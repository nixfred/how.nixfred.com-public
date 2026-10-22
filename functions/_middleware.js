// 3.5 markdown negotiation: a GET that asks for text/markdown gets the page's clean markdown twin
// (x.md for a chapter or module, llms.txt for the homepage). Everything else, including /mcp and /api/*, passes straight through.
export async function onRequest({ request, next, env }) {
  if (request.method !== "GET" || !/text\/markdown/i.test(request.headers.get("accept") || "")) return next();
  const url = new URL(request.url);
  let p = url.pathname;
  if (p === "/mcp" || p.startsWith("/api/") || p.startsWith("/.well-known/") || (/\.[a-z0-9]+$/i.test(p) && !p.endsWith(".html"))) return next();
  p = p.replace(/\.html$/, "").replace(/\/+$/, "");
  const twin = !p || p === "/index" ? "/llms.txt" : `${p}.md`;
  try {
    const r = await env.ASSETS.fetch(new URL(twin, url.origin));
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || /text\/html/i.test(ct)) return next();
    const body = await r.text();
    return new Response(body, { headers: {
      "content-type": "text/markdown; charset=utf-8", vary: "Accept",
      "x-markdown-tokens": String(Math.ceil(body.length / 4)),
      "cache-control": "public, max-age=0, must-revalidate", "x-content-type-options": "nosniff",
    } });
  } catch (e) {
    console.error("markdown negotiation failed", e && e.message);
    return next();
  }
}
