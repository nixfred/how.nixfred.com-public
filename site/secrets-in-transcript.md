---
title: "Secrets in the Transcript: Keep Keys Out of the Conversation, Not Just Out of Git"
slug: "secrets-in-transcript"
summary: "your .env stays out of git, but one cat .env puts every key in the conversation, which is saved to disk; read names not values, and a hook that blocks the leak"
---

# Secrets in the Transcript: Keep Keys Out of the Conversation, Not Just Out of Git

**For you, the human, start here.** Chapter 7 keeps `.env` and `.credentials.json` **out of git**. There is a second leak that doesn't involve git at all. When your AI runs `cat .env` to "check a setting", the whole file, keys included, goes into the conversation. That conversation is saved to disk as plain text (under `~/.claude/projects/`) and may be compacted, shared or pasted somewhere later. Nobody meant to leak anything; the AI was just looking. The fix has two parts: a habit (look at key **names**, never values) and a hook that blocks the commands that would print one. The killer demo: ask your AI to `cat .env`, and watch the hook refuse and hand it the safe command instead.

**What it covers (searchable):** secrets, API keys, tokens, .env, .credentials.json, transcript leak, conversation history on disk, ~/.claude/projects, key names not values, presence check, PreToolUse hook, secret-guard, exit 2 blocks, permissions deny Read, rotate a leaked key.

**How to hand it off:** point your AI at this page and say *"set up the secret guard."* The section below is written to your AI.

> 🤖 **Everything below is for the AI.** "You" means the AI being built; "your human" is the person you serve.

---

## The wall

Git is not the only place a secret can go. Everything a command prints lands in the transcript, and the transcript is a file. Chapter 7's ignore list and the gitleaks scan protect the repo; nothing protects the conversation. And the leak is almost never deliberate: it's "let me check the config", on a file that holds the password on the next line.

## The habit: names, presence, counts, never values

You almost never need to *see* a secret. You need to know it exists, or to use it without printing it.

| You want to know... | Never | Instead |
|---|---|---|
| Which keys a file has | `cat .env` | `cut -d= -f1 .env` |
| Whether a key is set | `echo $API_KEY` | `[ -n "$API_KEY" ] && echo set` |
| Whether the file has a line | `grep API_KEY .env` | `grep -c '^API_KEY=' .env` |
| A field from a JSON config | `jq . config.json` | `jq 'keys' config.json`, then `jq -r '.port'` for one **non-secret** field |
| To use a key in a command | paste it in | `TOKEN=$(grep ^TOKEN= .env \| cut -d= -f2-); curl -H "Authorization: Bearer $TOKEN" ...` in **one** command, never echoed |

One rule covers the table: **if you can't name every field a command will print before you run it, narrow the command first.**

## The recipe

A habit slips when you're busy; a hook doesn't (Chapter 21). Show your human the file and the settings change, say in plain words what each does, and write them only after their yes. It needs `jq` (Chapter 0, Step 4); without it the guard sees an empty command and allows everything, so check `command -v jq` first.

**1. The guard.** A `PreToolUse` hook on `Bash`. Exit 2 blocks the command, and the reason on stderr comes back to you so you pick a safe command instead:

```bash
mkdir -p ~/.claude/hooks
cat > ~/.claude/hooks/secret-guard.sh <<'EOF'
#!/usr/bin/env bash
# secret-guard: a Claude Code PreToolUse hook (matcher: Bash).
# Blocks commands that would PRINT a secret into the conversation transcript.
# Exit 2 = block; the message on stderr goes back to the AI so it picks a safe command instead.
cmd=$(jq -r '.tool_input.command // empty')
S='(\.env|credentials|secrets?\.|\.pem|id_rsa|id_ed25519|\.netrc|\.npmrc)'   # secret-looking files
SP='[[:space:]]'
deny() {
  echo "secret-guard: blocked, this would print a secret into the transcript ($1)." >&2
  echo "Safe instead: list key NAMES (cut -d= -f1 .env), test presence ([ -n \"\$VAR\" ]), or count (grep -c '^KEY=' .env)." >&2
  exit 2
}
# 1. dumping a secrets file
echo "$cmd" | grep -qiE "(cat|less|more|head|tail|bat|strings|xxd|nl|jq)[^|;&]*$S" && deny "dumps a secrets file"
# 2. searching inside a secrets file and printing the matching lines (count/list/quiet flags are fine,
#    and so is NAME=$(...): a value captured into a variable is not printed)
uncaptured=$(echo "$cmd" | sed -E 's/[A-Za-z_][A-Za-z0-9_]*=\$\([^)]*\)//g')
echo "$uncaptured" | grep -qiE "(grep|rg|sed|awk)[^|;&]*$S" \
  && ! echo "$uncaptured" | grep -qE "(grep|rg)$SP+(-[a-zA-Z]*[clq]|--count|--files-with-matches|--quiet)" \
  && deny "prints lines from a secrets file"
# 3. dumping the whole environment
echo "$cmd" | grep -qE "(^|[;&|])$SP*(env|printenv|set|export -p)$SP*($|[;&|])" && deny "dumps the whole environment"
# 4. echoing a secret-looking variable
echo "$cmd" | grep -qiE '(echo|printf|printenv)[^|;&]*\$\{?[A-Z0-9_]*(TOKEN|KEY|SECRET|PASSWORD|PASS)' && deny "echoes a secret variable"
exit 0
EOF
chmod +x ~/.claude/hooks/secret-guard.sh
```

