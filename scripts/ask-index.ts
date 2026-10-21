#!/usr/bin/env bun
// scripts/ask-index.ts , build-time index for "Ask Larry" (the site chat + the public MCP server).
// Runs after build.ts (package.json "build"). Deterministic, no network.
// Writes site/ask/index.json:
//   pages   : every published page (url, title, glossary line)
//   chunks  : heading-scoped chunks with url/title/heading metadata (port of larry/chunk.py)
//   bm25    : inverted index (postings) over title + heading path + text (port of larry/hybrid.py)
//   steps   : the guided-install route (chapters in build order, Ch0 split into its steps), with the
//             exact commands each page shows (labeled Mac / Linux / any) and its "done when" line
//   version : content hash; the deploy ingest tags every vector with it (clean re-index each deploy)
// The deploy workflow (scripts/ingest.ts) then embeds the chunks with Workers AI and upserts them
// into Vectorize, recording the embedding model + dims back into this file before upload.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tokenize, anchorSlug, SITE } from "../ask/text.js";
import { parseBlocks, checksFrom } from "../ask/commands.js";
import { decode, fragmentToMd, clean, sections, chunkMd } from "../ask/chunk.js";

const ROOT = `${import.meta.dir}/..`;
const OUT = `${ROOT}/site`;
const read = (p: string) => readFileSync(p, "utf8");

