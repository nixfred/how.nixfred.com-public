// Writes the exact tools/list content (names, descriptions, inputSchemas, server version, toolsSha256)
// to mcp-tools.json (committed) and site/mcp-tools.json (served). --check: fail if the committed file drifted.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { SERVER, TOOLS } from "../functions/mcp.js";
import { manifest } from "../ask/manifest.js";
const ROOT = `${import.meta.dir}/..`;
const out = JSON.stringify(await manifest(SERVER, TOOLS), null, 2) + "\n";
if (process.argv.includes("--check")) {
  const have = existsSync(`${ROOT}/mcp-tools.json`) ? readFileSync(`${ROOT}/mcp-tools.json`, "utf8") : "";
  if (have !== out) { console.error("✗ mcp-tools.json does not match the server's tools/list: run bun run build and commit mcp-tools.json"); process.exit(1); }
  console.log(`✓ mcp-tools.json matches the server (v${SERVER.version}, ${JSON.parse(out).toolsSha256.slice(0, 12)})`);
} else {
  writeFileSync(`${ROOT}/mcp-tools.json`, out); writeFileSync(`${ROOT}/site/mcp-tools.json`, out);
  console.log(`✓ mcp-tools.json: ${TOOLS.length} tools, v${SERVER.version}, toolsSha256 ${JSON.parse(out).toolsSha256.slice(0, 12)}`);
}
