// Multi-turn handling shared by the site chat (ask/core.js) and the fleet chat (ask/fleet.js). Pure functions, no I/O.
//
// Why this file exists (2026-10-20, Fred's 10:25 PM transcript on Ask Larry):
//   1. Both chats used to hand the model its own earlier answers as chat turns, right above a new request whose passages
//      overlapped them. The model continued the pattern: Q2's answer opened by repeating Q1's answer word for word.
//      Now the model gets the earlier QUESTIONS and the PAGES they were answered from (convoNote), never its old answer text,
//      and anything it still repeats is cut out before the visitor sees it (stripEcho / echoView).
//   2. "then what" / "what's next" was searched as "<previous question> + then what", so it found the same pages again and
//      the answer repeated, then drifted back to foundations. Now a next-step follow-up is rewritten into a standalone query for
//      the NEXT chapter in the guide's order after the last chapter the conversation cited (nextStep).
import { normUrl } from "./text.js";

// ---------------------------------------------------------------- chapters named in a history, a question or a URL
export const chapterOfUrl = u => { const m = String(u || "").match(/how\.nixfred\.com\/(\d{2})-[a-z0-9][a-z0-9-]*/i); return m ? +m[1] : null; };
const CH_MENTION = /\bch(?:apter|\.)?\s*(\d{1,2})\b(?!\.\d)/gi;
// the chapters one history turn points at: its sources first (what the page cited), else the URLs and "Chapter N" in its text
export function chaptersOfTurn(m) {
  const fromSources = (Array.isArray(m?.sources) ? m.sources : []).map(chapterOfUrl).filter(n => n !== null);
  if (fromSources.length) return [...new Set(fromSources)];
  const txt = String(m?.content || ""), out = new Set();
  for (const u of txt.match(/https?:\/\/[^\s)\]>"']+/g) || []) { const n = chapterOfUrl(u); if (n !== null) out.add(n); }
  for (const x of txt.matchAll(CH_MENTION)) out.add(+x[1]);
  return [...out];
}
// where the conversation is: the chapters the newest assistant turn that cited any chapter pointed at (its highest one)
export function lastChapter(history) {
  for (const m of [...history].reverse()) if (m.role === "assistant") { const c = chaptersOfTurn(m); if (c.length) return Math.max(...c); }
  return null;
}

// ---------------------------------------------------------------- "then what" / "what's next"
const squash = q => String(q).toLowerCase().replace(/[’‘]/g, "'").replace(/[?!.,;:]+/g, " ").replace(/\s+/g, " ").trim();
const BARE_NEXT = /^(?:(?:and|ok|okay|so|well|alright|cool|great|thanks|thank you)\s+)*(?:then|next|now|and then|after that|after this|what now|now what|what next|next up|then what|what then|what else|what after that|keep going|go on|go ahead|continue|carry on|move on|next step|the next step|ok next|next one)$/;
// the phrase has to END the question: "what is next js" and "what is the next release of X" are ordinary questions
const NEXT_ASK = /(?:^|\s)(?:what(?:'?s| is| comes| should i do| do i do| am i supposed to do| to do)?(?: the)? next|the next step|next step|what(?:'?s| is) after (?:that|this|those|these)|then what|what then|what now|now what|and then what|where (?:do i|should i) go (?:from here|next)|what do i do after(?: that| this)?)(?: from here| now| then)?$/;
export const isNextAsk = q => { const s = squash(q); return s.length > 0 && s.length <= 120 && (BARE_NEXT.test(s) || NEXT_ASK.test(s)); };
// "what comes after telos?", "what's next after memory", "which chapter is after chapter 11": the visitor names where they are
// (Audit200, live 2026-10-20: "what comes after telos?" cited telos-questions and the fleet chat refused it). The topic is a chapter
// number or a word of a chapter's slug or title; the answer is the chapter after it.
const AFTER_ASK = /^(?:(?:so|ok|okay|and|then)\s+)*(?:what(?:'?s| is)?|which chapter(?: is| comes)?|where do i go|what do i do|what should i do)\s+(?:comes\s+|goes\s+|is\s+)?(?:next\s+|right\s+)?after\s+(?:the\s+|my\s+|a\s+)?(.{2,60}?)(?:\s+chapter)?$/;
export function afterTopic(q, chapters) {
  const m = squash(q).match(AFTER_ASK); if (!m) return null;
  const t = m[1].trim(), n = t.match(/^(?:ch(?:apter)?\s*)?(\d{1,2})$/);
  if (n) return chapters.some(c => c.n === +n[1]) ? +n[1] : null;
  if (/^(?:that|this|those|these|it)$/.test(t)) return null;          // "what's after that": the history decides (NEXT_ASK)
  const words = t.split(" ").filter(w => w.length >= 4 && !GENERIC.has(w));
  for (const c of [...chapters].sort((a, b) => a.n - b.n)) {
    const own = new Set([...c.slug.replace(/^\d+-/, "").split("-"), ...String(c.title || "").toLowerCase().split(/[^a-z0-9.]+/)].filter(w => w.length >= 4 && !GENERIC.has(w)));
    if (words.some(w => own.has(w) || own.has(w.replace(/s$/, "")))) return c.n;
  }
  return null;
}
// "if I have telos and memory ...": the visitor says what they have done, which can be ahead of what Larry last cited
const HAVE = /\b(?:i have|i've|ive|i already have|already have|i got|we have|i finished|i did|i set up|i'?m done with|done with)\b/;
const GENERIC = new Set(["the", "and", "your", "files", "build", "plan", "beyond", "chat", "stack", "start", "here", "ask", "first", "session", "with", "from", "that", "this"]);
function chaptersNamed(q, chapters) {
  const s = squash(q), out = [];
  for (const x of s.matchAll(/\bch(?:apter)?\s*(\d{1,2})\b/g)) out.push(+x[1]);
  if (HAVE.test(s)) for (const c of chapters) for (const w of c.slug.replace(/^\d+-/, "").split("-")) if (w.length >= 4 && !GENERIC.has(w) && new RegExp(`\\b${w}\\b`).test(s)) { out.push(c.n); break; }
  return out;
}

// chapters: [{n, slug, url, title}] in any order. Returns null when q is not a next-step ask or the conversation has no position;
// else {from, n, slug, url, title, query, lead, note}: the chapter after `from`, the standalone query for it, the line that opens the
// answer, and the instruction line for the model. A conversation already at the last chapter returns {end: true, from}.
export function nextStep(chapters, q, history, scopeSlug = null) {
  const list = [...chapters].filter(c => Number.isInteger(c.n)).sort((a, b) => a.n - b.n);
  if (!list.length) return null;
  const after = afterTopic(q, list);
  if (!isNextAsk(q) && after === null) return null;
  const scoped = scopeSlug ? list.find(c => c.slug === scopeSlug)?.n : undefined;
  const last = lastChapter(history);
  const base = last ?? scoped ?? null;
  const named = chaptersNamed(q, list);
  const pos = after ?? Math.max(...[base, ...named].filter(n => n !== null && n !== undefined), -1);   // "after telos" says where they are
  if (pos < 0 && base === null && !named.length) return null;
  const nxt = list.find(c => c.n > pos);
  if (!nxt) return { end: true, from: pos };
  const from = list.find(c => c.n === pos);
  const label = c => `Chapter ${c.n}: ${c.title}`;
  return {
    from: pos, n: nxt.n, slug: nxt.slug, url: nxt.url, title: nxt.title,
    query: `${label(nxt)}. The next chapter after Chapter ${pos}${from ? ` (${from.title})` : ""}: what to do next. ${nxt.slug.replace(/^\d+-/, "").replace(/-/g, " ")}`,
    lead: `Next up: [${label(nxt)}](${nxt.url}).`,
    note: `(Follow-up: the visitor asked what comes next. The earlier turns covered up to Chapter ${pos}${from ? ` (${from.title})` : ""}. The next chapter in the guide's order is ${label(nxt)}, ${nxt.url}. Answer from that chapter's passages: its step, what it asks them to do. Do not repeat the earlier answers, and do not go back to earlier chapters or to the foundations.)`,
  };
}

// ---------------------------------------------------------------- what the model is told about the earlier turns
// Earlier visitor questions plus the pages they were answered from. Never the answer text: a model shown its own old answer repeats it.
export function convoNote(history, titleOf = u => u) {
  const turns = []; let q = null;
  for (const m of history) {
    if (m.role === "user") { if (q !== null) turns.push({ q, pages: [] }); q = m.content; }
    else if (m.role === "assistant") {
      const urls = (Array.isArray(m.sources) ? m.sources : []).filter(u => typeof u === "string");
      const pages = [...new Set(urls.map(titleOf))];
      if (!pages.length) for (const n of chaptersOfTurn(m)) pages.push(`Chapter ${n}`);
      turns.push({ q: q ?? "", pages }); q = null;
    }
  }
  if (q !== null) turns.push({ q, pages: [] });
  const rows = turns.slice(-3).filter(t => t.q).map(t => `- They asked: "${t.q.replace(/\s+/g, " ").slice(0, 160)}"${t.pages.length ? ` and you pointed them to: ${t.pages.slice(0, 4).join("; ")}.` : "."}`);
  return rows.length ? `Earlier in this chat (the visitor has already read those answers; never repeat or quote them, say only what is new):\n${rows.join("\n")}\n\n` : "";
}

// ---------------------------------------------------------------- cutting an echoed earlier answer out of a new one
const nz = s => String(s).toLowerCase().replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[^a-z0-9]+/g, " ").trim();
const blocksOf = t => String(t).split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
const MIN = 40;   // shorter blocks ("Sources:", a one-line sign-off) can legitimately recur
export const priorBlocks = history => history.filter(m => m.role === "assistant").flatMap(m => blocksOf(m.content)).map(nz).filter(b => b.length >= MIN);
// the line a next-step answer opens with (ours, added in code): a model copying the previous answer copies it too, whatever its length
const LEAD = /^next up chapter \d+\b/;
const isEcho = (block, prior) => { const b = nz(block); return LEAD.test(b) || (b.length >= MIN && prior.some(p => p.includes(b) || b.includes(p))); };
// text without the blocks that repeat an earlier answer
export function stripEcho(text, history) {
  const prior = priorBlocks(history); if (!prior.length && !history.length) return String(text);
  return blocksOf(text).filter(b => !isEcho(b, prior)).join("\n\n");
}
// the same for a half-written answer: complete blocks are judged now; the block still being written is held back while it is
// still a prefix of an earlier one (it may turn out to be the echo), so a repeated opening is never shown, even briefly
export function echoView(text, history, final = false) {
  const prior = priorBlocks(history); if (!prior.length && !history.length) return String(text);
  const blocks = blocksOf(text); if (!blocks.length) return "";
  const open = final ? null : (/\n{2,}\s*$/.test(text) ? null : blocks.pop());
  const kept = blocks.filter(b => !isEcho(b, prior));
  if (open !== null && open !== undefined) { const o = nz(open); if (!(o.length < 400 && (prior.some(p => p.startsWith(o)) || (o.length < 40 && "next up chapter".startsWith(o.slice(0, 15)))))) kept.push(open); }
  return kept.join("\n\n");
}
export const normText = nz;
export { normUrl };
