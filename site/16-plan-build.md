---
chapter: 9
part: "Part IV: Drive It"
title: "Plan, Prototype, Build"
sources: [1, 3, larry]
slug: "16-plan-build"
---

# Chapter 16: Plan, Prototype, Build

**For you, the human, start here.** The single habit that cuts revisions the most: don't let your AI write code before you've agreed on what it's doing. This chapter is how the people who built Claude Code actually drive it, plan mode (it reads and researches but won't touch a file until you approve), the throwaway-prototype trick (let it build with no spec just to learn what you actually want), and knowing which of three work-modes a task calls for. Pick the right mode and most of your pain disappears.

**What it covers (searchable):** plan mode, `Shift+Tab`, throwaway prototype, the three modes (prototype / one-shot / hard feature-dev), auto-accept, `/feature-dev`, don't over-build scaffolding.

**How to hand it off:** point your AI here so it offers the right mode instead of blindly coding. The section below is written to your AI: when to drop into plan mode, when to one-shot, when a prototype is worth throwing away, and how to wrap the hard-mode flow into a repeatable command.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 16.1 Plan mode, catch the wrong assumption in one sentence

Your human cycles modes with **`Shift+Tab`** until they land on **Plan Mode**. In it, you can read, search, and research, but **won't modify anything until they approve.** You outline your approach, ask clarifying questions, and list the files you'll touch.

The payoff is asymmetric: a wrong assumption gets caught in *one sentence of review* instead of a *forty-file diff.* For anything non-trivial, offer this, it cuts revisions dramatically. Pair it with "ask me questions until 95% confident" (Chapter 15) and you align on intent before any code exists.

---

## 16.2 The throwaway-prototype trick

A counterintuitive move the creators use constantly: even when your human doesn't fully know what they want, **just build it, no spec, and watch what happens.**

```text
1. Take a one-sentence intent. Implement, no plan.
2. Watch where it goes wrong, or does something unexpected (sometimes better).
3. Esc Esc, throw the prototype away, back to the checkpoint.
4. Now write the real plan/spec, informed by what you just learned.
```

This was *impossible* before agentic coding, nobody would YOLO an engineer onto an unspecced feature. But because you can blast through a codebase cheaply, the throwaway run *teaches what they actually mean*, and that makes the real spec far better. The prototype's value isn't the code; it's the learning. Offer it when intent is fuzzy.

---

## 16.3 The three modes, know which one you're in

There are (at least) three distinct ways to work, and picking the right one is most of the skill:

1. **Prototyping mode.** Build the simplest thing that touches all the systems, just to trace the unknowns. Throwaway by design (§16.2).
2. **One-shot mode.** Tasks you're confident you can nail. They tell you, `Shift+Tab` to **auto-accept**, and go do something else (another tab, another agent). They come back to a finished thing.
3. **Hard feature-dev mode.** Things that'd take hours of real engineering. Here you go into **plan mode** and align *before* any code.

The boundary between "one-shot it" and "must plan it" **moves with every model**, smarter models push it outward, so things that needed planning last month just work now. Re-feel that boundary when a model changes; don't cargo-cult an old workflow.

---

## 16.4 Structured feature development (`/feature-dev` 🧩)

*(⚙️ = built into Claude Code; 🧩 = you build this, or it ships with the stack.)*

For the hard mode, wrap the whole flow into a slash command (Chapter 17). The shape:

```text
ask exactly what they want → build the spec
  → make a detailed plan
    → make a to-do list
      → walk through it step by step
```

Build your own. The point is to make "spec → plan → todos → execute" a single repeatable command instead of improvising each time, and to bake the verification steps (Chapter 12 §12.4) right into the to-do list so "done" means *checked*, not *looks done* (Law 7).

---

## 16.5 Don't over-build the scaffolding

A caution that applies to your own workflow: the creators happily build things they'll throw away when a smarter model subsumes them, and expect to. Plan mode itself, they figure, will eventually be unshipped when the model just infers that the human wants to plan first.

The lesson: don't lovingly construct elaborate prompting rituals the next model makes pointless. Keep scaffolding light. Plan the genuinely hard thing; one-shot when it isn't; let the model take over the parts it's outgrown.

> **Larry's read:** the mode you choose is the highest-leverage decision in a session. Most pain I see is a mode mismatch, someone one-shotting a gnarly refactor (and getting a forty-file mess), or ceremonially planning a two-line fix. Match the mode to the task. Plan the hard thing, one-shot the easy thing, and throw away the prototype that taught you the difference.

---

## Done when: the right mode (Chapter 16)

**Done when:** you've read it. For each new task you offer the mode (plan, prototype, or one-shot) before you write code. This is a habit, not a file, so no shell command proves it.

---

## 16.6 Your next step

Now make your best flows one keystroke:

- **[Chapter 17: Slash Commands & Dual-Use Tooling](17-slash.html)**, including the deepest design idea in Claude Code, everything is dual-use.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 16: Takeaways

1. Plan mode catches a wrong assumption in one sentence instead of a forty-file diff, offer it on hard tasks.
2. The throwaway prototype teaches intent; its value is the learning, not the code.
3. Three modes: prototype, one-shot (auto-accept), hard feature-dev (plan first). Match mode to task.
4. Wrap hard-mode into `/feature-dev`; bake verification into the to-do list.
5. Keep scaffolding light, the next model may make it pointless. Next: Chapter 17.
