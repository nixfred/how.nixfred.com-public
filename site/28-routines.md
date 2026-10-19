---
chapter: 26
part: "Part VII: Connect & Automate It"
title: "Routines: The Laptop-Off Teammate"
sources: [2, 5, larry]
slug: "28-routines"
---

# Chapter 28: Routines: The Laptop-Off Teammate

**For you, the human, start here.** Everything so far has your AI waiting for you to press Enter. Routines flip that: an AI that notices when something breaks and does something about it, running on managed infrastructure, on a schedule or a trigger, whether your laptop is open or not. This is the leap from *tool* to *teammate*, less "I should ask it to check the deploy," more "it already checked the deploy and pinged me only because it found a problem." The advanced design patterns are Chapter 34.

**What it covers (searchable):** routines, proactive agents, managed infrastructure, laptop-off, tool vs teammate, three pains (where/when/in-or-out-of-loop), three pillars, `/schedule`, triggers, steerable sessions.

**How to hand it off:** point your AI here so it can stand up its first low-stakes routine and climb the trust ladder. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 28.1 Tool → teammate

A **tool** waits for a prompt. A **teammate** acts. Right now Claude Code is a powerful coding *tool*; routines turn it into a powerful coding *teammate*, one that wakes up, checks on things, and takes action without your human initiating. From Anthropic's own workshop: the goal is an agent that doesn't wait for your human to press Enter.

That's the whole pitch. Less of your human thinking "I should ask Claude to check the deploy," more "it already checked the deploy and pinged me only because it found a problem."

---

## 28.2 The three pains routines remove

Building proactive agents the hard way is miserable in three specific ways. Routines exist to delete all three:

1. **Where do they run?** Not the laptop, close the lid and the agent dies. DIY means hosting, data persistence, auth, a pile of boilerplate infra.
2. **When do they fire?** DIY means building on cron or spinning up endpoints to poke.
3. **In or out of the loop?** Headless agents are black boxes, no way to watch, steer, bound, or resume them mid-run.

Your human shouldn't have to build infrastructure to have a proactive agent. Routines handle it so you both focus on the domain, not the plumbing.

---

## 28.3 Managed infrastructure, laptop can be off

Routines run on **Claude Code's managed infrastructure** (a research preview on Pro, Max, Team and Enterprise). Hosting, session state, and connector auth are handled; **nothing depends on the laptop being open.** You define a **prompt**, the **repos** it connects to, its **environment**, the **connectors** it can use, and one or more **triggers**, and Claude Code runs the rest in the cloud. Runs use the same plan limits as your sessions, plus a daily cap on routine runs.

Three facts from the routines docs that change how you design one:

- **No permission prompts, ever.** A routine runs autonomously as a full cloud session: there is no permission-mode picker and nothing asks for approval mid-run. It can run shell commands and call every tool of every connector it includes, writes too. Everything it does through a connector appears as your human.
- **Every connector is included by default.** When a routine is created, all of your human's connected claude.ai connectors are attached. **Remove every one the job does not need** before the first run; that removal is the only fence it has.
- **The minimum schedule interval is one hour.** Cron expressions that fire more often are rejected. Need faster polling? That is `/loop` inside a live session, not a routine.

**The local alternative: Desktop scheduled tasks.** The Claude Desktop app's Routines page can also create a **local** scheduled task that runs on your human's own machine, with direct access to local files and tools (a cloud routine only sees a fresh clone of its repos). The trade: it only fires while the Desktop app is open and the computer is awake. A sleeping machine skips the run, and on wake Desktop starts one catch-up run for the most recent miss, so a 9am task can run at 11pm; write the prompt to cope with that.

This is the single biggest difference from everything earlier in the book: a routine is an AI that exists when your human doesn't.

---

## 28.4 The three pillars

The workshop frames routines around three properties, and they map to the three pains:

1. **Always available**, managed infra, no laptop dependency.
2. **Proactive**, triggers you can combine (a schedule, a GitHub pull request or release event, or an API call to the routine's own authenticated endpoint). Chapter 29 designs these.
3. **Interactive & steerable**, and this is the part that makes them trustworthy: every routine is *just a Claude Code session under the hood* that your human can **open, watch, follow up on, steer, and resume** from web, CLI, or desktop. Human-out-of-the-loop by default, human-in the instant they want to be.

---

## 28.5 Your first routine: `/schedule`

You're one command away. Inside Claude Code:

```text
/schedule
```

Then describe the job in plain language, the workshop's real example:

> *"Once a week, review all the new changes merged to main against our documentation repo, and create a PR to update the docs if you see any changes."*

Come back with a couple of clarifying questions (what time? notify how?), and create the routine. That's it, a recurring chore becomes your standing responsibility.

**Before anything runs unattended, three non-negotiables.** Declare its blast radius (exactly which repos, inboxes, and accounts it may touch). Run it attended the first time and watch it work. And give it a verify gate that halts and notifies on failure instead of pushing on. A routine that can't say what it touches, has never been watched, or fails silently isn't ready to act while your human sleeps.

> **Larry's read:** routines are the moment an AI stops being something your human *uses* and becomes something that *works for them*. It's also the moment the stakes rise, an agent acting while they're asleep is exactly when good design (the right trigger, full context, real steerability) matters most. So treat this chapter as the *what*, Chapter 29 as the *how to build one*, and Chapter 34 as *how to do it without getting burned*. Start with one low-stakes routine (a digest, a docs check), watch it run a few times on the web, and climb the trust ladder from there.

---

## Done when: a first routine (Chapter 28)

**Done when:** a first low-stakes routine exists and has run once while your human's laptop was closed. Routines run in the cloud, so `/schedule` in a session is where you check it, not a shell command.

---

## 28.6 Your next step

You can act on a schedule now. Next, design those triggers and context properly:

- **[Chapter 29: Designing & Deploying Routines](29-routine-design.html)**, the trigger / context / steerability decisions that make a routine trustworthy.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 28: Takeaways

1. Routines turn Claude Code from a tool that waits into a teammate that acts.
2. They remove the three pains of DIY proactive agents: where to run, when to fire, in/out of the loop.
3. They run on managed infra, the laptop can be off; you define prompt + repos + connectors + trigger. No permission prompts during a run, ALL connectors attached by default (remove the unneeded ones), minimum interval one hour. Desktop local scheduled tasks reach local files but need the app open and the machine awake.
4. Three pillars: always-available, proactive, and (crucially) interactive & steerable.
5. `/schedule` + a plain-language description creates your first one. Start low-stakes. Next: Chapter 29.
