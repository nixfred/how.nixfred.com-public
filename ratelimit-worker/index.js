// POST {bucket: "ASK"|"SEARCH"|"MCP"|"FLEET", key: "<client ip>"} -> {ok: boolean}
// POST /cap {limit} -> {ok, count, limit, day}: the fleet chat's hard daily cap (one unit per answered question).
// The cap fails closed: any error here is {ok: false}, and the Pages side then answers 503 cap_reached.
import { DurableObject } from "cloudflare:workers";

// One instance ("fleet") holds today's count. Storage calls inside one Durable Object are serialized, so the
// read-then-write below can not double-spend under concurrent requests: a true hard cap, not an estimate.
export class FleetCap extends DurableObject {
  async take(limit) {
    const day = new Date().toISOString().slice(0, 10);
    const cur = (await this.ctx.storage.get("cap")) || { day, n: 0 };
    const n = cur.day === day ? cur.n : 0;
    if (n >= limit) return { ok: false, count: n, limit, day };
    await this.ctx.storage.put("cap", { day, n: n + 1 });
    return { ok: true, count: n + 1, limit, day };
  }
}

// Strict per-visitor window. The native rate-limit bindings are approximate per location (counts sync in the
// background), so a burst from one visitor was never refused in testing. One object per bucket + hashed client
// key holds the last minute of timestamps in memory (no storage, no raw IP). Native limit() still runs first.
export const LIMITS = { ASK: 8, SEARCH: 40, MCP: 60, FLEET: 8 };
export class RateWindow extends DurableObject {
  hits = [];
  take(limit, ms = 60000) {
    const now = Date.now(); this.hits = this.hits.filter(t => now - t < ms);
    if (this.hits.length >= limit) return { ok: false, retryAfter: Math.ceil((ms - (now - this.hits[0])) / 1000) };
    this.hits.push(now); return { ok: true };
  }
}
const sha = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].slice(0, 16).map(b => b.toString(16).padStart(2, "0")).join("");

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("not found", { status: 404 });
    if (new URL(request.url).pathname === "/cap") {
      try {
        const b = await request.json(); const limit = Math.floor(Number(b.limit));
        if (!Number.isFinite(limit) || limit < 0 || !env.FLEET_CAP) return Response.json({ ok: false, error: "bad cap request" });
        return Response.json(await env.FLEET_CAP.get(env.FLEET_CAP.idFromName("fleet")).take(limit));
      } catch { return Response.json({ ok: false, error: "cap error" }); }
    }
    let b; try { b = await request.json(); } catch { return Response.json({ ok: true, error: "bad body" }); }
    const rl = { ASK: env.ASK, SEARCH: env.SEARCH, MCP: env.MCP, FLEET: env.FLEET }[b.bucket];
    if (!rl || !b.key) return Response.json({ ok: true, error: "unknown bucket" });
    const key = String(b.key).slice(0, 128);
    const { success } = await rl.limit({ key });
    if (!success) return Response.json({ ok: false });
    if (!env.RATE_WINDOW) return Response.json({ ok: true });
    try {
      const id = env.RATE_WINDOW.idFromName(b.bucket + ":" + await sha(key));
      return Response.json(await env.RATE_WINDOW.get(id).take(LIMITS[b.bucket]));
    } catch { return Response.json({ ok: true, error: "window error" }); }   // fail open to the native result
  },
};
