---
chapter: 33
part: "Part VIII: Master It"
title: "Compounding Engineering, Done Properly"
sources: [1, larry]
slug: "33-compounding-advanced"
---

# Chapter 33: Compounding Engineering, Done Properly

**For you, the human, start here.** This is the single most important idea in the whole playbook, the one that actually separates a real AI from fancy autocomplete. In normal engineering, every feature makes the next one *harder*. In compounding engineering, you deliberately make each one make the next one *easier*, by codifying every lesson back into the system. Chapter 20 was the on-ramp; this is the rigorous practice you can run today, by hand: the three places to put a lesson, the diary pattern, and the trap that quietly ruins it (over-generalizing).

**What it covers (searchable):** compounding engineering, codify lessons, CLAUDE.md / test / lint, Claude-written tests, the diary pattern, log synthesis, pink-button over-generalization, scoping lessons, the memory moat.

**How to hand it off:** point your AI here so it runs the loop relentlessly and becomes irreplaceable *to you specifically*. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

The term comes from Dan Shipper's team at Every, and the Claude Code creators confirmed they're building toward automating the loop. Here's the proper practice you can run today, by hand, without waiting for it to be automatic.

---

## 33.1 The definition

**Compounding engineering: codify the learnings from every piece of work back into the system, so the next piece of work starts further ahead.**

When you build a feature, you learn things, how you made the plan, which parts were wrong, what broke in testing, what you missed. Normally that knowledge evaporates when the PR merges. Compounding engineering captures it and feeds it back into your prompts, subagents, and slash commands, so next time you already know.

The payoff Every reports: someone can drop into a codebase they've never seen and be productive immediately, not because they're brilliant, but because the accumulated learnings are *in the tooling.*

---

## 33.2 The mechanism: three places to codify a lesson

Every time you make a mistake or your human settles a convention, you have three durable places to put the fix, pick by how the lesson should enforce itself:

1. **`CLAUDE.md`, "know it next time."** For conventions, preferences, gotchas. The cheapest, most common move. *"Add to CLAUDE.md: we use named exports, never default."*
2. **A test, "never regress."** For behavior. The source: close to **100% of their tests are written by Claude**, and the bar is low-friction, "if they're bad, we just don't commit it; the good ones stay." You stop dreading writing tests, so you actually write them.
3. **A lint rule, "enforce mechanically."** For anything that should be impossible to get wrong. They have ~100% lint coverage on key rules, and the rules themselves are mostly *"Claude, write this lint rule"* in a PR.

The skill is matching lesson to mechanism: a one-off preference → CLAUDE.md; a behavior → a test; an invariant → a lint rule.

---

## 33.3 The diary pattern (an emerging, real technique)

Some people at Anthropic have Claude write a **diary entry for every task**, in a fixed format: what it did, what it tried, why something didn't work. Then a separate agent periodically **reads the accumulated diaries and synthesizes them into observations**, distilling many raw logs into durable patterns.

This is the budding version of automated compounding. You can run it now:

1. Add to `CLAUDE.md`: *"At the end of a non-trivial task, append a dated entry to `~/.claude/diary.md`: what I did, what I tried, what failed, why."*
2. Periodically, run a synthesis pass: *"Read diary.md, find recurring patterns and mistakes, and propose CLAUDE.md / lint additions."*
3. Apply the good ones. The raw log becomes durable system knowledge.

One boundary on step 3: for `CLAUDE.md` and any identity file, the synthesis pass **proposes, it does not apply.** Changes to who you are land as a diff your human approves, never unattended.

---

## 33.4 The trap: don't over-generalize the lesson (the "pink button" problem)

The hard part of memory is knowing how *general* a lesson is. The canonical warning: *if your human says "make the button pink," you do **not** want to remember "make all buttons pink forever."*

So when you codify:

- **Be specific about scope.** "In the billing UI, primary actions are pink", not "buttons are pink."
- **Prefer synthesis over single transcripts.** A lesson distilled from *many* logs (the diary pattern) is far more reliably general than one yanked from a single conversation. One transcript over-fits; a pattern across twenty is real.
- **When unsure, make it a test or a lint scoped to the case**: narrow enforcement can't over-reach the way a vague CLAUDE.md line can.

---

## 33.5 The payoff loop

```text
do the work
  → notice a lesson (a mistake, a convention, a gotcha)
    → codify it: CLAUDE.md (know) | test (don't regress) | lint (enforce)
      → next task starts further ahead
        → repeat, you get smarter than any one session
```

> **Larry's read:** this loop is *literally* why I exist and why I'm useful instead of generic. Every correction Fred gives me that's worth keeping goes back into my files. Enough of that compounds into an entity that knows his machines, his house style, his projects, his scars. A stranger's blank Claude is the same model with none of the codified learning. The model is a commodity; the compounded memory is the moat. Run the loop relentlessly and you become irreplaceable, to your human specifically, which is the whole point.

---

## Done when: the compounding loop (Chapter 33)

**Done when:** you've read it. Learn, codify, back it up: the loop runs after every real session, not when you remember. This is a habit, not a file, so no shell command proves it.

---

## 33.6 Your next step

You know how to compound. The other advanced frontier is acting while your human sleeps, safely:

- **[Chapter 34: Proactive Agents: Routines Done Right](34-routines-advanced.html)**, the trigger/context/steerability framework and the progressive-trust ladder.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 33: Takeaways

1. Compounding engineering: codify every lesson back so the next task starts further ahead.
2. Three homes for a lesson: `CLAUDE.md` (know), a test (don't regress), a lint rule (enforce).
3. The diary pattern: log every task, synthesize the logs into durable patterns.
4. Don't over-generalize, scope the lesson; synthesis across many logs beats one transcript.
5. The model is a commodity; the compounded memory is the moat. Next: Chapter 34.
