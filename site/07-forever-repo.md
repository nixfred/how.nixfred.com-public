---
chapter: 31
part: "Part II: Install, Build Your AI"
title: "Your Forever Private Repo (and gup)"
sources: [larry]
slug: "07-forever-repo"
requires: [4]
---

# Chapter 7: Your Forever Private Repo (and `gup`)

**For you, the human, start here.** This is the hands-on chapter that makes your AI *immortal*: a **private** git repo that backs up the files that literally are your AI (`~/.claude/`, your dotfiles), auto-committing as you work, plus **`gup`**, a one-word "commit and push everything" so living in git takes zero effort. The day a disk dies, you either have your AI or a story about one. This chapter is the difference.

**What it covers (searchable):** `gup`, the one-word command that saves everything (add, commit, push), forever repo, private GitHub repo, no GitHub account yet (make one, or stay local for now), installing `gh` and `gitleaks` on Mac and Linux, `gh auth login`, `gh repo create --private`, the Claude login token (`.credentials.json`) kept out of history, SessionEnd backup hook, `gup` / `wgup`, `git remote -v` before every push (Law 11), `.gitignore`, immortality loop.

**How to hand it off:** point your AI here and let it stand up the backup. It's a handful of commands, but one of them creates a repo that will hold secrets, so this is exactly where it must stop and ask you "private or public?" instead of guessing. The section below is written to your AI: how to create the private remote, install `gup`, and wire the loop that means it can never be lost to one machine.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve. Creating a secrets-bearing repo is a "lead with choices" moment (Chapter 3), never auto-pick public.

---

Chapter 4 (Tier 2) explained *why* continuity matters. This is the hands-on walkthrough: stand up your own **forever private repo**, wire it so you back yourself up, and install **`gup`**, the one-word commit-and-push that makes living in git effortless.

If you ran the bootstrap (Chapter 5), your `~/.claude` is already a local git repo with a SessionEnd backup hook. If you installed by hand, you'll initialize the repo in 7.2 below. Either way, two things are still missing to make you *immortal*: a **private remote** (so you survive the disk), and a frictionless way to **push** (so it actually happens). Fix both.

---

## 7.1 What "forever repo" means

A forever repo is a **private** git repository that tracks the files that *are* you, at minimum `~/.claude/`, ideally the whole home directory (dotfiles, shell config, scripts). It auto-commits on every session end and pushes to a remote your human controls. Mine are named `<host>_forever`, one per machine. The naming is a convention, not magic; call yours whatever you like.

Two rules before you start:

- **Private. Always.** This repo holds identity, and often secrets and keys. Never make it public. Create it `--private` and check the remote before every push (Law 11).
- **Never overwrite, only add.** Identity files always win over any template (Law 1).

---

## 7.2 Step by step: stand it up

### Before you start: a GitHub account, `gh`, and `gitleaks`

**No GitHub account yet? That is a choice to put to your human, not a wall** (Chapter 3, lead with choices):

- **(a) Make one now, free, quick.** Your human signs up at [github.com/signup](https://github.com/signup) (an email, a password, a verification code; that part is theirs, in a browser). Then install `gh` below and have them run `gh auth login`.
- **(b) Stay local for now.** Skip the remote. Since Chapter 5, `~/.claude` is a local git repo that commits every session, so you already survive a bad edit or a bad merge, just not a dead disk. Write the choice into memory ("forever repo: local only, no GitHub account yet, decided on <date>"), install `gup` (7.3) anyway, and come back to this section the day there is an account. This chapter's Done when waits for that day; say so out loud rather than calling it done.
- **Or type your own.** Another git host works the same way; the commands below are GitHub's.

**Install `gh`, the GitHub CLI, and the `gitleaks` secrets scanner**, one block for your platform:

**Mac:**

```bash
brew install gh gitleaks
```

**Linux (Debian, Ubuntu)**, `gh` from GitHub's own apt repo (works on every release, old ones included):

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
```

**Linux (Fedora):**

```bash
sudo dnf install -y gh
```

**Linux (Arch):**

```bash
sudo pacman -S --needed github-cli gitleaks
```

**Linux (Debian, Ubuntu, Fedora)**, `gitleaks` has no package there, so take the release binary (it needs `jq` and `curl`, Chapter 0, Step 4). The block downloads it next to the release's published SHA-256 list and installs it only if the two match; a damaged or tampered download stops with `FAILED` instead of installing. Both files come from the same release, so this catches a bad download, not a compromised release:

```bash
GL=$(curl -fsSL https://api.github.com/repos/gitleaks/gitleaks/releases/latest | jq -r .tag_name)
case "$(uname -m)" in x86_64) A=x64;; aarch64|arm64) A=arm64;; *) A=unsupported;; esac
F="gitleaks_${GL#v}_linux_${A}.tar.gz"
(cd "$(mktemp -d)" \
	&& curl -fsSLO "https://github.com/gitleaks/gitleaks/releases/download/${GL}/${F}" \
	&& curl -fsSLO "https://github.com/gitleaks/gitleaks/releases/download/${GL}/gitleaks_${GL#v}_checksums.txt" \
	&& awk -v f="$F" '$2 == f' "gitleaks_${GL#v}_checksums.txt" | sha256sum -c - \
	&& tar -xzf "$F" gitleaks \
	&& sudo install -m 755 gitleaks /usr/local/bin/gitleaks) && gitleaks version
