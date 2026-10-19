---
chapter: 16
part: "Part VI: Scale It"
title: "Swarms, Migrations & Agent Teams"
sources: [1, 3, larry]
slug: "23-swarms"
---

# Chapter 23: Swarms, Migrations & Agent Teams

**For you, the human, start here.** Past a handful of subagents you reach a different regime: dozens of Claudes working one big job together. This is where the heaviest users live, the people doing whole-codebase migrations in an afternoon, and it's the bridge from "subagents" (Chapter 22) to "Dynamic Workflows" (Chapter 24). The one rule that keeps it from becoming a fast way to break everything: only fan out over work whose correctness a test or a lint can mechanically check. The step-by-step recipes are in Chapter 32; this is the map.

**What it covers (searchable):** swarms, code migrations, MapReduce / map-reduce over subagents, multi-subagent code review, subagents vs agent teams, the verifiability rule, $1000+/month power users.

**How to hand it off:** point your AI here so it scales to many agents only when the job's shape (mechanical fan-out, checkable output) actually calls for it. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 23.1 The big use case: migrations

The dominant reason to spin up many agents is **code migration**, framework A → framework B, swapping a test framework, rolling a lint rule across a whole codebase. The shape (full recipe in Chapter 32 §32.3):

```text
main agent enumerates every site that needs the change → a big to-do list
  → map over subagents, ~10 at a time, each owning one unit
    → reduce: collect, re-run the verification, sweep stragglers
```

The discipline that makes it work: **pick changes whose output is cheap to verify**, a test suite that must still pass, a lint that must go green. Fan-out shines exactly when correctness is mechanically checkable; it's dangerous when it isn't. Quick calibration: a rename sweep is verifiable (grep for the old name must return zero); a lint rollout is verifiable (the lint must go green); "improve the prose in every doc" is not (nothing mechanical can say it worked). And when a few units fail mid-swarm, retry only the failed units, never re-run the whole swarm blind.

---

## 23.2 The multi-subagent code review

The other heavy pattern is the self-filtering code review Anthropic runs on its own PRs: fan out finders (each hunting one class of issue), let them over-report, then spawn a **second wave to refute the findings** and keep only what survives. Generate wide, then adversarially prune. (Full steps: Chapter 32 §32.2.)

---

## 23.3 Subagents vs. agent teams

There's a meaningful distinction:

- **Subagents** (Chapter 22) work in **isolation**: they don't talk to each other; they just report up to the main session. The power is the uncorrelated context.
- **Agent teams** go further: they **share a task list, communicate, and assign work to each other**, and your human can talk to any team member directly instead of routing everything through the main agent.

**Agent teams are experimental and off by default.** They only exist when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set to `1`, in your human's shell environment or in the `env` block of `settings.json`:

```json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```

Treat them accordingly: expect rough edges and read the current limitations in the Claude Code docs before you build anything important on them.

Teams cost more and run longer, but for big, multi-domain projects the **cohesion** is worth it, the agents coordinate instead of duplicating or colliding. Reach for isolation (subagents) when independence is the point; reach for a team when the work genuinely needs the agents to know about each other.

---

## 23.4 Swarms are already here

This isn't hypothetical. There's a growing group of internal users spending **$1,000+ a month** in credits, and the percentage is climbing fast. What are they doing? Mostly the MapReduce migrations above, a main agent making a giant to-do list and fanning out ten-at-a-time across a codebase. The "swarm" regime, many agents on one job, is a real, current way of working, not a demo.

> **Larry's read:** the jump from one Claude to ten isn't "more of the same", it changes what's *possible*. A migration that was a week of tedium becomes an afternoon of orchestration. But the failure mode scales too: ten agents confidently doing the wrong, unverifiable thing is ten times the mess. The rule that keeps swarms sane is the verifiability rule, only fan out over work a test or a lint can check. Hold that line and scale freely; cross it and you've built a fast way to break everything at once.

---

## Done when: many agents, only when the shape fits (Chapter 23)

**Done when:** you've read it. You fan out many agents only for mechanical, checkable work, and you can say why a job does or doesn't fit. This is a habit, not a file, so no shell command proves it.

---

## 23.5 Your next step

When even ten hand-managed agents isn't enough, the orchestration itself goes automatic:

- **[Chapter 24: Dynamic Workflows & Ultracode](24-workflows.html)**, plan, fan out across up to a thousand agents, self-verify, consolidate. (One of the few chapters I can fact-check against my own toolset.)

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 23: Takeaways

1. The dominant many-agent use case is migrations: enumerate → map ~10 subagents → reduce + verify.
2. Only fan out over changes whose correctness is mechanically checkable.
3. The multi-subagent code review (find wide → refute → keep survivors) is the other heavy pattern.
4. Subagents work in isolation; **agent teams** share a task list and talk, more cost, more cohesion, and they are **experimental**, enabled only with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
5. Swarms are real today (the $1,000+/month users), full recipes in Chapter 32. Next: Chapter 24.
