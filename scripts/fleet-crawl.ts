#!/usr/bin/env bun
// scripts/fleet-crawl.ts , snapshot the PUBLISHED pages of the fleet sites for the shared chat (Ask Larry, fleet mode).
//   bun scripts/fleet-crawl.ts        writes fleet/crawl.json (committed; scripts/fleet-index.ts builds from it offline)
// Live public URLs only: each site's sitemap(s) (robots.txt "Sitemap:" lines + /sitemap.xml), or, for a site with no
// sitemap, same-origin links from its home page (BFS, capped). Never a repo, never a private file. A page that
// redirects off-site or to a login, or is not 200 text/html, is skipped and listed. how.nixfred.com is not crawled:
// fleet-index.ts reads it from site/ask/index.json, built from the very files this deploy publishes.
// Every page is scrubbed before it is stored: the owner's machine names, non-public emails, private and tailnet
// addresses and anything credential-shaped (the same rules as the public mirror scan).
// Two kinds of site: the five with the chat widget (personas, see ask/fleet.js), and knowledge-only sites: the card
// sites on nixfred.com that live on *.nixfred.com or *.nixfred.tech, read live from the master registry
// (https://nixfred.com/sites.json). Those have no widget and no site id; their pages only feed the index, robots.txt
// is obeyed for them, and each is capped so the index stays small enough to load. Family and personal sites are on
// DENY and are never crawled, whatever a registry or a sitemap says.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { pageToMd, decode } from "../ask/chunk.js";
import { HOST_HASHES, fnv1a, PUBLIC_EMAILS, RULES } from "./public-export.ts";