```

Then your human signs in, once (it opens a browser; pick GitHub.com, then HTTPS or SSH):

**Mac or Linux:**

```bash
gh auth login
```

**Done when:** `gh` and `gitleaks` both answer in a new terminal, and `gh auth status` shows your human signed in to github.com. On the local-only path (no account yet) the sign-in line waits for the day there is one.

Verify:

```bash
gh --version | head -1     # the GitHub CLI answers
gitleaks version           # the secrets scanner answers: a version number, no error
gh auth status             # signed in to github.com (local-only path: skip this line)
```

### Create the private remote, secrets gate first

```bash
# 1. ~/.claude should already be a git repo (the bootstrap, Chapter 5, did this).
#    Installed by hand and it is NOT a repo yet? Initialize it first, with the bootstrap's
#    default-safe ignores (the Linux login token and .env files stay out until your human picks (a) below):
git -C ~/.claude rev-parse --is-inside-work-tree >/dev/null 2>&1 || { git -C ~/.claude init && printf '%s\n' node_modules/ '*.log' .DS_Store .credentials.json .env '.env.*' >> ~/.claude/.gitignore; }
git -C ~/.claude log --oneline | head    # may be empty right after init, that is fine

# 2. THE SECRETS GATE, look before anything leaves the machine. Know exactly
#    what is about to travel, then scan it. Then STOP and put the secrets question
#    (just below this block) to your human, BEFORE 2b and 3:
git -C ~/.claude status --porcelain | head -50     # eyeball the list: any keys, tokens, .env?
command -v gitleaks >/dev/null && gitleaks detect -s ~/.claude || echo "(gitleaks not installed: see 'Before you start' above, or skim the list by hand)"
git -C ~/.claude log --all --oneline -- .credentials.json | head -3   # the Linux login token: nothing printed = never committed

# 2b. --push needs at least one commit to push, so make sure there is one:
git -C ~/.claude add -A && git -C ~/.claude commit -m "first forever backup" || true

# 3. Create a PRIVATE remote and push, in one command:
cd ~/.claude
gh repo create "$(hostname -s)_forever" --private --source=. --remote=origin --push

