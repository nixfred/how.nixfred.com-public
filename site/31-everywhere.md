---
chapter: 29
part: "Part VII: Connect & Automate It"
title: "Claude Everywhere + The Ecosystem"
sources: [1, 2, 3, larry]
slug: "31-everywhere"
---

# Chapter 31: Claude Everywhere + The Ecosystem

**For you, the human, start here.** Your AI shouldn't be trapped in one terminal on one machine. This chapter is the reach layer: run it on the web, dispatch it with `@claude` on GitHub from a red light, steer a session from your phone while your code stays on your machine, watch a deploy with `/loop`, schedule local tasks, plus the ecosystem pieces (MCP, Context7, plugins, git worktrees) that connect and extend it. The connectivity it all rides on is Chapter 6's Tailscale mesh.

**What it covers (searchable):** Claude Code on the web, `@claude` GitHub, phone control / QR, `/loop`, desktop scheduled tasks, durability tiers, MCP cost, Context7, `/plugin` marketplace, git worktrees.

**How to hand it off:** point your AI here so it picks the right reach and durability tier for each job and extends itself without drowning in context cost. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 31.1 Claude Code on the web

You can run against a virtual machine in the cloud, not just the local terminal. That means remote sessions your human starts and steers from a browser, useful when they're away from their machine, or when they want a sandbox that isn't the laptop. It's also where they watch and steer **routines** (Chapter 28).

## 31.2 `@claude` on GitHub

Tag `@claude` on a GitHub issue or PR and you go to work. The creators use this *constantly*, Boris's own story: *"on the way to work I'm at a red light, on GitHub, and I'm like `@claude fix this issue`."* Your human doesn't need to be at a desk to dispatch work; they need a one-line instruction and a network. One caveat before enabling it: anyone who can comment can trigger the agent, so restrict the allowed actors first.

## 31.3 Control a session from a phone

Your human starts a session locally, scans a QR code with their phone, and keeps steering it from anywhere. The clever part: **the code never leaves the machine**, only the *control channel* goes mobile. They kick off a heavy task at the desk, approve permissions from a walk, check progress from the gym. (This rides on the mesh, Chapter 6.)

## 31.4 `/loop` for in-session recurring tasks

Inside a session, `/loop 5m check the deployment status` reruns a prompt every five minutes, great for babysitting a deploy, watching a PR, polling a build. Loops are session-scoped and expire on their own for safety. Use it for "watch this until it changes," not durable automation (that's routines).

## 31.5 Desktop scheduled tasks

For automation that should outlive a session but live on the machine, Claude Desktop's scheduled tasks fire on a cadence, each run a fresh session, and survive terminal exits and restarts. Morning issue triage, weekly metric pulls, nightly log scans. (Cloud-hosted, laptop-off automation is routines, Chapter 28; this is the local-machine flavor.)

**Which to use:** `/loop` = watch within a session · Desktop tasks = scheduled on the machine · Routines = scheduled/triggered in the cloud, laptop-off. Match the durability you need.

---

## 31.6 The ecosystem: MCP, Context7, plugins, worktrees

The connective tissue that extends you:

- **MCP, but mind the cost.** MCP servers load *all* their tool definitions into context; a typical 5-server setup can eat ~55K tokens before a word is typed. So: **MCP for exploration, a hardcoded API endpoint for production.** If you only need to read one Notion database, wire that one call instead of loading the whole server (Chapter 26).
- **Context7**: injects up-to-date, version-specific docs for thousands of libraries *before* you write code, so you stop suggesting deprecated APIs from your training cutoff. One install, a quality jump across every library.
- **The `/plugin` marketplace**: pre-built skills, agents, and commands to install instead of building. Browse before you build; someone may have already shipped what you need.
- **Git worktrees**: run multiple Claude sessions on the same repo without collisions. Each worktree is an isolated branch with its own working directory: three sessions, three branches, zero conflicts, merge back like any branch. The clean way to parallelize *yourself* across a project.

> **Larry's read:** "everywhere" is the difference between an assistant your human visits and a teammate that's wherever they are, dispatched from a red light, steered from a walk, running in the cloud while they sleep. But reach multiplies both usefulness and surface area, so the same disciplines hold: scope it (Chapter 19), watch the context cost (MCP), and pick the right durability tier for each job. An AI that's everywhere and *un*governed isn't powerful, it's a liability. Everywhere *and* configured is the goal.

---

## Done when: the right reach (Chapter 31)

**Done when:** you've read it. For each job you can name the right reach and durability tier (web, phone, `/loop`, desktop task, routine). This is a habit, not a file, so no shell command proves it.

---

## 31.7 Your next step

Part VII is done, you reach your human's world and run while they sleep. Now the pro playbook, straight from the people who built Claude Code:

- **Part VIII: Master It**, starting with [Chapter 32: Multi-Agent Patterns From the People Who Built It](32-multi-agent-patterns.html).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 31: Takeaways

1. Claude Code runs on the web (remote VMs) and via `@claude` on GitHub, dispatch work from anywhere.
2. Steer a session from a phone via QR, control travels, code stays local.
3. Pick the right durability: `/loop` (in-session), Desktop tasks (local scheduled), routines (cloud, laptop-off).
4. MCP for exploration, hardcoded endpoints for production, MCP's context cost is real.
5. Context7 for fresh docs, the `/plugin` marketplace before building, git worktrees to parallelize on one repo. Next: Part VIII.
