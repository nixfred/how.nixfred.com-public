---
title: "A Lab Machine: Omarchy Linux for AI Experiments"
slug: "omarchy-linux-rd"
summary: "turn an older laptop into a keyboard driven Linux lab for your AI, and keep your main machine clean"
---

# A Lab Machine: Omarchy Linux for AI Experiments

**For you, the human, start here.** Once your AI does real work on your main computer, you stop wanting to experiment on that computer. A second machine fixes it: an older laptop becomes a lab where new tools, agents and ideas get tried without any risk to the machine that pays the bills. Omarchy is a free, opinionated Linux setup built on Arch and Hyprland that is fast, beautiful and keyboard driven, and it runs well on hardware a few years old. The killer demo: your AI, restored from your forever repo, running on a laptop you almost threw away, with every agent's status drawn live on the desktop.

**What it covers (searchable):** Omarchy, Arch Linux, Hyprland, ISO install, USB installer, Secure Boot, full disk encryption, older laptop hardware, NVIDIA driver generations, Broadcom Wi-Fi, Tailscale, restore your AI from the forever repo, Infomarchy, herdr, lab machine vs main machine.

**How to hand it off:** point your AI at this page and say *"help me check whether this laptop can run Omarchy as my AI lab."* The section below is written to your AI. It is Linux only; the checks you run before install day happen on whatever machine your human has now.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

Experiments break things. If your human's only machine is also where their real work lives, every new tool is a risk, so they stop trying new tools. A separate lab removes the fear. The main machine stays the finish line; the lab is optional.

## The tool

[Omarchy](https://omarchy.org/) (version 4.0.4 as of September 2026) installs from a USB stick and gives a complete desktop in one pass: Hyprland tiling window manager, terminal, browser, themes, and full disk encryption on by default. Read [the manual's getting started page](https://omarchy.org/manual/getting-started/) with your human before install day.

## Check the hardware first

Run this with your human before anyone wipes a disk:

- **CPU:** a 64-bit PC (x86_64) with UEFI. Intel 11th gen or newer, or AMD Ryzen 5000 or newer, is a comfortable target. Apple silicon Macs cannot run it.
- **Memory:** 16 GB is comfortable, 8 GB works for experiments without local models.
- **NVIDIA graphics** (from the 4.0.4 installer): RTX 20 series, GTX 16 series and newer get the current open driver; GTX 9xx and 10xx get a legacy driver branch that works but will not get new features; GTX 7xx and older get no driver at all. Integrated Intel or AMD graphics are the easy path.
- **Wi-Fi:** prefer Intel. Most Broadcom chips are trouble; only two older MacBook chips (BCM4360, BCM4331) get a driver automatically.
- **Keyboard at boot:** the disk encryption password is typed before Bluetooth starts, so have a wired or 2.4 GHz wireless keyboard, or use the built-in one.

If a check fails, say so plainly and suggest a different laptop. A 3 to 5 year old business laptop is usually a good buy.

## The recipe

1. Back up anything on the laptop. The install erases the disk.
2. Download the ISO from [omarchy.org](https://omarchy.org/) and write it to a USB stick of 8 GB or more.
3. In the laptop's firmware settings, turn off Secure Boot, then boot from the USB.
4. Answer the installer's questions; keep disk encryption on.
5. After first login, spend twenty minutes just moving around: workspaces, launcher, terminal. Nothing else yet.
6. Install Claude Code, sign in, and restore your identity from the forever repo ([Chapter 7](07-forever-repo.html)).
7. Join the laptop to your private network with Tailscale ([Chapter 6](06-tailscale.html)).
8. Optional: [herdr](herdr-sessions.html) for a workspace per experiment, and [Infomarchy](https://github.com/nixfred/infomarchy), an Omarchy plugin that draws every running agent and its status on the wallpaper.

## Lead with choices (Chapter 3)

- **Novice:** install, learn the desktop, restore the AI. Nothing else for a week.
- **Mid:** herdr workspaces per experiment, local models if the memory allows.
- **Super user:** the lab runs long agent jobs and scheduled experiments while the main machine stays untouched.

## Rules for the lab

- No confidential data on the lab machine, ever.
- Anything that proves itself gets rebuilt on the main machine deliberately, not copied over.
- The lab is allowed to break. That is its job.

## Worked example

Your human has a 4 year old business laptop with an Intel CPU, integrated graphics, Intel Wi-Fi and 16 GB. Every check passes. Install takes under an hour, the desktop orientation twenty minutes, and restoring the AI from the forever repo another twenty. By the end of the session, you are running on the lab, you know who your human is, and a new experiment has its own workspace, while their main machine did not change at all.

> **Larry's read:** the main machine is not a waystation on the way to Linux. For most people it is the finish line and should stay that way. The lab is for the ones who want to tinker, and the most important thing on it is the rule about what never goes there. Check the hardware before install day; a GTX 780 and a Broadcom card will eat the whole session.

---

## Your next step

One experiment a week on the lab, written up in its workspace. Then return to [how.nixfred.com](index.html) for [Chapter 8, disaster recovery](08-recovery.html), because a machine you are allowed to break is the best place to practise restoring. Basics first, modules after.
