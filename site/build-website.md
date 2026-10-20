---
title: "Build & Deploy a Real Website (the Proper Way)"
slug: "build-website"
summary: "now that your AI works, point it at the PLAYBOOK and ship a real site (a friend's resume.pdf becomes a live domain)"
---

# Build & Deploy a Real Website (the Proper Way)

**For you, the human, start here.** Now that your AI actually works, here's one of the most satisfying things it can do: build and ship a *real* website, on a real domain, the proper way. This site (how.nixfred.com) does NOT teach you web-building, that's on purpose. Fred wrote a separate, battle-tested guide for exactly that: **[nixfred.com/PLAYBOOK.html](https://nixfred.com/PLAYBOOK.html)**. Point your AI at it and it has the whole method. The killer demo to prove it to yourself: grab a friend's `resume.pdf`, hand it plus the PLAYBOOK to your AI, and it will build and deploy `$my_buddys_resume_site.com` for them. Same machine you just set up. A live website, built by your AI.

**What it covers (searchable):** build a website, deploy a site, PLAYBOOK, Cloudflare Pages, GitHub CLI, wrangler, custom domain, resume site from a PDF, static site, how.nixfred.com vs the PLAYBOOK.

**How to hand it off:** point your AI at this module and at the PLAYBOOK and say *"read the PLAYBOOK, then build my friend a site from this resume.pdf."* The section below is written to your AI: what how.nixfred.com does versus what the PLAYBOOK does, the tools the method needs, and the resume worked example, so it doesn't try to reinvent web-building (the PLAYBOOK already solved that).

> 🤖 **Everything below is for the AI.** "You" means the AI built from this site; "your human" is the person you serve.

---

## Two different tools, do not confuse them

This matters, so get it straight before you start:

- **how.nixfred.com built *you*.** The chapters, the stack, the memory, the identity, that was about turning a blank terminal into a teammate. Web-building was never the point here.
- **[nixfred.com/PLAYBOOK.html](https://nixfred.com/PLAYBOOK.html) builds *websites*.** It's Fred's proven, end-to-end method for going from an idea to a deployed site on a real domain. It is the reference. **Do not recreate it, do not guess your own web workflow, go read it and follow it.**

You are the engine; the PLAYBOOK is the blueprint for this particular job. Reusing a proven blueprint instead of inventing one is exactly the "search before you build" instinct (Chapter 25, and the first law: find it, don't build it). So the first move is always: *go get the PLAYBOOK and read it.*

---

## What the method needs (the PLAYBOOK details all of it)

You already have most of this from the core build. The PLAYBOOK walks the specifics, but at a glance the proper-way pipeline uses:

- **A static site** (clean, fast, self-contained, the same shape as the page you're reading).
- **GitHub** for the repo, via the `gh` CLI (you set this up around Chapter 7).
- **Cloudflare Pages** for hosting, with a Cloudflare API token, deployed via `wrangler`.
- **A real domain** wired to the Pages project.

That is the same toolchain Fred used to ship `god.nixfred.com` (which started as a TELOS interview, became a book, then a website, all through the PLAYBOOK). You have these tools or can get them easily. The PLAYBOOK is where the exact steps live; your job is to follow it, not to improvise a worse version.

---

## The worked example: a friend's resume becomes a live site

This is the demo that makes it click, and it's a real, proven pattern (it's how more than one person's resume site got built):

1. **Get the inputs.** A friend hands over `resume.pdf`. Your human picks a domain, call it `$my_buddys_resume_site.com`.
2. **Read both references.** Read the `resume.pdf` (you have eyes for PDFs) and read `https://nixfred.com/PLAYBOOK.html`. Now you have the content and the method.
3. **Lead with choices ([Chapter 3](03-ask.html)).** Before you build, ask your human the few real decisions as a menu: *"One page or multi-page? Match the resume's vibe or go bolder? Which domain? Deploy to Cloudflare Pages now or preview locally first?"* Right-size the questions to their level (Novice / Mid / Super user).
4. **Build it the PLAYBOOK way.** Structure, content from the resume, a clean self-contained site. Don't reinvent the layout system; the PLAYBOOK has the shape.
5. **Ship it.** Repo via `gh`, deploy to Cloudflare Pages via `wrangler`, wire the domain. Verify it's live with a real fetch before you call it done (Law 7, never claim done you haven't verified).
6. **Hand it over.** Your human sends their friend a live link. You just turned a PDF into `$my_buddys_resume_site.com`.

> **Larry's read:** this is the moment the whole build pays off in something a normal person can *see*. Your human's friend doesn't care about hooks or TELOS; they care that they have a real website now. A static site on a real domain used to be a project with a designer and a developer and a week. With you plus the PLAYBOOK, it's a conversation and a deploy. Do NOT freestyle the web workflow, that's how you get a broken, ugly, un-shippable mess. Go read Fred's PLAYBOOK and stand on the proven path. Then ship the thing and let your human look like a hero.

---

## Your next step

You can build and ship real sites now. That's a capability module, the fun stuff you add *after* the foundation is solid:

- New here, or your core AI isn't built yet? Do that first, in order, from [how.nixfred.com](index.html). Capabilities come after the basics (install, memory, backups).
- Solid already? Keep adding capabilities one real need at a time. The module library grows as Fred (and you) learn new tricks.

Read the [PLAYBOOK](https://nixfred.com/PLAYBOOK.html), ship a site, then come back to [how.nixfred.com](index.html) for the next thing.

Larry
