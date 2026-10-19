// GET /api/health , cheap liveness: index version, bindings present, models. No model calls.
import { loadIndex, json, MODELS } from "../../ask/core.js";
export async function onRequestGet({ request, env }) {
  try {
    const idx = await loadIndex(env, request);
    return json({ ok: true, version: idx.version, pages: idx.pages.length, chunks: idx.chunks.length, install_steps: idx.steps.length,
      embed: idx.embed ? { model: idx.embed.model, dims: idx.embed.dims, index: idx.embed.index } : null,
      chat: MODELS.chat, bindings: { ai: !!env.AI, vectorize: !!env.VECTORIZE, ratelimit: !!env.RL }, mcp: "https://how.nixfred.com/mcp" });
  } catch (e) { return json({ ok: false, error: "index unavailable" }, 503); }
}
