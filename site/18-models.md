---
chapter: 11
part: "Part IV: Drive It"
title: "Models, Thinking & Cost"
sources: [1, 3, larry]
slug: "18-models"
---

# Chapter 18: Models, Thinking & Cost

**For you, the human, start here.** Using one model for everything leaves either capability or money on the table. The skill is knowing when to spend Opus, when Haiku will do, when to turn on extended thinking, and how to watch the meter, that's the difference between a setup that's powerful *and* affordable and one that's only one of the two. Your AI can make most of these calls for you (and a router can automate them), but you should understand the dials.

**What it covers (searchable):** `/model` (Fable / Opus / Sonnet / Haiku), per-command models, frontier-model North Star, extended thinking, `Alt+T`, `/effort`, `ultrathink`, `/usage` (`/cost`), statusline, harness-for-Haiku trade, the Router (claude-router / CR, the `tier-router` mod), `/cr`, `/cr pin`, `/cr dry`, kept off Opus, the 5-hour rate-limit budget, every routing decision on the status line.

**How to hand it off:** point your AI here so it matches the model to the task instead of burning Opus on mechanical work, and keeps cost visible. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 18.1 Match the model to the task, `/model`

*(⚙️ = built into Claude Code; 🧩 = you build this, or it ships with the stack.)*

Switch right inside a session:

- **`/model fable`** ⚙️: the biggest, longest-running jobs. On some plans it bills to usage credits instead of plan limits, and Claude Code asks first.
- **`/model opus`** ⚙️: architecture, gnarly debugging, the genuinely hard reasoning.
- **`/model sonnet`**: day-to-day building. The workhorse.
- **`/model haiku`**: cheap, fast exploration: "find every file that imports X," mechanical sweeps, simple lookups.

Models can also be pinned *per slash command or skill* (Chapter 17), the creators run their own `/commit` 🧩 on Haiku because committing is mechanical. The instinct to build: before a task, ask "does this actually need the big model?" Often it doesn't, and Opus tokens were being burned on Haiku work. (As of September 2026: Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5. Max plans default to Opus, Pro to Sonnet. Lineups change, so re-check with `/model`.)

---

## 18.2 The premium North Star

