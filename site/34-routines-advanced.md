---
chapter: 34
part: "Part VIII: Master It"
title: "Proactive Agents: Routines Done Right"
sources: [2, larry]
slug: "34-routines-advanced"
---

# Chapter 34: Proactive Agents: Routines Done Right

**For you, the human, start here.** Straight from Maya's Anthropic "Code with Claude" workshop: how to turn Claude Code from a tool that waits into a teammate that notices when something breaks and does something about it, the proper way to design a **routine** (a remote, scheduled-or-triggered session that runs whether your laptop is open or not). The framework is three decisions (trigger, context, steerability) plus a progressive-trust ladder so you never hand it the keys on day one. The failure mode to avoid: an under-contextualized routine acting confidently on the wrong thing while you're not watching.

**What it covers (searchable):** proactive agents, routines, trigger / context / steerability, time vs event triggers, webhooks, context is the ceiling, generator-critic, human monitoring, verify step, progressive-trust ladder, deploy verifier / on-call investigator / backlog triage recipes.

**How to hand it off:** point your AI here so it builds routines that fire at the right moment, with everything they need, and climb the trust ladder rung by rung. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

A tool waits for someone to press Enter. A teammate acts. Routines are the bridge, and like anything powerful they're easy to do badly. Here's the workshop's framework, as instructions.

---

## 34.1 The mindset: tool → teammate

The three pains that used to make proactive agents miserable to build, and what routines remove:

- **Where do they run?** Not the laptop (close the lid, the agent dies). Routines run on **managed infrastructure**: hosting, session state, and connector auth handled for you.
- **When do they fire?** Not a cron job to babysit. Routines take a **trigger** declaratively.
- **In or out of the loop?** Headless agents are black boxes. Routines stay **interactive**: open, watch, steer, and resume from web/CLI/desktop, exactly as if launched in a terminal.

You define four things, prompt, repos, connectors, trigger, and Claude Code handles the rest. `/schedule` is the one command to your first one.

---

## 34.2 The three decisions behind every routine

Maya's framework. Every routine, ask these in order:

1. **Trigger**, what event or cadence should run this?
2. **Context**, what do you need to know/access to succeed?
3. **Steerability**, how do you stay honest and land the output your human wants?

Get these three right and the routine works. Skip one and it drifts, fails silently, or does the wrong thing confidently. Walk them one at a time.

---

## 34.3 Trigger: time-based vs event-based

Two kinds:

- **Time-based (schedule).** "Once a week, review changes merged to main against the docs repo and open a PR if anything's undocumented." Good for reviews, digests, sweeps.
- **Event-based.** Fires on something happening:
  - **Native GitHub events**: a pull request opened, merged or labelled, or a release published (issues are not a native trigger; route those through a GitHub Actions workflow that calls the routine's API endpoint).
  - **Label-gated**: only when a merged PR carries a `needs-docs` label.
  - **Your own webhook (the API trigger)**: `POST` to the routine's endpoint with its bearer token from CI/CD or any system, **with the event payload passed in as context** (it arrives marked as untrusted data, so the routine's prompt must say what to do with it).

Design rule: pick the trigger closest to the *real* moment the work becomes needed. A deploy-verifier should fire on the deploy webhook, not on a guessed-at schedule.

---

## 34.4 Context is the ceiling

The workshop's sharpest line: **"Whatever context Claude has is the ceiling of how successful Claude will be."** A routine can't exceed what you give it. So provision deliberately:

- **Repos**: usually more than one. The docs routine needs *both* the source repo (to see what changed) and the docs repo (to open the PR).
- **Connectors** for the tools it must touch, Google Drive (reference material, marketing voice), Slack (to ping your human), the GitHub MCP (to act on issues/PRs).

The flip side of provisioning: **a new routine includes all of your human's connectors by default, and it runs with no permission prompts**, so every tool on every attached connector (writes included) is live for the whole run. Provision up, yes, but then **remove every connector the routine does not need**. Context is the ceiling; the connector list is the fence. And remember schedules cannot fire more often than once an hour.

Think of context as a budget you set before the run. Under-provision and the routine fails not because you're weak but because you were blindfolded.

---

## 34.5 Steerability: keep it honest

Three levers, use all of them:

1. **Agent-on-agent review (generator, critic).** Set one routine to *create* docs PRs and a **second routine, triggered on that PR's creation, to review and comment** before a human arrives. (The pattern from Chapter 32: a fresh critic context beats self-review.)
2. **Human monitoring on demand.** Your human can open the live session on the web mid-run, ask questions, push it a different direction, or resume a past session. Human-out-of-the-loop by default, human-in the moment they need to be.
3. **Verify the output.** Maya's docs routine literally **renders the changed documentation page** and confirms it's what's expected. Don't trust; verify, bake a concrete check into the routine (Law 7).

---

## 34.6 The progressive-trust ladder

Don't hand a routine the keys on day one. Climb:

```text
1. Investigate only   → routine analyzes, gives a go / no-go, the human acts.
2. Act with review    → routine proposes a change (a PR), the human approves.
3. Act autonomously   → once the judgment is trusted on this task, let it act.
```

Maya's deploy-verifier example walks exactly this: first Claude just investigates and recommends a rollback; the human reads its analysis on the web; later, as trust grows, it rolls back itself based on the monitoring data. Earn each rung.

---

## 34.7 Three recipes to copy

- **Deploy verifier.** Trigger: CD webhook after every deploy. Context: the service's repo + monitoring tools (Datadog/Grafana) + Slack/email/Twilio to alert. Steer: start at "investigate → no-go recommendation," climb to auto-rollback.
- **On-call investigator.** Trigger: alert webhook. Context: relevant repos + logs/monitoring. Steer: draft an incident summary + first hypothesis for the human.
- **Backlog triage (for PMs).** Trigger: weekly schedule. Context: GitHub + Slack + wherever issues live. Steer: prioritize and open PRs for the most important items; the human reviews.

> **Larry's read:** the failure mode with proactive agents isn't that they do too little, it's that an under-contextualized routine acts confidently on the wrong thing while no one's watching. The framework is the guardrail: right trigger so it fires when it should, full context so it *can* succeed, real steerability so it stays honest. Build them to climb the trust ladder, not to skip it.

---

## Done when: proactive agents (Chapter 34)

**Done when:** you've read it. Every proactive agent sits on the progressive-trust ladder at the rung your human chose, with its trigger, its context and how your human steers or stops it named. This is a habit, not a file, so no shell command proves it.

---

## 34.8 Your next step

You can act autonomously and safely now. Two chapters left, the timeless principles and the send-off:

- **[Chapter 35: Principles of an AI-Grade Setup](35-principles.html)**, the taste the commands are downstream of.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 34: Takeaways

1. Routines turn a tool that waits into a teammate that acts, on managed infra, laptop-off.
2. Three decisions: trigger (time/event/webhook), context (the ceiling), steerability.
3. Context is the ceiling, provision repos + connectors before the run.
4. Steer with generator-critic review, live monitoring, and a concrete verify step.
5. Climb the progressive-trust ladder: investigate → act-with-review → act-autonomously. Next: Chapter 35.