// ── 1. the page list, in sitemap order (the sitemap is generated from the manifest) ──
const locs = [...read(`${OUT}/sitemap.xml`).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

// HTML tool pages (home, map, spawn, ...) have no .md twin: turn the article into light markdown.
function htmlToMd(html: string): string {
  let a = html.match(/<article class="col">([\s\S]*?)<\/article>/)?.[1] ?? html;
  a = a.replace(/<(script|style|button|svg|nav)[\s\S]*?<\/\1>/gi, "")
    .replace(/<footer class="(ethos|fixit)">[\s\S]*?<\/footer>/g, "")
    .replace(/<div class="invite-ribbon">[\s\S]*?<\/div>/g, "")
    .replace(/<div class="mentor">[\s\S]*?<\/div>/g, "")
    .replace(/<div class="pager">[\s\S]*?<\/div>/g, "");
  return fragmentToMd(a);
}

// ── 2. chunking: ask/chunk.js (shared with scripts/fleet-index.ts) ──

type Page = { url: string; slug: string; title: string; covers: string; md: string };
const pages: Page[] = [];
for (const loc of locs) {
  const path = loc.replace(SITE + "/", "");
  const slug = path === "" ? "index" : path.replace(/\.html$/, "");
  const htmlPath = `${OUT}/${slug}.html`;
  if (!existsSync(htmlPath)) continue;
  const html = read(htmlPath);
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? slug).replace(/ · how\.nixfred\.com$/, "").trim();
  const md = existsSync(`${OUT}/${slug}.md`) ? clean(read(`${OUT}/${slug}.md`)) : htmlToMd(html);
  const cov = md.match(/\*\*What it covers[^*]*\*\*:?\s*(.+)/)?.[1]?.replace(/[`*]/g, "")
    ?? decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  pages.push({ url: path === "" ? `${SITE}/` : loc, slug, title, covers: cov.slice(0, 220), md });
}
// the served runbook for installing agents: retrievable via MCP get_page, and used by the install tools
const runbook = existsSync(`${OUT}/install.md`) ? read(`${OUT}/install.md`) : "";

type Chunk = { p: number; h: string; hp: string; a: string; t: string };
const chunks: Chunk[] = [];
const NO_CHUNKS = new Set(["map"]);
// Verbatim file embeds (4+ backtick fences: the seed kit's constitution, hooks, audit spec) are not chunked for
// chat: they swamped every memory question with hook source. get_page and get_file still return them whole.
const forChunks = (md: string) => md.replace(/^(`{4,})[^\n]*\n[\s\S]*?\n\1\s*$/gm, "(verbatim file shown on the page; read it with get_file or at its URL)");   // the Map repeats one resume prompt per step and swamps retrieval; still listed + get_page-able
pages.forEach((pg, pi) => {
  if (NO_CHUNKS.has(pg.slug)) return;
  for (const c of chunkMd(forChunks(pg.md))) chunks.push({ p: pi, ...c });
});

// ── 3. BM25 postings: term -> [chunkIndex, tf, chunkIndex, tf, ...] ──
const postings: Record<string, number[]> = {}; const lens: number[] = [];
chunks.forEach((c, i) => {
  const toks = tokenize(`${pages[c.p].title} ${c.hp} ${c.t}`); lens.push(toks.length);
  const tf: Record<string, number> = {}; for (const t of toks) tf[t] = (tf[t] || 0) + 1;
  for (const [t, f] of Object.entries(tf)) (postings[t] ??= []).push(i, f);
});

// ── 4. glossary (one line per page, the page's own "What it covers" vocabulary) for the query rewrite ──
const shortTitle = (t: string) => t.replace(/^Chapter \d+:\s*/, "").split(":")[0].trim();
const glossary = pages.map(p => `- ${shortTitle(p.title)}: ${p.covers.length > 150 ? p.covers.slice(0, 150).replace(/,[^,]*$/, "") : p.covers}`).sort().join("\n");

// ── 5. guided-install route (only what the site itself says) ──
// order + "done when" come from llms.txt, which build.ts generates from the manifest + DONE table.
// A chapter with more than SPLIT_AT command blocks is split into sub-steps (ch4.1, ch4.2, ...) at its ##/###
// headings, so "one step" stays one step. Checks are read-only only: a "Verify:" block when the page has
// one, else a strict allowlist of read-only forms pulled from the step's own blocks; never setup commands.
type Cmd = { os: "mac" | "linux" | "any"; lang: string; code: string; under: string; dup_of?: string };
type Check = { os: "mac" | "linux" | "any"; code: string; under: string };
type Mention = { os: "mac" | "linux" | "any"; code: string; under: string };
type Step = { id: string; n: number | null; sub?: number; chapter: string; title: string; url: string; part: string; kind: "do" | "read";
  done_when: string | null; done_when_from: "step" | "chapter" | "none"; chapter_done_when: string; commands: Cmd[]; checks: Check[];
  check_source: "verify" | "allowlist" | "none"; checks_dropped: number; mentioned: Mention[]; fixes: { heading: string; url: string }[]; summary: string; os_only?: "mac" | "linux"; os_only_note?: string };
const SPLIT_AT = 4;
// kept for the audit spec parser below
const commandsOf = (md: string): Cmd[] => parseBlocks(md).cmds;
const SKIP_HEAD = /(your next step|takeaways|larry's read|here's your next step)/i;
const FIX_HEAD = /(troubleshoot|stuck|breaks|fails|wrong|gotcha|if it|when something)/i;
const firstPara = (b: string) => (b.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).map(x => x.replace(/\s+/g, " ").trim()).find(x => x.length > 60 && !/^\*\*[^*]{1,40}\*\*:?$/.test(x) && !/^[-|>#]/.test(x)) ?? "").replace(/[*`]/g, "").slice(0, 400);
const ownDone = (b: string) => b.match(/^\s*\*\*Done when(?::\*\*|\*\*:)\s*(.+)/m)?.[1]?.replace(/[*`]/g, "").trim() || null;
function makeStep(base: { id: string; n: number; sub?: number; chapter: string; title: string; url: string; part: string; chapterDone: string; summary: string }, text: string, secs: [string, string, string][], pageUrl: string, isWhole: boolean): Step {
  const p = parseBlocks(text); const ch = checksFrom(p); const own = ownDone(text);
  const done_when = own ?? (isWhole ? base.chapterDone : null);
  const fixes = secs.filter(([, h]) => FIX_HEAD.test(h)).map(([, h]) => ({ heading: h, url: `${pageUrl.replace(/#.*$/, "")}#${anchorSlug(h)}` }));
  const kind = p.cmds.length || ch.checks.length || p.mentions.length ? "do" : "read";
  // a step whose heading says it is for one OS ("Memory on Linux ... (on a Mac, skip it: ...)"): its unlabeled lines belong to that OS
  const t = base.title; const pm = t.match(/\(([^)]*\bskip\b[^)]*)\)/i)?.[1] || "";
  const osOnly = /\bon linux\b/i.test(t) && /\bmac/i.test(pm) ? "linux" : /\bon (a )?mac(os)?\b/i.test(t) && /\blinux\b/i.test(pm) ? "mac" : null;
  if (osOnly) { for (const c of ch.checks) if (c.os === "any") c.os = osOnly; for (const c of p.cmds) if (c.os === "any") c.os = osOnly; }
  return { id: base.id, n: base.n, ...(base.sub ? { sub: base.sub } : {}), chapter: base.chapter, title: base.title, url: base.url, part: base.part, kind,
    done_when, done_when_from: own ? "step" : done_when ? "chapter" : "none", chapter_done_when: base.chapterDone,
    commands: p.cmds, checks: ch.checks, check_source: ch.source, checks_dropped: ch.dropped,
    mentioned: p.mentions.filter(m => !p.cmds.some(c => c.code.includes(m.code))), fixes, summary: base.summary, ...(osOnly ? { os_only: osOnly, os_only_note: pm.trim() } : {}) };
}
const steps: Step[] = [];
let part = "";
const pageBySlug = new Map(pages.map(p => [p.slug, p]));
for (const line of read(`${OUT}/llms.txt`).split("\n")) {
  const pm = line.match(/^## (.+)/); if (pm) { part = pm[1].trim(); continue; }
  const m = line.match(/^Ch(\d+): (.+?) · (https:\/\/how\.nixfred\.com\/([^\s]+)\.md) · done when: (.+)$/);
  if (!m) continue;
  const n = +m[1], slug = m[4], pg = pageBySlug.get(slug); if (!pg) continue;
  const url = `${SITE}/${slug}.html`; const chapter = `Ch${n}: ${m[2]}`;
  const allSecs = sections(pg.md).filter(([, h]) => !SKIP_HEAD.test(h));
  if (n === 0) {
    // Ch0 is the all-human install: one step per "## Step N, ..." section
    for (const [, h, b] of allSecs.filter(([, h]) => /^Step \d+/i.test(h))) {
      const k = h.match(/^Step (\d+)/i)![1];
      steps.push(makeStep({ id: `ch0-step${k}`, n: 0, chapter, title: `Ch0 ${h}`, url: `${url}#${anchorSlug(h)}`, part, chapterDone: m[5], summary: firstPara(b) }, `## ${h}\n${b}`, [["", h, b]], url, false));
    }
    continue;
  }
  const brief = (pg.md.match(/\*\*For you, the human[^*]*\*\*\s*([^\n]+)/)?.[1] ?? pg.covers).replace(/[*`]/g, "").slice(0, 360);
  const body = allSecs.map(([, h, b]) => `## ${h}\n${b}`).join("\n\n");
  if (parseBlocks(body).cmds.length <= SPLIT_AT) {
    steps.push(makeStep({ id: `ch${n}`, n, chapter, title: chapter, url, part, chapterDone: m[5], summary: brief }, body, allSecs, url, true));
    continue;
  }
  // split: each ##/### section with commands starts a sub-step; command-less sections ride along with the one before
  // (or, before the first, with the first). The chapter title section (#) is the intro, not a step.
  const units: [string, string, string][][] = []; let lead: [string, string, string][] = [];
  for (const sec of allSecs) {
    const lvl = (pg.md.match(new RegExp(`^(#+)\\s+${sec[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"))?.[1] ?? "##").length;
    if (lvl === 1) continue;
    const starts = parseBlocks(`## ${sec[1]}\n${sec[2]}`).cmds.length > 0;   // a Verify-only section rides with the step it verifies
    if (starts) { units.push([...lead, sec]); lead = []; }
    else if (units.length) units[units.length - 1].push(sec); else lead.push(sec);
  }
  units.forEach((u, k) => {
    const anchorSec = u.find(sec => parseBlocks(`## ${sec[1]}\n${sec[2]}`).cmds.length)!;
    const path = anchorSec[0].split(" > ").slice(1).join(" > ") || anchorSec[1];
    const text = u.map(([, h, b]) => `## ${h}\n${b}`).join("\n\n");
    const st = makeStep({ id: `ch${n}.${k + 1}`, n, sub: k + 1, chapter, title: `Ch${n}.${k + 1}: ${path}`, url: `${url}#${anchorSlug(anchorSec[1])}`, part, chapterDone: m[5], summary: firstPara(anchorSec[2]) || brief }, text, u, url, false);
    if (k === units.length - 1 && !st.done_when) { st.done_when = m[5]; st.done_when_from = "chapter"; }
    steps.push(st);
  });
}
// a command block that repeats an earlier step's block verbatim (Ch4 re-shows Ch0's Tailscale + nixbash) says so
{ const seen = new Map<string, string>(); for (const s of steps) for (const c of s.commands) { const k = c.code.replace(/\s+/g, " ").trim(); if (seen.has(k) && seen.get(k) !== s.id) c.dup_of = seen.get(k); else if (!seen.has(k)) seen.set(k, s.id); } }
const modules = [...read(`${OUT}/llms.txt`).matchAll(/^(.+?) · https:\/\/how\.nixfred\.com\/([^\s]+)\.md · (.+)$/gm)]
  .filter(m => !/^Ch\d+:/.test(m[1])).map(m => ({ title: m[1], url: `${SITE}/${m[2]}.html`, summary: m[3] }));

// ── 6. served files an installing AI must be able to read through the MCP (get_file), and the audit spec ──
const WHAT: Record<string, string> = {
  "install.md": "the runbook an installing AI follows, tier by tier",
  "install.sh": "the scaffolder script (read it before anyone pipes it to a shell)",
  "gup": "one-word commit and push (Chapter 7)",
  "llms.txt": "the site manifest for AIs: every page, its purpose, its done-when line",
  "seed/CONSTITUTION.md": "the laws, loaded into the system prompt on every launch by the launcher",
  "seed/CLAUDE.md": "the starter identity file (~/.claude/CLAUDE.md)",
  "seed/LINEAGE.md": "where the line comes from, carried verbatim forever",
  "seed/AUDIT.md": "the full-build spec, as checks (what a finished AI has)",
  "seed/claude-launcher.sh": "wraps claude with --append-system-prompt-file so the constitution loads every turn",
  "seed/settings.fragment.json": "the hook wiring to merge into ~/.claude/settings.json",
  "seed/hooks/session-end-backup.sh": "SessionEnd: commit and push ~/.claude (the immortality heartbeat)",
  "seed/hooks/remember-trigger.sh": "UserPromptSubmit: 'remember X' becomes an order, recall questions become a search (Laws 2, 14, 16)",
  "seed/hooks/memory-backstop.sh": "SessionStart + SessionEnd: catches a lasting fact that was never saved (Law 15)",
};
const walk = (d: string): string[] => readdirSync(`${OUT}/${d}`, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
const servedPaths = ["install.md", "install.sh", "gup", "llms.txt", ...(existsSync(`${OUT}/seed`) ? walk("seed").sort() : [])].filter(f => existsSync(`${OUT}/${f}`));
const files = servedPaths.map(path => { const buf = readFileSync(`${OUT}/${path}`); return { path, url: `${SITE}/${path}`, what: WHAT[path] ?? "", bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") }; });
type AuditCheck = { id: string; title: string; why: string; commands: Cmd[]; pass_when: string; page: string; detail: string[] };
const audit: AuditCheck[] = [];
if (existsSync(`${OUT}/seed/AUDIT.md`)) {
  for (const [, h, b] of sections(read(`${OUT}/seed/AUDIT.md`))) {
    const am = h.match(/^A(\d+)\.\s+(.+)/); if (!am) continue;
    const line = (k: string) => b.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
    audit.push({ id: `audit-${am[1]}`, title: am[2].trim(), why: line("Why"), commands: commandsOf(`## ${h}\n${b}`), pass_when: line("Pass when"), page: line("Page"),
      detail: b.replace(/```[\s\S]*?```/g, "").split("\n").filter(l => /^- /.test(l)).map(l => l.slice(2).trim()) });
  }
}

// ── 7. write ──
const body = { pages: pages.map(p => ({ url: p.url, slug: p.slug, title: p.title, short: shortTitle(p.title), covers: p.covers })), chunks, glossary, steps, modules, files, audit, runbook: runbook.slice(0, 40000) };
const version = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 12);
const N = chunks.length, avg = lens.reduce((a, b) => a + b, 0) / Math.max(1, N);
mkdirSync(`${OUT}/ask`, { recursive: true });
// page markdown for get_page lives in its own file so the chat path never parses it
writeFileSync(`${OUT}/ask/pages.json`, JSON.stringify(Object.fromEntries(pages.map(p => [p.slug, p.md]))));
const prev = existsSync(`${OUT}/ask/index.json`) ? JSON.parse(read(`${OUT}/ask/index.json`)) : null;
const embed = prev?.version === version ? prev.embed ?? null : null;     // ingest fills this in at deploy
writeFileSync(`${OUT}/ask/index.json`, JSON.stringify({ version, built: "deploy", embed, ...body, bm25: { N, avg: +avg.toFixed(3), lens, postings } }));
console.log(`✓ ask index: ${pages.length} pages, ${N} chunks, ${Object.keys(postings).length} terms, ${steps.length} install steps, ${files.length} served files, ${audit.length} audit checks, version ${version}`);
