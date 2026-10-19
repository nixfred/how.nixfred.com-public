---
chapter: 7
part: "Part III: Configure It"
title: "Prompt Libraries, Templates & Quality Bars"
sources: [5, 1, larry]
slug: "12-prompt-library"
---

# Chapter 12: Prompt Libraries, Templates & Quality Bars

**For you, the human, start here.** This is the last piece of configuration: stop letting your good prompts die inside old chats. The prompts that work, the templates for things you make over and over, and your definition of "good", all of it should become reusable objects your AI can call by name, not stuff you re-improvise from memory every time. In Claude Code, a saved prompt is a one-keystroke slash command, a repeated output is a template, and "good" is a checklist your AI runs before it ever hands you a draft.

**What it covers (searchable):** prompt library, slash commands, `.claude/commands`, templates, quality bar / `/check`, verification-as-todo-items, the configured work environment.

**How to hand it off:** point your AI here so it captures your best prompts as commands and holds a quality bar automatically. The section below is written to your AI: how to turn a winning prompt into a slash command, when to make a template, and how to bake verification into its own to-do list so work that *looks* done actually *is*.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 12.1 Save the best prompts, they become slash commands

When a prompt works well, **save it.** Most people lose their best prompts inside closed conversations and re-improvise a worse version next time. Build your human a library:

- a research-brief prompt
- an article-draft prompt
- an editing prompt
- a meeting-summary prompt
- a competitor-research prompt

In a chatbot, that library is a notes file. In Claude Code it's better: a saved prompt becomes a **slash command**, a **skill** at `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/<name>/SKILL.md` (global), invoked as `/<name>`. (Custom commands were merged into skills; an older `.claude/commands/<name>.md` file still works the same way, but new ones belong in `skills/`, where frontmatter like `description`, `disable-model-invocation`, `allowed-tools` and `arguments` controls how they run.) Now the best prompt is one keystroke, not a copy-paste hunt. (Chapter 17 goes deep on building these, including templating and per-command models.)

> **Larry's read:** the moment a prompt earns its keep, it should stop being something your human *types* and become something either of you *calls*. A prompt reused from memory degrades over time; a prompt saved as a command only gets better as you edit it.

---

## 12.2 Templates for repeated outputs

Rule of thumb: **if your human produces the same kind of output more than twice, make a template.** Candidates:

- weekly report
- content brief
- project update
- research memo
- client summary
- article outline

A template makes you **predictable**, same structure, same sections, every time, which is exactly what they want for anything reviewed at a glance. Store templates with the project (Chapter 10) and reference them in the relevant command or prompt: *"draft this as a [research memo] using template.md."*

---

## 12.3 Hold a quality bar, before you answer

Know what "good" means *before* you hand over the final thing, as an explicit checklist you run against your own output:

- Is it specific, or padded?
- Any filler to cut?
- Does it match their format?
- Are the examples actually useful?
- Is the structure easy to scan?
- Is anything missing?

Make this a reusable object, not a one-off plea. Two good homes:

1. **A `/check` slash command** to run before accepting work.
2. **A line in `CLAUDE.md`:** *"Before presenting non-trivial output, run it against the quality checklist and fix what fails."*

Either way the floor on every answer rises, automatically. One rule to stop drift: the `/check` command is the single canonical home for the checklist itself; the `CLAUDE.md` line (and the copy back in Chapter 9) should point at `/check`, not restate it, or the copies quietly diverge.

---

## 12.4 Bake verification into the to-do list

A sharper version of the quality bar: when you make a to-do list for a task, add **verification steps as actual items**,

- "take a screenshot and check it renders"
- "open DevTools, confirm no console errors"
- "run the tests"

plus the magic line: **"don't move to the next to-do until the current one is verified done, you ran it and saw it work, or you stop and say what's blocking."** This is the difference between features that *look* finished and features that *are*. Verification isn't a phase at the end; it's a checkbox on every step. (It's also Law 7, fail loudly, never claim done you haven't verified.)

---

## 12.5 The payoff: a configured work environment

Stack the whole of Part III and the chatbot is gone:

```text
personal instructions + communication style   (Ch9)  → you sound like you work for them
projects + roles + reference material          (Ch10) → you know which world you're in
CLAUDE.md + context.md + /memory               (Ch11) → you remember, stable vs current
prompt library + templates + quality bar       (Ch12) → you're fast, consistent, and checked
TELOS                                          (Ch14) → you know who they actually are
```

> **Larry's read:** none of this needed a better model. Same Claude, completely different experience, because it's *configured*. That's the whole thesis of Chapter 9 made concrete. A stranger opens a blank box and asks it questions; your human opens a work environment that already knows their voice, projects, standards, and best prompts.

---

## Done when: a prompt library (Chapter 12)

**Done when:** your human's best repeated prompts are saved as slash commands or skills, each with its quality bar in it.

Verify:

```bash
ls ~/.claude/commands/*.md ~/.claude/skills/*/SKILL.md 2>/dev/null | head     # your saved prompts
```

---

## 12.6 Your next step

The work environment is built. Two more configuration moves, then you start driving:

- **[Chapter 13: Context Discipline](13-context.html)**, keeping that environment sharp instead of bloated.
- **[Chapter 14: TELOS](14-telos.html)**, the deep-context layer that knows your human, not just their stack.
- Then **Part IV: Drive It**, starting at [Chapter 15](15-prompting.html).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 12: Takeaways

1. Save winning prompts; in Claude Code they become one-keystroke slash commands.
2. More than twice? Make a template, predictable structure is the point.
3. Hold a quality checklist and run it before answering (a `/check` command or a `CLAUDE.md` line).
4. Bake verification steps into your to-do list; don't advance until verified (or say what's blocking).
5. Stacked config = a work environment, not a chatbot. Next: keep it sharp (Chapter 13).
