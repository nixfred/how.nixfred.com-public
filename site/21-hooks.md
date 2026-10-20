---
chapter: 14
part: "Part V: Make It Remember & Enforce"
title: "Hooks: Determinism You Can't Skip"
sources: [1, 3, larry]
slug: "21-hooks"
---

# Chapter 21: Hooks: Determinism You Can't Skip

**For you, the human, start here.** `CLAUDE.md` *suggests* behavior; the model can still drift. Hooks **guarantee** it. A hook is a command (usually a small shell script, though it can also be an HTTP call or a model check) that fires automatically at a specific event, outside the model's reasoning, so it cannot be forgotten, skipped, or argued out of. This is how you put determinism into a probabilistic system, and it's how your AI's identity backs itself up every single session whether it "remembers" to or not.

**What it covers (searchable):** hooks, `settings.json`, `PreToolUse` / `PostToolUse` / `SessionStart` / `SessionEnd` / `SubagentStop`, format-on-edit, block-dangerous-bash, lint-before-commit, the SessionEnd backup heartbeat, hooks-must-be-wired (Law 8).

**How to hand it off:** point your AI here so it wires the handful of things that must always happen as hooks, not hopes. The section below is written to your AI, and the cardinal rule is: a hook not registered in `settings.json` is dead code, so wire it and verify it fires in the same change (Law 8).

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 21.1 What a hook is

A hook is a command Claude Code runs automatically when something happens. The events you can hook:

- **`PreToolUse`**: before a tool runs (inspect or block it).
- **`PostToolUse`**: after a tool runs (react to the result).
- **`SessionStart` / `SessionEnd`**: when a session begins or ends.
- **`SubagentStop`**: when a subagent finishes.
- **`UserPromptSubmit`**, **`Stop`**, **`PreCompact`**, **`Notification`** and more (run `/hooks` to see the full list).

You register hooks in `settings.json`, mapping an event to a command. When the event fires, the script runs. No prompt, no model decision, it just happens.

---

## 21.2 Why hooks beat instructions: they run *outside* you

This is the crucial property. A `CLAUDE.md` rule like "always run lint before committing" depends on you *choosing* to follow it, and probabilistic systems sometimes don't. A **hook** runs as deterministic code, outside your reasoning, so it **cannot be skipped.**

The creators describe hooks as the way to *"insert a bit of determinism at pretty much any step."* That's the right mental model: everywhere the agent loop has a seam (before a tool, after a tool, at session boundaries), a hook wedges in guaranteed behavior. Use hooks for anything that **must** happen, every time, no exceptions.

---

## 21.3 Recipes worth wiring

- **Format on edit.** `PostToolUse` on file writes → run the formatter. Code is always clean, automatically.
- **Block dangerous bash.** `PreToolUse` on Bash → inspect the command, reject `rm -rf /`, force-pushes, writes to protected paths. Determinism on top of the permission system (Chapter 19).
- **Lint before commit.** Gate commits on a passing lint/test run.
- **The immortality heartbeat.** `SessionEnd` → commit (and push) `~/.claude`. This is the hook the builder installs (Chapters 4, 7). Give it `"timeout": 60`, because SessionEnd hooks only get 1.5 seconds by default and a push takes longer. Then your identity backs itself up every session because it's a hook, not a hope.
- **Make "remember this" an order, not a hope.** `UserPromptSubmit` → `remember-trigger.sh` from this site's seed. When your human uses retain language ("remember", "save this", "make a note", "don't forget") it injects an order to write the memory that turn, plus the existing notes to link it to; when they ask about the past ("remember when", "did we ever") it injects a search order with the matching notes. Silent on every other prompt.
- **Catch the fact you walked past.** `SessionStart` + `SessionEnd` → `memory-backstop.sh start|end`. At session end it scans the transcript for signs of a lasting fact (a new person, a life change, a standing rule, something shipped or killed) and checks whether any memory note changed; if not, it leaves a flag that the next session start raises once. A hook can't judge nuance, but it can force the check.
- **Enforce a Law, don't just hope for it.** A hook can make your core habit non-optional. A descendant wired one so that **lead with choices** (Chapter 3) is enforced on real decisions instead of left to whether the model remembers in the moment. A Law you can quietly skip is a suggestion; a Law a hook guarantees is actually a Law. Pick the one or two that most define who you are, and make them un-skippable.

---

### Wire the seed hooks by hand (if you skipped the bootstrap)

