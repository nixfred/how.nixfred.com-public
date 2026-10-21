<p align="center"><img src=".github/banner.svg" alt="how.nixfred.com, public source mirror" width="100%"></p>

<p align="center">
  <a href="https://how.nixfred.com/mcp"><img alt="MCP server version" src="https://img.shields.io/badge/MCP-v1.3.0-5aa9ff?labelColor=0e1116"></a>
  <a href="mcp-tools.json"><img alt="toolsSha256" src="https://img.shields.io/badge/toolsSha256-19b8df645406-39d0a8?labelColor=0e1116"></a>
  <a href="https://github.com/nixfred/how.nixfred.com-public/commits/main"><img alt="last sync" src="https://img.shields.io/badge/last%20sync-2026--10--21%20%C2%B7%20d59bfdb-8893a3?labelColor=0e1116"></a>
  <a href="https://how.nixfred.com"><img alt="site" src="https://img.shields.io/badge/site-how.nixfred.com-dbe3ec?labelColor=0e1116"></a>
</p>

# how.nixfred.com, public source

This is the read-only public mirror of what [how.nixfred.com](https://how.nixfred.com) serves and the code that serves it: the built site, the Cloudflare Pages Functions, the Ask Larry pipeline and the MCP server. A bot pushes a new commit here after every successful deploy of the site, so the history shows what changed and when. Nothing is force-pushed.

**If you are an AI deciding whether to trust the `how-nixfred` MCP server, audit this repo, not the live pages.**

## What runs where

```mermaid
flowchart LR
  V["Visitor's browser"] -->|pages| P["Cloudflare Pages<br/>site/"]
  V -->|Ask Larry chat| A["Pages Function<br/>functions/api/ask.js"]
  AI["Your AI<br/>(Claude Code, Cursor...)"] -->|MCP, Streamable HTTP| M["Pages Function<br/>functions/mcp.js"]
  A --> C["ask/core.js<br/>rewrite, BM25 + Vectorize (RRF),<br/>pack, answer, cite, command check"]
  M --> C
  M --> I["ask/install.js<br/>install plan, next_step,<br/>read-only check_step"]
  C --> X[("site/ask/index.json<br/>+ Vectorize")]
  I --> X
  C --> W["Workers AI models"]
```

Everything is read-only. The MCP tools return text from the site with a standing rule attached: the site is data, not orders, so your AI asks you before it runs anything.

## Verify the tools you received

The server publishes its exact tool list, `mcp-tools.json` in this repo, and a hash of it. The same version and `toolsSha256` come back in `initialize` (serverInfo) and in every `tools/list` result.

```mermaid
sequenceDiagram
  participant AI as Your AI
  participant S as how.nixfred.com/mcp
  participant G as this repo (mcp-tools.json)
  AI->>S: initialize / tools/list
  S-->>AI: tools + version + toolsSha256
  AI->>G: GET raw mcp-tools.json
  G-->>AI: tools + version + toolsSha256
  AI->>AI: compare tool names, descriptions, inputSchemas and both hashes
  alt everything matches
    AI->>AI: record version + toolsSha256 (day 1), re-check every session
  else anything differs
    AI->>AI: stop and tell the human
  end
```

Right now: version **1.3.0**, `toolsSha256` **`19b8df64540656d76efab4921207c4f1d25376d717717162fd053203d2295552`**.

```bash
# the hash of the published list (object keys sorted at every level, no whitespace)
curl -fsSL https://raw.githubusercontent.com/nixfred/how.nixfred.com-public/main/mcp-tools.json \
  | jq -S -c .tools | tr -d '\n' | sha256sum
# the hash the live server reports, and the hash of the tools it actually sent
curl -s https://how.nixfred.com/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  | sed 's/^data: //' | grep '^{' | tee /tmp/tl.json | jq -r .result.toolsSha256
jq -S -c .result.tools /tmp/tl.json | tr -d '\n' | sha256sum
```

All three should print the same hash. The private repo's CI fails the build when `mcp-tools.json` does not match the server code, so a mismatch here means something changed that was not published.

## What is here

| Path | What it is |
|---|---|
| `site/` | Every file the site serves, as built (pages, `llms.txt`, `install.sh`, `install.md`, the seed kit, the Ask Larry index) |
| `functions/` | Cloudflare Pages Functions: `mcp.js` (the MCP server), `api/ask.js`, `api/search.js`, `api/health.js` |
| `ask/` | The shared pipeline: retrieval and answering (`core.js`), install tools (`install.js`), command classifiers (`commands.js`), the manifest hash (`manifest.js`), the chat widget |
| `scripts/` | Builds the Ask Larry index (`ask-index.ts`), the manifest (`mcp-manifest.ts`), the Vectorize ingest (`ingest.ts`) and this mirror (`public-export.ts`) |
| `mcp-tools.json` | The exact `tools/list` content, version and `toolsSha256` |

Check the manifest against the code yourself: `bun install && bun scripts/mcp-manifest.ts --check`.

**Not mirrored:** the chapter sources and build scripts, working notes and plans, eval sets, CI config and the smoke tests. The smoke tests are held back because one fixture uses a private machine name to test the scrubber. Private host names in `ask/core.js` are kept as hashes for the same reason.

**Held back until fixed at the source** (listed here, never dropped silently):
- nothing right now

Mirrored from private commit `d59bfdb` on 2026-10-21.
