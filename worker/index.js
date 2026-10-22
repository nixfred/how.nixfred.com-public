// how.nixfred.com as one Worker (6.1). Static files come from site/ through the ASSETS binding; this router maps
// the paths that used to be Pages Functions to the same onRequest handlers in functions/, and runs the same
// middleware (markdown negotiation, analytics) in front of everything. The handlers are unchanged.
import * as mw from "../functions/_middleware.js";
import * as mcp from "../functions/mcp.js";
import * as ask from "../functions/api/ask.js";
import * as health from "../functions/api/health.js";
import * as search from "../functions/api/search.js";
import * as fleetAsk from "../functions/api/fleet/ask.js";
import limiter from "../ratelimit-worker/index.js";
export { FleetCap } from "../ratelimit-worker/index.js";

const ROUTES = { "/mcp": mcp, "/api/ask": ask, "/api/health": health, "/api/search": search, "/api/fleet/ask": fleetAsk };
const METHOD = m => "onRequest" + m.charAt(0) + m.slice(1).toLowerCase();

// 6.2: the rate limits and FleetCap are bindings on this Worker now. env.RL keeps its old shape (a fetch to the
// limiter), served in-process by the same limiter code, so ask/ and functions/ need no change.
function withLimiter(env) {
  if (!env.ASK || !env.FLEET_CAP) return env;   // bindings missing: env.RL stays as configured (or absent)
  const rl = { fetch: (url, init) => limiter.fetch(new Request(url, init), env) };
  return Object.assign(Object.create(env), { RL: rl });
}

// Keep what Pages sent: the .html -> clean URL redirect stays permanent (308, assets send 307), and 404s are not cached.
function pagesParity(res, path) {
  if (res.status === 307 && /\.html$/.test(path)) return new Response(null, { status: 308, headers: res.headers });
  if (res.status === 404) { const r = new Response(res.body, res); r.headers.set("cache-control", "no-store"); return r; }
  return res;
}

export default {
  async fetch(request, rawEnv, ctx) {
    const env = withLimiter(rawEnv);
    const raw = new URL(request.url).pathname;
    const path = raw.replace(/\/+$/, "") || "/";
    const next = async () => {
      const mod = ROUTES[path];
      const h = mod && (mod[METHOD(request.method)] || mod.onRequest);
      if (h) return h({ request, env, waitUntil: p => ctx.waitUntil(p), params: {}, data: {}, next: () => env.ASSETS.fetch(request) });
      return pagesParity(await env.ASSETS.fetch(request), raw);
    };
    return mw.onRequest({ request, env, next, waitUntil: p => ctx.waitUntil(p), data: {} });
  },
};
