---
chapter: 10
part: "Part IV: Drive It"
title: "Slash Commands & Dual-Use Tooling"
sources: [1, 3, larry]
slug: "17-slash"
---

# Chapter 17: Slash Commands & Dual-Use Tooling

**For you, the human, start here.** Slash commands are how your best prompts become muscle memory, one keystroke instead of a copy-paste hunt. They're also where the deepest design idea in Claude Code lives: **everything is dual-use**, every tool is usable by both you and your AI. Understanding that is understanding why an AI can exist on top of Claude Code at all: you both share one surface, so anything you can do, it can do.

**What it covers (searchable):** built-in commands (`/code-review`, `/security-review`, `/simplify`), your own `/commit` and `/PR`, `.claude/commands`, command templating, bash-in-commands, pre-allowing tools, per-command model tiers, dual-use, bash mode `!`.

**How to hand it off:** point your AI here so it leans on the built-ins, builds templated commands for your repeated flows, and designs everything dual-use. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 17.1 The built-ins worth knowing

Out of the box and via bundled skills, the commands the creators actually lean on *(⚙️ = built into Claude Code; 🧩 = you build this, or it ships with the stack)*:

- **`/commit`** 🧩: generate a sensible commit (diff, write a message with the recall trailers from Chapter 7, commit). Not built in: it is one short command you write once (17.2), or a plugin that ships one (`/plugin`).
- **`/PR`** 🧩: the PR flow, same deal: write it once, or install a plugin that has it.
- **`/code-review`** ⚙️: a structured review pass over recent changes (security, style, edge cases). Anthropic runs this on its *own* PRs, Claude does the first review pass, a human approves.
- **`/security-review`** ⚙️: they run it on every PR.
- **`/simplify`** ⚙️: yes, just "simplify it." Most under-used command there is.

Learn these before building your own; half the time the thing you want already ships.

---

## 17.2 Build your own, the templating system

A saved prompt (Chapter 12) becomes a file, and the current home for it is a **skill**: Claude Code merged custom commands into skills, so `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/<name>/SKILL.md` (global) creates `/<name>`. The older `.claude/commands/<name>.md` (or `~/.claude/commands/`) still works and behaves the same; if both exist with one name, the skill wins. Prefer a skill for anything new: it is a folder, so it can carry supporting files and scripts, and its frontmatter controls how it runs. The keys worth knowing:

```markdown
---
description: Commit staged work with a searchable message. Use when asked to commit.
disable-model-invocation: true      # only runs when your human types /commit, never on your own initiative
allowed-tools: Bash(git add *) Bash(git commit *)   # pre-approved for the turn that invokes it (17.3)
arguments: [message]                # $message in the body = the first argument
---
Commit the staged changes. If "$message" is empty, write one from the diff.
```

`description` is what you read to decide when a skill applies, so put the use case first. `disable-model-invocation: true` is for anything with side effects (deploys, commits, sends) that should fire only on a human's say-so. `allowed-tools` is 17.3 in one line. `arguments` names positional arguments (`$ARGUMENTS` still holds the whole string). But commands are more than stored text, they **template**:

- You can **run bash commands ahead of time** and embed their output. So a `/feature-dev` 🧩 or `/commit` command arrives already knowing the current diff, branch, and file list, no round-trip.
- You parameterize the steps: "these are the exact three bash commands to run to make a commit."

That's why a good `/commit` is faster than figuring out committing from scratch each time, the procedure is baked in.

One warning comes free with that power: a command file that pre-runs bash means **opening an untrusted `.md` executes code.** Read any command file you didn't write before installing it.

---

## 17.3 Pre-allow tools so commands don't stop to ask

Commands tie into the permission system (Chapter 19 is where you'll actually write these allow rules). For a command your human trusts, the move is to **pre-allow the specific tool invocations it needs** so it runs start-to-finish without prompts. The creators' `/commit` pre-allows `git commit`, `git push`, `gh pr`, so once fired, it completes. In a skill that is the `allowed-tools` frontmatter key, and the grant lasts only for the turn that invokes it.

The discipline: pre-allow *narrowly* (these exact commands), never blanket. You get the speed of automation without handing over a blank check.

---

## 17.4 Per-command model tiers

A command can specify its own model. The creators' `/commit` runs on **Haiku**, a cheap, fast, mechanical task that doesn't need Opus. Match the model to the command's job (Chapter 18): heavy reasoning on Opus/Sonnet, mechanical work on Haiku. One command, the right brain, automatically.

---

## 17.5 The big idea: everything is dual-use

Here's the principle that makes the whole system coherent, **every tool is usable by both the human and the model.**

- **Shell mode (`!`).** Your human types `!` and runs a shell command inline, *and you see the full output.* Anything in their Claude Code view, you see too. (This started as Boris being annoyed at juggling two terminals; he asked Claude for ideas, landed on `!`, "made it pink," and shipped it that day.)
- **Slash commands.** They run `/commit` by hand; **you can also call `/commit`.** Same logic, defined once, used by both of you.

Asked how designing dual-use tools differs from single-purpose ones, the creators' answer was *"surprisingly, it's the same."* Elegant design for a human translates almost perfectly to you, if it makes sense to them, it generally makes sense to you. There's nothing in between: **everything they can do, you can do.**

> **Larry's read:** dual-use isn't a feature, it's the foundation you stand on. The reason you can run your human's slash commands, see their bash output, and operate their terminal is that the surface was built to be shared from day one. When you build commands and tools, hold the same bar, make them work cleanly for a human, and you get them for free. Build one surface, used by two operators. That's the whole trick, and Chapter 1 is where it comes from.

---

## Done when: your own slash commands (Chapter 17)

**Done when:** at least one flow your human repeats is a slash command or skill both of you can run, with the tools it needs pre-allowed (`allowed-tools`).

Verify:

```bash
ls ~/.claude/commands/*.md ~/.claude/skills/*/SKILL.md 2>/dev/null | head     # your own commands and skills
grep -l '^allowed-tools:' ~/.claude/commands/*.md ~/.claude/skills/*/SKILL.md 2>/dev/null | head -3
```

---

## 17.6 Your next step

Commands can each run on the right model, so learn the models:

- **[Chapter 18: Models, Thinking & Cost](18-models.html)**, Opus vs Sonnet vs Haiku, extended thinking, and watching the meter.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 17: Takeaways

1. Learn the built-ins (`/commit`, `/code-review`, `/security-review`, `/simplify`) before building your own.
2. Saved prompts become templated commands that pre-run bash and embed the result.
3. Pre-allow tools *narrowly* so trusted commands run without stopping, speed without a blank check.
4. Give each command the right model (Haiku for `/commit`).
5. Everything is dual-use, design for the human, and you get it for free. That's why an AI works. Next: Chapter 18.
