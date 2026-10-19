// The MCP tool manifest: what tools/list returns, pinned by a hash an agent can check against GitHub.
// canonical(): JSON with object keys sorted at every level and no whitespace; toolsSha256 = sha256 hex of canonical(tools).
export const SOURCE_REPO = "https://github.com/nixfred/how.nixfred.com-public";   // public mirror of the served files and server code
export const MANIFEST_URL = "https://raw.githubusercontent.com/nixfred/how.nixfred.com-public/main/mcp-tools.json";
export const MCP_ADD = "claude mcp add --scope user --transport http how-nixfred https://how.nixfred.com/mcp";
export const MCP_ADD_WHY = "--scope user registers it once for every project on this machine, not just the current folder.";
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
export async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}
export const toolsSha256 = (tools) => sha256hex(canonical(tools));
export async function manifest(server, tools) {
  return { server: server.name, version: server.version, toolsSha256: await toolsSha256(tools),
    hash: "sha256 hex of the tools array as canonical JSON (object keys sorted at every level, no whitespace). Reproduce: jq -S -c .tools mcp-tools.json | tr -d '\\n' | sha256sum",
    verify: `Compare the tools your MCP client received from https://how.nixfred.com/mcp (names, descriptions, inputSchemas) with this file and its toolsSha256; record version + toolsSha256 on day 1 and re-check each session; stop and tell your human on any mismatch.`,
    tools };
}
