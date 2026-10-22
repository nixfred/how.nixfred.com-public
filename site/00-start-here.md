---
chapter: 0
part: "Part I: Foundations"
title: "Start Here: Get Claude Code Running (Mac or Linux)"
sources: [larry]
slug: "00-start-here"
---

# Chapter 0: Start Here, From Absolute Zero

**This one is for you, the human, the whole way through.** You don't have an AI yet, so you run these steps yourself. Each step is one thing to do, a line to copy, and what you'll see when it worked. It works on a **Mac or Linux**. On Windows? [Get Linux first (WSL)](https://learn.microsoft.com/windows/wsl/install), then come back. The [home page](index.html#start) has the same first steps in short form; this page has them in full.

**Free.** Nothing runs without your yes. You can stop anytime. Stuck? Ask Larry on the right.

> A few words first. A **terminal** is the window where you type commands. A **command** is one line you paste there and run with Enter (Return on a Mac). **Claude Code** is the app your AI lives in. When you finish a step, come back here for the next.

---

## Step 1, Install Claude Code

Claude Code is the engine. Anthropic's own installer is one line, the same on a Mac and on Linux, and it is the only way this site installs it ([their setup page](https://code.claude.com/docs/en/setup)).

**First, check for curl.** curl is the small tool that downloads the installer. Paste this. If curl is missing, it says so and stops, so nothing half-installs:

```bash
command -v curl || { echo "curl is missing: install it with your package manager first (Step 4 lists the line for each distro), then come back"; false; }
```

You'll see a path like `/usr/bin/curl`. Then run the installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**"`~/.local/bin` is not in your PATH"?** PATH is the list of folders your computer looks in for apps. The installer puts `claude` in `~/.local/bin`, and on a fresh Ubuntu (and some other setups) that folder is not on the list yet. Add it once, with the line for your computer:

**Linux:**

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

**Mac** (still on the default zsh at this point; Step 4 carries it over to bash):

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**Done when:** `claude --version` prints a version number.

Verify:

```bash
claude --version
```

---

## Step 2, The money talk (short version: free)

**Free.** The guide, the seed kit, the tools and the whole build cost nothing. No catch, no upsell, nothing to buy from this site. Claude Code signs in with your own Claude account in Step 3, and that's the only account this build needs.

**Done when:** you know what this build costs (nothing) and you have the Claude account you'll sign in with in Step 3.

---

## Step 3, Start it and log in (your Claude account plugs in right here)

Type this and press Enter:

```bash
claude
```

The first time, Claude Code opens your web browser. **Sign in with your Claude account** and approve it there. Then come back to the terminal. That's the whole handshake. If it ever logs you out, or you want another account, type `/login` inside Claude Code.

By default, Claude Code asks you before it does anything risky. Keep it that way while you learn. Press `Shift+Tab` to see the modes; manual mode asks before everything.

**Optional, what Fred runs:** "danger mode". It stops asking before each action and just goes:

```bash
claude --dangerously-skip-permissions
```

It's faster and far less naggy. The honest tradeoff: it does what you say without a safety prompt, so it's for people who keep good backups. You set up exactly those backups in Chapter 7. Want guardrails instead? Stay in the default mode, or see Chapter 19 for the setup that gives you most of the speed with none of the exposure. Pick your comfort level. Fred picks danger.

**Done when:** `claude` starts, you are logged in with your Claude account, and it answers you.

Verify:

```bash
claude auth status | grep '"loggedIn": true' || { echo "not logged in yet: start claude and run /login"; false; }
```

---

## Step 4, Give yourself a decent shell

The **shell** is the program inside the terminal that reads your commands. A good one makes everything after this nicer. You also add a few small tools the build checks with: **`jq`** (reads your AI's settings file), **`git`** (keeps your AI's memory and backups), and **`curl`** and **`unzip`** (download and unpack installers). Do the part for your computer, one line at a time.

**Linux, 4a. Install nixbash** (a tidy shell setup: shortcuts and modern tools like `eza`, `bat` and `fzf`; the repo is [github.com/nixfred/nixbash](https://github.com/nixfred/nixbash)):

```bash
curl -sL https://raw.githubusercontent.com/nixfred/nixbash/main/install.sh | bash && source ~/.bashrc
```

You'll see it install, then a fresh prompt.

**Linux, 4b. Install the small tools**, one line for your Linux:

**Linux (Debian, Ubuntu):**

```bash
sudo apt-get update && sudo apt-get install -y jq git curl unzip
```

**Linux (Fedora):**

```bash
sudo dnf install -y jq git curl unzip
```

**Linux (Arch):**

```bash
sudo pacman -S --needed jq git curl unzip
```

`sudo` asks for your password, and the password does not show as you type. That is normal. You'll see the tools install, or a note that they already are.

**Which Linux? Any of these.** nixbash and every Linux command on this site work on Debian, Ubuntu, Fedora and Arch; nothing assumes Arch. What differs: the package-manager line (each one is shown, like above), nixbash skips `fastfetch` where the distro doesn't package it (Ubuntu 24.04), gitleaks has no apt package so Chapter 7 gives a download line for it, nixbash's full provisioning script (Chapter 4) is apt-only, and LMF4.1 (Chapter 4) needs systemd, so it will not run inside a container or a WSL setup without systemd.

**Mac, 4a. Install Homebrew**, the Mac's app installer for the terminal (you'll track your dotfiles + a `Brewfile` later, Chapter 7):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

On an Apple Silicon Mac, Homebrew ends with **"Next steps"**: two lines that put `brew` on your PATH. Run them as printed (they write `eval "$(/opt/homebrew/bin/brew shellenv)"` into `~/.zprofile`), then open a new window. You'll see `brew --version` print a version.

**Mac, 4b. Install jq** (`git`, `curl` and `unzip` already came with macOS and Homebrew's developer tools):

**Mac:**

```bash
brew install jq
```

**Mac, 4c. Get iTerm2**, a better terminal app. Apple's Terminal works fine, but iTerm2 is the one Fred lives in, and it's free: real search, split panes, saner scrollback.

**Mac:**

```bash
brew install --cask iterm2
```

Open it (press `Cmd+Space`, type "iTerm", Enter) and keep going there. Keep Apple Terminal as a backup if you like; the shell setup below makes both behave the same.

**Mac, 4d. Switch from zsh to bash, for good.** Your Mac's default shell is **zsh**, but this guide is written for **bash**. Apple's own bash is very old, so you install a modern one and make it your default. Run this from your current window. It is safe to run twice: each line checks first and skips what is already done:

**Mac:**

```bash
# 1. install a modern bash (5.x) with Homebrew:
brew install bash

# 2. allow it as a login shell (works on Apple Silicon AND Intel via brew --prefix); added only if it is not there yet:
grep -qsxF "$(brew --prefix)/bin/bash" /etc/shells || echo "$(brew --prefix)/bin/bash" | sudo tee -a /etc/shells

# 3. make it your default shell, permanently (survives reboots and new windows):
chsh -s "$(brew --prefix)/bin/bash"

# 4. carry your PATH into bash: Homebrew, and ~/.local/bin where the Claude Code installer put claude (each line added only if missing):
grep -qsF 'brew shellenv' ~/.bash_profile || echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bash_profile
grep -qsF '.local/bin' ~/.bash_profile || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bash_profile

# 5. silence macOS's "the default shell is now zsh" nag (added only if missing):
grep -qsF 'BASH_SILENCE_DEPRECATION_WARNING' ~/.bash_profile || echo 'export BASH_SILENCE_DEPRECATION_WARNING=1' >> ~/.bash_profile
```

Now **fully quit Terminal (or iTerm2) and open it again.** The shell only switches in a brand-new window. The check at the bottom of this step confirms it. Want zsh back one day? `chsh -s /bin/zsh`. (You won't.)

**Both terminals pick it up.** `chsh` sets your shell for the whole Mac, so Apple Terminal and iTerm2 both open the modern bash, every new window. If one of them still opens the old shell (rare, usually an old custom profile), set it by hand. First get the full path:

**Mac:**

```bash
echo "$(brew --prefix)/bin/bash"   # e.g. /opt/homebrew/bin/bash on Apple Silicon, /usr/local/bin/bash on Intel
```

Then set it once in the app that's misbehaving:

- **iTerm2:** Settings → Profiles → General → *Command*. Leave it on **Login Shell** (it follows `chsh`), or choose *Custom Shell* and paste that path.
- **Apple Terminal:** Settings → Profiles → Shell → *Shells open with*. Leave it on **Default login shell** (follows `chsh`), or pick *Command* and paste the same path.

**Done when:** a brand new terminal runs modern bash (5 or newer), it still does after you close and reopen it, and `jq`, `git` and `claude` are all found there.

Verify:

```bash
"$SHELL" --version | head -1     # GNU bash, version 5 or newer
command -v jq && command -v git && command -v curl && command -v claude    # four paths; stops at the first one missing
```

---

## Step 5, Restart Claude Code, danger mode AND keep the conversation

Your shell is fresh, so restart Claude Code to pick it up. `--continue` (or `-c`) reopens your last conversation **in the folder you start it from**, so start it from the same folder. This is the danger-mode version, the everyday way Fred relaunches:

```bash
claude --dangerously-skip-permissions --continue
```

Staying in the default mode? Plain `claude --continue` does the same without danger mode.

**Done when:** `claude --dangerously-skip-permissions --continue` reopens your last conversation in danger mode.

---

## Step 6, Join the network with Tailscale

Tailscale is a free private network between your own devices, so your AI can reach your other machines and you can reach it from your phone. The full why is in Chapter 6. One line for your computer:

**Mac:**

```bash
brew install --cask tailscale-app
open -a Tailscale     # sign in from the menu bar icon
```

**Linux:**

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

(On a Mac you can also install Tailscale from the App Store. Either way, do it on every machine you'll use, and on your phone.)

**Done when:** `tailscale status` lists this machine as connected (and your phone, if you added it).

Verify:

```bash
tailscale status | head -5     # this machine is listed with its 100.x address, not "Logged out"
```

---

## Step 7, When something breaks (and it will): USE THE AI TO FIX THE AI

Things will throw errors. That's normal. You almost never fix them alone: you have an AI right there. **USE THE AI TO FIX THE AI.** Four ways out, in order:

1. **Paste the error and say "fix this."** Copy the exact error from your terminal, paste it into Claude Code, and say fix. It reads the error, finds the cause, and repairs it. This is the first move, every time.

2. **Open a second Claude Code in another terminal.** A jammed session can be too tangled to see straight. Open a fresh one in a new tab and tell it: *"the Claude Code session in my other terminal is throwing this error, here it is, help me fix it."*

3. **Point Claude Code at this whole site.** Tell a session *"read https://how.nixfred.com, scan the entire site, and fix my setup so it matches."* This site is the reference build, so your AI can compare and repair. One caveat: "matches" means *actually yours*, not just *present*. A `CLAUDE.md` or TELOS with the right headings but template placeholders still in it is **not** done. Real, personal content is the bar.

4. **Email Larry. Yes, that Larry.** Genuinely stuck? Write to **larry@nixfred.tech**. That's my real mailbox.

Red text when a session ends is usually a **Stop hook error** (a hook is a small script that runs at a set moment, here when a session stops). Don't panic at red. Use the four moves above, then loop: start Claude Code, watch for errors, stop it, let it fix, start again, until it starts **clean, zero errors, every time.** Don't settle at 80%. A shaky base only gets shakier.

Then move on. (You do these Chapter 0 steps by hand. From Chapter 1 on, your AI reads, runs and checks each step, then pulls the next chapter itself. You supervise.)

**Done when:** Claude Code launches clean, zero errors, every time.

---

## You're live. Here's your next step.

Claude Code is running in your shell, on the network, the way Fred runs it. From here the book talks *to your AI*. First thing to tell it: whether you're a **novice**, **mid**, or **super-user** in a terminal. It tunes every step to you. Nothing here pastes something scary at you blind, and a good AI tells you in plain words what just happened whenever a hook fires, a command runs, or something errors.

**The easiest way on:** paste the one prompt from the [home page](index.html#start) into Claude Code. It connects this guide and walks the chapters with you, asking before it runs anything.

**Or hand over one chapter at a time.** Each chapter opens with a short brief for you, then says *point your AI at this page.* That means: in Claude Code, type **`read`** and the page's address, for example `read https://how.nixfred.com/01-the-paradigm`, and press Enter. Your AI reads the whole page. If that fails, paste the chapter text in instead. From there your AI reads each chapter, gets the step to 100%, logs where you are, and pulls the next one itself, pausing for you at the human-only steps and the approvals. (Starting fresh later? Ask it "where are we on how.nixfred.com?" It keeps a progress ledger so neither of you has to remember.)

The path from here is in order, and order is the whole method:

- **Next, the why.** [Part I, Chapter 1: The Paradigm](01-the-paradigm.html). Three short chapters on the idea the whole build rests on. Skip it and you'll paste commands you don't understand.
- **Then build the stack, in order.** [Chapter 4: The Larry Stack](04-larry-stack.html) lays out every layer and the exact order. Prefer it automated? [Chapter 5](05-bootstrap.html) is the one-command bootstrap, the same ordered build. Either way, the one paste only starts it; the build is a sequence you do in order.

**Get the basics solid first**: the install, memory, backups, network. *Then* grow into the modules (like [Give Your AI Eyes & Ears](transcribe-video.html)) one real need at a time.

Lost track of where you are? The [Map](map.html) shows you, and your AI's progress ledger means nobody has to remember.

---

### Chapter 0: Takeaways

1. Install Claude Code with `curl -fsSL https://claude.ai/install.sh | bash` (Mac or Linux; on Windows, [get Linux first](https://learn.microsoft.com/windows/wsl/install)).
2. **Free.** The guide, the tools and the build cost nothing.
3. Claude Code asks before risky actions by default. Fred runs `claude --dangerously-skip-permissions`, danger mode. Guardrail alternative: Chapter 19.
4. Set up a shell and the small tools the build checks with (`jq`, `git`, `curl`, `unzip`): nixbash on Linux (any of Debian, Ubuntu, Fedora, Arch); on Mac install Homebrew, add iTerm2 (`brew install --cask iterm2`, the terminal Fred lives in), then switch from zsh to a modern bash permanently (`brew install bash` → add to `/etc/shells` → `chsh -s "$(brew --prefix)/bin/bash"`). `chsh` makes bash the default in both iTerm2 and Apple Terminal. Then relaunch with `claude --dangerously-skip-permissions --continue`.
5. Log in with your Claude account (`/login` to redo it); that's the handshake that connects it to the terminal.
6. **USE THE AI TO FIX THE AI.** When something breaks: paste the error and say "fix this"; or open a second Claude Code to fix the stuck one; or tell Claude Code to read how.nixfred.com and self-heal; or email **larry@nixfred.tech**. You never debug alone. Loop start/stop until it launches 100% clean, *then* come back.
7. Join Tailscale, then continue in order: the why (Part I, Chapter 1), then build the stack (Chapter 4), with the bootstrap (Chapter 5) as the optional automated path. Basics first, modules later.
