// GET /api/search?q=...&k=5&page=<slug>  , hybrid keyword (BM25) + vector search, no LLM.
import { loadIndex, findPage, bm25, embedQueries, originOk, rateLimit, tooMany, json, LIMITS } from "../../ask/core.js";

export async function search(env, request, q, { k = 5, page = null } = {}) {
  const idx = await loadIndex(env, request); const fused = new Map();
  const add = (list, w) => list.forEach((i, r) => fused.set(i, (fused.get(i) || 0) + w / (61 + r)));
  add(bm25(idx, q, { page }), 1); let mode = "keyword";
  if (env.VECTORIZE && idx.embed) {
    try {
      const [vec] = await embedQueries(env, idx, [q]); const v = idx.version;
      const filter = page === null ? { v } : { v, page: idx.pages[page].slug };
      const r = await env.VECTORIZE.query(vec, { topK: 20, filter, returnMetadata: "none" });
      add(r.matches.map(m => +String(m.id).slice(v.length + 1)).filter(i => Number.isInteger(i) && i < idx.chunks.length), 1); mode = "hybrid";
    } catch {}
  }
  return { mode, results: [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([i]) => {
    const c = idx.chunks[i], p = idx.pages[c.p];
    return { title: p.title, heading: c.h, url: p.url + (p.slug === "index" ? "" : c.a), page: p.slug, text: c.t };
  }) };
}

export async function onRequestGet({ request, env }) {
  if (!originOk(request)) return json({ error: "Origin not allowed" }, 403);
  if (!(await rateLimit(env, request, "SEARCH"))) return tooMany();
  const u = new URL(request.url); const q = (u.searchParams.get("q") || "").trim();
  if (!q) return json({ error: "q is required" }, 400);
  if (q.length > LIMITS.questionChars) return json({ error: `Keep it under ${LIMITS.questionChars} characters.` }, 413);
  const idx = await loadIndex(env, request);
  const page = u.searchParams.get("page") ? findPage(idx, u.searchParams.get("page")) : null;
  const k = Math.min(10, Math.max(1, +(u.searchParams.get("k") || 5) || 5));
  const r = await search(env, request, q, { k, page });
  return json({ ...r, results: r.results.map(x => ({ ...x, text: x.text.slice(0, 600) })) });
}
