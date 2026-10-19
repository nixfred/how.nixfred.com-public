// Shared text helpers for Ask Larry: used at build time (scripts/ask-index.ts) and at runtime
// (Pages Functions), so the BM25 index and the query tokenizer can never drift apart.
// Port of larry/hybrid.py tokenize(): lowercase, stopwords, light stemming, compound-token parts.

const TOKEN = /[a-z0-9][a-z0-9_./:+-]*[a-z0-9]|[a-z0-9]/g;
export const STOP = new Set(`a an and are as at be but by can do does did for from has have how i if in into is it
its me my of on or so that the their them then there these they this to was we what when where which
who why will with you your yours yourself i'm im just like stuff thing things actually kinda gonna`.split(/\s+/));

export function stem(t) {
  for (const suf of ["ings", "ing", "ies", "ied", "edly", "ed", "es", "s", "ly"]) {
    if (t.length > suf.length + 3 && t.endsWith(suf)) return t.slice(0, -suf.length) + (suf === "ies" || suf === "ied" ? "y" : "");
  }
  return t;
}

export function tokenize(text) {
  const out = [];
  for (let t of String(text).toLowerCase().match(TOKEN) || []) {
    t = t.replace(/^[./:+-]+|[./:+-]+$/g, "");
    if (!t || STOP.has(t)) continue;
    out.push(stem(t));
    if (/[./:\-_]/.test(t) && t.length > 2) {
      for (const p of t.split(/[./:_-]+/)) if (p && !STOP.has(p) && p.length > 1) out.push(stem(p));
    }
  }
  return out;
}

export const SITE = "https://how.nixfred.com";

// canonical comparison key: drop fragment, trailing '/', '.html', index
export function normUrl(u) {
  try {
    const x = new URL(u, SITE + "/");
    const path = x.pathname.replace(/(\/index)?\.html$/, "").replace(/\/+$/, "") || "/";
    return `${x.protocol}//${x.host.toLowerCase()}${path}`;
  } catch { return String(u); }
}

export const anchorSlug = s => String(s).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");
