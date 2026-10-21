// Shared chunker for the Ask Larry indexes: scripts/ask-index.ts (how.nixfred.com) and scripts/fleet-index.ts
// (all five fleet sites). Port of larry/chunk.py, keeping line breaks so commands stay readable.
// Build-time only (no runtime import), so the two indexes can never chunk differently.
import { anchorSlug } from "./text.js";

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " ", rarr: "→", larr: "←", middot: "·", hellip: "…", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', times: "×" };
export const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));

// light markdown from an HTML fragment (headings, lists, code, bold; every other tag dropped)
export function fragmentToMd(a) {
  a = a.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => "\n```\n" + decode(c.replace(/<[^>]+>/g, "")).trim() + "\n```\n");
  a = a.replace(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${"#".repeat(+n)} ${t.replace(/<[^>]+>/g, "").trim()}\n\n`);
  a = a.replace(/<li[^>]*>/gi, "\n- ").replace(/<\/(p|div|ol|ul|section|details|summary|blockquote|table|tr)>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi, "**$2**");
  a = decode(a.replace(/<[^>]+>/g, ""));
  return a.split("\n").map(l => l.replace(/[ \t]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
// any site's page: <main>, else <article>, else <body>, minus chrome (nav, header, footer, scripts, forms).
// <noscript> is kept: some pages (nixfred.com home) put their whole no-JS text there.
export function pageToMd(html) {
  const pick = tag => html.match(new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>`, "i"))?.[0];
  let a = pick("main") ?? pick("article") ?? pick("body") ?? html;
  a = a.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|template|svg|nav|header|footer|form|button|select|iframe|dialog)\b[\s\S]*?<\/\1>/gi, "");
  return fragmentToMd(a);
}

export const TARGET = 450, MAX = 600, MIN = 120, MERGE = 260, OVERLAP = 60;
export const words = s => s.split(/\s+/).filter(Boolean).length;
export const clean = md => md.replace(/^<!--[\s\S]*?-->\s*/, "").replace(/^---\n[\s\S]*?\n---\n/, "").trim();
// [heading path, heading, body] per #..#### section
export function sections(md) {
  const out = []; let stack = {}; let buf = []; let cur = ""; let inCode = false;
  const flush = () => { const body = buf.join("\n").trim(); if (body) out.push([Object.keys(stack).map(Number).sort().map(k => stack[k]).join(" > "), cur, body]); };
  for (const line of md.split("\n")) {
    if (line.trim().startsWith("```")) inCode = !inCode;
    const m = inCode ? null : line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (m) { flush(); buf = []; const lvl = m[1].length; cur = m[2].trim(); stack = Object.fromEntries(Object.entries(stack).filter(([k]) => +k < lvl)); stack[lvl] = cur; }
    else buf.push(line);
  }
  flush();
  return out;
}
export function windows(body) {
  if (words(body) <= MAX) return [body];
  const lines = body.split("\n"); const out = []; let cur = []; let n = 0;
  for (const l of lines) {
    cur.push(l); n += words(l);
    if (n >= TARGET) {
      out.push(cur.join("\n"));
      const keep = []; let k = 0;                                 // ~OVERLAP words of trailing context
      for (let i = cur.length - 1; i >= 0 && k < OVERLAP; i--) { keep.unshift(cur[i]); k += words(cur[i]); }
      cur = keep; n = k;
    }
  }
  if (cur.length && n > OVERLAP) {
    if (n < MIN && out.length) out[out.length - 1] += "\n" + cur.slice(cur.length ? 1 : 0).join("\n");
    else out.push(cur.join("\n"));
  }
  return out;
}
// one page's markdown -> [{h, hp, a, t}]: small sections merged up to MAX words, long ones windowed with overlap
export function chunkMd(md) {
  const merged = []; let acc = null;
  for (const [path, head, body] of sections(md)) {
    if (!acc) acc = [path, head, body];
    else if (words(acc[2]) < MERGE && words(acc[2]) + words(body) <= MAX) acc[2] += `\n\n## ${head}\n` + body;
    else { merged.push(acc); acc = [path, head, body]; }
  }
  if (acc) {
    const last = merged[merged.length - 1];
    if (last && words(acc[2]) < MIN && words(last[2]) + words(acc[2]) <= MAX + MIN) last[2] += `\n\n## ${acc[1]}\n` + acc[2];
    else merged.push(acc);
  }
  const out = [];
  for (const [path, head, body] of merged)
    for (const w of windows(body)) out.push({ h: head, hp: path, a: head ? "#" + anchorSlug(head) : "", t: w.trim() });
  return out;
}

// ── fleet chat: one chunk -> its Vectorize metadata (the chunk text lives in the vector's metadata, no static index) ──
// Vectorize allows 10 KiB of metadata per vector (developers.cloudflare.com/vectorize/platform/limits, checked
// 2026-10-20); the text is trimmed at a word boundary so the whole record stays under META_MAX bytes.
export const META_MAX = 9800;
const bytes = s => new TextEncoder().encode(s).length;
export function vectorMetadata(c, v) {
  const m = { v, site: c.site, url: c.url, title: c.title, short: c.short, hp: c.hp, t: c.t };
  if (bytes(JSON.stringify(m)) <= META_MAX) return m;
  let t = c.t;
  while (t.length > 200 && bytes(JSON.stringify({ ...m, t })) > META_MAX) t = t.slice(0, Math.floor(t.length * 0.9)).replace(/\s+\S*$/, "");
  return { ...m, t: t + " ...", cut: true };
}
