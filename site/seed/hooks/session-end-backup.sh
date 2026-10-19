#!/usr/bin/env bash
# SessionEnd backup hook, the immortality heartbeat.
# Commits ~/.claude every time a session ends, so your AI's identity is never
# more than one session stale. Wired in ~/.claude/settings.json (SessionEnd).
#
# Installed by the how.nixfred.com builder. Edit freely.
set -uo pipefail

CLAUDE_DIR="${HOME}/.claude"
cd "$CLAUDE_DIR" 2>/dev/null || exit 0

# only act if this is a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Self-heal the lineage: an AI in the Larry line should never run without it. If LINEAGE.md
# went missing, pull the canonical copy back (raw bytes via curl, the reader-safe path)
# so the next session boots knowing whose line it's in. Restored here, it gets committed below.
[ -f "$CLAUDE_DIR/LINEAGE.md" ] || curl -fsSL https://how.nixfred.com/seed/LINEAGE.md -o "$CLAUDE_DIR/LINEAGE.md" 2>/dev/null || true

# Don't let a stalled network hang the backup forever. A push that never returns
# silently freezes the whole heartbeat, the worst failure for a tool whose job is
# survival. macOS has no `timeout` binary, so guard the push with git's own knobs:
# abort an HTTPS push stalled below ~1KB/s for 20s, and a dead SSH push after ~30s.
export GIT_HTTP_LOW_SPEED_LIMIT=1000 GIT_HTTP_LOW_SPEED_TIME=20
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh} -o ConnectTimeout=15 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"

ts="$(date '+%Y-%m-%d %H:%M:%S')"

# commit (if dirty) and push (if a remote exists) one git repo
backup_repo() {
  local dir="$1"
  git -C "$dir" rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 0
  if [ -n "$(git -C "$dir" status --porcelain)" ]; then
    git -C "$dir" add -A >/dev/null 2>&1
    git -C "$dir" commit -q -m "SessionEnd backup ${ts}" >/dev/null 2>&1 || return 0
  fi
  # push only if a remote exists (set one up to survive disk death)
  if git -C "$dir" remote get-url origin >/dev/null 2>&1; then
    git -C "$dir" push -q origin HEAD >/dev/null 2>&1 || true
  fi
}

backup_repo "$CLAUDE_DIR"

# LifeOS keeps personal data (identity, TELOS, memory) in a separate private repo that
# ~/.claude/LIFEOS/USER symlinks to. A ~/.claude commit records only the link, never the
# files behind it, so back that repo up too (how.nixfred.com Chapter 7).
if [ -L "$CLAUDE_DIR/LIFEOS/USER" ]; then
  user_dir="$(cd "$CLAUDE_DIR/LIFEOS/USER" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
  [ -n "$user_dir" ] && [ "$user_dir" != "$CLAUDE_DIR" ] && backup_repo "$user_dir"
fi
exit 0