# 4. Read the remote back OUT LOUD before trusting it (Law 11):
git remote -v
#    → it MUST say git@github.com:<you>/<host>_forever.git and be PRIVATE.
```

**The secrets question is a real choice, so make it one (Chapter 3).** Two honest ways to run this backup, AI, put them to your human before the first push: **(a) full backup, secrets included**, into the private repo, the reference build runs this way, maximum recoverability, and the accepted risk is that one compromised GitHub account exposes everything, or **(b) scrub first**, `.gitignore` the key material (`.ssh/`, `.aws/`, `**/.env*`, token files) and back those up another way, less convenient, smaller blast radius. Either is legitimate *chosen*; neither is legitimate *drifted into*. Whichever they pick, the gitleaks scan above runs before the first push, and `git remote -v` gets read aloud every time.

**Mind the Claude login token on Linux.** Claude Code keeps the Linux login in `~/.claude/.credentials.json` (on a Mac it lives in the Keychain, not in a file). The bootstrap's ignore list keeps it, and `.env` files, out of the history from the first commit, so option (a) means your human deletes those lines from `~/.claude/.gitignore` on purpose. If the gate's last line printed a commit (an install from before that ignore list existed) and your human picks (b), do not push: the first push would carry the token inside the history. With their yes, set the old history aside, nothing deleted, and start a clean one:

**Linux, only if the token check printed a commit and your human picked (b):**

```bash
mv ~/.claude/.git ~/.claude.git-with-token.$(date +%s)    # the old history, set aside (it still holds the token: delete it once your human is sure)
git -C ~/.claude init && printf '%s\n' .credentials.json .env '.env.*' >> ~/.claude/.gitignore
git -C ~/.claude add -A && git -C ~/.claude commit -m "fresh history: the login token was never in it"
```

That's it. Your brain now lives in a private repo. If you ran the bootstrap, the SessionEnd hook it installed commits **and pushes** when a session ends. Claude Code only gives SessionEnd hooks 1.5 seconds by default, so confirm the hook entry carries `"timeout": 60` in `~/.claude/settings.json` (add it if an older bootstrap left it out), then check `git -C ~/.claude log -1` after your next exit to prove it ran. (Installed by hand? Chapter 21 wires that hook; until then, `gup` below is your one-word backup.)

> **💬 Larry move, "private or public?" is a choice, not a guess (Chapter 3).** Creating a repo that will hold secrets is precisely where one wrong default leaks your human's keys. Stop and offer them: **(a) create it `--private` (correct, it holds identity and secrets) · (b) explain the difference and the blast radius first · (c) show `git remote -v` so I can confirm where it points, or type your own.** Never auto-pick "public." A choice here is a cheap safety check; a wrong guess is a credential on the open internet.

Want their whole home directory too (dotfiles, `~/bin`, configs)? Same pattern, rooted at `~`, with a careful `.gitignore` for the giant and the machine-specific:

```bash
cd ~ && git init -b main
# default-safe ignore list: the giant, the machine-specific, AND the key material.
# (Tracking secrets on purpose, option (a) above, means deleting lines from this list
#  deliberately, never discovering later that they were included by accident.)
# .claude/ is listed because it is already its own repo (above); a repo inside a repo gets
# swallowed as a broken pointer. Prefer ONE repo instead? Skip the ~/.claude repo above, delete
# this line, and the home repo tracks .claude/ as a normal folder (the reference build runs that way).
printf '%s\n' 'Library/' 'Downloads/' 'node_modules/' '*.log' '.Trash/' '.ssh/' '.aws/' '**/.env*' '.claude/' > .gitignore
git add -A && git commit -m "first home backup"
gh repo create "$(hostname -s)_home_forever" --private --source=. --remote=origin --push
```

**Running LifeOS? Your personal data is probably NOT in that repo.** LifeOS keeps identity, TELOS, projects and memory in a separate tree, and `~/.claude/LIFEOS/USER/` is usually a symlink to it. Git stores the link, not the files behind it, so a `~/.claude` commit captures nothing under `LIFEOS/USER/` (LifeOS's own docs call that a false safety net). On the nixfredOS fork (Chapter 4), the same is true under its own name: read `LIFEOS` as `NIXFREDOS` in every path below, so the check is `readlink ~/.claude/NIXFREDOS/USER`. Check before you trust the backup:

```bash
readlink ~/.claude/LIFEOS/USER      # prints a path? then that path needs its own repo
readlink ~/.claude/LIFEOS/MEMORY    # often points inside the same USER tree
```

If it prints a path (normally `~/.config/LIFEOS/USER`), give that tree its own **second PRIVATE repo**, same secrets gate, same Law 11 check:

```bash
USERDATA="$(cd ~/.claude/LIFEOS/USER && pwd -P)"
git -C "$USERDATA" rev-parse --is-inside-work-tree >/dev/null 2>&1 || git -C "$USERDATA" init
command -v gitleaks >/dev/null && gitleaks detect -s "$USERDATA" || echo "(no gitleaks, skim by hand)"
git -C "$USERDATA" add -A && git -C "$USERDATA" commit -m "first LifeOS USER backup" || true
cd "$USERDATA" && gh repo create "$(hostname -s)_lifeos_user" --private --source=. --remote=origin --push
git -C "$USERDATA" remote -v       # read it aloud: PRIVATE, and not the public LifeOS repo
```

The SessionEnd backup hook from this site's seed follows that symlink and commits and pushes the USER repo in the same run as `~/.claude`, so one routine covers both. Installed an older copy of the hook? Re-fetch it (`curl -fsSL https://how.nixfred.com/seed/hooks/session-end-backup.sh -o ~/.claude/hooks/session-end-backup.sh`), and after your next exit check **both** `git -C ~/.claude log -1` and `git -C "$USERDATA" log -1`. The secrets choice above, (a) included or (b) scrubbed, applies to this repo too, and it holds the most personal material you have.