export const CRAWL_SITES = [
  { id: "nixfred", origin: "https://nixfred.com" },
  { id: "nixfredos", origin: "https://nixfredos.com" },
  { id: "ladder", origin: "https://ladder.nixfred.com" },
  { id: "larry", origin: "https://larry.nixfred.com" },
];
const REGISTRY = "https://nixfred.com/sites.json";
const WIDGET_HOSTS = new Set(["nixfred.com", "nixfredos.com", "how.nixfred.com", "ladder.nixfred.com", "larry.nixfred.com"]);
const KNOWLEDGE_HOST = /\.nixfred\.com$/;   // *.nixfred.com only (Fred, 7:52 PM): no nixfred.tech, no off-domain cards
// not family, just not wanted in the index: larry.nixfred.com's version archives (Fred, 7:52 PM)
export const SKIP_PATHS: [RegExp, string][] = [[/^https:\/\/larry\.nixfred\.com\/v[1-5](\/|$)/, "larry.nixfred.com version archive (v1 to v5)"]];
// the five widget sites, in Fred's words; the card sites get the one-liner from their nixfred.com card
const MAIN_DIRECTORY = [
  { id: "nixfred", host: "nixfred.com", url: "https://nixfred.com/", name: "nixfred.com", role: "Fred, portfolio and hiring", keys: ["portfolio", "resume", "hire fred", "hire him", "hiring", "fred's site", "fred's website", "fred's home page", "fred's homepage", "about fred", "contact fred", "nixfred.com"] },
  { id: "nixfredos", host: "nixfredos.com", url: "https://nixfredos.com/", name: "nixfredOS", role: "the pitch", keys: ["pitch", "nixfredos", "nixfred os", "what you get"] },
  { id: "how", host: "how.nixfred.com", url: "https://how.nixfred.com/", name: "how.nixfred.com", role: "the guide", keys: ["the guide", "larry's guide", "how-to guide", "how to guide", "build your own ai", "how.nixfred.com"] },
  { id: "ladder", host: "ladder.nixfred.com", url: "https://ladder.nixfred.com/", name: "The Ladder", role: "the student checklist", keys: ["the ladder", "ladder", "student checklist", "ladder.nixfred.com"] },
  { id: "larry", host: "larry.nixfred.com", url: "https://larry.nixfred.com/", name: "larry.nixfred.com", role: "Larry's story", keys: ["larry's story", "larry's site", "larry's website", "larry's own site", "larry.nixfred.com"] },
];
// family and personal (Fred, 2026-10-20): never crawled, never indexed
export const DENY_HOSTS = new Set(["dad.nixfred.com", "sr.nixfred.com", "crystalmnix.com", "masonnix.com", "dianajosephhamlin.pages.dev"]);
export const DENY_PATHS = ["https://nixfred.com/caregiving", "https://nixfred.com/ella"];
// the same people's pages on other sites (galaxy.nixfred.com/project/<slug>/ and the like), by path segment
export const DENY_SLUGS = new Set(["a-life-in-the-air", "dad", "crystal-m-nix", "mason-l-nix", "diana-joseph-hamlin", "caregiving", "caregiving-journal", "ella", "the-life-of-ella-owen"]);
export const denied = (u: string) => { try { const x = new URL(u); const p = `${x.origin}${x.pathname}`.replace(/\/+$/, ""); return DENY_HOSTS.has(x.hostname) || DENY_PATHS.some(d => p === d || p.startsWith(d + "/")) || x.pathname.split("/").some(seg => DENY_SLUGS.has(seg.toLowerCase())); } catch { return true; } };
// a paragraph that names a denied site or person is dropped from any page (directory and card pages list them all)
const FAMILY = /\b(dad|sr)\.nixfred\.com\b|crystalmnix|masonnix|dianajosephhamlin|nixfred\.com\/(caregiving|ella)\b|Ella (Kelly )?Owen|Caregiving Journal|Alzheimer|\bFreddie Wright Nix\b|\bCrystal M\.? Nix\b|\bMason L\.? Nix\b|\bDiana Joseph\b|\bA Life in the Air\b|\bI'm Still Standing\b/i;
// and a whole section headed Personal or Family (the registry's own "Personal" section, galaxy's "## PERSONAL") goes too
export const dropFamily = (md: string) => {
  const out: string[] = []; let skip = 0;
  for (const par of md.split(/\n{2,}/)) {
    const h = par.match(/^(#{1,4})\s+(.*)/);
    if (h) { if (skip && h[1].length <= skip) skip = 0; if (!skip && /^(personal|family)\b/i.test(h[2].trim())) { skip = h[1].length; continue; } }
    if (skip || FAMILY.test(par)) continue;
    out.push(par);
  }
  return out.join("\n\n");
};
const UA = "how.nixfred.com fleet-crawler (+https://how.nixfred.com/ask-larry)";
const MAX_PAGES = 120, MAX_BFS = 60, MAX_DEPTH = 3;
const KNOW_MAX_PAGES = 100, KNOW_MAX_CHARS = 15000;   // per knowledge site, per page (youtube.nixfred.com alone lists 500); 100 per Fred, 7:52 PM (the chunks live in Vectorize, not in the site)

// robots.txt for one origin -> may(path). Groups for "*" (or this crawler by name), longest match wins, Allow wins a tie.
export function robotsRules(txt: string): (path: string) => boolean {
  const groups: { agents: string[]; rules: [boolean, string][] }[] = []; let cur: any = null, lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false; if (!cur) continue;
    if (k === "disallow" && v) cur.rules.push([false, v]); else if (k === "allow" && v) cur.rules.push([true, v]);
  }
  const mine = groups.filter(g => g.agents.some(a => a !== "*" && "fleet-crawler".includes(a)));
  const rules = (mine.length ? mine : groups.filter(g => g.agents.includes("*"))).flatMap(g => g.rules);
  const rx = (p: string) => new RegExp("^" + p.replace(/[.+?^{}()|[\]\\\$]/g, m => m === "$" ? m : "\\" + m).replace(/\*/g, ".*").replace(/\$(?!$)/g, "\\$"));
  return (path: string) => { let best: [boolean, string] | null = null;
    for (const r of rules) if (rx(r[1]).test(path) && (!best || r[1].length > best[1].length || (r[1].length === best[1].length && r[0]))) best = r;
    return best ? best[0] : true; };
}
const ROOT = `${import.meta.dir}/..`;
const EXTRA: { render?: string[]; extra?: { host: string; name: string; role: string; about?: string }[]; keys?: Record<string, string[]> } = existsSync(`${ROOT}/fleet/extra-sites.json`) ? JSON.parse(readFileSync(`${ROOT}/fleet/extra-sites.json`, "utf8")) : {};

export function redact(t: string): string {
  t = t.replace(/\b[A-Za-z0-9]+\b/g, w => w.length <= 8 && HOST_HASHES.has(`${w.length}:${fnv1a(w.toLowerCase()).toString(36)}`) ? "one of my machines" : w);
  t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})*/g, m => PUBLIC_EMAILS.has(m.toLowerCase()) || /\.(md|json|ts|js|sh|html)$/i.test(m) || /@\d/.test(m) ? m : "[email removed]");
  for (const [, rx] of RULES) t = t.replace(new RegExp(rx.source, rx.flags), "[removed]");
  // Larry's home is larry.nixfred.com and old pages still name the old path under the portfolio domain (audit rule)
  t = t.replace(/(?:https?:\/\/)?(?:www\.)?nixfred\.com\/larry(?![\w.-])\/?/g, "larry.nixfred.com/");
  return t;
}

