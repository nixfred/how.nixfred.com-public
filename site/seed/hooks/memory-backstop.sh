#!/usr/bin/env bash
# how.nixfred.com seed hook: the backstop for Constitution Law 15 (persist magnitude the same turn).
#
#   memory-backstop.sh start   (SessionStart)  surfaces last session's miss, once, then marks this session's start
#   memory-backstop.sh end     (SessionEnd)    scans the transcript for magnitude signals (a new person or AI,
#                                              a life change, a standing rule, a system shipped or killed, a status
#                                              shift); if any fired and NO memory note changed this session, it
#                                              leaves a flag that the next session start raises.
#
# A hook cannot judge nuance, but it can force the check. Heuristic on purpose: a false alarm costs one
# reminder line, a missed fact costs your human repeating themselves. Ported from Larry's own
# MagnitudeMemoryCheck + MagnitudePendingSurface hooks. Fail-open, always exits 0. bash 3.2 safe.

mode="${1:-}"
STATE="$HOME/.claude/state"; FLAG="$STATE/magnitude-pending.txt"
mkdir -p "$STATE" 2>/dev/null || exit 0
raw="$(cat 2>/dev/null || true)"
field() { printf '%s' "$raw" | sed -nE "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\1/p" | head -1; }
sid="$(field session_id)"; sid="${sid:-unknown}"
MARK="$STATE/session-start.$sid"

if [ "$mode" = start ]; then
  if [ -f "$FLAG" ]; then
    cat <<EOF
LAW 15 BACKSTOP: last session ($(head -1 "$FLAG")) showed signs of a lasting fact
($(sed -n 2p "$FLAG")) but no memory note changed. Review it now: if something of lasting weight
happened (a new person or AI, a life change, a standing rule, a system shipped or killed, a status shift),
write the note and its index line this turn. If nothing lasting happened, that is fine; this is a backstop,
not a command. This flag is now cleared.
EOF
    rm -f "$FLAG"
  fi
  touch "$MARK" 2>/dev/null
  find "$STATE" -name 'session-start.*' -mtime +7 -exec rm -f {} + 2>/dev/null   # our own stale markers only
  exit 0
fi

if [ "$mode" = end ]; then
  tp="$(field transcript_path)"
  [ -n "$tp" ] && [ -f "$tp" ] || { rm -f "$MARK"; exit 0; }
  labels=""
  hit() { grep -qiE "$2" "$tp" 2>/dev/null && labels="${labels:+$labels, }$1"; }
  hit "new person, AI or named system" '(came online|spun up|now live|peer ai|new (client|customer|teammate|colleague|hire)|named (it|him|her|them) )'
  hit "life change" '(new job|got the job|offer letter|resigned|laid off|diagnos|surgery|hospital|moved to|getting (married|divorced)|passed away|new baby)'
  hit "standing rule or settled decision" '(standing rule|from now on|going forward|new rule|settled|never again|don.?t relitigate)'
  hit "system shipped or killed" '(shipped|went live|deployed to prod|launched|deprecated|decommission|retired|sunset)'
  hit "status shift" '(now a (client|customer|collaborator|peer)|onboarded|came aboard|signed (the|a) (contract|deal))'
  if [ -n "$labels" ]; then
    touched=""   # no start marker means we cannot prove a note changed, so over-remind
    [ -f "$MARK" ] && touched="$( { find "$HOME/.claude/projects" -path '*/memory/*.md' -type f -newer "$MARK" 2>/dev/null
                  [ -d "$HOME/.claude/LIFEOS/MEMORY" ] && find "$HOME/.claude/LIFEOS/MEMORY" -name '*.md' -type f -newer "$MARK" 2>/dev/null
                  find "$HOME/.claude" -maxdepth 1 \( -name CLAUDE.md -o -name context.md \) -newer "$MARK" 2>/dev/null; } | head -1 )"
    [ -n "$touched" ] || printf '%s\n%s\n' "$(date '+%Y-%m-%d %H:%M')" "$labels" > "$FLAG"
  fi
  rm -f "$MARK"
fi
exit 0
