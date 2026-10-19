#!/usr/bin/env bash
# how.nixfred.com seed hook, UserPromptSubmit: makes Constitution Laws 2, 14 and 16 deterministic.
#
#  - Your human says "remember X" / "save this" / "make a note" / "don't forget": this injects an order to
#    write the memory THIS turn (Law 16), plus the existing notes it should be linked to (enrich, don't file flat).
#  - Your human asks about the past ("remember when", "did we ever", "last time we"): this injects a recall
#    order (Laws 2 + 14) plus the local memory notes that match, so you search before you answer.
#
# Ported from Larry's own RememberTrigger hook (the OG of this line runs the TypeScript original).
# Silent on normal turns. Read-only over memory. Always exits 0 (never blocks a prompt). bash 3.2 safe.
# Wire it in ~/.claude/settings.json under "UserPromptSubmit" (the seed settings.fragment.json does).

raw="$(cat 2>/dev/null || true)"
[ -n "$raw" ] || exit 0
if command -v jq >/dev/null 2>&1; then
  prompt="$(printf '%s' "$raw" | jq -r '.prompt // .user_prompt // empty' 2>/dev/null)"
else
  prompt="$raw"   # no jq: match against the raw JSON, which still contains the prompt text
fi
[ -n "$prompt" ] || exit 0

# automated notifications and command echoes are never your human giving an order
case "$prompt" in *"<task-notification>"*|*"NOT a message from the user"*|*"<local-command-caveat>"*|*"[SYSTEM NOTIFICATION"*) exit 0;; esac

low="$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]' | tr '\n' ' ')"
B='(^|[^a-z])'; E='([^a-z]|$)'
RECALL="${B}(remember when|(did|have) we (ever|already)|what did we (decide|do|say|build|try)|the thing with|last time (we|you)|we (talked|spoke) about)${E}"
RETAIN="${B}(remember|don.?t forget|do not forget|make a note|note this|save this|jot (this |that )?down|keep track of|hang onto|hold onto)${E}"
SESSION="${B}(this (whole )?(session|conversation|chat)|what we (did|built|talked about)|everything (we|tonight)|all of this)${E}"

# memory notes to search: Claude Code's typed auto memory, plus LifeOS's memory tree if present
mem_files() {
  find "$HOME/.claude/projects" -path '*/memory/*.md' ! -name MEMORY.md -type f 2>/dev/null
  [ -d "$HOME/.claude/LIFEOS/MEMORY" ] && find "$HOME/.claude/LIFEOS/MEMORY" -maxdepth 3 -name '*.md' -type f 2>/dev/null
}
STOP=' the and for that this with you your from about have will would what when where which there their they them just dont remember forget save note make keep please also into than then some more want need thing things '
keywords() { # up to 6 distinct words of 4+ letters, minus filler
  printf '%s' "$1" | tr -cs 'a-z0-9' '\n' | awk 'length>=4' | while read -r w; do
    case "$STOP" in *" $w "*) ;; *) echo "$w";; esac
  done | awk '!seen[$0]++' | head -6
}
related() { # $1 = text, $2 = minimum shared keywords. Prints "  - note: description" for the top 5 notes.
  local text="$1" min="$2" words files
  words="$(keywords "$text")"; [ -n "$words" ] || return 0
  files="$(mem_files)"; [ -n "$files" ] || return 0
  printf '%s\n' "$words" | while read -r w; do
    printf '%s\n' "$files" | tr '\n' '\0' | xargs -0 grep -lis -- "$w" 2>/dev/null
  done | sort | uniq -c | sort -rn | awk -v m="$min" '$1>=m {print $2}' | head -5 | while read -r f; do
    d="$(grep -m1 -E '^description:' "$f" 2>/dev/null | sed -E 's/^description:[[:space:]]*//; s/^["'"'"']//; s/["'"'"']$//' | cut -c1-110)"
    printf '  - %s: %s\n' "$(basename "$f" .md)" "${d:-(no description)}"
  done
}

if printf '%s' "$low" | grep -qiE "$RECALL"; then
  hits="$(related "$low" 2)"
  cat <<EOF
RECALL TRIGGER (Constitution Laws 2 and 14): your human is referencing past work. Search BEFORE you answer;
never ask them to repeat what your record already holds.
${hits:+Local memory notes that match:
$hits
}If these do not answer it, run the full recall ritual (Law 14: CHANGELOG, commit trailers, milestone tags,
git notes, your memory archive) and cite the layer and anchor you found it in.
EOF
  exit 0
fi

if printf '%s' "$low" | grep -qiE "$RETAIN"; then
  topic="$(printf '%s' "$low" | sed -E 's/.*(remember( that)?|don.?t forget|do not forget|make a note( of)?|note this|save this|jot (this |that )?down|keep track of|hang onto|hold onto)[[:space:]:,]*//' | cut -c1-120)"
  hits="$(related "$topic" 2)"
  scope=""
  printf '%s' "$low" | grep -qiE "$SESSION" && scope="SCOPE: your human means the whole session. Also checkpoint the session (a dated summary of what was done and decided), not just one fact."
  cat <<EOF
LAW 16, EXPLICIT MEMORY ORDER: your human used retain language${topic:+ ("$topic")}. This is a direct order, not a comment.
Obey THIS turn:
  1. Write or UPDATE the memory note (one fact per note, typed, with a one-line description).
  2. Add or update its line in your memory index.
  3. Confirm in ONE line what you saved and where.
${hits:+Related notes already on file (link the new one to these instead of duplicating):
$hits
}${scope:+$scope
}Enrich, don't just file: surface at least one connection your human did not draw (a shared person, a date, "this is the third...").
EOF
fi
exit 0