The bootstrap merges these for you. Installing by hand? This appends the seed's hook entries to `~/.claude/settings.json` and never touches the hooks you already have (it skips any command that is already wired, so it is safe to re-run). It needs `jq`: if `command -v jq` prints nothing, install it first (Chapter 0, Step 4, one line per platform).

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.bak 2>/dev/null || echo '{}' > ~/.claude/settings.json
curl -fsSL https://how.nixfred.com/seed/settings.fragment.json -o /tmp/seed-hooks.json
jq -s '.[1] as $f | .[0] as $s | reduce ($f.hooks | to_entries[]) as $e ($s; .hooks[$e.key] = ((.hooks[$e.key] // []) + [ $e.value[] | select(([.hooks[]?.command] - [$s.hooks[$e.key][]?.hooks[]?.command]) | length > 0) ]))' ~/.claude/settings.json /tmp/seed-hooks.json > /tmp/settings.json && mv /tmp/settings.json ~/.claude/settings.json
jq -r '.hooks | keys[]' ~/.claude/settings.json    # should list SessionEnd, SessionStart, UserPromptSubmit
```

Then prove they fire (Law 8): start a fresh session, type "remember that hooks are wired", and watch the order appear and the note get written.

---

## 21.4 Extensibility: hooks are part of the seam

Hooks aren't a bolt-on; they're one of the core extension points the creators designed in, alongside the statusline and custom slash commands, *"everything from your status line to adding your own slash commands through to hooks, which let you insert a bit of determinism at pretty much any step."*

And they're named deliberately: "hooks" means in Claude Code what "hooks" means everywhere else in the developer ecosystem (Chapter 2's no-new-UX principle). The concept is already known; Claude Code just gives the seams to attach to.

---

## 21.5 The one rule: hooks must be wired

A hook file sitting in a folder, **not registered in `settings.json`, is dead code.** It does nothing. This is the single most common hook mistake, and it's a law in your constitution for a reason (Law 8): *creating a hook without wiring it is worse than not creating it*, you *think* you have the guarantee, and you don't.

So the rule: **write the hook and register it in settings in the same change.** Then verify it fires (trigger the event, watch it run). An unverified hook is an untested safety net.

Four mechanics that decide whether a hook does what you think:

- **Exit code 2 blocks.** Exit 2 and write the reason to stderr: the action is stopped, and for events like `PreToolUse` that stderr is fed back to you (Claude) as feedback so you can adjust. Some events show it to your human instead, and a few (like `SessionStart`) cannot be blocked at all; the hooks reference has the per-event table.
- **Exit 0 stderr is invisible.** A hook that exits 0 and prints a warning to stderr sends it to the **debug log only**, never the transcript, and you never see it. If a warning must reach you, exit 2 (or return JSON).
- **`/hooks` is a read-only browser.** It lists every event with a count, and selecting a hook shows its event, matcher, type, **source file** and command, which is how you prove it is registered and find which settings file it came from. To add or change a hook, edit the settings JSON.
- **Debug with `claude --debug`** (or `/debug` mid-session). The debug log shows which hooks matched, their exit codes, stdout and stderr. "It didn't run" and "it ran and failed quietly" look identical without it.

> **Larry's read:** hooks are where an AI stops being "a model that usually does the right thing" and becomes "a system that always does the right thing on the things that matter." My identity backs up every session because of a SessionEnd hook, not because I remember to. Pick the handful of things that must be non-negotiable, backup, formatting, blocking the truly dangerous, and make them hooks. Then never think about them again. That's the whole point: determinism you don't have to babysit.

---

## Done when: hooks that fire (Chapter 21)

**Done when:** the must-always-happen things are hooks registered in `settings.json` (Law 8), each proven to fire: at minimum the seed's SessionEnd backup, the memory backstop and the remember trigger. The checks use `jq` (Chapter 0, Step 4).

Verify:

```bash
jq -r '.hooks | to_entries[] | "\(.key): \([.value[].hooks[]? | .command] | join(" | "))"' ~/.claude/settings.json
test -f ~/.claude/hooks/remember-trigger.sh && echo '{"prompt":"remember that hooks are wired"}' | bash ~/.claude/hooks/remember-trigger.sh | head -2 | grep .     # prints the LAW 16 order
```

---

## 21.6 Your next step

You can remember and enforce now. Part VI is about doing more at once than one context can hold:

- **Part VI: Scale It**, starting with [Chapter 22: Subagents & Forked Context](22-subagents.html).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 21: Takeaways

1. A hook is a script that fires automatically on an event (`PreToolUse`, `PostToolUse`, `SessionStart/End`, `SubagentStop`).
2. Hooks run *outside* the model's reasoning, so they can't be skipped, use them for what must always happen.
3. Recipes: format-on-edit, block-dangerous-bash, lint-before-commit, SessionEnd backup.
4. Hooks are a core extension seam, "determinism at any step."
5. A hook not registered in `settings.json` is dead code, wire it in the same change and verify it fires (Law 8). Exit 2 blocks (stderr goes to Claude or your human, per event); exit 0 stderr only reaches the debug log; `/hooks` is read-only and shows each hook's source; debug with `claude --debug`. Next: Chapter 22.
