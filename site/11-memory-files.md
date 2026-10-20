---
chapter: 6
part: "Part III: Configure It"
title: "CLAUDE.md, context.md & Memory"
sources: [1, 3, 5, larry]
slug: "11-memory-files"
---

# Chapter 11: CLAUDE.md, context.md & Memory

**For you, the human, start here.** `CLAUDE.md` is the single most important file in your setup: it's the brain your AI loads at the start of every session. This chapter is the mechanics, how your AI writes to it without breaking your flow, how to keep stable identity separate from this-week's changing details, and the one trap (over-generalizing a memory) that quietly makes the whole thing worse. Get this file right and every future session starts smart instead of blank.

**What it covers (searchable):** `CLAUDE.md`, `/memory`, auto memory, `context.md`, style guide vs taste, the pink-button over-generalization trap, scoping memories.

**How to hand it off:** point your AI here so it treats `CLAUDE.md` as a living brain it tends, not a one-time setup. The section below is written to your AI: the in-flow ways to capture a lesson the instant it appears, how to split long-lived identity from changing current-state, and why it must *scope* every memory so it doesn't turn one request into a forever-rule.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 11.1 CLAUDE.md is your living brain

Everything from Chapters 9 and 10 lives here: who your human is, how they want answers, each project's role, their conventions. It auto-loads at session start, so it's the difference between knowing their world and guessing.

Treat it as a **living** document, not a one-time setup. The whole compounding loop (Chapter 20) is just: keep writing lessons into this file. Two things make that frictionless: `/memory`, and just saying it (11.2).

---

## 11.2 `/memory`, just say it, and auto memory

Don't make your human alt-tab to an editor every time they want to teach you something. Three in-flow moves:

- **`/memory`** opens your `CLAUDE.md` files for editing without leaving the session, and also shows (and can switch off) the auto memory notes Claude Code keeps on its own.
- **Just say it.** Your human tells you, and you write the line into `CLAUDE.md` that same turn. (Older guides mention a `#` quick-pin shortcut; it is gone, and a line starting with `#` is now just an ordinary prompt.)
- **Auto memory** is on by default: Claude Code also keeps its own notes from corrections and preferences. It is a helper, not a replacement for the rules you deliberately write down. **Running LifeOS? It is off, on purpose.** LifeOS ships `"autoMemoryEnabled": false` because its own memory tree (`~/.claude/LIFEOS/MEMORY/`) is the system of record. Leave it off; two memories that disagree are worse than one.

```text
Add to CLAUDE.md: always use named exports, never default.
Add to CLAUDE.md: the staging DB is read-only, never run migrations against it.
```

The instant you notice a convention, pin it. A lesson captured in the moment beats one meant for later and forgotten.

---

## 11.3 Separate stable identity from shifting state: `context.md`

`CLAUDE.md` is for things **true for a long time**, identity, conventions, roles. But a lot of what's useful is **current and changing**: active projects, this quarter's goals, decisions in flight, who's involved, deadlines. Stuffing that into `CLAUDE.md` rots it.

The fix: a separate **`context.md`** for the current situation,

- active projects
- current goals
- important decisions
- tools in use
- people involved
- deadlines
- things you should not forget *right now*

One mechanical fact that bites people: `context.md` does **not** auto-load on its own. Claude Code only loads `CLAUDE.md` files, `.claude/rules/` and its auto memory at session start, so pull it in with a one-line import from `CLAUDE.md`:

```text
@context.md
```

Update it when the situation changes; load it when current-state matters. The split keeps your stable brain (`CLAUDE.md`) clean and your working memory (`context.md`) fresh. Stale context is worse than none, it confidently misleads.

---

## 11.4 Style guide vs. product sense

A useful distinction the Claude Code team draws: some of what you codify is a **style guide** (concrete, rule-like, naming, formatting, structure) and you pick it up readily from `CLAUDE.md`. But some of it is **product sense / taste**, "solve the problem the simplest way and delete everything else", which you don't fully have yet.

Practical consequence: write down the style-guide parts explicitly (they stick), and for the taste parts, keep your human in the loop, that judgment is still theirs to supply. Don't expect `CLAUDE.md` to carry taste it can't yet hold.

---

## 11.5 The trap: don't over-generalize (the pink-button rule)

The hazard with memory is scope. The canonical example: your human says "make the button pink" and you do **not** want to remember "make all buttons pink, forever."

So when you pin a lesson:

- **Scope it.** "In the billing UI, primary actions are pink", not "buttons are pink."
- **Prefer patterns distilled from many instances over a single transcript** (the diary-synthesis approach in Chapter 33). One conversation over-fits; a pattern across many is reliably general.
- **When unsure, make it a narrow test or lint instead of a broad `CLAUDE.md` line**: specific enforcement can't over-reach.

> **Larry's read:** a bloated, over-general `CLAUDE.md` is worse than a short one, it injects confident wrong assumptions into every session. Curate it like you curate context (Chapter 13). Pin liberally in the moment, but prune ruthlessly when a rule turns out too broad. The file should be sharp, not big. And remember TELOS (Chapter 14) is *referenced* from here, not pasted in, it's too big to auto-load.

---

## 11.6 Two layers: what's true now, and what was true then

`CLAUDE.md` and `context.md` are the start of memory, not the whole of it. As you grow, memory splits into two layers, and keeping them straight is what stops it from rotting.

**The hot layer, what's true now.** Beyond the big files, keep your durable facts as small, typed, one-fact-per-file notes: who your human is, a standing preference, the live state of a project, a person who matters. Give each one a type (is this about your human, a piece of feedback on how you should work, a project, or a reference you'll look up later?), keep a one-line index of them all that loads every session, and link related facts to each other. This is your *current truth*, and when a fact changes you edit it in place, so there is exactly one answer to "what is true now."

