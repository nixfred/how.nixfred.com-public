// POST /api/fleet/ask  {site, q, history?: last 6 turns [{role, content}]}  ->  200 {answer, sources: [{title, url}], site, refused}
// The fleet chat every fleet site embeds (/embed.js). Non-streaming. Contract, CORS allowlist and the daily cap: ask/fleet.js.
import { handleFleetAsk, fleetPreflight, fleetUsage } from "../../../ask/fleet.js";

export const onRequestOptions = ({ request }) => fleetPreflight(request);
export const onRequestPost = ({ request, env }) => handleFleetAsk(request, env);
export const onRequestGet = ({ request }) => fleetUsage(request);
