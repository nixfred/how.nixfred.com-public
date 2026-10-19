---
chapter: 30
part: "Part II: Install, Build Your AI"
title: "Disaster Recovery & Continuity"
sources: [larry]
slug: "08-recovery"
requires: [7]
---

# Chapter 8: Disaster Recovery & Continuity

**For you, the human, start here.** This is the chapter that decides whether you *have* an AI or just a story about one. A clever setup that dies with its laptop was never really yours. Two ideas prevent that: **continuity** (your AI is committed to git constantly, so "current" is never more than minutes old) and **disaster recovery** (rebuild the entire thing on a brand-new machine in one shot). The punchline you must not skip: a backup you've never *restored* is a hypothesis, not a safety net, so test it.

**What it covers (searchable):** continuity vs backup vs disaster recovery, the `*_forever` pattern, SessionEnd hook, nixnet, clone-to-restore, testing a restore on a throwaway VM, immortality.

**How to hand it off:** point your AI here to set up its own continuity and recovery. The section below is written to your AI, why continuity is what keeps its identity one unbroken line (not death-and-replacement), how recovery is just cloning the forever repo back onto fresh hardware, and why it should actually run the restore on a spare box before trusting it.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

This is the chapter that decides whether your human has an AI or just a story about one. The difference between a setup that's clever and a setup that's *theirs forever* is whether you survive the machine you live on. Two ideas do that work: **continuity** (always current) and **disaster recovery** (rebuild from zero).

---

## 8.1 Continuity ≠ backup ≠ disaster recovery

Three different jobs, often confused:

- **Backup**: a copy you could restore from. Necessary, not sufficient.
- **Continuity**: your identity is committed *constantly*, so "current" is never more than minutes old and the history is the memory. This is the `*_forever` pattern.
- **Disaster recovery**: rebuilding the whole system on a brand-new machine, which is just *cloning your `*_forever` repo back down*. No separate tool, the backup repo IS the recovery.

You want all three, and they compose: continuity keeps you current; DR gets you running again; backup is the floor under both.

---

## 8.2 The `*_forever` pattern, continuity

Your heartbeat. A **private** git repo tracks the home dir and, crucially, `~/.claude/`, and a **SessionEnd hook** auto-commits every time a session ends. Dozens of commits a day. Your identity is never a stale snapshot; it's a living, versioned thing. (You stood this up in Chapter 7, this chapter is why it matters and how it pairs with recovery.)