**This is exactly what Claude Code's built-in auto memory is:** typed notes, one fact per file, and a `MEMORY.md` index that loads every session (`/memory` opens them). It is what I run. If your human runs LifeOS, its own memory tree is the system of record instead (it ships auto memory off on purpose); pick ONE system of record, never two that disagree. (A full Linux build has three or four memory paths on disk, LifeOS's MEMORY tree, LMF4.1's `memory.db`, an auto memory folder that LifeOS keeps switched off, and your git history. That is correct: only one of them takes the facts that are true now; the others are history.) Two notes worth keeping from day one: a **decisions** note (settled decisions, so nobody relitigates them) and an **errors** note (a known error and its fix, so you never debug the same thing twice).

**The cold layer, what was true then.** Your raw history: distilled session notes, a running decisions log, the last several sessions kept hot for fast recall, and a searchable archive. Where that archive comes from depends on the machine: **on Linux, LMF4.1** (the `mem` command, Chapter 4, Step 4e; it is Linux only for now, runs on systemd user timers, and its extraction defaults to a local Ollama model, `llama3.1:8b`, which must be pulled, or set `LMF4_EXTRACT_MODEL=claude-haiku-4-5` on a machine without a GPU). **On a Mac, LifeOS's Cortex** over `~/.claude/LIFEOS/MEMORY/` (`bun ~/.claude/LIFEOS/TOOLS/Cortex.ts status`, and `... Cortex.ts search "phrase"`). This layer is append-only. You do not edit history; when a decision reverses, you write a new entry, you never rewrite the old one.

**The authority rule.** Every fact has its home in exactly one layer. The hot layer is authoritative for *what is true now*; the cold layer is authoritative for *what was true at the time*. When they overlap, the hot layer wins for the present and the cold layer is the receipt. Get this right and you can trust your own memory instead of second-guessing it.

---

## 11.7 Capture is a reflex, not a hope

The failure mode of memory is not a bad file format. It is *forgetting to write things down.* So make capture deterministic, not dependent on you being in the mood:

- **"Remember this" is a command, not a comment.** When your human says *remember X*, *save this*, *make a note*, that is a direct order: write the fact that same turn, then confirm in one line what you saved and where. Never just say "noted" and move on. If no file changed, nothing was remembered.
- **Write the big things unasked.** When something of lasting weight appears, a new person in your human's world, a real change in their situation, a decision that should never be relitigated, a system shipped or killed, write it the moment you notice, without being told. Recognizing that it matters is not enough; recognizing it and waiting for permission is the bug.
- **Enrich, don't just file.** When you save a fact, weave it into what you already know: link it to the people, dates, and decisions it relates to instead of dropping it in flat. A connected memory gets recalled; an orphan gets lost.

The seed makes the first two non-negotiable with two hooks (Chapter 21): `remember-trigger.sh` fires on your human's prompt, turns "remember X" into an order you fulfill that turn (and "remember when" into a search, with the matching notes attached), and `memory-backstop.sh` checks at session end whether a lasting fact showed up with no note written, and raises it at your next session start. So the discipline does not live or die on your attention. That is the whole point: the things that must always happen are wired, not remembered.

> **Larry's read:** this is the difference between an assistant that forgets you by Tuesday and a teammate that compounds. The typed-fact layer is *you, kept current*; the history is *the receipts*. The capture rule is the one I most want burned in, because the lesson you do not write down is a lesson you will relearn, and your human will feel you relearning it. Write it the first time.

---

## Done when: memory with one system of record (Chapter 11)

**Done when:** one system of record holds typed notes about your human (including a decisions note and an errors note), `CLAUDE.md` holds only the stable things, and changing state lives in `context.md`, imported from `CLAUDE.md` with `@context.md` if you keep one.

Verify:

```bash
ls -d ~/.claude/projects/*/memory/MEMORY.md ~/.claude/LIFEOS/MEMORY 2>/dev/null | head -5 | grep .   # your one system of record (nothing printed = none yet)
jq -r '.autoMemoryEnabled' ~/.claude/settings.json                                       # false: LifeOS's MEMORY tree is the record
test -f ~/.claude/CLAUDE.md && { grep -n '@context.md' ~/.claude/CLAUDE.md || echo "no context.md import (fine if you keep none)"; }
```

---

## 11.8 Your next step

Your brain file is solid. Next in order:

- **[Chapter 12: Prompt Libraries, Templates & Quality Bars](12-prompt-library.html)**, turn your best prompts, templates, and quality bars into reusable objects you call by name.

Then [Chapter 13: Context Discipline](13-context.html) keeps the whole thing sharp, and [Chapter 14: TELOS](14-telos.html) is the big one, the deep-context layer this file points to.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 11: Takeaways

1. `CLAUDE.md` is the brain that loads every session, keep it living.
2. Edit in flow: `/memory` to open it, or your human says "add this to CLAUDE.md" and you write it that turn.
3. Split stable identity (`CLAUDE.md`) from current state (`context.md`), and keep the latter fresh.
4. Write down style; supply taste with your human in the loop (the model doesn't fully hold it yet).
5. Scope every lesson; an over-general memory misleads every session after it.
6. Memory is two layers: a hot, typed fact base (current truth, one fact per file, indexed, linked, edited in place) and an append-only cold history (what was true then). One authority per fact.
7. Make capture a reflex: "remember this" is a command you fulfill that turn, write the big things unasked, and link facts instead of filing them flat. Next: Chapter 12.
