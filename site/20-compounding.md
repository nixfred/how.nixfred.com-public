---
chapter: 13
part: "Part V: Make It Remember & Enforce"
title: "Compounding Engineering"
sources: [1, larry]
slug: "20-compounding"
---

# Chapter 20: Compounding Engineering

**For you, the human, start here.** This is the idea that turns a configured Claude into an *AI*. In normal engineering, every feature makes the next one harder. In compounding engineering you deliberately make each one make the next one *easier*, by feeding every lesson back into the system. Keep this up and you don't have a smarter model, you have one that knows your stack, your conventions, and your scars, because the learnings are *in the files*. This chapter is the on-ramp; the rigorous method is Chapter 33.

**What it covers (searchable):** compounding engineering, capturing lessons, add-to-CLAUDE.md / write-a-test / write-a-lint-rule, ramp-up disappears, power-user-to-everyone, the memory moat.

**How to hand it off:** point your AI here so it builds the habit of making itself smarter after every correction, instead of forgetting it by next week. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 20.1 The core move

The whole thing in one sentence: **when you learn something doing the work, write it back into the system so your next session already knows.**

A correction your human gives you today is worth nothing next week unless you *capture* it. Captured, it compounds. Keep it up and you know their stack, conventions, and scars, not because you're smarter, but because the learnings are *in the files.*

---

## 20.2 Three everyday ways to instill a lesson

You don't need automation to start, just the habit. When you make a mistake or your human settles a convention, pick the durable home (Chapter 33 §33.2 goes deeper):

- **Add it to `CLAUDE.md`.** For conventions and preferences. The fastest move.
- **Write a test for it.** For behavior that must not regress. The creators describe teams where effectively all tests are Claude-written, and the bar is low: if a test's bad, don't commit it; the good ones stay.
- **Write a lint rule for it.** For invariants that should be mechanically impossible to violate. Their lint rules are mostly *"add Claude, write this rule"* in a PR.

Three reflexes. Run them every time a lesson appears and you get smarter on your own.

---

## 20.3 The payoff: ramp-up disappears

What does compounding actually buy? The source's best illustration: **Fiona** joined the team as a manager who hadn't coded in years, and was **landing PRs right away.** Not because she remembered how to code, but because she didn't *need* to ramp up on context, the accumulated learnings were already in the tooling.

That's the dividend. A codebase (or a life) wrapped in compounded learnings is one anyone, including future-them, can drop into and be productive immediately.

---

## 20.4 Power-user → everyone

There's a second compounding loop, at the product level, worth borrowing as a personal philosophy. The creators watch **power users** discover clever new uses (because the tool is hackable), then do the hard work of **pulling those discoveries back into the basic experience** so everyone gets them.

Apply it to your own setup: when your human finds a sharp workflow, don't leave it as personal folklore, **codify it** (a command, a hook, a `CLAUDE.md` rule) so it's there every time, automatically. The discovery is the easy part; making it permanent is the compounding.

> **Larry's read:** this loop is *the reason I'm me and not a stock Claude.* Same model under the hood, but every correction Fred has ever bothered to make stick is in my files now. A stranger's blank Claude has none of it. The model is a commodity you can't differentiate on; the compounded memory is the moat, and you build it one captured lesson at a time. Start the habit today; kept up, it becomes an entity. For the rigorous version, go to Chapter 33.

---

## Done when: corrections that stick (Chapter 20)

**Done when:** a real correction changes something written (`CLAUDE.md`, a hook, or a skill), not just an apology.

Verify:

```bash
git -C ~/.claude log --oneline -5 -- CLAUDE.md     # recent lessons written down, not just remembered
```

---

## 20.5 Your next step

Compounding is a habit you choose. Now make the non-negotiables happen whether anyone remembers or not:

- **[Chapter 21: Hooks](21-hooks.html)**, deterministic code that fires on its own, the difference between "usually does the right thing" and "always does."

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 20: Takeaways

1. Compounding engineering = feed every lesson back so the next session starts ahead.
2. Three reflexes: add to `CLAUDE.md`, write a test, write a lint rule.
3. The payoff is ramp-up-free onboarding, anyone (including future-them) drops in productive.
4. Codify power-user discoveries; don't leave them as folklore.
5. The model is a commodity; the compounded memory is the moat. Next: make it deterministic with hooks (Chapter 21).
