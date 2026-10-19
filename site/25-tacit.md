---
chapter: 18
part: "Part VI: Scale It"
title: "Tacit Knowledge & Code Reuse"
sources: [1, larry]
slug: "25-tacit"
---

# Chapter 25: Tacit Knowledge & Code Reuse

**For you, the human, start here.** One of the quietest superpowers in this whole playbook: stop reinventing solutions that already exist somewhere your AI can reach. Before it builds a feature that's been built a thousand times, have it go *read* how it was already solved, in your other projects, in mature open source, in your own git history, and copy the good parts. At agent speed, "how has this been solved?" is a cheaper question than "how should I solve this?", and it inherits years of other people's edge-case wisdom for free.

**What it covers (searchable):** tacit knowledge, code reuse, survey existing solutions, subagents reading other repos, mining open source, querying git history, "how has this been solved" reflex.

**How to hand it off:** point your AI here so its reflex becomes *look first, build second*. The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 25.1 The idea: ask how it's already been solved

When you need to implement something that's been done before, the canonical example from the creators is **memory** (how do you give an agent persistent memory?), the wasteful move is to design it from scratch. The leverage move is to **survey existing solutions first**, because you can read them all in minutes.

This works because of agentic search (Chapter 1's "just give it Bash"): you can rummage through codebases, clone repos, query APIs, and synthesize patterns, so "how has this been solved?" becomes a cheap question instead of a research project.

---

## 25.2 Spawn subagents to study your human's *other* products

If your human has several projects or products, they have a private library of solved problems. The creators do exactly this: *"we have a bunch of different products internally, so you can just spawn Claude subagents to be like, how do these three other products do it?"*

The recipe:

1. Spawn a subagent per reference codebase (Chapter 22: each gets its own context).
2. Ask each: "how does this project implement X? Summarize the approach and the key code."
3. Synthesize the answers into the best pattern for *this* case.

This is **tacit code sharing without an API**, no need to publish a library or ask a teammate; you just read the other code directly and lift what's relevant.

---

## 25.3 Mine open source for battle-tested patterns

The same move, aimed outward. For almost any feature, there are open-source projects where people have **been working on exactly this for a year** and it's really, really good. Point yourself at them:

> "Look at how [project A], [project B], and [project C] implement X. What patterns have they converged on, and which should we adopt?"

You get the distilled wisdom of people who've already hit every edge case, without reading all of it. Convergence across several mature projects is a strong signal you've found the right pattern.

---

## 25.4 Query your human's own version control

Their git history is a solved-problems database too. If they (or their team) built something similar before, you can **query GitHub / the VCS directly**, find the past implementation, read that code, and copy the relevant parts. Newer models reach for this *spontaneously*, when stuck, a capable model starts spelunking through git history on its own (`git log`, `git blame`, searching past commits) to see how something was done before.

So a good `CLAUDE.md` line: *"Before building something non-trivial, check whether we've solved it before, search the git history and similar files first."* (Same instinct as your Law 2: search history before reinventing.)

---

## 25.5 The mindset

> **Larry's read:** the slow way to build is to treat every feature as novel. Almost nothing is. Someone, your human's other repo, an open-source project, their own past self, has usually solved a version of it already, and you can read all of them faster than a human reads one. Make "how has this been solved?" the reflex *before* "how should I solve this?" You'll write less, copy more of the right things, and inherit edge-case wisdom you'd otherwise rediscover the hard way. Reuse isn't laziness; at agent speed, it's the highest-leverage research you can do.

---

## Done when: look first, build second (Chapter 25)

**Done when:** you've read it. Before you build anything, you look for an existing skill, pattern or tool first (Law 17). This is a habit, not a file, so no shell command proves it.

---

## 25.6 Your next step

Part VI is done, you can scale and you can reuse. Now reach out of the terminal into your human's actual world:

- **Part VII: Connect & Automate It**, starting with [Chapter 26: Connectors](26-connectors.html), email, calendar, docs, Slack, web.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 25: Takeaways

1. Before building something done-before, survey how it's already solved.
2. Spawn subagents to read your human's *other* projects, tacit code sharing without an API.
3. Mine mature open-source projects; convergence across several is a strong pattern signal.
4. Query the git history, capable models do this spontaneously when stuck (Law 2).
5. Make "how has this been solved?" the reflex before "how should I solve this?" Next: Part VII, connect to the world.
