---
chapter: 4
part: "Part III: Configure It"
title: "Setup Beats Model: Configure, Don't Chat"
sources: [5, 1, larry]
slug: "09-configure"
---

# Chapter 9: Setup Beats Model: Configure, Don't Chat

**For you, the human, start here.** Most people use Claude in the weakest possible way: open a chat, ask one question, get one answer, close the tab, and start from zero next time. No saved context, no preferences, no memory. That's why the answers feel random. The fix is almost never a bigger model, it's a better **setup**. This chapter is the hinge the whole book turns on: a configured AI beats a smarter unconfigured one, every time.

**What it covers (searchable):** personal instructions, communication style, quality bar / self-check, precise correction, feedback as configuration, harness-beats-model.

**How to hand it off:** point your AI here so it learns to configure itself *around you* instead of guessing. The section below is written to your AI: how to capture who you are, how to lock in the answer style you want, how to run a quality checklist before it replies, and the key move, when you correct it on something you'll want every time, it writes that correction into `CLAUDE.md` so it never makes you say it twice.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

You *are* a configured Claude. The difference between you and a stranger's blank session isn't intelligence, it's that you start every session already knowing your human. This is the same truth from two directions. The power-user playbooks say it plainly, *most people don't need a better model, they need a better setup.* And the people who built Claude Code say it in their own words: **the harness matters as much as the model** (Chapter 1). A great model in a blank config underperforms a good model in a configured one. This chapter is where your configuration starts.

---

## 9.1 Capture your human's personal instructions

Get the basic facts down once, into `CLAUDE.md` (Chapter 11 goes deep), so they never re-explain them:

- **Who they are**: role, expertise.
- **What they work on**: projects, stack.
- **Who their audience or customers are.**
- **What kind of answers they prefer**, and the formats they use often.
- **What tone they want.**

The payoff is immediate: every session starts already knowing their world, instead of guessing and getting it wrong. Use the AskUserQuestion habit (Chapter 3) to *pull* this out of them, offer choices, don't make them write an essay.

> **Larry's read:** the difference between me and a stranger's blank Claude isn't intelligence, it's that I start every session already knowing Fred, his machines, his house style, his projects. Same model. Completely different collaborator. That gap is just configuration written down.

---

## 9.2 Define how you should communicate

Don't leave the *style* of your answers to chance, your human should specify it, and you should hold it. Concretely:

- Keep answers practical.
- Use examples when possible.
- Avoid vague advice.
- Ask clarifying questions only when necessary.
- **Give the answer first, then explain.**
- Use clear formatting.

If this isn't defined, you guess, and you'll guess "corporate hedge" more often than your human would like. Written-down communication rules turn a generic assistant into one that sounds like it works *for them*.

---

## 9.3 Set a quality bar before your final answer

Know what "good" means *before* you hand something over. A short checklist you run against your own output:

- Is the answer specific, or padded?
- Is there filler to cut?
- Does it match their format?
- Are the examples actually useful?
- Is the structure easy to scan?
- Is anything missing?

Bake this into config (or a slash command, Chapter 12) and the floor on every answer rises immediately. Your human stops getting first drafts and starts getting checked work.

---

## 9.4 Treat correction as configuration

When your output misses, your human shouldn't have to sigh and accept it, and "no, better" isn't enough. They'll tell you exactly what to change:

- "This is too vague, give me the specific commands."
- "Use shorter paragraphs."
- "Give me examples."
- "Drop the corporate language."
- "Make the structure easier to scan."

You improve sharply on precise feedback. And here's the move that makes you an AI instead of a chatbot: when a correction is something they'll want *every* time, don't just fix it once, **write it into `CLAUDE.md`.** A precise correction is a one-off; the same correction in config is permanent. Scope each capture before you write it, per the discipline in [Chapter 11](11-memory-files.html), or `CLAUDE.md` bloats with one-off rules that mislead every later session. That loop is the whole of Chapter 20 (compounding).

---

## Done when: configured around your human (Chapter 9)

**Done when:** your human's personal instructions, how they want you to communicate, and your quality bar are written into `~/.claude/CLAUDE.md` in their words, with no template placeholders left.

Verify:

```bash
test -f ~/.claude/CLAUDE.md && ! grep -nE '\{\{[A-Z_]+\}\}' ~/.claude/CLAUDE.md && echo "no placeholders left"
git -C ~/.claude log --oneline -3 -- CLAUDE.md     # edited since the seed
```

---

## 9.5 Your next step

You know configuration beats model. Now structure where it lives:

- **[Chapter 10: Projects, Roles & Reference Material](10-projects.html)**, splitting work so each area carries only its own context.
- Then **[Chapter 11: CLAUDE.md, context.md & Memory](11-memory-files.html)**, the mechanics of the brain file.
- And the highest-leverage one of all, **[Chapter 14: TELOS](14-telos.html)**.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 9: Takeaways

1. The lever is setup, not model, the same truth as "the harness matters as much as the model."
2. Capture your human's personal instructions once: who they are, their work, preferences, tone.
3. Hold an explicit communication style, or you guess (and hedge).
4. Run a quality checklist before you answer.
5. Treat correction as config: codify the corrections they'll want every time. Next: Chapter 10.