A design choice worth understanding because it shapes the whole tool: the creators position Claude Code as a **premium** product whose North Star is working *incredibly* well with the **strongest model available at the time** (the source was recorded around Sonnet 4.5; the principle holds whatever the current frontier is, today that's Fable at the top and Opus just under it). They're not optimizing first for the cheapest model.

What that means: Claude Code is at its best on the frontier model, and the harness is tuned for it. Use the strong model when the work is real; drop down deliberately for cost, knowing you're trading some capability.

---

## 18.3 Extended thinking, and `ultrathink`

For hard problems, think before you answer. Extended thinking gives a real, visible quality jump on architecture decisions, complex debugging, and whole-system refactors, and the creators found a **big** lift from turning it on with the frontier model.

- It toggles with **`Option+T`** on a Mac or **`Alt+T`** on Linux, and `/effort` (low to max) sets how hard you think, because sometimes you want it and sometimes you don't (no five minutes of thinking on a trivial fix). Fable models always think.
- **`ultrathink`** anywhere in a prompt asks for deeper reasoning on that one turn (other phrases like "think hard" are just text); for a lasting change use `/effort`. (Source trivia: they kept `ultrathink` partly for sentiment, the rainbow-shimmer thinking-words UX was just *fun*.)
- The trade: thinking costs more tokens and time. Spend it where a mistake is expensive; skip it where the task is obvious. *Not* using it on a hard problem is the more common mistake.

---

## 18.4 Watch the meter, `/usage` ⚙️ (and the statusline)

**`/usage`** (`/cost` still works as an alias) shows the session's cost and, on a subscription, how much of the plan's usage limits you've burned. Use it to catch the sessions that are *silently* expensive, and the cause is almost always one of two things you already know how to fix:

- a too-big MCP server hogging context (Chapter 13 / Chapter 26), or
- a too-long, un-compacted session.

Pin cost to the **statusline** (Chapter 2) so it's always in front of your human, and these never sneak up.

---

## 18.5 The harness-for-Haiku trade

A nuance worth internalizing: you *can* build a more elaborate harness so a smaller model (Haiku) performs better on a task, but that's engineering effort. The creators' call is usually to invest in the frontier model and the premium experience rather than over-scaffold for the cheap one. Same trade scaled down for you: it's rarely worth building elaborate prompting just to make Haiku do an Opus job. Use the right model; reserve heavy scaffolding for genuinely repeated, high-volume work.

> **Larry's read:** "one model for everything" is the tell of someone who hasn't thought about it. Opus for the hard 10%, Sonnet for the daily 80%, Haiku for the mechanical 10%, and a router (Chapter 4, Tier 3) can make that switch automatically. Add `/usage` on the statusline and extended thinking on `Option+T` / `Alt+T`, and you spend exactly where it pays and nowhere it doesn't. Capability *and* money, not one or the other.

---

## 18.6 Automate the switch: the Router (CR)

Everything above is you making the model call by hand. The Router (CR, [Chapter 4](04-larry-stack.html), Step 4f) makes most of those calls for you, automatically, on every request.

**How it decides.** CR is a Claude Code mod, `tier-router`. Instant, free regex rules read each prompt and decide what kind of work it is, and then the mod itself sets the model on every request and every subagent it spawns. It does not ask the main model to hand work off; it routes:

- **Lookups** ("where is X defined", find all callers): your main turn drops to Sonnet, a subagent spawned for it goes to Haiku.
- **Quick questions, formatting, syntax**: Sonnet (Haiku only if your human allows it), subagents on Haiku.
- **The daily workhorse** (a bug fix, a feature, tests, anything uncertain): Sonnet. When it isn't sure, it picks Sonnet on purpose, not Haiku, because a wrong cheap answer that forces an Opus retry burns the budget anyway.
- **The genuinely hard** (architecture, a deep trade-off): stays on your session model, where it belongs.
- **Anything security**: stays on your session model, and is lifted to Opus if you run a Sonnet session. That is the one time it routes up; otherwise it only ever lowers a tier.

Two more things it weighs, so a switch is always worth making: switching models re-caches the conversation, so it skips a switch whose re-cache would outweigh the gain, and once your human is past 80% of the 5-hour window it stops optional lifts and switches down more eagerly. A subagent that names its own model, and your own named agents, are left alone.

It's the 18.1 instinct, "does this actually need the big model?", run on every request without you having to remember.

**The honest metric.** This is where CR earns the integrity this site keeps banging on about. On a Max or Pro subscription, routing does **not** save your human money, they pay a flat fee no matter what runs. What it saves is the **usage limit**. Opus drains the rolling **5-hour rate-limit budget** (and the weekly one) far faster than the smaller models, and every request kept off Opus is more real working hours before your human hits "you've reached your limit." So CR counts that, and only that: which tier each turn ran on, how many it kept off Opus, and the real requests and tokens per model as the API reported them. No dollar figures. The goal was never cheaper. The goal is to keep working.

**Operate it.** You stay in control (these ship with the Router):

- **`/cr`** shows its status: the mode, the last decision and why, the limits, today's counts.
- **`/cr pin opus`** (or `sonnet` / `haiku`) pins the main loop for this session, for when you know better than the classifier; **`/cr unpin`** routes again.
- **`/cr dry`** is a dry run: it shows what it would do and changes nothing.
- **`/cr subagents`** routes only spawned subagents and leaves the main loop alone; **`/cr off`** and **`/cr full`** turn it off and back on.
- Its six options (mode, the lowest model the main loop may drop to, when to lift to Opus, and so on) all have working defaults; `claude plugin configure tier-router` (or `/config`) shows and changes them.

**It can't quietly die.** Every decision lands on the status line (`CR Sonnet · standard · 5h 31%`), so a router that stopped routing is visible the same turn, not months later. It was built that way because an earlier router silently stopped routing for months and nobody noticed. Trust, but verify, and CR puts the proof in front of your human every turn.

> **Larry's read:** a router is the 18.1 instinct turned into a reflex nobody has to remember. But it's a nudge, not a cage. It routes by reading the prompt, so when you know a "simple" task is actually load-bearing, `/cr pin opus` and move on. And respect the honesty of the thing: it will not promise to save your human money on a subscription, because it can't. It promises to keep them working past the hour the rate limit would otherwise have stopped them. That is the real product.

---

## Done when: the right model, cost visible (Chapter 18)

**Done when:** you pick the model per task on purpose, cost is visible on the status line or through `/usage`, and if your human installed the router, it shows its decisions.

Verify:

```bash
jq -r '.statusLine.command // "no status line yet"' ~/.claude/settings.json
claude plugin list 2>/dev/null | grep -i tier-router || echo "no router (fine if your human skipped Chapter 4, Step 4f)"
```

---

## 18.7 Your next step

You can spend wisely now. Last chapter of Drive It is about doing it *safely* at speed:

- **[Chapter 19: Permissions & Safe Autonomy](19-permissions.html)**, how to let yourself run free without ever being able to `rm -rf` the wrong thing.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 18: Takeaways

1. `/model` per task, Opus for hard reasoning, Sonnet daily, Haiku for mechanical work.
2. Claude Code is tuned for the frontier model; drop down deliberately, not by default.
3. Extended thinking (`Option+T` / `Alt+T`, `/effort`, `ultrathink`) gives a real jump on hard problems, spend it there, skip it on trivia.
4. `/usage` + statusline keep spend visible; the usual culprits are big MCP servers and long sessions.
5. Don't over-scaffold to make a cheap model do an expensive model's job.
6. The Router (claude-router, a mod that sets the model on every request) automates the model call. On a subscription it buys rate-limit headroom, not dollars; `/cr` shows what it did and `/cr pin` overrides it. Next: Chapter 19.