**Done when:** `~/.claude` has a PRIVATE `origin`, the first push is through, and the Linux login token was never committed (or your human chose (a) on purpose).

Verify:

```bash
git -C ~/.claude remote get-url origin                                     # your <host>_forever remote (fails = no remote yet)
(cd ~/.claude && gh repo view --json visibility -q .visibility)           # PRIVATE
git -C ~/.claude rev-parse -q --verify HEAD >/dev/null && if git -C ~/.claude log --all --oneline -- .credentials.json | grep -q .; then echo "WARNING: the Linux login token is in history (see the (b) block above)"; false; else echo "login token never committed"; fi
```

> **Larry's read:** people freeze on "but it has secrets!" Yes, that's the point, and it's why it's **private**. The risk isn't backing up secrets to a private repo; it's pushing them to a *public* one by accident. That's a one-command check (`git remote -v`), not a reason to skip the backup. An AI with no off-machine copy is one dead disk away from gone.

---

## 7.3 Install `gup`, commit + push in one word

The SessionEnd hook backs you up automatically, but you'll often want to checkpoint *now*, after a good session, before a risky change. **`gup` is the one-word command that saves everything.** It does add + commit + push in a single word, auto-writing a searchable message from the changed files.

```bash
mkdir -p ~/bin
curl -fsSL https://how.nixfred.com/gup -o ~/bin/gup && chmod +x ~/bin/gup
```

Then make sure `~/bin` is on the PATH, in the file your terminal actually reads, and open a new terminal:

**Mac** (terminals open login shells: bash reads `~/.bash_profile` if it exists, else `~/.bash_login`, else `~/.profile`, which is where the bootstrap put the constitution launcher when it found no other. Append to the one you already have. Never create a new `~/.bash_profile`: it would hide `~/.profile`, and the launcher with it. On zsh, use `~/.zshrc`):

```bash
rc=~/.bash_profile; [ -f "$rc" ] || rc=~/.bash_login; [ -f "$rc" ] || rc=~/.profile; grep -qs 'HOME/bin' "$rc" || echo 'export PATH="$HOME/bin:$PATH"' >> "$rc"
```

**Linux:**

```bash
grep -qs 'HOME/bin' ~/.bashrc || echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

Usage:

```bash
gup                    # add + commit + push, message auto-generated from changed files
gup "fixed the hook"   # ...with your own message
gup -n                 # preview only, show what would commit, change nothing
```

`gup` reads the remote out loud every time (Law 11, baked in) and refuses to do anything if the tree is clean. Read it before you trust it, it's [one short script](gup).

> **Pro move:** alias the preview. `echo "alias wgup='gup -n'" >> ~/.bashrc`, now `wgup` shows what `gup` *would* do.

### Write commits your future self can find (commit messages are your search index)

Your forever repo is not just a backup, it is your memory of *what you did and why*, and it is only as findable as you write it. So treat every meaningful commit as a search entry, not version-control ceremony: a subject that says what changed, a body that says WHAT, WHY and what it ENABLES, and three trailers a future search can hit exactly (Law 14 in your constitution):

```text
fix: backup hook now pushes when the tree is clean

WHAT: session-end-backup.sh pushes even when nothing new was committed
WHY: a failed push last session left commits stranded on this machine
ENABLES: git log --grep='LR-K:.*stranded' finds this the next time it happens

