#!/usr/bin/env bun
// scripts/fleet-index.ts , build-time index for the fleet chat (POST /api/fleet/ask, /embed.js). Offline, deterministic.
// Runs after scripts/ask-index.ts (package.json "build"). Inputs, both made only from published pages:
//   site/ask/index.json   how.nixfred.com pages + chunks, built from the files this deploy publishes
//   fleet/crawl.json      nixfred.com, nixfredos.com, ladder.nixfred.com, larry.nixfred.com (scripts/fleet-crawl.ts)
// Writes NO search index into the site (Fred / AI Strategy, 8:22 PM: no multi-MB static index): the chunks go to the
// Vectorize index how-nixfred-fleet, each with its text in the vector's metadata {v, site, url, title, short, hp, t}.
//   fleet/chunks.json        every chunk + its metadata, the input of `bun scripts/ingest.ts --fleet` (gitignored)
//   site/ask/fleet-meta.json a few KB the runtime loads once: version, glossary for the rewrite, per-site counts, and
//                            {embed} that the ingest fills in; with no embed (index not ingested) the chat answers
//                            directory questions only and otherwise 503 brain_down
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tokenize } from "../ask/text.js";
import { chunkMd, clean, vectorMetadata } from "../ask/chunk.js";
import { FLEET_SITES } from "../ask/fleet.js";

const ROOT = `${import.meta.dir}/..`;
const how = JSON.parse(readFileSync(`${ROOT}/site/ask/index.json`, "utf8"));
const crawl = existsSync(`${ROOT}/fleet/crawl.json`) ? JSON.parse(readFileSync(`${ROOT}/fleet/crawl.json`, "utf8")) : { sites: [], crawled: null };

type Page = { site: string; url: string; slug: string; title: string; short: string };
type Chunk = { p: number; h: string; hp: string; t: string };
const pages: Page[] = [], chunks: Chunk[] = [];
// titles go out verbatim in the API's sources: no em or en dashes there either
const dashless = (t: string) => t.replace(/\s*[\u2013\u2014]\s*/g, " · ");
const short = (t: string) => t.split(/\s+[|·•]\s+|\s+(?:--|::)\s+|\s+[\u2013\u2014]\s+/)[0].replace(/^Chapter \d+:\s*/, "").trim().slice(0, 80);

// how.nixfred.com: reuse its own chunks (same chunker, same text the site chat answers from)
how.pages.forEach((pg: any, i: number) => {
  const p = pages.length; pages.push({ site: "how", url: pg.url, slug: pg.url, title: pg.title, short: pg.short || short(pg.title) });
  for (const c of how.chunks) if (c.p === i) chunks.push({ p, h: c.h, hp: c.hp, t: c.t });
});
// the other four widget sites, and the knowledge-only sites (no widget, no site id): crawl snapshot, chunked the same way
const META: Record<string, { host: string; about: string }> = Object.fromEntries(Object.entries(FLEET_SITES).map(([id, s]: [string, any]) => [id, { host: s.host, about: s.about }]));
const KNOWLEDGE: string[] = [];
for (const s of crawl.sites) {
  if (s.kind === "knowledge") { if (FLEET_SITES[s.id]) throw new Error(`knowledge site ${s.id} collides with a widget site id`); META[s.id] = { host: new URL(s.origin).host, about: String(s.about || s.title || "").slice(0, 120) }; KNOWLEDGE.push(s.id); }
  else if (!FLEET_SITES[s.id]) throw new Error(`fleet/crawl.json has unknown site ${s.id}`);
  for (const pg of s.pages) {
    const p = pages.length; pages.push({ site: s.id, url: pg.url, slug: pg.url, title: dashless(pg.title), short: short(pg.title) });
    const md = (pg.description && !pg.md.includes(pg.description) ? pg.description + "\n\n" : "") + clean(pg.md);
    for (const c of chunkMd(md)) if (c.t.split(/\s+/).length >= 12) chunks.push({ p, h: c.h, hp: c.hp, t: c.t });
  }
}

