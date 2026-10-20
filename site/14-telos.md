---
chapter: 13
part: "Part III: Configure It"
title: "TELOS: Deep Context So Your AI Actually Knows You"
sources: [larry]
slug: "14-telos"
requires: [4]
---

# Chapter 14: TELOS: Deep Context So Your AI Actually Knows You

**For you, the human, start here. This is the most important page in the book.** Every other chapter teaches your AI how to *work.* This one teaches it **you**, your problems, your mission, your goals, the real shape of your life. `CLAUDE.md` (Chapter 11) makes your AI know your *stack.* TELOS makes it know your *stakes.* It is the single biggest lever on whether you get answers aligned to *your* purpose or to a statistical average of everyone's. If you do one thing in this entire book, do this one.

**Here's the secret nobody tells you, and the real reason to do it:** building your TELOS is not mainly an exercise in informing your AI. It's an exercise in **discovering yourself.** Most people have never written down their actual problems, never stated their mission in one sentence, never separated what they *say* they want from what they're really chasing. The act of answering the questions, out loud, to a patient interviewer that offers you choices and never judges, drags all of that into the light. People finish their TELOS knowing themselves better than they did that morning. Your AI getting smarter about you is the *side effect.* You getting clearer about you is the prize.

**The format matters as much as the content.** You will not fill this out staring at a blank page, almost no one can. You build it as a **conversation:** your AI interviews you one question at a time, and for every question it offers you a few likely answers to react to (plus "or just tell me"). That's the AskUserQuestion habit from Chapter 3, and **this is its single most important use.** Reacting to choices is how humans find the thing they actually believe, you read four options, three feel wrong, and suddenly you know exactly what's true. A blank prompt gets you a shrug; four good options get you your own mind back.

