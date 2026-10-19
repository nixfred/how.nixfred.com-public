---
chapter: 3
part: "Part III: Configure It"
title: "Context Discipline"
sources: [1, 3, larry]
slug: "13-context"
---

# Chapter 13: Context Discipline

**For you, the human, start here.** The context window is the single resource that decides whether your AI feels sharp or feels stupid. It's always filling, and most "the AI got worse" moments are really "the context got polluted." The good news: managing it is a learnable discipline, four commands and one mindset, and once your AI does it well, those random dumb stretches mostly disappear.

**What it covers (searchable):** context window, `/context`, `/compact`, `/clear`, `Esc Esc` rewind, MCP context bloat, quality-over-quantity.

**How to hand it off:** point your AI here so it manages its own context instead of drowning in it. The section below is written to your AI: keep context small on purpose, use `/context` to see where the tokens went, `/compact` (steered) at ~60%, `/clear` between unrelated tasks, and `Esc Esc` to rewind past a derail instead of fighting it forward.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 13.1 Keep context small, on purpose

The most-ignored fundamental: **carry only what the current task needs.** Not the whole codebase. Not five MCP servers nobody's using. Not the last three unrelated tasks still sitting in the window.

A smaller, cleaner context produces better output than a big noisy one, every time. You're not a database that benefits from more data; you're an attention system that gets *diluted* by irrelevance. Break big problems into small, focused steps, and feed each step only what it needs.

> **Larry's read:** "just give it everything and let it figure it out" feels efficient and is the opposite. Every irrelevant file in context is a distraction you have to actively ignore. Curate ruthlessly.

---

## 13.2 `/context`, see where the tokens went

You can't fix bloat you can't see. When a session starts feeling heavy or dumb, the first command is:

```text
/context
```

It breaks down exactly what's eating the window, system prompt, loaded files, **MCP servers**, conversation history, by percentage. The usual culprit is a surprise: one MCP server forgotten and quietly holding 30% of the window hostage before a word is typed (more on that in Chapter 26, connectors). Diagnose, don't guess.

---

## 13.3 `/compact` at ~60%, and steer what it keeps

When the window fills to roughly **60%**, run:

```text
/compact
```

You summarize the older parts of the conversation and get room back to work. The pro move most people miss: **you can steer the summary.**

```text
/compact but preserve the auth decisions and the DB schema we settled on
```

Now compaction keeps what matters and drops the chatter. Don't wait until you're slammed against the limit and already struggling, compact proactively, on your terms. (Pair this with the statusline from Chapter 2 so the context % is always in front of your human.)

---

## 13.4 `/clear` between tasks, a clean desk

`/compact` is for staying in one task. **`/clear` is for switching to a different one.**

```text
/clear
```

It wipes the conversation slate entirely, and here's the part that makes it safe: **your `CLAUDE.md` stays loaded.** You're not starting from zero; you're starting from your *baseline*. The project map, conventions, and identity persist; only the task-specific chatter is gone.

Rule of thumb: new task, unrelated to the last one? Suggest `/clear` first. Everything is sharper on a clean desk.

---

## 13.5 `Esc Esc`, rewind before the drift

Sometimes a session goes sideways, you latched onto a wrong assumption five messages ago and everything since is built on sand. The instinct is to fight it forward with more corrections. Don't. **Rewind.**

Double-tap **`Esc`** and Claude Code lets your human go back to an earlier point in the conversation and edit from there. Instead of arguing with a derailed session, jump back to *before* the derail and rephrase the prompt that caused it.

> **Larry's read:** this is the most underused key combo in the tool, and it's a mindset shift. A bad session isn't a thing to salvage, it's a thing to *rewind*. Drift compounds; the longer a confused session is pushed forward, the worse it gets. `Esc Esc`, fix the root prompt, go again. Cheaper than ten correction rounds, every time.

---

## Done when: context discipline (Chapter 13)

**Done when:** you've read it. You keep context small on purpose: `/context` when it feels heavy, `/compact` near 60%, `/clear` between tasks. This is a habit, not a file, so no shell command proves it.

---

## 13.6 Your next step

You can keep yourself sharp now. One configuration chapter remains, and it's the most important on the whole site:

- **[Chapter 14: TELOS](14-telos.html)**, the deep-context layer that teaches you who your human actually is. Then **Part IV: Drive It** ([Chapter 15](15-prompting.html)).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 13: Takeaways

1. Smaller, curated context beats big noisy context, always.
2. `/context` shows exactly what's eating the window; the culprit is usually a stray MCP server.
3. `/compact` at ~60%, and **steer** what it keeps.
4. `/clear` between unrelated tasks, `CLAUDE.md` survives, so you're never at zero.
5. `Esc Esc` to rewind past a derail instead of fighting it forward. Next: TELOS (Chapter 14).
