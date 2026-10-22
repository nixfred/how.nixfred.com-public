---
title: "Talk, Don't Type: Voice Dictation Into Your AI (and Everything Else)"
slug: "voice-dictation"
summary: "a hotkey that turns speech into text in any app, so your prompts carry the context typing leaves out"
---

# Talk, Don't Type: Voice Dictation Into Your AI (and Everything Else)

**For you, the human, start here.** Typed prompts stay short because typing is slow, and short prompts get shallow answers. Talking is several times faster, so a spoken prompt naturally carries the background, the constraints and the "oh, and also" that make an answer good. This module gets a dictation tool onto a hotkey that works in every app on your computer: your AI, email, documents, the terminal. The killer demo: hold a key, ramble for a bit about a real problem, let go, and watch your AI turn it into a plan that is better than anything you would have typed.

**What it covers (searchable):** Wispr Flow, Privacy Mode, zero data retention, HIPAA BAA, superwhisper, built-in macOS Dictation, on-device dictation, voxtype on Linux, Claude Code `/voice`, microphone and accessibility permissions, custom dictionary, cloud vs local audio.

**How to hand it off:** point your AI at this page and say *"help me set up voice dictation, and ask me about privacy first."* The section below is written to your AI. Mac and Linux are in separate blocks.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

You only ever see what your human types. When typing is the bottleneck, you get one-line requests with the context stripped out, and you guess. A dictation tool fixes the input side: your human talks, text lands wherever their cursor is, including your prompt box.

## Ask the privacy question first

Before installing anything, ask it as a menu (Chapter 3):

- **(a) Nothing I say is confidential.** Use the best cloud tool.
- **(b) I sometimes talk about client, patient or legal details.** Cloud tool with its privacy settings locked down, and a rule about what not to say.
- **(c) No audio may ever leave this machine.** On-device dictation only.

Their answer picks the tool. Do not skip this; audio is data.

## The tools (checked September 2026)

**Wispr Flow, cloud, best accuracy and formatting.** Mac, Windows, iPhone and Android. No official Linux app. Free tier is limited (current plans at [wisprflow.ai/pricing](https://wisprflow.ai/pricing)). Transcription always happens in the cloud. For choice (b), turn on **Privacy Mode** and turn off cloud storage, which Wispr describes as zero data retention ([data controls](https://wisprflow.ai/data-controls)). A HIPAA BAA is available ([details](https://docs.wisprflow.ai/articles/4218718535-hipaa-compliance-healthcare-use)). Whether that satisfies your human's own professional rules is their call, not yours; say so.

**On-device on a Mac.** Built-in macOS Dictation is free and runs on-device on Apple silicon (System Settings, Keyboard, Dictation). superwhisper has a free local tier and a paid Pro plan and runs its models on the Mac. Use one of these for choice (c).

**Claude Code has `/voice` built in** for talking to Claude Code itself. It needs a Claude.ai login and sends audio to Anthropic. Handy, but it only works inside Claude Code; a system-wide tool works everywhere.

**Linux.** voxtype is an open-source push-to-talk dictation tool that runs whisper locally.

## The recipe

**Mac (Wispr Flow):**

```bash
brew install --cask wispr-flow     # or download from wisprflow.ai
open -a "Wispr Flow"
```

Then grant **Microphone**, **Accessibility** and **Input Monitoring** in System Settings, Privacy and Security, and quit and reopen the app. Pick a hotkey nothing else uses. If your human chose (b), open Wispr's settings with them and switch on Privacy Mode now, before the first word.

**Mac (on-device):** System Settings, Keyboard, Dictation, turn it on, choose a shortcut. Test with Wi-Fi off to prove it is local.

**Linux (Omarchy ships an installer):**

```bash
omarchy-voxtype-install
```

**Linux (other distros):** install voxtype from [voxtype.io](https://voxtype.io) and bind its push-to-talk key in your desktop.

Then, on any platform:

1. Test in three apps: your prompt box, an email, a document.
2. Add your human's names, company names and jargon to the tool's custom dictionary.
3. Have them dictate a short brief about a real task into you, and compare your answer with their usual typed prompt.

## Lead with choices (Chapter 3)

- **Novice:** one tool, one hotkey, one habit: "every prompt longer than a sentence gets spoken."
- **Mid:** add the dictionary and the "think out loud, then ask for a plan" pattern.
- **Super user:** dictate specs and reviews, and let you restructure the ramble into a clean document.

## Worked example

Your human holds the hotkey and says: *"I need to answer this client about why their quarterly estimate went up, they are annoyed, keep it short and friendly, the reason is the bonus in March, and offer a call next week."* Typed, that would have been "reply to client about estimate". Spoken, you have tone, reason, length and a call to action. The draft is right the first time.

> **Larry's read:** the speed is not the point. The point is that people say things out loud they would never bother to type, and those things are exactly the context I need. Get the privacy answer before the install, though. Nobody wants to discover in month three that their client calls went through a cloud they never thought about.

---

## Your next step

Make speaking the default: every prompt longer than a sentence gets dictated until it is a habit. Then go back to [how.nixfred.com](index.html) and pair it with [Chapter 3, talking in choices](03-ask.html). Basics first, modules after.
