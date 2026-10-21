---
chapter: 32
part: "Part VIII: Master It"
title: "Multi-Agent Patterns From the People Who Built It"
sources: [1, larry]
slug: "32-multi-agent-patterns"
---

# Chapter 32: Multi-Agent Patterns From the People Who Built It

**For you, the human, start here.** This is the advanced section: the exact subagent patterns Kat and Boris Cherny described using *inside Anthropic* to build Claude Code itself, written up as recipes your AI can run. Not theory, the working playbook from the people who shipped it. The thread through all five: a subagent's power isn't a costume ("frontend dev," "PM"), it's the *uncorrelated context*, a second mind that isn't anchored to the first reaches better answers. The beginner question is "how do I use subagents"; the pro question is "what's the *pattern*."

**What it covers (searchable):** multi-agent patterns, uncorrelated context, multi-subagent code review with false-positive dedup, MapReduce migrations, generator-critic loop, opponent-processor / two-adversary, when not to fork.

**How to hand it off:** point your AI here so it reaches for the right pattern by the *shape* of the problem. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

A subagent is a separate Claude with **its own context window**, optionally **its own model**, working in parallel and reporting back. Here are the five patterns that matter.

---

## 32.1 The principle: it's the uncorrelated context, not the roleplay

When subagents first caught on, people made cute teams, a "frontend dev," a "backend dev," a "PM." Boris's read: the costume is not the point. **The value is the uncorrelated context window.** Two Claudes that don't know about each other's context reach conclusions independently, and you get better results because neither is anchored by the other's reasoning.

So when you design a multi-agent step, stop asking "what persona" and start asking: **"what should this agent NOT know?"** Isolation is the feature.

> Practical rule: fork a subagent whenever a chunk of work would otherwise pollute your main context with detail you won't need afterward (a code review, a deep search, a migration unit). You get a clean answer back and your main thread stays sharp.

---

## 32.2 Recipe: the multi-subagent code review with false-positive dedup

This is the one Anthropic actually runs on Claude Code's own PRs. It's a `/code-review` slash command that fans out, then *filters itself*:

1. **Fan out finders.** Spawn parallel subagents, each hunting one class of issue:
   - one checks **CLAUDE.md / convention compliance**
   - one reads **git history** for context on why code is the way it is
   - one looks for **obvious bugs**
   - (add: security, perf, edge cases)
2. **Collect everything.** The finders over-report on purpose, lots of candidates, including false positives.
3. **Spawn a second wave to refute.** Fire ~5 more subagents whose only job is **checking the findings for false positives.** Each tries to *kill* a finding.
4. **Keep what survives.** What's left after the refutation pass is the real issue list, "all the real issues without the false issues." The survivor bar, precisely: a finding survives only if the refuter, given the exact claim and the code, cannot produce a counterexample.

The two-wave shape (generate wide → adversarially prune) is the whole trick. One pass over-reports; the refute pass makes it trustworthy. Build this as a reusable command and run it on every PR.

---

## 32.3 Recipe: MapReduce migrations (ten subagents at a time)

The pattern the heaviest power users lean on for big mechanical changes, framework A → framework B, rolling out a lint rule, a testing-framework swap:

1. **Main agent builds the to-do list.** Survey the codebase and enumerate every site that needs the change.
2. **Map over subagents, ~10 at a time.** "Start ten agents, migrate these ten units, then the next ten." Each subagent owns one unit in its own context.
3. **Pick verifiable targets.** This works best where the output is *easy to verify*, a test suite that must still pass, a lint that must go green. Boris's examples: lint-rule rollouts (too nuanced for a naive autofixer) and testing-framework migrations.
4. **Reduce.** Main agent collects results, re-runs the verification, sweeps stragglers.

The discipline: don't fan out over work you can't cheaply verify. MapReduce shines exactly when correctness is mechanically checkable.

---

## 32.4 Recipe: the generator, critic loop

Borrowed from classic multi-agent design and used in Anthropic's own docs automation (Chapter 34): **one agent produces, a *separate* agent critiques**, before a human ever looks.

1. **Generator** does the work (writes the PR, drafts the doc, makes the change).
2. **Critic** is a *different* agent (a subagent synchronously, or a second routine triggered on the PR's creation) that reviews the output and leaves comments.
3. **Human** sees the work already critiqued, and arbitrates.

Why a separate critic instead of self-checking: same principle as §32.1, the critic isn't anchored by the generator's reasoning. Self-review by the same context is weaker than review by a fresh one.

---

## 32.5 Recipe: the opponent-processor (two adversaries)

The sharpest variant, from Dan Shipper's real expense-filing build: when a task has a *tension*, give each side its own agent and let them fight.

His setup: a Claude project pulls his card transactions, then **two subagents argue**, one "pro-Dan" (maximize legitimate expenses), one representing "the company" (scrutinize them), and the disagreement surfaces the correct set. An auditor and an advocate.

Use it whenever the right answer lives between two competing interests: aggressive vs. safe refactor, ship-now vs. harden, include vs. exclude. Two adversarial context windows beat one trying to hold both views at once.

---

## 32.6 When NOT to fork

Forking isn't free, more agents, more tokens, longer runs. The source is candid that it's sometimes a matter of taste (Boris uses a subagent for code review synchronously, but a plain slash command in CI, "it just doesn't matter" there). Guidance:

- **Single, verifiable, in-context task?** Don't fork. Just do it.
- **The other agent's work would pollute your context, or needs independent judgment?** Fork.
- **CI / unattended?** A slash command is often enough; save subagents for interactive work where the clean context window earns its cost.

> **Larry's read:** the mistake isn't using too few agents, it's spawning a swarm where one focused prompt would do, and then paying for it in tokens and wall-clock. Reach for these patterns when the *shape* of the problem (wide search, mechanical migration, adversarial judgment) actually calls for isolation. Otherwise, one good Claude on a clean context beats ten confused ones.

---

## Done when: multi-agent patterns (Chapter 32)

**Done when:** you've read it. You pick a multi-agent pattern by the shape of the problem, and you can say why the simpler one wasn't enough. This is a habit, not a file, so no shell command proves it.

---

## 32.7 Your next step

You have the multi-agent recipes. Next, the rigorous version of the loop that makes you irreplaceable:

- **[Chapter 33: Compounding Engineering, Done Properly](33-compounding-advanced.html)**, the diary pattern, the three places to codify a lesson, and the over-generalization trap.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 32: Takeaways

1. The value of a subagent is the uncorrelated context, not the persona; ask "what should this agent not know?"
2. Multi-subagent review: fan out finders → refute wave → keep survivors. Anthropic runs it on its own PRs.
3. MapReduce migrations: enumerate → map ~10 → reduce + verify; only over mechanically-checkable work.
4. Generator-critic and opponent-processor: a fresh or adversarial context beats self-review.
5. Don't fork a single verifiable in-context task. Match the pattern to the problem's shape. Next: Chapter 33.
