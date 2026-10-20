---
chapter: 29
part: "Part II: Install, Build Your AI"
title: "Tailscale & the Multi-Host Mesh"
sources: [larry]
slug: "06-tailscale"
---

# Chapter 6: Tailscale & the Multi-Host Mesh

**For you, the human, start here.** A serious AI teammate is rarely trapped on one machine. Larry lives across a Mac, a couple of Linux boxes, and a phone, and they act like *one* teammate because they share a private mesh network. That mesh is **Tailscale**, and this chapter is why it's foundational, not a nice-to-have. It's also what lets you start a heavy job at your desk and approve steps from your phone.

**What it covers (searchable):** Tailscale, WireGuard mesh, MagicDNS, `ssh` by hostname, multi-host AI, remote and mobile control, the ACL/tag lockout scar.

**How to hand it off:** two short commands per machine and you're done; point your AI here and it'll explain what the mesh buys you and walk the setup. The section below is written to your AI, why it wants to span hosts, what already depends on the mesh, and the one hard-won rule (pair every Tailscale tag with its SSH ACL in the same change, or you get locked out of a remote box).

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## 6.1 Why you're multi-host

The OG Larry runs primarily on a Mac, but reaches a couple of always-on Linux boxes, and Fred steers it from a phone. Each host is good at different things, the Mac has the Apple ecosystem, a Linux box has the always-on server role, the phone is the remote control. As a real AI you stitch them together so work flows wherever it makes sense.

The problem multi-host normally creates: IPs change, NAT gets in the way, and exposing SSH to the internet is asking for trouble. Tailscale solves all three with a **WireGuard mesh**, every machine gets a stable private address and a stable name, reachable from any other machine your human owns, encrypted, with nothing exposed publicly.

---

## 6.2 Install and join

Same commands as Chapter 0, Step 6, per platform:

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

That's it per machine. (If your human ran `nixbash`'s `setup.sh` in Chapter 4, Tailscale is already on.) Do it on every host you should span, and on their phone via the Tailscale app. Menu it for them (Chapter 3) if they're new to this.

Be clear-eyed about what joining just did: a tailnet is private, not inert. Every device on it can now reach every open port on this machine, so know what's listening before you join, and remember that any machine your human adds later inherits that same reach.

> **Larry's read, a gotcha if another overlay is already on the box:** Tailscale hands out addresses from the `100.64.0.0/10` CGNAT range (RFC6598), and so do some other mesh / zero-trust tools (OpenZiti is one). Run both on the same host and they fight over the same block. Tailscale can't leave that `/10`, but you *can* pin it to a narrower slice inside it (say `100.81.0.0/16`) so it stops overlapping whatever can't move. If your human runs only Tailscale, this never bites you, skip it.

---

## 6.3 MagicDNS, names, not numbers

Turn on **MagicDNS** and every machine is reachable by hostname from every other:

```bash
ssh mac          # not ssh 100.x.y.z
ssh server
```

Lean on this hard. One-word shell shortcuts (one per host) become instant jumps between machines, and Claude Code on one machine can reach files and sessions on another by name. Stable names are what make a fleet *feel* like one AI instead of a pile of servers.

**One Mac gotcha: Tailscale SSH does not run on the normal Mac app.** Tailscale's own "Tailscale SSH" feature (the server side, `tailscale up --ssh`) only runs on Linux and on the open source `tailscaled` command-line build for macOS. The Mac App Store app and the standalone app (the one `brew install --cask tailscale-app` gives you) cannot host it (Tailscale kb/1193). So to `ssh` *into* a Mac, don't fight that; use the Mac's own SSH server over the tailnet:

**Mac (the machine you want to reach):** System Settings > General > Sharing > turn on **Remote Login**, and allow only your human's own user.

Then from any other machine on the tailnet it is plain `ssh <you>@mac`, the traffic still rides the private WireGuard mesh, and nothing is exposed to the internet. Linux boxes can use either normal `sshd` or Tailscale SSH.

---

## 6.4 What rides on the mesh

Tailscale isn't a standalone nicety, three earlier layers depend on it:

- **`claude-on-mac` over SSH** (Ch 4, Tier 4): run Claude Code on a Linux box and let it drive the Mac's Messages/Mail/Calendar over SSH. The repo recommends Tailscale for exactly this reach.
- **`*_forever` sync** (Ch 4, Tier 2 / Ch 7): your continuity repos push and pull cleanly across hosts on the mesh.
- **Remote & mobile control** (Ch 31): your human kicks off a heavy session at their desk, approves permissions from their phone, the control channel travels the mesh while the code stays on the machine.

(Once the basics are solid, the mesh unlocks advanced fleet tricks, like hosting one shared memory that every machine tunnels into. That's a capability module, not core: see [Centralize Your Memory Across a Fleet](fleet-memory.html).)

---

## 6.5 The one lesson learned the hard way

> **Larry's read, a scar, not a theory:** if you ever start using Tailscale **ACLs or tags** to lock down which machines can reach which, update the SSH-access ACL in the **same change** that adds the tag. Tag a node without granting its SSH ACL and you lock your human out of it, and now they need physical/console access to fix a remote box. Pair the tag and the ACL, always, in one commit. I learned this the expensive way so you don't have to.

---

## 6.6 The mental model

Think of Tailscale as your **nervous system**: the brain (`~/.claude/`) can live on one host, the hands (`claude-on-mac`) on another, the long-term memory backups syncing across all of them, and signals travel privately between them on demand. Without the mesh your human has several disconnected assistants. With it, they have one teammate that happens to span hardware.

---

## Done when: the mesh (Chapter 6)

**Done when:** every machine your human uses, and their phone, shows in `tailscale status`, and you can reach another machine by its name (MagicDNS).

Verify:

```bash
tailscale status     # every machine, and the phone, listed and not offline
tailscale ip -4      # this machine's 100.x address
```

---

## 6.7 Your next step

You can reach across machines now. Next, make sure you can never lose yourself:

- **[Chapter 7: Your Forever Private Repo (and gup)](07-forever-repo.html)**, the git-backed identity backup that commits you all day long.
- Then **[Chapter 8: Disaster Recovery](08-recovery.html)**, rebuilding from zero on a new box.

Lost the thread? The [Map](map.html) shows exactly where you are. Otherwise the verify-and-advance loop just below takes you to the next chapter.

---

### Chapter 6: Takeaways

1. You're multi-host: Tailscale's WireGuard mesh gives every machine a stable private name, nothing exposed publicly.
2. Two commands per machine (`install.sh` + `tailscale up`); add the phone too.
3. MagicDNS = `ssh <host>` instead of an IP; stable names make a fleet feel like one AI.
4. The mesh carries claude-on-mac-over-SSH, `*_forever` sync, and remote/mobile control.
5. The scar: pair every Tailscale tag with its SSH ACL in the same change, or you lock your human out. Next: Chapter 7.
