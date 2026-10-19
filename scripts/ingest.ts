#!/usr/bin/env bun
// scripts/ingest.ts , deploy-time re-index for Ask Larry (runs in GitHub Actions, see deploy.yml).
//   bun scripts/ingest.ts            embed every chunk in site/ask/index.json with Workers AI and upsert
//                                    into Vectorize (index + metadata indexes created if missing); records
//                                    {model, dims, index} back into site/ask/index.json before Pages upload
//   bun scripts/ingest.ts --prune    after the Pages deploy: delete the previous version's vectors
// Vector ids are "<content version>-<chunk #>" and every vector carries metadata {v, page}, and the
// Functions filter queries by the live version, so a deploy never mixes old and new vectors.
// Needs CLOUDFLARE_API_TOKEN (Workers AI: Read, Vectorize: Edit) and CLOUDFLARE_ACCOUNT_ID.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const TOKEN = process.env.CLOUDFLARE_API_TOKEN, ACCT = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !ACCT) { console.error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required"); process.exit(1); }
const INDEX = process.env.ASK_VECTORIZE_INDEX || "how-nixfred-ask";
// picked from the live Workers AI catalog (Oct 2026): qwen3-embedding-0.6b = 8k-token context (whole
// chunks fit, bge-base truncates at 512), 1024 dims, $0.012/M tokens. bge-m3 is the same price and
// the same 1024 dims, so it is a drop-in fallback for the same index.
const MODELS = ["@cf/qwen/qwen3-embedding-0.6b", "@cf/baai/bge-m3"];
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`;
const LIVE = process.env.ASK_LIVE_URL || "https://how.nixfred.com";
const STATE = ".ask-ingest-state.json";               // outside site/ (never uploaded), carries the old version to --prune

async function cf(path: string, init: RequestInit = {}, ok404 = false): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(API + path, { ...init, headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) } });
    const j: any = await r.json().catch(() => ({}));
    if (ok404 && r.status === 404) return null;
    if (r.ok && j.success !== false) return j.result ?? j;
    const msg = `${r.status} ${JSON.stringify(j.errors || j).slice(0, 400)}`;
    if (r.status === 401 || r.status === 403) throw new Error(`Cloudflare auth/permission error on ${path}: ${msg}. The token needs Workers AI (Read) and Vectorize (Edit) on this account.`);
    if (attempt >= 4 || (r.status < 500 && r.status !== 429)) throw new Error(`${path}: ${msg}`);
    await new Promise(s => setTimeout(s, 1500 * attempt));
  }
}
const embedText = (idx: any, c: any) => `${idx.pages[c.p].title} | ${c.hp}\n${c.t}`.slice(0, 7000);

async function embed(model: string, texts: string[]): Promise<number[][]> {
  const r = await cf(`/ai/run/${model}`, { method: "POST", body: JSON.stringify({ text: texts }) });
  const data = r.data ?? r.response?.data;
  if (!Array.isArray(data) || data.length !== texts.length) throw new Error(`${model}: unexpected embedding shape`);
  return data;
}

async function ensureIndex(dims: number) {
  const got = await cf(`/vectorize/v2/indexes/${INDEX}`, {}, true);
  if (!got) {
    console.log(`creating Vectorize index ${INDEX} (${dims} dims, cosine)`);
    await cf(`/vectorize/v2/indexes`, { method: "POST", body: JSON.stringify({ name: INDEX, description: "how.nixfred.com Ask Larry chunks", config: { dimensions: dims, metric: "cosine" } }) });
  } else if (got.config?.dimensions !== dims) {
    throw new Error(`index ${INDEX} has ${got.config?.dimensions} dims, model gives ${dims}. Set ASK_VECTORIZE_INDEX to a new name (and the binding in wrangler.toml).`);
  }
  const have = new Set(((await cf(`/vectorize/v2/indexes/${INDEX}/metadata_index/list`).catch(() => null))?.metadataIndexes || []).map((m: any) => m.propertyName));
  for (const prop of ["v", "page"]) if (!have.has(prop)) {
    console.log(`creating metadata index ${prop}`);
    await cf(`/vectorize/v2/indexes/${INDEX}/metadata_index/create`, { method: "POST", body: JSON.stringify({ propertyName: prop, indexType: "string" }) }).catch(e => { if (!/exist/i.test(String(e))) throw e; });
  }
}

const idx = JSON.parse(readFileSync("site/ask/index.json", "utf8"));
const ids = (ver: string, n: number) => Array.from({ length: n }, (_, i) => `${ver}-${i}`);

if (process.argv.includes("--prune")) {
  const st = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : null;
  if (!st?.old || st.old.version === idx.version) { console.log("nothing to prune"); process.exit(0); }
  const old = ids(st.old.version, st.old.n);
  for (let i = 0; i < old.length; i += 100)
    await cf(`/vectorize/v2/indexes/${INDEX}/delete_by_ids`, { method: "POST", body: JSON.stringify({ ids: old.slice(i, i + 100) }) });
  console.log(`pruned ${old.length} vectors of version ${st.old.version}`);
  process.exit(0);
}

// what is live right now (so --prune can remove it after the new deploy is up)
let old: { version: string; n: number } | null = null;
try { const r = await fetch(`${LIVE}/ask/index.json?v=${Date.now()}`); if (r.ok) { const j: any = await r.json(); old = { version: j.version, n: j.chunks.length }; } } catch {}

let model = "", vecs: number[][] = [];
const texts = idx.chunks.map((c: any) => embedText(idx, c));
for (const m of MODELS) {
  try {
    vecs = [];
    for (let i = 0; i < texts.length; i += 32) vecs.push(...await embed(m, texts.slice(i, i + 32)));
    model = m; break;
  } catch (e) { console.warn(`embedding with ${m} failed: ${e}`); if (/auth\/permission/.test(String(e))) throw e; }
}
if (!model) throw new Error("no embedding model worked");
const dims = vecs[0].length;
await ensureIndex(dims);
const newIds = ids(idx.version, vecs.length);
for (let i = 0; i < vecs.length; i += 200) {
  const nd = vecs.slice(i, i + 200).map((v, j) => JSON.stringify({ id: newIds[i + j], values: v, metadata: { v: idx.version, page: idx.pages[idx.chunks[i + j].p].slug } })).join("\n");
  await cf(`/vectorize/v2/indexes/${INDEX}/upsert`, { method: "POST", headers: { "content-type": "application/x-ndjson" }, body: nd });
}
idx.embed = { model, dims, index: INDEX, at: new Date().toISOString() };
writeFileSync("site/ask/index.json", JSON.stringify(idx));
writeFileSync(STATE, JSON.stringify({ old, new: { version: idx.version, n: vecs.length } }));
console.log(`✓ upserted ${vecs.length} vectors (${model}, ${dims}d) into ${INDEX}, version ${idx.version}${old ? `, previous live version ${old.version}` : ""}`);
