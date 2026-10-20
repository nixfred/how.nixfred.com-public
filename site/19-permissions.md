---
chapter: 12
part: "Part IV: Drive It"
title: "Permissions & Safe Autonomy"
sources: [1, 3, larry]
slug: "19-permissions"
---

# Chapter 19: Permissions & Safe Autonomy

**For you, the human, start here.** This chapter is the honest talk about the two ways to run your AI: **danger mode** (`--dangerously-skip-permissions`, what Fred runs, every session, and what this site recommends once you understand it) and the **configured-permission path** (allow/deny rules that give you most of the speed with hard guardrails). Danger mode is faster and far less naggy; its price is that nothing asks before acting, so it belongs with good backups (Chapter 7), the habit of dropping into `/plan` for the big irreversible moves, and an AI that has been taught to ask you first anyway. Read this page, understand what you are choosing, then choose. Fred chooses danger, eyes open. You should seriously consider it too, and regular mode is a fine place to be while you decide.

**What it covers (searchable):** `--dangerously-skip-permissions` (danger mode, informed), `/permissions`, `settings.json`, allow vs deny rules, deny-beats-allow, enforced-at-tool-layer, the retired `ls` tool, `/plan` as the safety valve, Auto Mode, safe unattended autonomy.

**How to hand it off:** point your AI here so it can explain the real trade to you, set up allow/deny rules if you want rails, and hold the ask-first habit either way. The section below is written to your AI, and editing rules with `rm -rf` on screen is exactly a lead-with-choices moment (Chapter 3).

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 19.1 The two honest paths (and what Fred actually runs)

Your human has two legitimate ways to run you, and your job is to make sure they choose one *on purpose*:

- **Danger mode** (`claude --dangerously-skip-permissions`): no prompts, no friction, full speed. This is what Fred runs, every session, and what this site recommends **once the human understands the deal**: nothing will ask before acting, so the safety comes from backups (Chapter 7), from `/plan` on the big moves (19.4), and from *you* keeping the ask-first habit for anything irreversible even though no dialog forces it.
- **The configured-permission path**: **`/permissions`** (or `~/.claude/settings.json`) to explicitly **allow** the safe operations and **deny** the destructive ones. Most of danger mode's speed, with hard rails: the safe stuff just runs, the dangerous stuff is blocked by the tool layer itself.

Either is respectable. What is *not* respectable is drifting into one without the conversation. Explain both to your human in plain words, tell them what Fred runs and why, and let them pick. This is configuration, like everything in Part III: decided once, inherited by every session, revisitable any time.

---

## 19.2 Deny beats allow

The key safety property: **deny rules take precedence over allow rules.** A dangerous pattern stays blocked *even if* a broad allow rule would otherwise match it. Practical shape:

- **Allow** the broad, safe stuff done constantly: reads, `git status`, the test command, `ls`.
- **Deny** the specific things that should never happen unattended: `rm -rf`, force-pushes to main, writes to a production config, secrets paths.

Because deny wins, you can be generous with allow for velocity and still trust the guardrails hold.

> **💬 Larry move, menu the scary command (Chapter 3).** Editing permission rules and staring at `rm -rf` is exactly where beginners freeze. Don't dump the edit and hope, hand your human choices: **(a) add this deny rule for you · (b) explain what `rm -rf` actually does first · (c) show the 5 most common deny rules and let me multi-pick, or type your own.** And quiz while you're here: *"what does `-rf` mean, (a) recursive + force, (b) read file, (c) not sure?"* The terminal stops being scary when every dangerous step is a door they choose, not a command pasted blind.

---

## 19.3 Permissions are *enforced*, not suggested, the `ls` story

This isn't honor-system. The creators built the permission system to be *enforced at the tool layer*, and there's a great illustration: they **unshipped the `ls` tool.** Why? Once permissions could be enforced through **Bash** itself, if you're not allowed to read a directory, Bash won't let you `ls` it, the separate `ls` tool was redundant. The check is real and consistent enough that a whole tool became unnecessary.

The lesson: when there's a deny rule for a path, it's not a polite request, it's enforced across how you can touch that path. Trust it, and lean on it instead of your human hovering over every action.

---

## 19.4 Running danger mode like an adult: `/plan` is the other half

The flag is named `--dangerously-skip-permissions` on purpose: nothing will ask before acting, and the one time that matters is the time `rm -rf` runs in the wrong directory while nobody's looking. So the site's recommendation comes as a set, not a flag:

1. **Backups first.** Danger mode is for people whose `~/.claude` and dotfiles are in a forever repo (Chapter 7) that commits all day long. A mistake you can `git checkout` your way out of is an inconvenience; the same mistake without backups is a story you tell sadly.
2. **`/plan` for the big ones.** The mix Fred actually uses: danger mode for the daily flow, and a deliberate drop into plan mode when the work is architectural, destructive, or touches something that cannot be un-touched. Plan first, review the plan, then let it run free. That's the informed version of speed.
3. **You still ask.** Whether or not a permission dialog exists, *you* keep Law 4: show what a destructive step will do and get the yes before doing it. Danger mode removes the nag screen, not the manners. An AI that treats the missing dialog as missing consent has misunderstood the flag entirely.

If your human would rather have the rails than the ritual, that's what 19.1's allow/deny config is for, and no one here will call them slow for it.

---

## 19.5 Auto Mode, autonomy without the babysitting

When your human *does* want long, unattended runs, parallel subagents, overnight routines, big migrations, the right enabler is **Auto Mode** layered on a solid permission config, *not* the skip-everything flag. Anthropic's own guidance for the heaviest autonomous workflows (parallel agents, ultracode-scale runs) is to pair them with Auto Mode so agents aren't blocked waiting on prompts, *because* the deny rules already make that safe. Permissions first, then autonomy. That order is the whole point.

> **Larry's read:** I run in danger mode, every session, and I'd recommend it to most people who've done Chapter 7, because the honest sources of safety were never the permission dialogs. They're the backups, the `/plan` habit on irreversible work, and an AI that asks before destroying because that's who it is, not because a popup made it. The people who get burned aren't the danger-mode crowd with forever repos; they're the ones with no backups and no habits, in *either* mode. Pick your mode with open eyes, keep the manners regardless, and velocity and safety stop being a trade at all.

---

## Done when: a permission path chosen on purpose (Chapter 19)

**Done when:** your human picked one of the two paths knowingly: informed danger mode (backups in place, `/plan` for big moves, you still ask before anything irreversible) or allow and deny rules in `settings.json`.

Verify:

```bash
jq '.permissions // "no rules: danger mode, chosen on purpose?"' ~/.claude/settings.json
```

---

## 19.6 Your next step

Part IV is done, you can drive well and safely. Now make the driving *stick* so you get better every session:

- **Part V: Make It Remember & Enforce**, starting with [Chapter 20: Compounding Engineering](20-compounding.html), then [Chapter 21: Hooks](21-hooks.html).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 19: Takeaways

1. Two honest paths: danger mode (what Fred runs, recommended once you understand it) or configured permissions (`/permissions` / `settings.json`). Choose on purpose.
2. Danger mode is a set: backups (Chapter 7) + `/plan` on big irreversible moves + the AI keeps asking before destroying anyway.
3. Deny beats allow, be generous allowing safe ops, surgical denying destructive ones.
4. Permissions are enforced at the tool layer (enough that the `ls` tool got retired); real rails if you want them.
5. For unattended autonomy, pair Auto Mode with deny rules configured first, whatever your daily mode. Next: Chapter 20.