async function get(url: string): Promise<Response | null> {
  try { return await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xml;q=0.9,*/*;q=0.5" }, redirect: "follow", signal: AbortSignal.timeout(15000) }); }
  catch { return null; }
}
const canon = (u: string) => { const x = new URL(u); x.hash = ""; x.search = ""; return x.href; };
const skipPath = (p: string) => /\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|gz|mp4|mp3|webm|css|js|json|xml|txt|woff2?)$/i.test(p) || /(^|\/)(404|login|signin|sign-in|logout|auth|admin|api)(\/|\.html|$)/i.test(p);

async function sitemapUrls(origin: string): Promise<string[]> {
  const maps = new Set<string>([`${origin}/sitemap.xml`]);
  const robots = await get(`${origin}/robots.txt`);
  if (robots?.ok) for (const m of (await robots.text()).matchAll(/^\s*sitemap:\s*(\S+)/gim)) maps.add(m[1]);
  const out = new Set<string>(); const seen = new Set<string>(); const queue = [...maps];
  while (queue.length && seen.size < 20) {
    const sm = queue.shift()!; if (seen.has(sm)) continue; seen.add(sm);
    if (new URL(sm).origin !== origin) continue;
    const r = await get(sm); if (!r?.ok || new URL(r.url).origin !== origin || !/xml/.test(r.headers.get("content-type") || "")) continue;
    const xml = await r.text();
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => decode(m[1]));
    if (/<sitemapindex/i.test(xml)) queue.push(...locs); else for (const l of locs) out.add(l);
  }
  return [...out].filter(u => { try { const x = new URL(u); return x.origin === origin && !skipPath(x.pathname); } catch { return false; } });
}

type Doc = { url: string; title: string; description: string; md: string };
async function fetchPage(url: string, origin: string, maxChars = Infinity): Promise<{ doc?: Doc; links?: string[]; why?: string }> {
  if (denied(url)) return { why: "family / personal denylist" };
  for (const [rx, why] of SKIP_PATHS) if (rx.test(url)) return { why };
  const r = await get(url);
  if (!r) return { why: "fetch failed" };
  const final = new URL(r.url);
  if (final.origin !== origin) return { why: `redirects off-site to ${final.origin}` };
  if (skipPath(final.pathname)) return { why: `redirects to ${final.pathname}` };
  if (denied(final.href)) return { why: "family / personal denylist" };
  for (const [rx, why] of SKIP_PATHS) if (rx.test(final.href)) return { why };
  if (r.status !== 200) return { why: `HTTP ${r.status}` };
  if (!/text\/html/.test(r.headers.get("content-type") || "")) return { why: `not html (${r.headers.get("content-type")})` };
  const html = await r.text();
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) return { why: "meta robots noindex" };
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? final.pathname).replace(/\s+/g, " ").trim();
  const description = decode(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "").trim();
  if (FAMILY.test(decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""))) return { why: "family / personal denylist (title)" };
  let md = dropFamily(pageToMd(html));
  if (md.length > maxChars) { const cut = md.lastIndexOf("\n\n", maxChars); md = md.slice(0, cut > maxChars / 2 ? cut : maxChars); }
  const links = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"'#]+)/gi)].map(m => { try { return canon(new URL(decode(m[1]), final.href).href); } catch { return ""; } })
    .filter(u => u && new URL(u).origin === origin && !skipPath(new URL(u).pathname));
  if (md.split(/\s+/).length < 25) return { why: "under 25 words of text", links };
  return { doc: { url: canon(final.href), title: redact(title), description: redact(description), md: redact(md) }, links };
}

// the knowledge-only sites, live from the registry: card sites on *.nixfred.com / *.nixfred.tech, minus the five and DENY
async function knowledgeSites(): Promise<{ list: any[]; out: { host: string; why: string }[] }> {
  const r = await get(REGISTRY); if (!r?.ok) throw new Error(`registry ${REGISTRY} unreachable`);
  const reg: any = await r.json(); const list: any[] = [], out: { host: string; why: string }[] = [];
  for (const x of reg.sites || []) {
    if (x.kind !== "site" || x.status !== "live") continue;
    const host = String(x.host || ""); if (WIDGET_HOSTS.has(host)) continue;
    if (!KNOWLEDGE_HOST.test(host)) { out.push({ host, why: DENY_HOSTS.has(host) ? "family / personal denylist" : "not on *.nixfred.com (out of scope)" }); continue; }
    if (DENY_HOSTS.has(host) || (x.aliases || []).some((a: string) => DENY_HOSTS.has(a))) { out.push({ host, why: "family / personal denylist" }); continue; }
    list.push({ id: host, origin: `https://${host}`, url: x.url || `https://${host}/`, kind: "knowledge", title: x.title || host, titleFull: x.titleFull || x.title || host, about: x.desc?.line || x.title || "", card: x.desc?.card || x.desc?.long || "", long: x.desc?.long || "" });
  }
  // live *.nixfred.com sites the registry does not list yet (fleet/extra-sites.json, each one checked with curl)
  for (const x of EXTRA.extra || []) {
    if (list.some(k => k.id === x.host)) continue;
    if (DENY_HOSTS.has(x.host) || !KNOWLEDGE_HOST.test(x.host)) { out.push({ host: x.host, why: DENY_HOSTS.has(x.host) ? "family / personal denylist" : "not on *.nixfred.com (out of scope)" }); continue; }
    list.push({ id: x.host, origin: `https://${x.host}`, url: `https://${x.host}/`, kind: "knowledge", title: x.name, about: x.role, card: x.about || x.role });
  }
  return { list, out };
}

// ---- script-rendered sites (mac, townhop, go, omarchy, filter): their HTML has under 25 words, so a plain fetch finds nothing.
// Each gets ONE card page at its home URL, built from its nixfred.com/sites.json card (title, card line, long line). With --render
// (local only, headless Chromium, software rendering, no window, never the GPU) the sites listed in fleet/extra-sites.json "render"
// also get the text the browser shows, chunked like any page. Sites whose page is live data (go: today's events, townhop: a demo
// route with creators' view counts) or a desktop UI (mac) stay card-only, so the index never holds stale listings. A site that is
// robots-blocked or noindex (ddn, aiwatch) never gets here: it stays a directory link.
const RENDER = process.argv.includes("--render");
const RENDER_HOSTS = new Set<string>(EXTRA.render || []);
const undash = (t: string) => t.replace(/\s*[\u2013\u2014]\s*/g, ", ");
async function renderHtml(url: string): Promise<string | null> {
  try {
    const PW = process.env.PLAYWRIGHT || `${process.env.HOME}/.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs`;
    const { chromium } = await import(PW);
    const browser = await chromium.launch({ headless: true, executablePath: existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined, args: ["--disable-gpu", "--disable-gpu-compositing", "--use-gl=disabled", "--mute-audio"] });
    try {
      const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, userAgent: UA })).newPage();
      await page.goto(url, { waitUntil: "load", timeout: 30000 }); await page.waitForTimeout(6000);
      return await page.content();
    } finally { await browser.close(); }
  } catch (e) { console.warn(`! render ${url} failed: ${String(e).slice(0, 120)}`); return null; }
}
// repo-card chrome on rendered catalog pages (stars, forks, language, "Install / Clone" ...): no meaning as search text
const CHROME = /^(\*\*)?\d+(\*\*)?\s*(stars|forks|watching|open PRs|open issues|commits? shown)$|^\*\*\d+\*\*(stars|forks|watching|open PRs|open issues|commits? shown)$|(language|licen[cs]e(, release)?|release|created|last push|branch|(contributors?|commits?) shown)$|^(not )?listed\s*(ALPHA|developing|shelved)?\s*(fork)?\s*\d*$|^(Install|Clone|Source|Details)$/i;
const RENDER_MAX_CHARS = 40000;
async function cardDoc(s: any): Promise<{ doc: Doc; rendered: boolean }> {
  const home = canon(`${s.origin}/`), title = undash(s.titleFull || s.title);
  const card = undash(String(s.card || s.about || "")).trim(), long = undash(String(s.long || "")).trim();
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let body = "";
  if (RENDER && RENDER_HOSTS.has(s.id)) {
    const html = await renderHtml(home);
    if (html && !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
      body = dropFamily(pageToMd(html)).split("\n").filter(l => !CHROME.test(l.trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
      if (body.length > RENDER_MAX_CHARS) { const cut = body.lastIndexOf("\n\n", RENDER_MAX_CHARS); body = body.slice(0, cut > RENDER_MAX_CHARS / 2 ? cut : RENDER_MAX_CHARS); }
      if (body.split(/\s+/).length < 25) body = "";
    }
  }
  // the registry's long line can be stale (omarchy: "Thirty plugins" while the page lists 74): with real page text, the page wins
  let md = `# ${title}\n\n${card}`;
  if (!body && long && !norm(card).includes(norm(long))) md += `\n\n${long}`;
  md += `\n\nThis is the site at ${home}`;
  if (body) md += `\n\n## What the page shows\n\n${undash(body)}`;
  return { doc: { url: home, title: redact(title), description: redact(card), md: redact(md) }, rendered: !!body };
}

async function crawlSite(s: any, skipped: { url: string; why: string }[]) {
  const know = s.kind === "knowledge"; const docs = new Map<string, Doc>();
  let may = (_: string) => true;
  if (know) { const rb = await get(`${s.origin}/robots.txt`); if (rb?.ok && /text\/plain/.test(rb.headers.get("content-type") || "")) may = robotsRules(await rb.text()); }
  if (!may("/")) return { docs, source: "robots", why: "robots.txt disallows /" };
  const cap = know ? KNOW_MAX_PAGES : MAX_PAGES;
  const fromMap = (await sitemapUrls(s.origin)).filter(u => !denied(u));
  const source = fromMap.length ? "sitemap" : "links";
  const queue: [string, number][] = (fromMap.length ? fromMap.slice(0, cap) : [`${s.origin}/`]).map(u => [canon(u), 0]);
  const seen = new Set(queue.map(([u]) => u));
  while (queue.length && docs.size < cap) {
    const [url, depth] = queue.shift()!;
    if (!may(new URL(url).pathname)) { skipped.push({ url, why: "robots.txt disallows it" }); continue; }
    const res = await fetchPage(url, s.origin, know ? KNOW_MAX_CHARS : Infinity);
    if (res.doc && !docs.has(res.doc.url)) docs.set(res.doc.url, res.doc);
    else if (res.why) skipped.push({ url, why: res.why });
    if (source === "links" && depth < MAX_DEPTH) for (const l of res.links || []) if (!seen.has(l) && seen.size < MAX_BFS) { seen.add(l); queue.push([l, depth + 1]); }
  }
  // script-rendered home page (under 25 words): a card page instead of nothing (never for a robots-blocked or noindex site)
  if (know && !docs.size && skipped.some(k => k.url === canon(`${s.origin}/`) && k.why === "under 25 words of text")) {
    const { doc, rendered } = await cardDoc(s); docs.set(doc.url, doc);
    return { docs, source: rendered ? "render+card" : "card", why: "" };
  }
  return { docs, source, why: docs.size ? "" : "no page with readable text (all skipped, see below)" };
}

if (import.meta.main) {
  const sites: any[] = []; const skipped: { url: string; why: string }[] = [];
  const prev = existsSync(`${ROOT}/fleet/crawl.json`) ? JSON.parse(readFileSync(`${ROOT}/fleet/crawl.json`, "utf8")) : null;
  const { list, out } = await knowledgeSites();
  // --only=host,host crawls just those sites and keeps every other site's last snapshot (a small, reviewable diff)
  const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7).split(",").map(x => x.trim()).filter(Boolean);
  if (only.length) for (const k of prev?.skipped || []) if (!only.includes(k.url.replace(/^https?:\/\//, "").split("/")[0])) skipped.push(k);
  for (const s of [...CRAWL_SITES.map(x => ({ ...x, kind: "widget" })), ...list]) {
    const kept = only.length && !only.includes((s as any).id) ? prev?.sites?.find((x: any) => x.id === (s as any).id) : null;
    if (only.length && !only.includes((s as any).id)) { if (kept) sites.push(kept); continue; }
    const { docs, source, why } = await crawlSite(s, skipped);
    // a site that is down right now keeps its last snapshot instead of vanishing from the index
    const old = prev?.sites?.find((x: any) => x.id === s.id);
    // a plain crawl (CI) has no browser: it keeps the committed rendered text instead of dropping it to the card
    if (!RENDER && source === "card" && old?.source === "render+card") { console.log(`${s.id}: keeping the committed rendered snapshot (${old.pages.length} page)`); sites.push(old); continue; }
    if (!docs.size && old?.pages?.length && source !== "robots") { console.warn(`! ${s.id}: no pages reachable now, keeping the previous ${old.pages.length} from ${prev.crawled}`); sites.push(old); continue; }
    console.log(`${s.id}: ${docs.size} pages from ${source} (${s.origin})${why ? ", " + why : ""}`);
    sites.push({ ...s, source, ...(why ? { why } : {}), pages: [...docs.values()] });
  }
  // ONE site directory (ask/site-directory.json), used at runtime for "which site is X" answers and auto-linking
  const directory = [...MAIN_DIRECTORY.map(d => ({ ...d, kind: "widget" })),
    ...list.map(k => { const label = k.id.split(".")[0];
      return { id: k.id, host: k.id, url: k.url.endsWith("/") ? k.url : k.url + "/", name: k.title, role: redact(k.about), about: redact(String(k.card || "")).slice(0, 260), kind: "knowledge",
        keys: [k.id, ...["site", "website", "page", "thing", "app"].map(w => `${label} ${w}`), k.title.toLowerCase(), ...(EXTRA.keys?.[k.id] || [])].filter((x, i, a) => x && a.indexOf(x) === i) }; })];
  writeFileSync(`${ROOT}/ask/site-directory.json`, JSON.stringify({ note: "ONE site directory for the fleet chat (scripts/fleet-crawl.ts writes it from https://nixfred.com/sites.json; the five widget roles are Fred's words). Used by ask/fleet.js for which-site answers and auto-linking.", registry: REGISTRY, sites: directory }, null, 1) + "\n");
  mkdirSync(`${ROOT}/fleet`, { recursive: true });
  writeFileSync(`${ROOT}/fleet/crawl.json`, JSON.stringify({ crawled: new Date().toISOString(), registry: REGISTRY, sites, not_crawled: out, skipped }, null, 1) + "\n");
  console.log(`✓ fleet/crawl.json: ${sites.reduce((a, s) => a + s.pages.length, 0)} pages from ${sites.length} sites, ${skipped.length} pages skipped, ${out.length} registry sites not crawled`);
  for (const o of out) console.log(`  not crawled ${o.host}: ${o.why}`);
  for (const k of skipped) console.log(`  skipped ${k.url}: ${k.why}`);
}
