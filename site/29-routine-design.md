---
chapter: 27
part: "Part VII: Connect & Automate It"
title: "Designing & Deploying Routines"
sources: [2, larry]
slug: "29-routine-design"
---

# Chapter 29: Designing & Deploying Routines

**For you, the human, start here.** Chapter 28 was the *what*; this is *how to build one*. Every routine comes down to three decisions: the **trigger** (what fires it), the **context** (what it needs to know and reach), and **steerability** (how you keep it honest). Walked through with the real example Anthropic shipped, automating their own documentation. The line to remember: whatever context your AI has is the ceiling of how well a routine performs, so provision it like a budget before the run. Chapter 34 takes this to the advanced, do-it-right level.

**What it covers (searchable):** routine design, trigger / context / steerability, schedule vs event triggers, GitHub events, label-gating, webhooks, context as the ceiling, agent-on-agent review, verify step, watching runs on the web.

**How to hand it off:** point your AI here so it designs routines that fire at the right moment, with everything they need, and a verify step at the end. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 29.1 The three decisions

Every routine comes down to three questions, asked in order. Get them right and it works; skip one and it drifts:

1. **Trigger**, what event or cadence runs this?
2. **Context**, what do you need to know and access to succeed?
3. **Steerability**, how do you stay honest and land the output your human wants?

The worked example below is **Sarah's docs automation**: weekly PRs for Claude Code jumped 200% in a year, and the one engineer maintaining docs couldn't keep up. So she built routines to do it.

---

## 29.2 Decision 1, the trigger

Two kinds:

- **Schedule (time-based).** Sarah's first routine: *once a week*, diff the source repo against the docs repo and open a PR for anything undocumented.
- **Event-based.** Fires on something happening:
  - **Native GitHub events**: a pull request opened, merged or labelled, or a release published (pull request and release events are the only native GitHub triggers).
  - **Label-gated**: only when a merged PR carries a `needs-docs` label.
  - **API trigger**: `POST` to the routine's own URL with its bearer token from CI/CD or any system (create and revoke the token at claude.ai/code/routines). Any text you send arrives marked as untrusted data, so write the routine's prompt to say exactly what to do with it, and treat the token like a password: whoever holds it can start your agent.

Sarah's second routine reacts **every time a GitHub issue is opened** in the docs repo. Issues are not a native routine trigger, so a small GitHub Actions workflow on `issues: opened` calls the routine's API endpoint with the issue text: investigate it, decide if it's a documentation gap, and if so open a PR and ping her. Pick the trigger closest to the *real* moment the work is needed.

---

## 29.3 Decision 2, context (the ceiling)

The workshop's sharpest line: **whatever context you have is the ceiling of how successful you'll be.** Provision deliberately:

- **Repos**: usually more than one. The docs routine needs *both* the Claude Code source repo (to see what changed) and the docs repo (to open the PR).
- **Connectors**: for what it must touch: Google Drive (existing marketing briefs, so it matches the house voice), Slack (to ping on a new PR), the GitHub MCP (to act on issues and PRs).

Set context like a budget *before* the run. Under-provision and the routine fails, not because you're weak, but because you were blindfolded.

---

## 29.4 Decision 3, steerability

Three levers to keep quality up:

1. **Agent-on-agent review.** Set one routine to *create* docs PRs and a **second routine, triggered on that PR's creation, to review and comment** before a human looks (the generator-critic pattern, Chapter 32 / Chapter 34).
2. **Human monitoring on demand.** Your human can open the live session on the web mid-run, ask questions, push it elsewhere, or resume a past session, exactly as if it were a terminal session.
3. **Verify the output.** Sarah's routine literally **renders the changed documentation page** and confirms it's what's expected. Don't trust; verify, bake a concrete check in (Law 7).

The standing rule before any routine runs unattended: declare its blast radius (which repos, inboxes, and accounts it can touch), run it attended the first time, and make that verify gate halt and notify on failure rather than carry on.

---

## 29.5 Deploying and watching it

Once created, a routine appears in Claude Code on the web. Your human can see its connected repos, its schedule/trigger, the generated instructions (you wrote them from their prompt + answers), and **each individual run**, the initial prompt, the steps you took, the PR you opened. They can jump into a live run and steer it, or stop it ("I already handled this one"). That visibility is what makes handing off real work feel safe.

> **Larry's read:** the trigger/context/steerability trinity is the whole craft, and context is the one people skimp on and regret. A routine that fires at the right time, with everything it needs, and a verify step at the end is a teammate. One missing a repo or a connector is an agent confidently doing the wrong thing at 3 a.m. Build your first few with a human-review step (lever 2), watch them on the web, and only remove the training wheels once the judgment has earned it. Chapter 34 is the next rung, agent-on-agent review and the progressive-trust ladder.

---

## Done when: routine design (Chapter 29)

**Done when:** you've read it. Every routine you propose names its trigger, the context it needs, and how your human steers or stops it, with a verify step. This is a habit, not a file, so no shell command proves it.

---

## 29.6 Your next step

You can design one routine well. Now compose them into systems that run a week:

- **[Chapter 30: Repeatable Systems](30-systems.html)**, briefings, pipelines, and scheduled work that compound.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 29: Takeaways

1. Three decisions per routine: trigger, context, steerability.
2. Trigger: a schedule, a GitHub pull request or release event (filter by label), or an API call with a bearer token.
3. Context is the ceiling, provision repos + connectors deliberately before the run.
4. Steerability: agent-on-agent review, live human monitoring, and a concrete verify step.
5. Watch every run on the web; keep a human-review step until the judgment is trusted (advanced: Chapter 34). Next: Chapter 30.
