// Build-time half of the shared Ask Larry panel (runtime half: ask/panel.js). ONE source for the panel markup and
// CSS, used by build.ts for how.nixfred.com's own pages and for /embed.js, so every fleet site gets the same chat.
//   panelHtml(o)       the pill + panel markup (how.nixfred.com's page layout, and the embed's shadow root)
//   panelCss(style)    the embed's CSS, cut from site/assets/style.css: the :root colours, the base rules the panel
//                      inherits on how.nixfred.com, and the "ask-larry-panel" block, re-scoped to the embed's root
//   embedJs(root)      site/embed.js: panel CSS + markup + ask/panel.js + ask/embed.js, in one IIFE

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// The subtitle may only claim "all of nixfred.com" when the site directory AND the ingest cover every public *.nixfred.com
// site (family denylist excluded). test/fleet-contract.ts derives that from ask/site-directory.json and
// site/ask/fleet-meta.json and fails if COVERS_ALL claims more (or less) than the numbers show.
export const SUB_ALL = "answers from all of nixfred.com, with links";
export const subtitles = all => all ? { main: SUB_ALL, fleet: SUB_ALL } : { main: "answers only from this site, with links", fleet: "answers from Fred's sites, with links" };
export const COVERS_ALL = false;
const SUB = subtitles(COVERS_ALL);

export function panelHtml(o = {}) {
  const sub = o.sub ?? SUB.main;
  const ph = o.placeholder ?? "Ask Larry about building your own AI…";
  const foot = o.footHtml ?? `Grounded in how.nixfred.com, 500 characters max. <a href="/ask-larry">Let your AI install this with you →</a>`;
  return `<button type="button" class="al-pill" id="al-pill" aria-controls="al-panel" aria-expanded="true" title="Open Ask Larry"><span class="al-dot"></span>💬 Ask Larry</button>
<aside class="al-panel" id="al-panel" aria-label="Ask Larry">
  <header class="al-head"><div><b>Ask Larry</b><span>${esc(sub)}</span></div><button type="button" class="al-clear" title="Clear this conversation">clear</button><button type="button" class="al-close" aria-label="Minimize Ask Larry" title="Minimize">▾</button></header>
  <div class="al-scope" hidden></div>
  <div class="al-log" aria-live="polite"></div>
  <form class="al-form"><textarea class="al-input" rows="2" maxlength="500" placeholder="${esc(ph)}" aria-label="Your question for Larry"></textarea><button type="submit" class="al-send">Ask</button></form>
  <p class="al-foot">${foot}</p>
</aside>`;
}

// split CSS into top-level blocks (rules, @media with nested rules, @keyframes), keeping comments out
function blocks(css) {
  const out = []; let i = 0; css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  while (i < css.length) {
    const open = css.indexOf("{", i); if (open < 0) break;
    const head = css.slice(i, open).trim(); let depth = 1, j = open + 1;
    for (; j < css.length && depth; j++) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; }
    out.push({ head, body: css.slice(open + 1, j - 1) }); i = j;
  }
  return out;
}
// the how.nixfred.com page layout around the panel (content padding, nav, hero, sidebar search, chapter button)
const HOW_ONLY = /(^|[\s,>+~(])\.(main|nav|navtoggle|al-hero[\w-]*|cta-nav|search-results|al-chapter|wrap|col)\b/;
const scope = sel => sel.replace(/body\.al-min/g, ".al-root.al-min").replace(/body:not\(\.al-min\)/g, ".al-root:not(.al-min)").replace(/^body$/, ".al-root");
function keep(list) {
  const out = [];
  for (const b of list) {
    if (b.head.startsWith("@keyframes")) { out.push(`${b.head}{${b.body}}`); continue; }
    if (b.head.startsWith("@media")) { const inner = keep(blocks(b.body)); if (inner.length) out.push(`${b.head}{${inner.join("")}}`); continue; }
    const sels = b.head.split(",").map(s => s.trim()).filter(s => s && !HOW_ONLY.test(" " + s));
    if (sels.length) out.push(`${sels.map(scope).join(",")}{${b.body.trim()}}`);
  }
  return out;
}
export function panelCss(style) {
  const start = style.indexOf("/* ask-larry-panel:start"), end = style.indexOf("/* ask-larry-panel:end");
  if (start < 0 || end < start) throw new Error("site/assets/style.css lost its ask-larry-panel markers");
  const top = blocks(style.slice(0, start));
  const pick = h => top.find(b => b.head === h);
  const root = pick(":root"), body = pick("body"), star = pick("*"), a = pick("a"), ah = pick("a:hover");
  if (!root || !body || !star || !a) throw new Error("site/assets/style.css lost a base rule the panel inherits (:root, *, body, a)");
  // body's inheritable half only (colour, type, smoothing): the host page keeps its own margin and background
  const inherit = body.body.split(";").map(d => d.trim()).filter(d => d && !/^(margin|background)/.test(d)).join(";");
  return [
    `:host{all:initial;display:block;height:0}`,
    // phones: how.nixfred.com pads its content so the docked ask bar never covers the end of the page; the embed's
    // host element does the same job as an in-flow spacer at the end of the host page
    `@media(max-width:640px){:host{height:170px}}`,
    `.al-root{${root.body.trim()};${inherit}}`, `*{${star.body.trim()}}`, `a{${a.body.trim()}}`, ah ? `a:hover{${ah.body.trim()}}` : "",
    ...keep(blocks(style.slice(start, end))),
  ].join("\n");
}

export function embedJs(root, read) {
  const css = panelCss(read(`${root}/site/assets/style.css`));
  // the two personas whose subtitle says "the sites" follow the coverage switch too (the others keep their own wording)
  const embedSrc = SUB.fleet === SUB_ALL ? read(`${root}/ask/embed.js`).replaceAll("sub: 'answers from the sites, with links'", `sub: ${JSON.stringify(SUB_ALL)}`) : read(`${root}/ask/embed.js`);
  const html = panelHtml({ sub: SUB.fleet, placeholder: "Ask Larry anything…", footHtml: `Answers only from published pages, 500 characters max. <a href="https://how.nixfred.com/ask-larry" target="_blank" rel="noopener">Don't trust me, audit it →</a>` });
  return `// Ask Larry for every fleet site. Built by build.ts from ask/panel-build.js + ask/panel.js + ask/embed.js: the same
// panel, CSS and behaviour as how.nixfred.com's own chat. Do not edit site/embed.js by hand.
(function(){
var AL_CSS=${JSON.stringify(css)};
var AL_HTML=${JSON.stringify(html)};
${read(`${root}/ask/panel.js`)}
${embedSrc}
})();
`;
}
