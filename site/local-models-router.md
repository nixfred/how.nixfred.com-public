---
title: "Your Rules, Your Models: Local LLMs and a Local or Cloud Router"
slug: "local-models-router"
summary: "run an open model on your own machine and route sensitive folders to it, everything else to Claude"
---

# Your Rules, Your Models: Local LLMs and a Local or Cloud Router

**For you, the human, start here.** Some work should never leave your machine: client records, health details, anything under a confidentiality rule. Other work is simple enough that a free model on your own computer does it fine. This module installs a local model sized to your memory, writes your routing rules down, and wires the simplest router there is: a folder rule. Work in a sensitive folder runs on the local model; everywhere else uses Claude as normal. The killer demo: stop the local model and watch the sensitive folder refuse to work instead of quietly sending your data to the cloud.

**What it covers (searchable):** Ollama, local LLM, open models, Qwen, Gemma, Apple silicon unified memory, NVIDIA VRAM, model sizing, Claude Code with Ollama, ANTHROPIC_BASE_URL, project settings.json env, ollama launch claude, LM Studio, claude-code-router, LiteLLM, routing rules, fail closed, data terms.

**How to hand it off:** point your AI at this page and say *"help me write my routing rules, then set up a local model for the sensitive work."* The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

By default every prompt you process goes to a cloud model. For most work that is right: the best models are there. But your human may have data that must stay on the machine, and they may want free local capacity for simple jobs. You need rules they can say out loud, and a mechanism that follows them without anyone remembering.

## Rules first, tools second

Before installing anything, write the rules with your human in a file you can read (for example `~/Projects/ROUTING.md`). Ask as a menu, one data type at a time:

```
client or patient records, IDs, tax data  -> local only, never cloud
summaries of public material               -> local first
hard reasoning, code, long agent work      -> Claude
everything else                            -> Claude
```

Also tell them the plan terms honestly, because they affect the rules: Claude Pro and Max are consumer plans, where model training is a user setting and retention depends on it; Team and the API are commercial plans with no training by default ([data usage](https://code.claude.com/docs/en/data-usage)). Let your human decide which fits their obligations; do not decide for them.

## Size the model to the machine

Memory decides everything. Leave room for the rest of their apps. Starting points from published September 2026 benchmarks (verify on their machine by timing a real prompt):

| Machine | Try first | Honest use |
|---|---|---|
| 16 GB Apple silicon | a 4B to 9B model at 4-bit (for example Qwen 3.5 4B or 9B) | summaries, extraction, drafting |
| 24 to 36 GB Apple silicon | a 27B dense or 35B mixture-of-experts model at 4-bit | solid everyday local work |
| 64 GB+ Apple silicon | the same models, much faster | local becomes pleasant |
| 8 to 12 GB NVIDIA | 4B to 14B at 4-bit | fast small models |

Under 16 GB, local models are a demo, not a daily tool. Say so before anyone buys hardware.

## The recipe

**Mac:**

```bash
brew install ollama
ollama serve &                       # or open the Ollama app
ollama pull qwen3.5:9b               # pick from the table above
ollama run qwen3.5:9b "Summarize: the meeting moved to Tuesday."
```

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3.5:9b
ollama run qwen3.5:9b "Summarize: the meeting moved to Tuesday."
```

**The router: a folder rule.** Ollama speaks the Anthropic API, so Claude Code can use it directly ([Ollama docs](https://docs.ollama.com/integrations/claude-code)). Put the sensitive work in one folder and give that folder its own settings. Create `.claude/settings.json` inside it:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:11434",
    "ANTHROPIC_AUTH_TOKEN": "ollama",
    "ANTHROPIC_API_KEY": "",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "permissions": { "deny": ["WebFetch", "WebSearch"] }
}
```

Start Claude Code in that folder with the local model: `claude --model qwen3.5:9b`. Everywhere else, nothing changes.

**Prove it, both ways, with your human watching:**

1. In the sensitive folder, ask a trivial question. Confirm Ollama served it: its log shows a `POST /v1/messages` request at that moment.
2. Stop Ollama and ask again. The session must hang or error. It must **not** answer, because an answer would mean the work went somewhere else. This was tested with a signed-in Claude Code session in September 2026: the folder's settings sent the request to the local port, and with nothing listening it did not fall back to the cloud. Re-test after Claude Code updates.

Other routers exist: `ollama launch claude` starts Claude Code on a local model for one session, LM Studio offers the same Anthropic compatible endpoint, and claude-code-router and LiteLLM are proxies with smarter rules. Start with the folder rule; it is the one your human can understand and audit.

## Lead with choices (Chapter 3)

- **Novice:** one model, one sensitive folder, the prove-it test.
- **Mid:** a second model for code or speed, rules file reviewed monthly.
- **Super user:** a proxy router with per-task rules, and logs showing where every request went.

## Worked example

Your human keeps client files in `~/Clients`. That folder gets the settings above. They open it and ask for a summary of a client letter: the Ollama log shows the request, the answer comes from the local model, and web tools are denied. They stop Ollama and try again: the session stalls instead of answering. In `~/Projects/website`, Claude works as normal. The rule is one sentence: "anything in Clients stays on this machine."

> **Larry's read:** local models are good at summarising, extracting and drafting, and they will disappoint you on hard reasoning. That is fine; the router is the point, not the model. The one thing that must never happen is a silent fallback, a setup that "helps" by sending the sensitive request to the cloud when local is down. Test the failure, not just the success.

---

## Your next step

Run every summarising job in the sensitive folder through local for a week, and update the rules when a real case does not fit. Then return to [how.nixfred.com](index.html) for [Chapter 18, models, thinking and cost](18-models.html) and [Chapter 19, permissions](19-permissions.html). Basics first, modules after.
