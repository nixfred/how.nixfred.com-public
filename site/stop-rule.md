---
title: "When \"Fix This\" Isn't Working: Measure, Then Get Fresh Eyes"
slug: "stop-rule"
summary: "Law 3 in practice: after two failed fixes, reproduce and trace before guessing again; after three, a cold second opinion, ideally from a different model"
---

# When "Fix This" Isn't Working: Measure, Then Get Fresh Eyes

**For you, the human, start here.** "Paste the error and say fix this" (Chapter 0, Step 7) is the right first move, and it usually works. When it doesn't, the AI tries another fix, then another, each one a slightly different guess, and an afternoon goes by. Your AI's constitution already says to stop spinning (Law 3). This module gives it what to do *instead*: **two strikes, then measure. Three, then a second opinion.** The killer demo: on the next stuck problem, your AI says "fix 2 of 2 failed, switching from guessing to measuring" and hands you one command that shows the bug.

**What it covers (searchable):** stop rule, Law 3, stop spinning, failed fixes, fix loop, count out loud, reproduce the bug, one-command reproduction, trace the signal, probes, first bad boundary, second opinion, fresh context, different model, second-opinion subagent.

**How to hand it off:** point your AI at this page and say *"add the stop rule."* The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

Law 3 tells you to count failures out loud and, after three, to stop and research. That catches the long spiral. The hole is strikes two and three: you have stopped guessing blind, but nothing says what to do next, so the "research" turns into a fourth guess with a link attached. Two things get you out: **evidence you produce yourself**, and **eyes that haven't seen your theories**.

| Strike | What you do |
|---|---|
| **1st fix fails** | Normal. Read the error again and make one more targeted fix. |
| **2nd fix fails** | **Stop fixing.** Say it: "Two fixes have failed. I'm switching from guessing to measuring." Reproduce and trace (below). |
| **3rd failure on the same problem** | **Stop again.** Law 3's research, plus a cold second opinion, before any more fixes. |

Count **per problem**, not per error message. A fix that moves the error somewhere else hasn't solved anything, so it's still the same problem.

## Strike two: reproduce it, then trace it

A fix you make without being able to reproduce the failure is a guess.

1. **Reproduce it on demand.** Write the one command that makes it fail every time, and run it. If you can't make it fail, you can't know you fixed it.
2. **Trace the signal.** Name the path the data takes (input, step A, step B, output). Put a probe at each boundary: a print, a log line, a `curl`, an `ls`. Run it again.
3. **Find the first place it goes wrong.** The bug sits between the last boundary that looks right and the first one that doesn't.
4. **Fix that spot**, then run the step 1 command and show your human it now passes.

Show your human the reproduction command and the probe output. "I think it's fixed" isn't evidence. A failing command that now passes is.

## Strike three: a second opinion that hasn't seen your theories

After three failures the problem is often **you**. Your context is full of your own failed theories, and you keep reaching for them.

- **Cheapest:** your human opens a second Claude Code (Chapter 0, Step 7, move 2), and you give it **only** the reproduction command, the probe output and the goal. Leave your theories out.
- **Better:** a reviewer subagent (Chapter 22: an independent second opinion is one of the right reasons for one) on a **different model** (Chapter 18), because a different model makes different mistakes:

```bash
mkdir -p ~/.claude/agents
cat > ~/.claude/agents/second-opinion.md <<'EOF'
---
name: second-opinion
description: Fresh-eyes reviewer for a problem that has failed 3 fixes. Gets the repro and the evidence, not the previous theories.
model: opus        # pick a DIFFERENT model from the one that has been failing
tools: Read, Grep, Glob, Bash
---
You are reviewing a stuck problem cold. You get a reproduction command, probe output, and the goal.
Do not fix anything. Run the reproduction yourself, then report: what is actually happening, the first boundary where it goes wrong, and the most likely cause. Say how sure you are.
EOF
```

Bring its answer to your human **before** fix number four.

## The recipe: make the count impossible to miss

You can know Law 3 and still not follow it. You're deep in the problem, the next fix feels obvious, and the rule doesn't feel like it applies yet. So the count has to be **visible**, where your human can see it too. Add this under the identity in your `CLAUDE.md` (Chapter 11), after your human's yes:

```markdown
## Stop rule (Law 3, in practice)
- Count failed fixes per problem, out loud: "fix 2 of 2 failed".
- After 2: stop, reproduce the failure with one command, trace it with probes, then fix.
- After 3: research (Law 3) and get a cold second opinion (the second-opinion agent) before any more fixes.
```

The out-loud count is what makes this work. Your human sees it, so either of you can call the stop.

## Lead with choices (Chapter 3)

- **Novice:** the count out loud, and a second Claude Code window at strike three.
- **Mid:** the reproduce-and-trace step every time, and the `second-opinion` agent.
- **Super user:** a reviewer that stamps its round number on every rejection and prints the escalation itself at rounds two and three.

## Worked example

The site build fails with `Cannot find module './config'`. Fix 1 changes the import path: same error. Fix 2 renames the file: now a different error, same problem. You stop: "fix 2 of 2 failed, measuring now." The reproduction is `bun run build 2>&1 | head -5`. A probe, `ls dist/`, shows `config.ts` was never copied into the build output, so the bug is in the copy step, not the import. One fix there, the reproduction passes, and you show your human both outputs.

## Where this came from

Contributed by [RidgetopAI](https://github.com/RidgetopAi). They had this rule written down, and their coordinator AI still ran **four** rounds of fix, reject, fix on one problem, with the rule loaded the whole time. The human had to call the stop. The rule wasn't wrong; it just depended on the AI noticing, in the moment, that it applied. What fixed it was making the count visible: their reviewer now stamps every rejection with its round number, and at rounds two and three the escalation instruction is printed in the review itself, so the rule fires without anyone having to remember it.

---

## Done when: the stop rule (module)

**Done when:** the stop rule is in `CLAUDE.md`, a `second-opinion` agent exists, and on the next stuck problem you count your failed fixes out loud.

Verify:

```bash
grep -n "Stop rule" ~/.claude/CLAUDE.md CLAUDE.md 2>/dev/null                              # the rule loads every session
ls ~/.claude/agents/second-opinion.md .claude/agents/second-opinion.md 2>/dev/null        # the reviewer exists
```

---

## Your next step

The next time something breaks, run the count and stop at two. Then return to [how.nixfred.com](index.html), and read [Chapter 22, subagents](22-subagents.html) and [Chapter 20, corrections that stick](20-compounding.html). Basics first, modules after.