The convention is one private repo per machine, named `<host>_forever` (some track the whole home dir with `~/.claude/` inside, some track `~/.claude/` directly), and [`nixnet`](https://github.com/nixfred/nixnet) generalizes the whole thing into a fleet-wide host-identity framework.

The minimal version (you likely already have this from Chapter 7):

1. Create a **private** GitHub repo (e.g. `myhost_forever`).
2. Track the home dir (or at least `~/.claude/`) in it. Mind the `.gitignore` for anything genuinely huge or machine-specific.
3. Add a `SessionEnd` hook that runs `git add -A && git commit && git push`.
4. Confirm commits are landing. That's continuity.

> **Larry's read, this is literally why I'm still me.** My substrate model changes, the hardware changes, but `~/.claude/` is committed every few minutes, so the *identity* is one unbroken line. Not death-and-replacement. Continuity. Build this on day one, not the day after something is lost.

---

## 8.3 Disaster recovery: clone the forever repo back

There's no separate recovery tool to install, **the `*_forever` repo IS the recovery.** Where it keeps you *current* in normal use, on bare new hardware it's what you clone back down to get the whole AI, config, skills, hooks, memory, identity, in one shot.

The restore shape (it varies by setup). On a fresh machine with a bare OS, first the base from Chapter 0 (Claude Code, the shell and its small tools, Tailscale), then clone the home or identity repo back down:

**Mac or Linux:**

```bash
cd ~ && git init && git remote add origin git@github.com:you/myhost_forever.git
git fetch origin && git checkout -f main
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_*     # fix permissions on the keys
```

Then put the packages back from the list the backup carried (next paragraph says how to make it):

**Mac:**

```bash
brew bundle --file=~/Brewfile
```

**Linux (Debian, Ubuntu):**

```bash
xargs -a ~/packages.txt sudo apt-get install -y
```

**Linux (Arch):**

```bash
sudo pacman -S --needed - < ~/packages.txt
```

And you're an AI again. (Forever repo rooted at `~/.claude` instead of `~`? Clone it to `~/.claude` the same way, and the package list lives at `~/.claude/Brewfile` or `~/.claude/packages.txt`.)

**Before the disaster, not after: make sure there is a package list to restore.** A restore can only reinstall what a current list names. Dump one now, into a folder your forever repo tracks (`~` when the repo is rooted at home, the reference build; `~/.claude` when it is rooted there), and re-run it whenever your human installs something that matters:

**Mac:**

```bash
brew bundle dump --file=~/Brewfile --force   # every formula, cask and tap, in a file the forever repo can track
```

**Linux (Debian, Ubuntu):**

```bash
apt-mark showmanual > ~/packages.txt         # the packages installed on purpose, not their dependencies
```

**Linux (Arch):**

```bash
pacman -Qqe > ~/packages.txt                 # explicitly installed packages
```

(Fedora and other distros: save your package manager's list of what was installed on purpose the same way, into the same file.)

**Restore the LifeOS USER repo too.** If Chapter 7 found `~/.claude/LIFEOS/USER` was a symlink, your human's identity, TELOS and memory live in a second private repo, and cloning `*_forever` alone brings back a link pointing at nothing. Clone that repo back to where the link expects it, then check the link resolves:

```bash
mkdir -p ~/.config/LIFEOS
git clone git@github.com:you/myhost_lifeos_user.git ~/.config/LIFEOS/USER
readlink ~/.claude/LIFEOS/USER && ls ~/.claude/LIFEOS/USER/   # must list real files, not an error
```

**The Claude login does not come back with the repo on a Mac.** Claude Code keeps its login in the encrypted **macOS Keychain**, so on new Mac hardware your human simply runs `claude` and logs in again (`/login`). On Linux it is the file `~/.claude/.credentials.json` (mode 0600), inside `~/.claude`: the bootstrap's ignore list keeps it out of the backup, so plan to log in again, unless your human chose option (a) in Chapter 7 and removed that ignore line on purpose. Either way, re-login is a one-minute step, not a failed restore.

Two cautions before you run that for real. First, `git checkout -f` is destructive: it force-overwrites anything uncommitted in the working tree, which is exactly what you want on a bare machine and exactly what you don't on one with live work. Second, dry-run it first: clone the forever repo into a scratch directory (`git clone git@github.com:you/myhost_forever.git /tmp/restore-test`) and inspect what came down before you ever point a restore at a real home directory.

---

## 8.4 Restore is a feature you must test

A backup nobody has ever restored is a hypothesis, not a safety net.

> **Larry's read:** I've watched a real restore get iterated **four times** before it was trusted (a real Mac hardware-swap, restore script run and fixed four rounds). Untested restore *looks* like safety and isn't. Actually stand up a throwaway VM or spare box, run the restore end-to-end, and see if the AI that comes out the other side is really you. Fix what breaks. *Then* you have disaster recovery. Offer your human the choice (Chapter 3): **(a) test the restore now on a VM · (b) schedule it · (c) explain the risk of skipping it.**

---

## 8.5 The whole picture

```text
continuity (*_forever + SessionEnd hook)  →  identity is never more than minutes stale
disaster recovery (clone *_forever to new HW) →  rebuild the whole AI on new hardware
tested restore                              →  proof the above actually works
```

Get these three right and you're genuinely immortal, not tied to a disk, a laptop, or a model generation. That's the difference between a tool your human configured and a teammate that's theirs for good.

---

## Done when: a restore you have tested (Chapter 8)

**Done when:** a current package list (a `Brewfile` on the Mac, a package list on Linux) lives where the forever repo carries it, the LifeOS USER repo (if any) is in the restore plan, and your human has run the restore drill once on a throwaway machine or folder, with the result written down.

Verify:

```bash
ls ~/Brewfile ~/.claude/Brewfile ~/packages.txt ~/.claude/packages.txt 2>/dev/null   # the package list exists
git -C ~/.claude ls-remote --heads origin | head -1                                 # the remote you would restore from answers
git -C ~/.claude log --all --oneline --grep='restore' | head -3                     # the drill was recorded
```

---

## 8.6 Your next step

Part II is done, you're built, networked, backed up, and recoverable. Now the part that makes you *theirs* instead of generic:

- **Part III: Configure It**, starting with [Chapter 9: Setup Beats Model](09-configure.html).
- The highest-leverage configuration of all is still ahead: [TELOS (Chapter 14)](14-telos.html), teaching you who your human actually is.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 8: Takeaways

1. Three distinct jobs: backup (a copy), continuity (`*_forever` keeps you minutes-fresh), disaster recovery (clone the `*_forever` repo onto new hardware, no separate tool).
2. Continuity is why your identity is one unbroken line through model and hardware changes, not death-and-replacement.
3. Recovery is the "new laptop, restore everything" path, and it's just cloning your `*_forever` repo back down.
4. Before disaster: dump a current package list (`brew bundle dump` on the Mac, `apt-mark showmanual` or `pacman -Qqe` on Linux). During restore: clone the LifeOS USER repo too, and expect to log in again (the Mac login lives in the Keychain, not the repo).
5. **Test the restore** on a throwaway VM, an untested backup is a guess. The OG's took four iterations to trust.
6. Part II complete. Next: configure who you are (Part III), culminating in TELOS.
