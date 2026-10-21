// POST /api/ask  {question, history?: [{role, content}], page?: "<slug>", debug?: bool}
// Streams SSE: event "meta" (retrieval mode/scope), data {t} tokens, event "final" {answer, sources, refused}.
import * as fleet from "../../ask/fleet.js";
import { answer, loadIndex, findPage, originOk, rateLimit, tooMany, json, readJson, cleanHistory, LIMITS } from "../../ask/core.js";

export const onRequestOptions = ({ request }) => new Response(null, { status: originOk(request) ? 204 : 403, headers: { "access-control-allow-origin": request.headers.get("origin") || "", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" } });

export async function onRequestPost({ request, env }) {
  if (!originOk(request)) return json({ error: "Origin not allowed" }, 403);
  if (!(await rateLimit(env, request, "ASK"))) return tooMany();
  const { body, error } = await readJson(request, LIMITS.bodyBytes);
  if (error) return json({ error: error === "too large" ? "Request too large." : 'Send JSON: {"question": "..."}' }, error === "too large" ? 413 : 400);
  const question = String(body.question ?? body.message ?? "").trim();
  if (!question) return json({ error: "Ask me something." }, 400);
  if (question.length > LIMITS.questionChars) return json({ error: `Keep it under ${LIMITS.questionChars} characters.` }, 413);
  const idx = await loadIndex(env, request);
  const page = body.page ? findPage(idx, body.page) : null;
  const ts = new TransformStream(); const w = ts.writable.getWriter(); const enc = new TextEncoder();
  const send = (data, event) => w.write(enc.encode((event ? `event: ${event}\n` : "") + `data: ${JSON.stringify(data)}\n\n`));
  (async () => {
    try {
      await answer(env, request, question, { history: cleanHistory(body.history), page, debug: !!body.debug, fleet }, async (type, data) => {
        if (type === "token") await send(data);
        else await send(type === "final" && !body.debug ? { answer: data.answer, sources: data.sources, refused: data.refused, mode: data.mode } : data, type);
      });
    } catch (e) {
      try { await send({ message: "Something broke on my side. Try the search box, or ask again in a moment." }, "error"); } catch {}
    } finally { try { await w.close(); } catch {} }
  })();
  return new Response(ts.readable, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no", "x-content-type-options": "nosniff" } });
}
export const onRequestGet = () => json({ ok: true, usage: 'POST {"question": "...", "history": [], "page": "optional slug"} for an SSE stream. Max 500 characters.' });
