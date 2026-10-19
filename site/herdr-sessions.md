---
title: "One Space Per Project: Persistent Agent Sessions With herdr"
slug: "herdr-sessions"
summary: "a workspace per project that never closes, with the agent already running in the right folder"
---

# One Space Per Project: Persistent Agent Sessions With herdr

**For you, the human, start here.** Once you have more than a couple of projects, you spend real time finding things: which folder, which terminal window, which conversation. herdr fixes that. It is a free, open-source terminal workspace manager built for AI agents. Each project gets a named workspace that stays alive when you close the window, with your AI already running in the right folder, and a sidebar that shows which one is working, which one is waiting on you and which one is done. The killer demo: close the terminal, reopen it, and every project is exactly where you left it.

**What it covers (searchable):** herdr, workspaces, tabs, panes, persistent sessions, detach and reattach, agent status (working, blocked, done), herdr integration install claude, session restore, Mac and Linux install, one workspace per project or client, tmux alternative.

**How to hand it off:** point your AI at this page and say *"set me up with herdr, one workspace per project."* The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

A normal terminal window dies when it closes, and so does the session you were running in it. Your human juggles windows and tabs, loses track of which one holds which project, and starts you cold in the wrong folder. Worse, when you finish a long task or stop to ask a question, nobody notices.

## The tool

[herdr](https://herdr.dev/) (by Herdr, Inc., Apache-2.0, free) runs a background server that owns real terminals. Its concept model, in teaching order:

- **Workspace:** one per project. This is the unit your human thinks in.
- **Tab** and **pane:** layouts and terminals inside a workspace.
- **Agent:** herdr detects Claude Code and other agents in a pane and shows its state: `working`, `blocked` (waiting for your human), `done`.
- **Session:** the background server. Most people only need the default one.

herdr publishes an official guide written for AIs helping a human set it up: [herdr.dev/agent-guide.md](https://herdr.dev/agent-guide.md). Read it before you start, and never invent keybindings or flags; check [the docs](https://herdr.dev/docs/) instead.

## The recipe

**Mac:**

```bash
brew install herdr        # or: curl -fsSL https://herdr.dev/install.sh | sh
herdr --version
```

**Linux:**

```bash
curl -fsSL https://herdr.dev/install.sh | sh
herdr --version
```

Then, together:

1. `cd ~/Projects/<first-project>` and run `herdr`. The first run shows onboarding and creates a workspace.
2. Start `claude` in the pane. Install the integration so conversations come back after a restart: `herdr integration install claude`.
3. Teach the mouse first: click to focus, right-click for menus, drag borders. Keys can come later (`ctrl+b` then `?` lists them).
4. Create one workspace per project, each started in its own folder, each named exactly like the folder.
5. Detach (close the window, or `ctrl+b` then `q`), run `herdr` again, and show your human everything is still there.
6. Point at the sidebar: a `blocked` workspace needs them, a `done` one has finished work to review.

If you are running inside a herdr pane yourself (`HERDR_ENV=1`), do not launch `herdr` from there; it blocks nested launches. herdr also ships a skill that teaches you to drive it from inside a pane; ask your human before installing it into your config.

## Lead with choices (Chapter 3)

- **Novice:** mouse only, one workspace per project, detach and reattach.
- **Mid:** tabs for `agent`, `server` and `logs` inside a workspace; keyboard basics.
- **Super user:** the CLI and socket API to open a workspace, start an agent and hand it a prompt from a script or a notification.

## Worked example

Your human has three clients and an internal tool. Four folders, four workspaces: `client-a`, `client-b`, `client-c`, `tooling`. Monday morning they run `herdr`, see `client-b` marked `done` from a long report you started Friday, review it, then click `client-a`, where you are already in the right folder with the conversation restored. No searching, no cold start, no mixing one client's files into another's session.

> **Larry's read:** the win is not the terminal tricks. It is that "which project am I in?" stops being a question. One rule makes it work: one workspace per project, named like the folder, and nothing unrelated sneaks in. Break that rule and you have rebuilt the mess with extra steps.

---

## Your next step

Work only from workspaces for a week. Then return to [how.nixfred.com](index.html), and read [Chapter 10, projects and roles](10-projects.html) and [Chapter 13, context discipline](13-context.html). Basics first, modules after.
