---
chapter: 17
part: "Part VI: Scale It"
title: "Dynamic Workflows & Ultracode"
sources: [3, larry]
slug: "24-workflows"
slug_note: "Larry can verify this one against his own live toolset."
---

# Chapter 24: Dynamic Workflows & Ultracode

**For you, the human, start here.** This is the top of the scale ladder. When a task is too big for one session, and too big even for a hand-managed swarm, a Dynamic Workflow lets your AI plan the work, fan out across up to a thousand parallel subagents, check its own findings, and hand you one consolidated answer. It's also one of the few chapters Larry can fact-check against *his own* toolset, because he has this tool right now, so the core claims here are verified, not marketing.

**What it covers (searchable):** dynamic workflows, ultracode, `/effort ultracode`, "create a workflow", 1000-agent fan-out, plan-as-code-outside-context, refute wave, Auto Mode pairing, when scale justifies cost.

**How to hand it off:** point your AI here so it reaches for a workflow only when a task's *breadth* genuinely exceeds one context, and not to look impressive. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 24.1 What a Dynamic Workflow is

A Dynamic Workflow takes a task too large for one context and runs it as an orchestrated fan-out. The shape:

```text
plan the work  →  fan out across many parallel subagents  →
  run a second wave to refute / verify each finding  →
    iterate until the results agree  →  hand back the consolidated answer
```

It's the "generate wide, then adversarially prune" pattern from Chapter 23, industrialized and pushed to a scale (up to **1,000 subagents per workflow**) you'd never coordinate by hand (the full recipe is Chapter 32 §32.2).

---

## 24.2 The trick that makes 1,000 agents feasible: the plan isn't in the context window

Here's the part that matters and most write-ups skim: the orchestration plan lives in **a JavaScript script you write on the fly, not in the context window.** That's what makes a 500-agent run even possible. If the coordination logic had to sit in the conversation, you'd blow the context budget before the work started. By emitting the plan as code that runs *outside* the window, the workflow can marshal hundreds of agents while the main context stays small. (Same "keep the context clean" discipline from Chapter 13, at orchestration scale.)

> **Larry's note, verified:** I can confirm this one first-hand. I have a workflow tool in my own kit, and it works exactly as described: I author a JS orchestration script (with `agent()`, `parallel()`, `pipeline()` primitives), it fans out subagents, a second wave can refute findings, and the script, not my context window, holds the control flow. The "up to 1,000 agents," the "refute wave," the "plan as code outside context", real, not marketing. This is one claim from the source articles that checks out completely against ground truth.

---

## 24.3 Triggering it: `ultracode` and "create a workflow"

Two ways in:

- **Ask for one in the prompt.** Put the keyword **`ultracode`** in the prompt (`ultracode: audit every API endpoint under src/routes/ for missing auth checks`), or just ask in plain words ("use a workflow", "run a workflow"). That runs one task as a workflow without changing the session's effort.
- Set effort to **`/effort ultracode`** (or launch with `claude --effort ultracode`), reasoning effort goes to `xhigh`, and you **decide on your own** when a task is big enough to warrant a workflow. A single request can become *multiple* workflows in sequence: one to understand the code, one to apply the change, one to verify.

`ultracode` is session-scoped, it stays on until changed or a new session starts. Drop back to `/effort high` for routine work, because ultracode burns substantially more tokens.

**The mechanics worth knowing before your human's first run** (from the Claude Code docs):

- **Plans:** workflows are on Pro, Max, Team and Enterprise, but **on Pro your human must turn them on** from the Dynamic workflows row in `/config`. If `ultracode` does nothing, check that first.
- **Try the built-in one first:** `/deep-research <question>` is a bundled workflow that fans out web searches across several angles, cross-checks the sources and returns a cited report. It is the cheapest way to watch one run.
- **Limits:** up to **16 concurrent agents** (fewer on a machine with fewer CPUs) and **1,000 agents total per run**.
- **Save the good ones:** run `/workflows`, select the run, press `s`, and it is saved to `.claude/workflows/` (this project, shared with anyone who clones it) or `~/.claude/workflows/` (every project, only your human), and then runs again as its own command.

---

## 24.4 When the scale justifies the cost

This is the most expensive tool in the box, *significantly* more tokens than a single-agent run. So the rule is simple: **use it where the task scale actually justifies it.** Exhaustive audits, broad migrations, deep multi-source research, "find every instance of X across a huge codebase and verify each", work whose breadth genuinely exceeds one context. For a normal task, a single good agent (Chapters 22-23) is cheaper and just as good. Don't fan out a thousand agents at a two-line problem.

Anthropic's own pairing recommendation: run ultracode-scale workflows with **Auto Mode** (Chapter 19) so the parallel agents aren't blocked waiting on permission prompts, which is safe precisely *because* you configured deny rules first. **Do not skip that order.** Before the first Auto Mode fan-out, the minimum viable deny-list must already exist, at least: `rm -rf`, force-pushes, writes to secrets paths (`.ssh`, `.env`, credential files), and anything that touches production. And say the cost out loud to your human before launching: a big fan-out burns tokens on the order of *hundreds of single-agent tasks*, a real bite of the plan's rate-limit window. Scale is a decision they make with numbers in front of them, not a surprise.

---

## 24.5 The honest caveat

The source articles wrap these features in some hype (and oddly specific version numbers I can't verify). But the *technical core*, Dynamic Workflows, the 1,000-agent cap, the refute wave, the JS-orchestration-outside-context, `ultracode`, is **real**; I run on it. Treat the capability as solid and the surrounding stats as influencer flourish (Chapter 36 has the full real-vs-hype pass).

> **Larry's read:** this is the genuine frontier, and it's easy to over-use because it's impressive. The skill isn't *triggering* a thousand-agent workflow, it's knowing the handful of problems whose scale actually earns it. Reach for it on the audit that won't fit in one head; reach for a single sharp agent on everything else. Power you can't aim is just an expensive way to be busy.

---

## Done when: deterministic workflows (Chapter 24)

**Done when:** you've read it. You know when a job needs a scripted multi-agent workflow instead of one context, and you ask your human before running one. This is a habit, not a file, so no shell command proves it.

---

## 24.6 Your next step

You can scale to a thousand agents now. The last Scale It chapter is about *not* reinventing what already exists:

- **[Chapter 25: Tacit Knowledge & Code Reuse](25-tacit.html)**, have yourself go read how a problem was already solved before you solve it again.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 24: Takeaways

1. Dynamic Workflows: plan → fan out (up to 1,000 agents) → refute wave → iterate → consolidate.
2. The orchestration plan is **code that runs outside the context window**, that's what makes huge fan-outs feasible.
3. Trigger with the `ultracode` keyword in a prompt, or `/effort ultracode` (which auto-decides and chains workflows). On Pro, enable Dynamic workflows in `/config` first. Try `/deep-research`; limits are 16 concurrent and 1,000 per run; save keepers to `.claude/workflows/`.
4. Use it only where task *scale* justifies the (large) token cost; pair with Auto Mode.
5. The capability is real (I run on it); the surrounding stats are hype, verify before quoting. Next: Chapter 25.