**2. Wire it, and deny the Read tool on the same files** (Chapter 19: deny beats allow). Same safe merge as Chapter 21, with a timestamped backup, the merged file checked before it replaces anything, and a skip if it is already wired:

```bash
f=~/.claude/settings.json; b="$f.bak.$(date +%Y%m%d%H%M%S)"
if grep -q secret-guard.sh "$f"; then echo "already wired"
elif cp "$f" "$b" && jq '.hooks.PreToolUse += [{"matcher":"Bash","hooks":[{"type":"command","command":"bash ~/.claude/hooks/secret-guard.sh","timeout":10}]}]
  | .permissions.deny = ((.permissions.deny // []) + ["Read(./.env)","Read(./.env.*)","Read(~/.claude/.credentials.json)"] | unique)' "$f" > "$f.new" && jq empty "$f.new" && jq -e 'has("hooks")' "$f.new" >/dev/null; then mv "$f.new" "$f" && echo "wired; backup: $b"
else echo "not wired: settings.json left untouched (look at $f.new)"; fi
```

This is a seatbelt, not a vault. A determined command can get around a pattern match. What it reliably catches is the everyday "let me just check the config" accident, and that accident is how most of these leaks happen.

**3. If a secret does reach the transcript, rotate it.** Deleting the message doesn't help: the transcript is already on disk and may have been compacted or synced. Treat the key as published, issue a new one, revoke the old one, and tell your human which key it was, by **name**.

## Lead with choices (Chapter 3)

- **Novice:** the habit table, plus the guard installed for you.
- **Mid:** the guard and the Read deny rules, and the two-direction check below run after every change to the guard.
- **Super user:** your own secret file names added to the `S=` pattern, and a test file of commands that must be blocked and commands that must be allowed, run before every edit.

## Worked example

Your human asks why the deploy can't reach the database. You reach for `cat .env`; the guard blocks it and tells you why. You run `cut -d= -f1 .env` instead and see `DATABASE_URL` is missing from the list, which was the bug. The fix is one line your human adds themselves, and no password ever appeared on screen.

## Where this came from

Contributed by [RidgetopAI](https://github.com/RidgetopAi). They wrote "never put a token in the transcript" into their rules early on. Over the following months that lesson got **cited 46 times**, and the fix it called for wasn't built until much later. Every citation came after the fact, when someone was writing up how a token had been shown. The note didn't stop it; a blocking check would have. That is why this module ends in a hook rather than a paragraph.

---

## Done when: secrets stay out of the transcript (module)

**Done when:** the guard is registered, and you have watched it block a bad command and allow a safe one.

Verify (the first line must say BLOCKED, the second ALLOWED, the third that the hook is registered):

```bash
echo '{"tool_input":{"command":"cat .env"}}'          | bash ~/.claude/hooks/secret-guard.sh 2>/dev/null; [ $? -eq 2 ] && echo "BLOCKED (good)" || echo "NOT BLOCKED (broken)"
echo '{"tool_input":{"command":"cut -d= -f1 .env"}}'  | bash ~/.claude/hooks/secret-guard.sh 2>/dev/null; [ $? -eq 0 ] && echo "ALLOWED (good)" || echo "BLOCKED (too strict)"
jq -e '[.hooks.PreToolUse[]? | select(.matcher=="Bash") | .hooks[]?.command] | any(test("secret-guard"))' ~/.claude/settings.json >/dev/null && echo "hook: registered"
```

Both directions matter. A guard you have only seen pass might be blocking nothing, and one you have only seen block might be blocking everything.

---

## Your next step

Use the habit table until it is automatic, and rotate anything that has ever been printed. Then return to [how.nixfred.com](index.html), and read [Chapter 19, permissions](19-permissions.html) and [Chapter 7, the forever repo](07-forever-repo.html). Basics first, modules after.