// glossary for the rewrite: one line per site, pages grouped by their first path segment (a big section, like a
// 57-page study guide, is one line with a few example titles, so the prompt stays small)
const glossary = Object.entries(META).filter(([id]) => pages.some(p => p.site === id)).map(([id, s]) => {
  const groups = new Map<string, Page[]>();
  for (const p of pages.filter(p => p.site === id)) { const seg = new URL(p.url).pathname.split("/").filter(Boolean)[0] || ""; const k = groups.get(seg) || []; k.push(p); groups.set(seg, k); }
  const parts: string[] = [];
  for (const [seg, ps] of groups) parts.push(ps.length > 4 ? `${seg} (${ps.length} pages, e.g. ${ps.slice(0, 3).map(p => p.short).join("; ")})` : ps.map(p => p.short).join("; "));
  if (KNOWLEDGE.includes(id)) return `- ${s.host} (${s.about}): ${parts.join("; ").slice(0, 220)}`;
  return `- ${s.host} (${s.about}): ${parts.join("; ")}`;
}).join("\n");

const body = { sites: Object.keys(FLEET_SITES), knowledge: KNOWLEDGE.filter(id => pages.some(p => p.site === id)), pages, chunks, glossary, crawled: crawl.crawled, how_version: how.version };
const version = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 12);
const metas = chunks.map(c => vectorMetadata({ site: pages[c.p].site, url: pages[c.p].url, title: pages[c.p].title, short: pages[c.p].short, hp: c.hp, t: c.t }, version));
const counts: Record<string, { pages: number; chunks: number }> = {};
for (const id of Object.keys(META)) counts[id] = { pages: pages.filter(p => p.site === id).length, chunks: metas.filter(m => m.site === id).length };
// the old static indexes are gone from the site for good (site/ask/fleet.json, then the site/ask/fleet/ shards)
rmSync(`${ROOT}/site/ask/fleet`, { recursive: true, force: true }); rmSync(`${ROOT}/site/ask/fleet.json`, { force: true });
const metaFile = `${ROOT}/site/ask/fleet-meta.json`;
const prev = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : null;
const embed = prev?.version === version ? prev.embed ?? null : null;     // ingest --fleet fills this in at deploy
// "Chapter 7" in an answer always gets its link: chapter number -> how.nixfred.com URL (from the guide's own slugs)
const chapters = Object.fromEntries(how.pages.map((p: any) => [p.slug.match(/^(\d{2})-/)?.[1], p.url]).filter(([n]: any) => n).map(([n, u]: any) => [String(+n), u]));
const chapterTitles = Object.fromEntries(how.pages.filter((p: any) => /^\d{2}-/.test(p.slug)).map((p: any) => [String(+p.slug.slice(0, 2)), p.short || p.title]));   // "what's next" names the next chapter (ask/followup.js)
const meta = JSON.stringify({ version, embed, N: metas.length, sites: body.sites, knowledge: body.knowledge, counts, chapters, chapterTitles, glossary, crawled: crawl.crawled, how_version: how.version });
writeFileSync(metaFile, meta);
mkdirSync(`${ROOT}/fleet`, { recursive: true });
writeFileSync(`${ROOT}/fleet/chunks.json`, JSON.stringify({ version, chunks: metas.map((m, i) => ({ id: `${version}-${i}`, ...m })) }));
const per = Object.keys(META).map(id => `${id} ${counts[id].pages}/${counts[id].chunks}`).join(", ");
const big = metas.reduce((a, m) => Math.max(a, new TextEncoder().encode(JSON.stringify(m)).length), 0);
console.log(`✓ fleet index: ${pages.length} pages, ${metas.length} chunks (site pages/chunks: ${per}), version ${version}`);
console.log(`  shipped in the site: site/ask/fleet-meta.json ${(meta.length / 1024).toFixed(1)} KB. Vectorize metadata: max ${big} bytes per vector (limit 10240), ${metas.filter(m => (m as any).cut).length} trimmed to fit`);
