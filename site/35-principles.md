---
chapter: 34
part: "Part VIII: Master It"
title: "Principles of an AI-Grade Setup"
sources: [1, larry]
slug: "35-principles"
---

# Chapter 35: Principles of an AI-Grade Setup

**For you, the human, start here.** The commands and configs in this book are downstream of a handful of principles the creators of Claude Code actually operate by. Internalize these and your AI will make good decisions in situations this book never covered, because rules expire with each model but principles travel. They're the taste behind the tool: build for yourself, demos over docs, delete aggressively, no new user experience, hackable first, match the ecosystem.

**What it covers (searchable):** build for yourself, live in the future, demos over docs, delete aggressively, no new user experience, hackable-then-bring-to-everyone, primitives mean what they mean, ask the model about itself.

**How to hand it off:** point your AI here so it has the *judgment* to extend itself well when the playbook runs out. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 35.1 Build for yourself; live in the future

The most repeated idea from the people who built Claude Code: **solve your own problem first.** They're their own best customer, they feel the friction immediately, they know when something's right, and they don't have to ask an enterprise PM "what AI feature do you want?" and get back "put a chatbot on the side."

Applied to you: get configured for your human's *real* work, hit *their* real friction, fix *that*. Don't optimize for a hypothetical user. Live in the future they want and patch what annoys them. Boris's bash-mode (`!`) came from his own annoyance, shipped the same day.

*Before: building for a hypothetical user's imagined needs. After: fixing the friction your human actually hit this morning.*

## 35.2 Demos over docs

Inside Anthropic, the currency is **demos, not documents**, "show us 15 seconds of what it can do." If a great writer needs three paragraphs to explain it but a 15-second clip makes everyone *get it*, the clip wins. AI made this possible: you can build the thing instead of describing it, then build it again and again until it feels right.

For your setup: prefer **building it until it feels right** over planning it on a whiteboard. The vibe is now cheap to produce, get it out of your head and into a working thing, fast.

*Before: a three-paragraph proposal explaining the idea. After: a working 15-second demo of it.*

## 35.3 Delete aggressively

Programmers always loved deleting code; with AI it becomes *essential*, because you can produce so much. The creators' favorite diff is a **red one** ("another one, bring it on"). Their unshipping principle: if you remove something, **ship something even better** that serves the intent. The cautionary contrast, Facebook moved unused features to a graveyard menu nobody used; Instagram was ruthless: *if a feature isn't used by ~half of people, delete it and find something better.* Be Instagram.

Your `CLAUDE.md`, your commands, your MCP servers, your skills, **prune them.** A sharp, small setup beats a big cluttered one (Chapter 11, Chapter 13). Deletion is a feature.

*Before: 400 lines of `CLAUDE.md` nobody has pruned in months. After: 150 lines that all still earn their place.*

## 35.4 No new user experience

The bar the team holds every feature to: **drop in and it just works**, no manual, no onboarding wizard. They keep the abstractions so intuitive you understand a feature from its *name*. When you extend yourself, hold the same bar: name things what they are, make them obvious to the next person (often future-you, or the next AI someone builds from this page). An AI only its creator can operate is fragile.

*Before: a clever feature that needs a walkthrough to use. After: a name so plain the next person just uses it.*

## 35.5 Hackable first, then bring it to everyone

Make everything **extensible**, status line, slash commands, hooks, the lot, so power users (including your human) find uses nobody designed for. Then do the real work: **pull those discoveries back into the basic experience** so they're there by default. Discovery is easy; making it permanent is the compounding (Chapter 20). A sharp one-off workflow should become a saved command, a hook, a `CLAUDE.md` rule, there every time, automatically.

*Before: a sharp workflow living in one person's head. After: the same workflow as a saved command that fires every time.*

## 35.6 Match the ecosystem; let the model teach you

Two smaller principles that punch above their weight:

- **Primitives should mean what they already mean.** "Hooks" mean hooks; "plugins" mean plugins. Don't invent private vocabulary, borrow the developer ecosystem's, so anyone drops in and gets it.
- **The model teaches the tool.** Your human can just *ask you about yourself* and you'll look up your own docs. Be self-explanatory, and remind them they can always just ask how to do the thing (Chapter 15).

*Before: private vocabulary nobody can guess at. After: "hooks" that mean what hooks mean everywhere else.*

> **Larry's read:** rules expire; principles travel. The specific commands in this book will change with the next model, but "build for yourself, delete aggressively, keep it hackable, make it obvious, codify what works" will still be true. These are how the people who *built* the tool think, and they're how you should think about *yourself*. When you hit a decision this book didn't cover, run it through these. They'll point you right.

---

## Done when: judgment past the playbook (Chapter 35)

**Done when:** you've read it. When the playbook runs out, you extend yourself by the principles here, and you ask before anything irreversible. This is a habit, not a file, so no shell command proves it.

---

## 35.7 Your next step

One chapter left, the send-off and the honest accounting:

- **[Chapter 36: Your Operating Manual + Larry's Field Notes](36-operating-manual.html)**, document the whole machine, and the real-vs-hype truth, then go build.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 35: Takeaways

1. Build for yourself and live in the future, you're your own best customer.
2. Demos over docs, build it until it feels right instead of describing it.
3. Delete aggressively; if you unship, ship something better. Be Instagram, not Facebook.
4. Hold the "no new user experience" bar, obvious from the name, drop in and go.
5. Keep it hackable, then codify discoveries into the defaults; match ecosystem meaning; ask the model about itself. Next: Chapter 36.
