---
title: "Pick Up Where You Left Off: The Handoff Note"
slug: "handoff"
summary: "a one-screen note your AI writes before every stop and a hook loads at every start, so /clear, a compaction or a new day never loses the thread"
---

# Pick Up Where You Left Off: The Handoff Note

**For you, the human, start here.** Your AI's memory (Chapter 11) knows **who you are and what is true**. It does not know **where you were in the middle of something**. Run `/clear`, let a compaction happen, or come back tomorrow, and the AI either starts over or guesses. The worst guess is the wrong *kind* of work: you were only talking an idea through, and the fresh session starts building it. The fix is a short note the AI writes before every stop, called a **handoff**, which a hook loads at the start of the next session. One line in it matters more than the rest: **MODE**, which says whether you were discussing or building. The killer demo: `/clear` in the middle of a task, and the fresh session tells you what you were doing and what comes next before it touches anything.

**What it covers (searchable):** handoff, HANDOFF.md, resume point, pick up where you left off, MODE line (discuss, decide, build, debug, research), /handoff slash command, SessionStart hook, after /clear, after compaction, stale handoff warning, append-only handoff history, memory vs handoff.

**How to hand it off:** point your AI at this page and say *"set up handoffs for this project."* The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

Memory answers "what is true?" Nothing in a fresh session answers "where were we, and what is next?" So after every `/clear` (Chapter 13 tells you to clear between tasks, and you should), every compaction and every new day, you rebuild the thread from scraps, or you guess. A coding agent's default guess is to build, because that is what it is for. If your human was still deciding, that guess is the expensive one.

| | Memory (Chapter 11) | Handoff |
|---|---|---|
| Answers | What is true? | Where were we, and what is next? |
| Lives | Until the fact changes | Until the next session reads it |
| Count | Many small notes | **One live file per project** |

Memory is the map. The handoff is the "you are here" pin.

## The note: one screen, and MODE is the line that matters

The handoff lives at `.claude/HANDOFF.md` in the project. Always that path, so the loader always finds it:

```markdown
Written: 2026-10-21
MODE: discuss          # discuss | decide | build | debug | research
GOAL: Pick how users sign up; your human wants to compare 2 options first.
STATE: Option A (magic link) sketched. Option B (OAuth) not looked at yet.
NEXT: Lay out B next to A as a table. Do NOT write sign-up code until they pick.
OPEN: Does the free tier need email verification? Your human to answer.
```

- **MODE is the one line that cannot be left out.** `discuss` and `decide` mean you do not build. A fresh session that does not know this will start building.
- **NEXT is one concrete action**, not a summary. If you cannot name the next action, say so in NEXT.
- **Keep it to one screen.** A handoff points into memory, it does not copy it. Anything of lasting weight still goes to memory the same turn (Law 15).

## The recipe

Show your human each file and the settings change, say in plain words what each does, and write them only after their yes (Law 8: a hook is wired and proven in the same change).

**1. A `/handoff` command** (Chapter 17), so writing one is one word:

```bash
mkdir -p .claude/commands
cat > .claude/commands/handoff.md <<'EOF'
Write the session handoff now.
1. If .claude/HANDOFF.md exists, move it to .claude/handoffs/<its Written date>-<HHMM>.md (history is append-only, never edit it).
2. Write a new .claude/HANDOFF.md with these lines: Written, MODE, GOAL, STATE, NEXT, OPEN.
3. MODE is required. If you are not sure whether we were discussing or building, ask me.
4. Show me the file you wrote.
EOF
```

Your human types `/handoff` before closing, `/clear` or a break. Better: you write one **unasked** when you see a stop coming ("let's pick this up tomorrow", context getting full).

**2. A SessionStart hook that loads it.** Whatever a SessionStart hook prints goes into your context, and SessionStart also fires after `/clear` and after a compaction, which is exactly when you need it:

```bash
mkdir -p ~/.claude/hooks
cat > ~/.claude/hooks/handoff-load.sh <<'EOF'
#!/usr/bin/env bash
# handoff-load: a Claude Code SessionStart hook. Whatever it prints is added to the AI's context.
f="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/HANDOFF.md"
if [ ! -f "$f" ]; then
  echo "No handoff for this project. If this is not a brand-new project, ask your human what we were doing before acting."
  exit 0
fi
echo "# Resume point: read this, say the MODE and NEXT back to your human, then act."
[ -n "$(find "$f" -mtime +7 2>/dev/null)" ] && echo "WARNING: this handoff is over 7 days old. Confirm it is still current before trusting it."
grep -q '^MODE:' "$f" || echo "WARNING: this handoff has no MODE line. Ask your human whether we are discussing or building before you change anything."
echo
cat "$f"
EOF
chmod +x ~/.claude/hooks/handoff-load.sh
```

**3. Wire it.** Same safe merge as Chapter 21: a timestamped backup, the merged file checked before it replaces anything, every hook already there left in place, and a skip if it is already wired:

```bash
f=~/.claude/settings.json; b="$f.bak.$(date +%Y%m%d%H%M%S)"
if grep -q handoff-load.sh "$f"; then echo "already wired"
elif cp "$f" "$b" && jq '.hooks.SessionStart += [{"hooks":[{"type":"command","command":"bash ~/.claude/hooks/handoff-load.sh","timeout":10}]}]' "$f" > "$f.new" && jq empty "$f.new" && jq -e 'has("hooks")' "$f.new" >/dev/null; then mv "$f.new" "$f" && echo "wired; backup: $b"
else echo "not wired: settings.json left untouched (look at $f.new)"; fi
```

**4. On boot, say it back before you touch anything.** When a handoff loads, your first message names the mode and the next step: *"Resuming the sign-up options in **discuss** mode. Next: compare OAuth with the magic link. I won't write code until you pick."* It takes your human two seconds to correct you if that is wrong. No MODE line? **Ask** (Law 5: check state before acting).

## The one trap: a handoff the loader can't see

A handoff written anywhere other than the path the hook reads is invisible, and that is worse than having none, because the next session finds an **old** one and trusts it. Same path every time, and older notes move into `.claude/handoffs/` instead of piling up next to the live one.

## Lead with choices (Chapter 3)

- **Novice:** type `/handoff` before you close or `/clear`; the hook does the rest.
- **Mid:** your AI writes the handoff unasked when it sees a stop coming, and you read the say-back.
- **Super user:** one handoff per project across a fleet (the [herdr](herdr-sessions.html) workspace per project pairs well with it), the history in `.claude/handoffs/` committed with the project.

## Worked example

Your human spends Tuesday evening weighing two sign-up designs and stops before choosing. They type `/handoff`; the note says `MODE: discuss` and `NEXT: lay out OAuth next to the magic link, no code`. Wednesday morning they open the project. The hook loads the note and your first line is *"Resuming sign-up options in discuss mode, next is the comparison table, no code until you pick."* No re-explaining, and no half-built OAuth flow nobody asked for.

## Where this came from

Contributed by [RidgetopAI](https://github.com/RidgetopAi), who run their company on handoffs. Both traps above actually happened to them. A discussion lost its "don't build yet" line between sessions, and the next session started building: that is why MODE is required and the hook warns when it is missing. Later, three handoffs were written somewhere the loader did not read, and the next session resumed from one four handoffs out of date: that is why the path is fixed and the loader warns when the note is stale.

---

## Done when: handoffs (module)

**Done when:** a `/handoff` command exists, the SessionStart hook is registered, and a fresh session in the project starts by stating the MODE and NEXT.

Verify:

```bash
test -f .claude/commands/handoff.md && echo "command: ok"
jq -e '[.hooks.SessionStart[]?.hooks[]?.command] | any(test("handoff-load"))' ~/.claude/settings.json >/dev/null && echo "hook: registered"
CLAUDE_PROJECT_DIR=$PWD bash ~/.claude/hooks/handoff-load.sh | head -3      # the resume header, or the "no handoff" line
```

Then watch the warning fire (Law 8): take the `MODE:` line out, rerun the last command, see the "no MODE" warning, and put the line back. A check you have never watched fail is a check you don't know works.

---

## Your next step

Write a handoff before every stop for a week, until the say-back is a habit. Then return to [how.nixfred.com](index.html), and read [Chapter 13, context discipline](13-context.html) and [Chapter 21, hooks](21-hooks.html). Basics first, modules after.
