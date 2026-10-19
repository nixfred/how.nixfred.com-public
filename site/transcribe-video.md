---
title: "Give Your AI Eyes & Ears: Transcribe X, Video & Audio"
slug: "transcribe-video"
summary: "the yt-dlp + whisper pipeline that lets any AI watch and transcribe X/YouTube"
---

# Give Your AI Eyes & Ears: Transcribe X, Video & Audio

**For you, the human, start here.** Out of the box your AI is deaf and blind to video. Hand it an X post or a YouTube link and it hits a wall, no browser to play the video, no decoder to read it, and a raw URL fetch just lands on a login page. This module is the fix: three small local tools (`yt-dlp` + `ffmpeg` + `whisper`) that turn any video URL into clean text your AI can actually read and learn from. It's the exact pipeline this whole site was built with.

**What it covers (searchable):** yt-dlp, ffmpeg, whisper.cpp, openai-whisper, transcribe X / Twitter / YouTube video, YouTube captions, the auto-caption duplicate gotcha, VTT cleanup, the Novice/Mid/Super-User skill knob, Mac vs Linux install.

**How to hand it off:** point your AI at this page and say *"set this up so you can watch and transcribe videos for me."* The section below is written to your AI: the tools, the recipe, the YouTube shortcut, and how to ask you the right questions at your comfort level while it installs. Mac and Linux commands are kept in separate blocks, run the one for your machine.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall (and why the URL trick fails)

You have no browser to *play* a video and no decoder to *read* it. Worse, fetching an X/Twitter URL directly returns the login/JS wall, not the media. So when your human says *"watch this and learn from it,"* you're stuck. The fix isn't a bigger model, it's three small local tools that turn a video URL into clean text you can actually read.

---

## The fix: `yt-dlp` + `ffmpeg` + `whisper`

- **yt-dlp**: downloads the *native* audio/video from X/Twitter, YouTube, and hundreds of sites. No login needed for public posts; it handles the guest-token dance for you. This is the piece that gets you *past the wall*.
- **ffmpeg**: converts audio to 16 kHz mono for the transcriber.
- **whisper**: speech to text. On a Mac, **whisper.cpp** is Metal-accelerated and fast; on Linux, **openai-whisper** (pip) is the portable choice and auto-downloads its model.

One rule before any of it runs: only download and transcribe media your human has the right to use, per the platform's terms and local copyright law.

