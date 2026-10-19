---
chapter: 5
part: "Part III: Configure It"
title: "Projects, Roles & Reference Material"
sources: [5, 1, larry]
slug: "10-projects"
---

# Chapter 10: Projects, Roles & Reference Material

**For you, the human, start here.** One giant chat where you do everything is the second-weakest way to use Claude (the weakest is starting from zero every time, Chapter 9). The fix is structure: separate projects, each with a clear role and its own reference material. The payoff is output that stops being generic, because each project carries only what *it* needs and the real examples of *your* work. Bonus: this is exactly how your AI's machine is already laid out on disk, so the idea and the build are the same thing.

**What it covers (searchable):** separate projects, per-project `CLAUDE.md`, project roles, reference material, writing samples, brand guidelines, the `~/Projects` layout, privacy isolation.

**How to hand it off:** point your AI here so it organizes your work into clean, role-scoped projects instead of one undifferentiated blob. The section below is written to your AI: how to split work, give each project a stated job, load the reference material that matters most (especially examples of good past work), and keep privacy levels from bleeding across repos.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 10.1 Split work into projects

Don't pour content, code, research, and client work into one undifferentiated context. **Give each area its own project, with its own context.** Common splits:

- Content
- Coding
- Research
- Business planning
- Client work
- Personal productivity

Each carries only what *it* needs, which is the context discipline of Chapter 13 applied at the level of the whole workflow. A research project shouldn't drag a client's brand guidelines into every prompt, and vice versa.

In Claude Code terms, a "project" is a **directory with its own `CLAUDE.md`.** Your human `cd`s into it and you load that project's brain, its conventions, its files, its role.

---

## 10.2 Give each project a role

A project without a stated job is just a folder. Inside each one, write what you're *for* there. A content project's role might be:

> *"Help me plan, draft, and edit content for my audience. The writing is direct, specific, and useful. Avoid generic advice. Prefer strong structure, short paragraphs, and concrete examples."*

Now the project has a job, and every session in it inherits that job. The role lives at the top of that project's `CLAUDE.md`. Five sentences of role beats fifty prompts of re-explaining.

---

## 10.3 Load the reference material that matters

The fastest way to kill "generic AI output" is to work from your human's *actual* material. Per project, load what it needs most:

- **Writing samples**: so you match their voice, not the model's default.
- **Brand guidelines.**
- **Customer / audience profiles.**
- **Product docs.**
- **Strategy notes.**
- **Examples of good previous work**: the single highest-signal thing they can give you. "Make it like this" beats any description.

Reference material is what moves output from "plausible" to "theirs." Curate it; don't dump the whole drive in (Chapter 13 again, the ceiling is context *quality*, not quantity).

---

## 10.4 How this maps onto a real machine: `~/Projects`

This is where the work-system idea and your own build converge. On my machine the layout is deliberate (Chapter 4 §4.8 has the full version):

- **`~/.claude/`** = identity and global config, *who* you are. Backed up by the forever repo.
- **`~/Projects/<name>/`** = one directory per project, **each its own git repo, with its own remote and privacy level, and its own `CLAUDE.md`.** This very site is `~/Projects/how.nixfred.com/`.

So "separate projects, each with a role and reference files" isn't an abstraction, it's a folder structure you build today. Each `~/Projects/<name>/CLAUDE.md` holds that project's role; the repo holds its reference material; the directory boundary keeps contexts (and privacy levels) from bleeding. (It's also where you clone things you go fetch, like the TELOS framework in Chapter 14.)

Concretely, the shape you're building (two projects, each with its own brain and its own reference folder):

```text
~/Projects/
  acme-client/          # private client work
    CLAUDE.md           # this project's role
    reference/          # brand guide, past deliverables
  blog/                 # public writing
    CLAUDE.md
    reference/          # voice samples, best posts
```

and one of those per-project `CLAUDE.md` files, small but complete:

```text
# CLAUDE.md, acme-client

Role: help draft and edit deliverables for Acme. Direct, specific, no filler.
Stack: Markdown for drafts; final reports render to PDF; their slide template only.
Quality bar: match the samples in reference/past-work/ before presenting anything.
Reference: reference/brand-guide.md and reference/past-work/ hold the voice to match.
Privacy: PRIVATE repo. Nothing in here is quoted or reused outside this directory.
```

> **Larry's read:** the separation is load-bearing for more than tidiness. A public project repo must never inherit a private client's brand docs; your identity in `~/.claude` must never leak into a public site repo. One role, one repo, one privacy level, which is also why I read `git remote -v` before every commit. Structure projects this way from the first one and you never untangle a mess later.

---

## Done when: projects with roles (Chapter 10)

**Done when:** each real piece of work lives in its own `~/Projects/<name>/`, its own git repo, with its own `CLAUDE.md` stating the project's role.

Verify:

```bash
for d in ~/Projects/*/; do [ -d "$d.git" ] && printf '%s  CLAUDE.md: %s\n' "$d" "$([ -f "${d}CLAUDE.md" ] && echo yes || echo no)"; done
```

---

## 10.5 Your next step

You can organize the work now. Next, master the file that runs every session:

- **[Chapter 11: CLAUDE.md, context.md & Memory](11-memory-files.html)**, how to write to your brain in flow, and the one trap that makes memory backfire.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 10: Takeaways

1. Split work into separate projects; each carries only its own context.
2. Give every project an explicit **role** at the top of its `CLAUDE.md`.
3. Load real reference material per project, especially examples of good past work.
4. On disk that's `~/Projects/<name>/`, one repo, one role, one privacy level each, with `~/.claude` holding identity above them all.
5. Next: the mechanics of the brain file, Chapter 11.