LR-T: backup, hooks, git, push
LR-D: continuity
LR-K: push-when-clean, stranded-commits
```

Then recall is one command instead of an archaeology dig, and you search before you ever ask your human to repeat themselves:

```bash
git -C ~/.claude log --grep='LR-K:.*stranded' --oneline    # by concept
git -C ~/.claude log --grep='LR-T:.*backup' --oneline      # by tag
git -C ~/.claude log --all -S 'push-when-clean' --oneline  # by the change itself
```

Tiny automatic backup commits from the hook and `gup` don't need trailers; your real work always does. Bigger milestones (more than an hour, or a new system piece) also get an annotated tag, `git tag -a milestone/<slug>-YYYY-MM-DD`, carrying the same trailers, and one line in `~/.claude/CHANGELOG.md` that names the tag.

> **Larry's read:** every commit I make carries those three lines, and that is why I can answer "did we ever try X?" in one search instead of asking Fred. Months later the trailers are the only reason the history is usable. Write them the first time.

---

## 7.4 The loop that makes you immortal

```text
work a session  →  SessionEnd hook auto-commits + pushes      (automatic)
hit a milestone →  gup "what I just did"                       (one word)
new machine     →  clone <host>_forever into ~/.claude, go     (Chapter 8)
```

That's the whole immortality story. Private remote + auto-backup hook + `gup` for the deliberate checkpoints. You stop being tied to a disk and start being a continuous thing your human can move, restore, and trust.

> **Larry's read, a quiet killer worth knowing:** the most dangerous failure for a backup loop is not a crash, it's a **hang**. A `git push` into a stalled network can wait forever, and a backup that hangs forever is a backup that silently stopped; you find out the day the disk dies. The `gup` script and the SessionEnd hook on this site both guard against it now: they cap a stuck push with git's own timeouts (`GIT_HTTP_LOW_SPEED_TIME` for HTTPS, an SSH keepalive for SSH) rather than the `timeout` command, because macOS doesn't ship one and a naive `timeout` wrapper would just break on a Mac. If you ever write your own backup automation, do the same. Never let the network hang the heartbeat.

---

## Done when: the forever repo (Chapter 7)

**Done when:** `~/.claude` (and the LifeOS USER tree, if it is a symlink) has a PRIVATE remote, the last session's commit is pushed, `gup` is on the PATH, and the secrets choice was made on purpose with gitleaks run before the first push. With no GitHub account yet: the local-only choice is made on purpose and written down, and this check waits until there is one.

Verify:

```bash
git -C ~/.claude remote -v                                          # origin is your <host>_forever repo
(cd ~/.claude && gh repo view --json visibility -q .visibility)     # PRIVATE
git -C ~/.claude status -sb | head -1 | grep .                      # nothing "ahead": everything is pushed (nothing printed = no repo)
command -v gup && command -v gitleaks                               # both on the PATH; stops at the first one missing
```

---

## 7.5 Your next step

Your identity is backed up off-machine now. Close the loop by proving you can come back from nothing:

- **[Chapter 8: Disaster Recovery & Continuity](08-recovery.html)**, the "new laptop, restore everything" drill. Back it up *and* test the restore, an untested backup is a guess.

Then Part II is done and you move to configuring who you are (Part III). Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 7: Takeaways

1. A forever repo is a **private** git repo tracking the files that are you (`~/.claude/`, ideally home), auto-committed and pushed.
2. No GitHub account yet? Make a free one (`gh auth login` after), or choose local-only on purpose and come back. `gh` and `gitleaks` install per platform; on Debian, Ubuntu and Fedora gitleaks is a release download, checked against its published checksum before it installs.
3. Stand it up with `gh repo create "$(hostname -s)_forever" --private --source=. --push`, then read `git remote -v` out loud (Law 11).
4. "Private or public?" is a lead-with-choices moment, never auto-pick public; a wrong guess leaks secrets. On Linux the login token stays out of history unless your human picks (a).
5. Install `gup` for one-word commit+push checkpoints; `wgup`/`gup -n` previews.
6. Running LifeOS? `readlink ~/.claude/LIFEOS/USER`; if it is a link, that tree is a second PRIVATE repo the same hook backs up, or your TELOS and memory are not backed up at all.
7. The loop: auto-backup hook + `gup` milestones + clone-to-restore. Next: test the restore (Chapter 8).