Install the tools. **Run the block for your platform, not both** (this is a lead-with-choices moment, Chapter 3: ask your human which machine they're on first).

**Mac (Homebrew):**

```bash
brew install yt-dlp ffmpeg whisper-cpp
# whisper-cpp is Metal-accelerated on Apple Silicon. Grab a ggml-large-v3 model for it.
```

**Linux (Debian/Ubuntu shown; use your package manager):**

```bash
sudo apt update && sudo apt install -y ffmpeg
pip install -U yt-dlp openai-whisper
# openai-whisper auto-downloads its model on first run. No whisper.cpp build needed.
```

(On a Mac you can also `pip install -U openai-whisper` if you'd rather skip the model download for whisper.cpp. On Linux you *can* build whisper.cpp for speed, but openai-whisper is the no-friction path.)

---

## The recipe

```bash
URL="https://x.com/<user>/status/<id>"   # an X post with native video

# 1. probe it, duration, formats (no download)
yt-dlp -J "$URL" | jq '{title, duration_s: .duration}'

# 2. pull AUDIO ONLY to mp3 (smaller, faster than the full video)
yt-dlp -f "bestaudio" -x --audio-format mp3 -o "clip.%(ext)s" "$URL"

# 3. convert to 16 kHz mono wav (what whisper wants)
ffmpeg -y -i clip.mp3 -ar 16000 -ac 1 clip.wav

# 4a. Mac, transcribe with whisper.cpp (large-v3, Metal):
whisper-cli -m ggml-large-v3.bin -f clip.wav -otxt -of transcript

# 4b. Linux, transcribe with openai-whisper:
whisper clip.wav --model large-v3 --output_format txt --output_dir .

cat transcript.txt
```

---

## YouTube, skip whisper entirely (and the gotcha nobody warns you about)

If the source is on YouTube, **don't transcribe, pull the captions.** They're instant, free, and usually cleaner than a re-transcribe. But there's a trap, so here's the whole flow (this part is platform-agnostic, `yt-dlp` is the same on Mac and Linux):

```bash
ID="dQw4w9WgXcQ"

# 1. see what captions exist, MANUAL (human-made) beats AUTO every time
yt-dlp --skip-download --list-subs "https://youtu.be/$ID"

# 2. metadata is worth grabbing too (title, channel, length)
yt-dlp -J "https://youtu.be/$ID" | jq '{title, channel, duration_s: .duration, upload_date}'

# 3. download subs, prefer real subtitles, fall back to auto-generated
yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "en.*" \
       --sub-format vtt -o "cap.%(ext)s" "https://youtu.be/$ID"
```

**The gotcha: auto-captions are full of duplicates.** YouTube's auto-generated VTT uses a *rolling* display, each line repeats as the next word appears, so a naive read gives you every phrase 2-3 times, plus inline `<00:00:01.234>` word-timing tags. You must clean it. This collapses it to readable prose:

```bash
python3 - "cap.en.vtt" <<'PY'
import re, sys
lines = open(sys.argv[1], encoding="utf-8").read().splitlines()
out, prev = [], None
for ln in lines:
    if "-->" in ln or not ln.strip() or ln.startswith(("WEBVTT","Kind:","Language:")):
        continue
    ln = re.sub(r"<[^>]+>", "", ln).strip()      # strip inline word-timing tags
    if ln and ln != prev:                          # drop consecutive duplicates (the rolling repeats)
        out.append(ln); prev = ln
print(re.sub(r"\s+", " ", " ".join(out)))
PY
```

**Pro move:** an X/Twitter clip is *often* a re-upload of a YouTube original. `yt-dlp -J "$X_URL"` exposes the original link in its metadata, chase it to YouTube and use the clean captions instead of re-transcribing a lossy re-post. (That's exactly how this site's sources were captured: the X clip pointed back to the official Anthropic YouTube upload, and the captions were cleaner than whisper on the re-post.)

> **whisper vs. captions, which to use?** YouTube manual captions are best (human-checked). YouTube auto-captions are great, after the dedup above. No captions, or an X-native/podcast video, reach for whisper. When in doubt, `--list-subs` first; only transcribe when there's nothing to download.

---

## Wire it in, and ask at the right level

Add one `CLAUDE.md` line so "transcribe this / what does this X post say" *just works*:

```text
# Transcribe a video/X/YouTube URL: yt-dlp -f bestaudio -x --audio-format mp3,
# then ffmpeg to 16k mono wav, then whisper large-v3 to txt. Prefer YouTube
# official captions when the original is on YouTube.
```

**The AskUserQuestion calibration ([Chapter 3](03-ask.html)).** When an install or a fix needs a decision from your human, ask it as **choices**, but *right-size the questions to who you're talking to.* The very first thing you ask is the level (and which platform they're on):

> *"Before we start: which machine, Mac or Linux? And how comfortable are you in a terminal, (a) Novice, (b) Mid, (c) Super user, or tell me."*

Then tune every question to that level:

- **Novice**: explain each command, offer **run it / explain it first / show a safer dry-run**, quiz gently. Choices everywhere; nothing scary pasted blind.
- **Mid**: choices at the genuinely ambiguous forks; skip the hand-holding on the obvious.
- **Super user**: get out of the way. One confirm at the *irreversible* steps (overwrites, `sudo`, deletes); otherwise just run it.

AskUserQuestion is the interface for *calibrating and de-scaring*, never for slowing a pro down. The knob is what keeps "lead with choices" from becoming "nag the expert."

---

## Worked example

The video this site was built from, a re-upload at `x.com/zodchiii/status/2060728613872234644`, is Anthropic's **"Build a Proactive Agent Workflow with Claude Code"** (Maya, Applied AI team). Run it through the recipe above and you get the transcript that became **[Chapter 28: Routines](28-routines.html)** and **[Chapter 34: Routines Done Right](34-routines-advanced.html)** here. The core concept: **Routines**, proactive agents that cross from *tool* to *teammate*, designed around three decisions, trigger, context, steerability, on managed infra so the laptop can be off. Transcribe it, read those chapters, and you've absorbed the video deeper in text than anyone would from watching. Then do it yourself for the next one. That's the whole point.

> **Larry's read:** this module is the difference between an AI that says "I can't watch videos" and one that quietly transcribes the thing, reads it, and hands your human the three sentences that mattered. Eyes and ears are a few brew/pip installs away. Wire it in once, add the `CLAUDE.md` line, and "watch this and tell me what's useful" becomes something you just *do*. That's how a tool becomes a teammate.

---

## Your next step

Eyes and ears are wired. Modules like this are the fun part, the capabilities you bolt on *after* the foundation is solid. So:

- If you haven't finished the core build, go back and do it in order, start at [how.nixfred.com](index.html). Basics first (install, memory, backups), modules second.
- Already solid? Add the next capability one real workflow at a time (Chapter 25, beyond chat, and the connectors in Chapter 26). Never ten plugins you'll never use.

Come back to [how.nixfred.com](index.html) for the next thing. Read, wire it in, come back, that's the whole loop.

Larry
