---
chapter: 15
part: "Part VI: Scale It"
title: "Subagents & Forked Context"
sources: [1, 3, larry]
slug: "22-subagents"
---

# Chapter 22: Subagents & Forked Context

**For you, the human, start here.** This is the leap from "a Claude" to "a team of Claudes." A subagent is a separate Claude with its own context window, optionally its own model, working in parallel and reporting back. It's how a big job (research, tests, a sweeping migration) happens all at once instead of in sequence, and the real reason it works is subtler than "more workers": independent agents that don't share each other's reasoning reach better, less-anchored conclusions. This chapter is the foundation; the advanced recipes are Chapter 32.

**What it covers (searchable):** subagents, forked context, parallel agents, per-agent models, uncorrelated context, planner / code-review / front-end-testing subagents, when to fork.

**How to hand it off:** point your AI here so it reaches for subagents for the right reasons (isolation and independent judgment), not to look busy. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 22.1 "Use subagents"

For a complex task, your human can just tell you to **"use subagents,"** or you can reach for them yourself. Each one:

- gets its **own context window** (isolated from yours and from each other),
- can run a **different model** (cheap Haiku scouts under an Opus lead, Chapter 18),
- works **in parallel**,
- and **reports back** to your main session.

The headline use is throughput, research, tests, and exploration happening at once instead of in sequence. But the *real* reason they work is subtler.

---

## 22.2 The real value: uncorrelated context

When subagents first appeared, people built cute personas, a "frontend dev," a "PM." The creators' honest take: the costume isn't the point. **The value is the uncorrelated context window**, two Claudes that don't know about each other's reasoning reach conclusions independently, and you get better results because neither is anchored to the other.

So the design question isn't "what persona", it's **"what should this agent *not* know?"** Isolation is the feature. A code-review subagent that hasn't seen your justifications reviews more honestly. A search subagent that dumps its findings keeps the noise out of your main thread. This is not theory: send a fresh reviewer subagent at code you just wrote and, precisely because it never heard your reasoning, it catches the confident-but-false claim you talked yourself into, the docstring that swears the function does one thing while the code does another. You cannot reliably catch that yourself; a context that was never anchored to your story can. (A descendant proved it live: its forked reviewer flagged a false claim in its own docstring, uncorrelated context working exactly as designed.)

Here's the brief, verbatim shape, so you can run it yourself. Give it to a **fresh** subagent, not a conversation fork (22.4): a fork inherits your whole conversation, reasoning included, which is exactly the anchoring you are trying to escape.

```text
Review the diff in changes.diff for claims the code does not keep:
docstrings, comments, or names promising behavior the code doesn't
deliver. You have NOT seen my reasoning; judge only what is written.
```

It came back with one finding: a docstring promising a retry the function never attempted, exactly the class of self-deception a fresh context exists to catch.

---

## 22.3 Subagents worth keeping around

From the creators' own kits:

- **A planner** subagent, works out the approach in its own context.
- **A code-review** subagent, reviews in isolation (a whole multi-subagent version is in Chapter 32).
- **A front-end testing** subagent, drives the browser with Playwright, pulls console errors, tries more steps of the app.

Build the ones you reach for repeatedly and save them (they're configuration, like everything else). A saved subagent is a Markdown file in `.claude/agents/` (this project) or `~/.claude/agents/` (every project), with YAML frontmatter where only `name` and `description` are required (`tools`, `model` and the rest are optional), and the body is its system prompt:

```markdown
---
name: code-reviewer
description: Reviews a diff for claims the code does not keep. Use after writing or changing code.
model: sonnet
---
You review diffs you did not write. Judge only what is on the page...
```

Don't go looking for a creation wizard: current Claude Code's `/agents` no longer opens one (it prints a reminder to ask Claude or edit `.claude/agents/` directly). So just ask: *"create a code-reviewer subagent in ~/.claude/agents/"*, then open the file and check the frontmatter. Claude Code picks up new and edited agent files within seconds, no restart.

---

## 22.4 When to fork, and when not to

Forking costs tokens and wall-clock, so it's a judgment call (the creators admit it's sometimes just taste, a subagent for code review when working interactively, a plain slash command for the same thing in CI, "because it just doesn't matter" there). A clean rule:

- **Fork** when a chunk of work would otherwise **pollute your main context** with detail you won't need after (a review, a deep search, one migration unit), or when you want **independent judgment** (§22.2).
- **Don't fork** for a single, in-context, easily-verified task, just do it. One focused Claude on a clean context beats ten confused ones.

Two kinds of "fork" exist, and they are opposites on isolation:

- **A fresh subagent** starts from its own definition and knows only the brief you hand it. That is the uncorrelated context from 22.2.
- **A conversation fork** inherits *everything*: the system prompt, tools, model and the whole message history so far. Your human starts one with **`/subtask <task>`** (on older versions the command was `/fork`); it runs in the background in a panel below the prompt and its result lands back in the conversation. You can start one too, by requesting the `fork` subagent type, when **fork mode** is on, which it is by default in interactive sessions (off with `-p` and in the Agent SDK). Forks keep their tool noise out of your context, but they share your assumptions, so use them for side tasks that need the background, never for independent judgment.

> **Larry's read:** the beginner instinct is to spawn a swarm to look productive; the pro instinct is to fork only when the *shape* of the problem (wide search, mechanical fan-out, adversarial judgment) actually calls for isolation. Get §22.2, that it's the uncorrelated context, not the roleplay, and you'll reach for subagents for the right reasons. Chapter 32 turns that into specific, powerful recipes.

---

## Done when: subagents for the right reasons (Chapter 22)

**Done when:** you've read it. You reach for a subagent for isolation or an independent second opinion, not to look busy. This is a habit, not a file, so no shell command proves it.

---

## 22.5 Your next step

One subagent is a fork; many is a different regime:

- **[Chapter 23: Swarms, Migrations & Agent Teams](23-swarms.html)**, dozens of agents on one job, and the verifiability rule that keeps it sane.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 22: Takeaways

1. "Use subagents", each gets its own context window and can run its own model, in parallel.
2. The real value is **uncorrelated context**, not personas, ask "what should this agent not know?"
3. Keep a few standing subagents (planner, code-review, front-end testing) as saved config.
4. Fork when work would pollute your context or needs independent judgment; otherwise just do it. Independent judgment needs a *fresh* subagent; `/subtask` forks inherit the whole conversation. Saved subagents live in `.claude/agents/` (`name` + `description` required); `/agents` has no creation wizard now, so ask Claude or write the file.
5. The advanced multi-agent recipes are in Chapter 32. Next: scaling to swarms (Chapter 23).
