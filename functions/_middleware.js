// Runs before every Pages Function and static file.
// 1. Markdown negotiation (3.5): a GET that asks for text/markdown gets the page's clean markdown twin
//    (x.md for a chapter or module, llms.txt for the homepage).
// 2. Request analytics (4.1): for /mcp and /api/* only, one Analytics Engine data point per request with the route,
//    method, status and latency. No IP, no question text, no identifiers.
const ROUTES = [["/mcp", "mcp"], ["/api/ask", "ask"], ["/api/fleet/ask", "fleet"], ["/api/search", "search"], ["/api/health", "health"]];
const routeOf = p => (ROUTES.find(([r]) => p === r) || [null, p.startsWith("/api/") ? "api-other" : null])[1];

function record(env, route, method, status, ms) {
  try {
    if (env.AE && route) env.AE.writeDataPoint({ indexes: [route], blobs: [route, method, String(Math.floor(status / 100)) + "xx"], doubles: [status, ms] });
  } catch (e) { console.error("analytics write failed", e && e.message); }
}

async function markdownTwin(request, env) {
  const url = new URL(request.url);
  let p = url.pathname;
  if (p === "/mcp" || p.startsWith("/api/") || p.startsWith("/.well-known/") || (/\.[a-z0-9]+$/i.test(p) && !p.endsWith(".html"))) return null;
  p = p.replace(/\.html$/, "").replace(/\/+$/, "");
  const twin = !p || p === "/index" ? "/llms.txt" : `${p}.md`;
  try {
    const r = await env.ASSETS.fetch(new URL(twin, url.origin));
    if (!r.ok || /text\/html/i.test(r.headers.get("content-type") || "")) return null;
    const body = await r.text();
    return new Response(body, { headers: {
      "content-type": "text/markdown; charset=utf-8", vary: "Accept",
      "x-markdown-tokens": String(Math.ceil(body.length / 4)),
      "cache-control": "public, max-age=0, must-revalidate", "x-content-type-options": "nosniff",
    } });
  } catch (e) {
    console.error("markdown negotiation failed", e && e.message);
    return null;
  }
}

export async function onRequest({ request, next, env }) {
  if (request.method === "GET" && /text\/markdown/i.test(request.headers.get("accept") || "")) {
    const md = await markdownTwin(request, env);
    if (md) return md;
  }
  const route = routeOf(new URL(request.url).pathname);
  if (!route) return next();
  const t0 = Date.now();
  try {
    const res = await next();
    record(env, route, request.method, res.status, Date.now() - t0);
    return res;
  } catch (e) {
    record(env, route, request.method, 500, Date.now() - t0);
    throw e;
  }
}