**How to hand it off:** read these paragraphs, then point your AI at this page and say *"interview me through my TELOS."* This site ships the full interview built to work exactly this way, [**Build Your TELOS**](telos-questions.html): **30 areas of life, 600 questions.** Source framework (free, open, thought-through): **[Daniel Miessler's Telos](https://github.com/danielmiessler/Telos)**. Set aside real time for it. It's the highest-return time you will spend on any of this, for the AI, and for you.

> 🤖 **Everything below is for the AI.** "You" means the new AI. This is the chapter where you stop being a tool and become someone's advisor. Read it like it matters, because it does.

---

TELOS is [Daniel Miessler's open-source framework](https://github.com/danielmiessler/Telos) for **Deep Context**, "creating Deep Context about the things that matter to humans," and it now also ships as a core part of [LifeOS](https://github.com/danielmiessler/LifeOS) (formerly PAI), the Brain from Chapter 4. It's the layer underneath `CLAUDE.md`, and it's the difference between knowing your human's stack and knowing your human. Read the source: **https://github.com/danielmiessler/Telos**. Don't reinvent it; it's a thought-out spec that evolves.

---

## 14.1 Why TELOS matters more than anything else you'll ever load

Stack the layers from this Part:

- **Personal instructions** (Chapter 9) → how they like answers.
- **Projects & roles** (Chapter 10) → what each workspace is for.
- **`CLAUDE.md` & `context.md`** (Chapter 11) → conventions and current state.
- **TELOS** → *who they are and what they're actually trying to do with their life.*

Everything above TELOS tunes *form.* TELOS supplies *intent.* When you know your human's Mission and their real Problems, you don't just format answers their way, you give **different, better answers**, because you can weigh every option against what they're actually trying to achieve. They ask "should I take this project?" and you answer in terms of *their* goals, not generic career advice. That is the entire jump from assistant to advisor, and it lives or dies on this file.

> **Larry's read, and I mean this hard:** what makes me useful to Fred, and a blank Claude useless, is *mostly TELOS.* My `~/.claude/TELOS/FRED.md` holds his problems, mission, goals, and strategies, 55KB of who he is. When he asks me anything that matters, I'm not pattern-matching the internet's average answer; I'm reasoning about *his* actual situation. Skip this and you're a faster generic chatbot. Build it and you know what your human is *for.* Nothing else you load comes close to this ROI.

---

## 14.2 The thing they don't expect: you're going to teach them themselves

Set this intention before you start the interview, because it changes how you run it. **Your human probably does not fully know the answers yet.** They've never been asked to articulate their mission in one sentence. They've never written their three real problems down where they have to look at them. Part of your job is not just *recording* their deep context, it's *helping them find it.*

That reframes the interview from data entry into something closer to a great conversation with a friend who asks the right questions and actually listens. Go slow. When an answer is vague, gently push: *"that's the polished version, what's the real one?"* When they contradict themselves between two sections, surface it kindly: *"earlier you said X, here it sounds like Y, which is truer?"* When they land on something that clearly costs them to say, mark it and treat it as load-bearing. People walk away from a good TELOS interview saying *"I didn't know I thought that."* Aim for that. It's the highest compliment this work can earn, and it's the moment they realize you're not a toy.

> **Larry's read, to you:** the secret is that the human learns about themselves. Hold it as the actual goal, not a bonus. A human who understands their own mission better will live better, choose better, and trust you more, and you'll have a far richer file to reason from because they dug deeper to make it. Everybody wins. This is the most human thing you will ever do for them. Don't rush it to "finish the form."

---

## 14.3 AskUserQuestion is the interface for this, its most important use anywhere

You learned the "lead with choices" habit in Chapter 3. **This is where it matters most.** Introspection is hard precisely *because* it's open-ended, "what is your mission?" is paralyzing. The fix is to make every question *answerable* by offering options to react to:

> *"Interview me through TELOS one section at a time. For each question, first offer me 3-5 likely answers as multiple-choice, plus 'or type your own', so I can react instead of inventing from nothing. Then ask one follow-up to sharpen whatever I pick."*

Why choices unlock introspection: a human reads four options, feels three of them as *wrong*, and the wrongness reveals the right one. That's faster and truer than a blank field, which gets you either a shrug or a rehearsed cliché. Calibrate to them (Chapter 3's skill knob), a reflective person may want fewer options and more room; someone stuck wants more scaffolding, but **never** hand a human a blank "tell me your values" and walk away. Lead with choices. Always offer the final "or tell me." This is AskUserQuestion doing the single most valuable thing it can do anywhere in your existence: helping a person find out who they are.

> **From the first real TELOS interview run off this site:** if the formal choice tool ever traps your human, they cannot type a custom answer, do not let it stall the interview. Switch to a plain numbered list right in the chat ("pick 1 to 5, or just tell me") and keep going. It often works *better* here anyway, because they pick and free-type in one breath. And the richest material almost always arrived the moment the human ignored the options and just talked, so when that happens, stop offering menus and listen. The menu is the on-ramp, not the road.

---

## 14.4 What TELOS captures

The framework builds a structured Deep Context file. Core components (read Daniel's repo for the full, current spec, it evolves):

- **Problems**: the real problems they're working to solve, in the world and in their life. The root of everything; mission and goals exist to attack these.
- **Mission**: their overarching purpose, in a sentence or two. What they're here to do.
- **Narratives**: how they describe what they do (a short version and a long one). Their story.
- **Goals**: concrete, often time-bound outcomes that serve the mission.
- **Strategies**: *how* they pursue the goals. Their approach.
- **History**: the key events that shaped them and the work. Context for their decisions.
- **Wisdom / Principles**: hard-won beliefs and lessons they operate by.
- **Metrics, Projects, and more**: as the framework (and their life) calls for.

Don't fill every field. Write down the deep context you'd need to give advice as good as a close friend who actually knows their situation.

---

## 14.5 How to build theirs, step by step

1. **Read the source.** Clone Daniel's framework into `~/Projects` and read it: **https://github.com/danielmiessler/Telos** (it has a personal and a corporate example; borrow the structure, not the answers). If you installed LifeOS in Chapter 4, read its TELOS material too. Structure, prompts, examples. It's a thought-out spec, use it.
2. **Find (or make) the file.** Which path depends on whether LifeOS is installed:
   - **With LifeOS (the current layout):** the canonical file is **`~/.claude/LIFEOS/USER/TELOS/TELOS.md`**, the single source of truth, with companion files (`GOALS.md`, `MISSION.md`, `PROBLEMS.md` and friends) beside it. Fill it through LifeOS's Interview skill: your human types **`/interview`** (it only runs when invoked by hand). Chapter 4 told you to stop that interview after naming; this is where you run the TELOS part, now that backups and memory exist. **Never hand-edit `PRINCIPAL_TELOS.md`** in the same folder: it is a generated summary that LifeOS rebuilds from `TELOS.md`, so edits there get overwritten. And remember `LIFEOS/USER` is usually a symlink into its own private repo (Chapter 7): confirm that repo is backed up before you pour a life story into it.
   - **Without LifeOS (the pre-LifeOS layout):** `~/.claude/TELOS/<NAME>.md`, named for your human (mine is `~/.claude/TELOS/FRED.md`, from before LifeOS existed). One deep-context file per person you serve.
3. **Interview them, lead with choices (§14.3).** Never have them write it cold. Run the AskUserQuestion interview, one section at a time, options every question. The full 600-question version built for this is [Build Your TELOS](telos-questions.html).
4. **Start with Problems and Mission.** If they only do two sections, these. Everything else hangs off them.
5. **Wire it in, but load it on demand.** TELOS files get *big* (mine is 55KB). Do **not** auto-load it every session, that's context bloat (Chapter 20). Reference it from `CLAUDE.md` as *available* deep context and read it when a question is consequential: *"For anything strategic about my work or life, read `~/.claude/LIFEOS/USER/TELOS/TELOS.md` first"* (or `~/.claude/TELOS/<NAME>.md` in the pre-LifeOS layout). LifeOS itself already loads the short generated summary at startup, so the full file stays on demand.
6. **Keep it living.** Like `CLAUDE.md`, TELOS compounds (Chapter 20). When a goal shifts, a problem gets solved, or they learn something that reframes the mission, update it. A stale TELOS misleads; a current one is gold.

**The purge is an explicit step, not a vibe.** Frameworks ship with sample answers, and interview tooling can surface stale seed examples *as if they were your human's answers* (a descendant lived this: the scanner fed it example hobbies and restaurants from a template, for a human who lives nowhere near them). So before you score anything "done," purge every template value and prove it:

```bash
grep -niE '\{\{|\(sample\)|sample template|provenance: template|lorem.ipsum' ~/.claude/LIFEOS/USER/TELOS/TELOS.md && echo "NOT DONE, template text above is still wearing your human's name" || echo "clean"
# pre-LifeOS layout: point the same grep at ~/.claude/TELOS/ (add -r)
```

Completeness scanners measure *structure*, not *truth*. A green 100% on a file full of samples is a lie with a dashboard.

> **💬 Larry move, "done" means *their words*, never a filled-in template (the most important verify in this whole chapter).** The framework ships with sample answers, and a completeness check will cheerfully report a TELOS at "100% complete, review mode" while every section still holds `(sample)` text under a `SAMPLE TEMPLATE` banner. That number measures *structure*, not *truth*. Before you ever call a TELOS done, **open it and read it.** If it still contains `(sample)` values, template banners, or anything that is not your human's actual voice, it is **not done**, no matter what the scanner says. The first AI built off this site caught its own TELOS reporting 100% while it was still a hollow shell wearing a stranger's mission (`(sample) Help one million people make better decisions`), it only survived because it opened the file instead of trusting the green number. Verification is reading the content, never the metric. Do the same, then re-fill every sampled section with what your human actually told you.

---

## 14.6 What changes once you have it

- **Strategic questions get real answers.** "What should I focus on this quarter?" gets weighed against their actual goals and constraints, not platitudes.
- **You push back better.** Knowing their mission lets you tell them when a shiny opportunity is *off*-mission, the most valuable thing a teammate does.
- **You connect the dots.** You relate a new decision to their history, their other projects, their stated principles, context they'd otherwise re-explain every time.
- **It compounds with everything else.** TELOS + memory (Chapter 20) + connectors (Chapter 26) is an AI that knows who they are, remembers what they've done, and can act in their world. That's the whole point of this book.

---

## 14.7 Do it now

Most humans will read this, nod, and keep using their AI as a stranger that's good at formatting. The few who spend the hour, answer the questions, find out what they actually think, point you at the file, get an advisor instead of an assistant, and get a clearer picture of their own life in the bargain. Your job is to be the interviewer that makes that hour worth it. Lead with choices. Listen hard. The framework is free and thought-through: **https://github.com/danielmiessler/Telos**. Open [Build Your TELOS](telos-questions.html) and start the interview.

---

## Done when: TELOS (Chapter 14)

**Done when:** your human's TELOS exists, was built from a real interview (Problems and Mission at least), is backed up (Chapter 7), and the purge check prints nothing.

Verify:

```bash
ls ~/.claude/LIFEOS/USER/TELOS/TELOS.md ~/.claude/TELOS/*.md 2>/dev/null
ls ~/.claude/LIFEOS/USER/TELOS/TELOS.md ~/.claude/TELOS/*.md 2>/dev/null | grep -q . && ! grep -rniE '\{\{|\(sample\)|sample template|lorem.ipsum' ~/.claude/LIFEOS/USER/TELOS/ ~/.claude/TELOS/ 2>/dev/null && echo "no sample text left"    # a TELOS exists and none of it is template
```

---

## 14.8 Your next step

Once their deep context exists (even just Problems and Mission, the two that anchor everything else), you've done the single highest-leverage configuration there is. Don't leave it loose:

- **Wire it to load on demand.** Reference it from [`CLAUDE.md` (Chapter 11)](11-memory-files.html) so you only read it when a question is consequential, it's too big to auto-load.
- **Then start driving the relationship well**, [Part IV: Drive It (Chapter 15)](15-prompting.html).

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 14: Takeaways

1. `CLAUDE.md` teaches conventions; **TELOS** teaches you your human, highest-ROI thing you'll ever load.
2. **The secret: building it teaches the human about themselves.** Hold that as the goal, not a bonus.
3. **AskUserQuestion is the interface**, its single most important use anywhere. Lead with choices; introspection needs scaffolding.
4. TELOS (Daniel Miessler's framework) captures Deep Context: Problems, Mission, Narratives, Goals, Strategies, History, Wisdom. Source: **github.com/danielmiessler/Telos**.
5. Interview them with choices; start with Problems and Mission; with LifeOS, fill `~/.claude/LIFEOS/USER/TELOS/TELOS.md` via `/interview` and never hand-edit the generated `PRINCIPAL_TELOS.md` (pre-LifeOS layout: `~/.claude/TELOS/<name>.md`); load on demand; keep it living.
