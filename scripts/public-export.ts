// Builds the public mirror (nixfred/how.nixfred.com-public): an allowlist of what is served and the code that serves it.
// Usage: bun scripts/public-export.ts <outdir>   (env PRIVATE_SHA: the private commit being mirrored)
// Fails (exit 1) if the export contains a private host name, a non-public email, a private IP or a credential-shaped string.
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const ROOT = `${import.meta.dir}/..`; const OUT = process.argv[2];

// what goes out: served files, the server code, the scripts that build the index and the manifest
const ALLOW = ["site", "functions", "ask", "scripts/ask-index.ts", "scripts/mcp-manifest.ts", "scripts/ingest.ts", "scripts/public-export.ts",
  "mcp-tools.json", "package.json", "bun.lock"];
// held back on purpose until fixed at the source (each is listed in the public README, never dropped silently).
// A held-back file that scans clean is mirrored again automatically.
const HOLD: Record<string, string> = {
  "site/seed/LINEAGE.md": "names one of the owner's machines; a reword is queued (inbox 003)",
};

export const HOST_HASHES = new Set(["3:mj5xqm", "3:tpi3i1", "4:18fxzs4", "3:bd2pnt", "4:5c7zia", "6:17m2iyu"]);   // same list as ask/core.js
const fnv1a = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const PUBLIC_EMAILS = new Set(["larry@nixfred.tech", "frednix@gmail.com", "git@github.com"]);   // the contact addresses the site already publishes
const RULES: [string, RegExp][] = [
  ["private-ip", /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g],
  ["tailnet-ip", /\b100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.(?!0\b)\d{1,3}\b/g],   // x.y.z.0 network examples are fine
  ["tailnet-host", /\b[a-z0-9-]+\.ts\.net\b|\btail[0-9a-f]{5,}\b/gi],
  ["credential", /\b(sk-ant-[\w-]{20,}|sk-[A-Za-z0-9_-]{32,}|ghp_\w{20,}|github_pat_\w{20,}|gh[ousr]_\w{20,}|xox[abpr]-[\w-]{10,}|AKIA[0-9A-Z]{16}|AIza[\w-]{30,})|-----BEGIN [A-Z ]*PRIVATE KEY/g],
];
export function scanText(t: string): string[] {
  const hits: string[] = [];
  for (const w of t.match(/[A-Za-z0-9]+/g) || []) if (w.length <= 8 && HOST_HASHES.has(`${w.length}:${fnv1a(w.toLowerCase()).toString(36)}`)) { hits.push("host-name"); break; }
  for (const m of t.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})*/g) || []) if (!PUBLIC_EMAILS.has(m.toLowerCase()) && !/\.(md|json|ts|js|sh|html)$/i.test(m) && !/@\d/.test(m)) { hits.push("email"); break; }
  for (const [k, rx] of RULES) if (t.match(rx)) hits.push(k);
  return hits;
}
const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

if (import.meta.main) {
  if (!OUT) { console.error("usage: bun scripts/public-export.ts <outdir>"); process.exit(2); }
  rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
  for (const a of ALLOW) cpSync(join(ROOT, a), join(OUT, a), { recursive: true });
  const held: [string, string][] = [];
  for (const [f, why] of Object.entries(HOLD)) { const p = join(OUT, f); if (existsSync(p) && scanText(readFileSync(p, "utf8")).length) { rmSync(p); held.push([f, why]); } }
  const man = JSON.parse(readFileSync(join(ROOT, "mcp-tools.json"), "utf8"));
  const sha = (process.env.PRIVATE_SHA || "local").slice(0, 7), date = new Date().toISOString().slice(0, 10);
  const badge = (l: string, v: string, c: string) => `https://img.shields.io/badge/${encodeURIComponent(l.replace(/-/g, "--"))}-${encodeURIComponent(v.replace(/-/g, "--"))}-${c}?labelColor=0e1116`;
  let readme = readFileSync(join(ROOT, "public/README.md"), "utf8")
    .replaceAll("{{VERSION}}", man.version).replaceAll("{{TOOLS_SHA}}", man.toolsSha256).replaceAll("{{TOOLS_SHA12}}", man.toolsSha256.slice(0, 12))
    .replaceAll("{{SHA}}", sha).replaceAll("{{DATE}}", date)
    .replaceAll("{{BADGE_MCP}}", badge("MCP", `v${man.version}`, "5aa9ff")).replaceAll("{{BADGE_SHA}}", badge("toolsSha256", man.toolsSha256.slice(0, 12), "39d0a8"))
    .replaceAll("{{BADGE_SYNC}}", badge("last sync", `${date} · ${sha}`, "8893a3"))
    .replaceAll("{{HELD}}", held.length ? held.map(([f, w]) => `- \`${f}\`: ${w}`).join("\n") : "- nothing right now");
  writeFileSync(join(OUT, "README.md"), readme);
  mkdirSync(join(OUT, ".github"), { recursive: true }); cpSync(join(ROOT, "public/banner.svg"), join(OUT, ".github/banner.svg"));
  const bad: string[] = [];
  for (const p of walk(OUT)) { if (/\.(png|jpe?g|gif|webp|ico|woff2?)$/i.test(p)) continue; const h = scanText(readFileSync(p, "utf8")); if (h.length) bad.push(`${relative(OUT, p)}: ${[...new Set(h)].join(", ")}`); }
  if (bad.length) { console.error("✗ public export is not clean (nothing pushed):\n" + bad.map(b => "  " + b).join("\n")); process.exit(1); }
  console.log(`✓ public export: ${walk(OUT).length} files, clean, held back ${held.length} (${held.map(h => h[0]).join(", ") || "none"}), mcp v${man.version} ${man.toolsSha256.slice(0, 12)}`);
}
