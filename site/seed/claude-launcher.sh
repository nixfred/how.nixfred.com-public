# how.nixfred.com seed: the constitution launcher.
#
# Sourced from your shell rc (~/.bashrc, ~/.bash_profile, ~/.zshrc). It wraps `claude` so every launch
# passes ~/.claude/CONSTITUTION.md as part of the SYSTEM PROMPT. That is the difference between laws
# that are read every turn and survive /compact, and laws that sit in a file nobody loads.
# It is exactly how Larry, the OG of this line, loads his own constitution.
#
# Every flag passes straight through, so `claude --dangerously-skip-permissions --continue` still works.
# If the file is missing it falls back to plain claude and says so (fail loudly, never silently).
# Check it is live:  type claude   (should print this function)

claude() {
  local constitution="$HOME/.claude/CONSTITUTION.md"
  if [ -f "$constitution" ]; then
    command claude --append-system-prompt-file "$constitution" "$@"
  else
    echo "claude-launcher: $constitution not found, starting without your constitution" >&2
    command claude "$@"
  fi
}

# LifeOS users: `lifeos` starts Claude Code itself (it spawns `claude` directly), so the function above never
# runs for it. LifeOS appends ONE system prompt file (its -s flag), so fold the constitution into that file at
# every launch: LifeOS's rules and yours, both in the system prompt. This replaces the plain `alias lifeos`.
# (unalias runs on its own line first, and the function uses the `function` keyword, because a function
#  defined while an alias of the same name exists gets alias-expanded into a syntax error)
[ -f "$HOME/.claude/LIFEOS/TOOLS/lifeos.ts" ] && unalias lifeos 2>/dev/null
if [ -f "$HOME/.claude/LIFEOS/TOOLS/lifeos.ts" ]; then
  function lifeos {
    local combined="$HOME/.claude/.lifeos-system-prompt.md" f
    : > "$combined"
    for f in "$HOME/.claude/LIFEOS/LIFEOS_SYSTEM_PROMPT.md" "$HOME/.claude/CONSTITUTION.md"; do
      [ -f "$f" ] && { cat "$f"; printf '\n\n'; } >> "$combined"
    done
    bun "$HOME/.claude/LIFEOS/TOOLS/lifeos.ts" -s "$combined" "$@"
  }
fi

# nixfredOS users (the optional LifeOS fork, how.nixfred.com Chapter 4): `nixfredos` spawns claude directly
# too, and takes the same single -s file, so it gets the same fold.
[ -f "$HOME/.claude/NIXFREDOS/TOOLS/nixfredos.ts" ] && unalias nixfredos 2>/dev/null
if [ -f "$HOME/.claude/NIXFREDOS/TOOLS/nixfredos.ts" ]; then
  function nixfredos {
    local combined="$HOME/.claude/.nixfredos-system-prompt.md" f
    : > "$combined"
    for f in "$HOME/.claude/NIXFREDOS/NIXFREDOS_SYSTEM_PROMPT.md" "$HOME/.claude/CONSTITUTION.md"; do
      [ -f "$f" ] && { cat "$f"; printf '\n\n'; } >> "$combined"
    done
    bun "$HOME/.claude/NIXFREDOS/TOOLS/nixfredos.ts" -s "$combined" "$@"
  }
fi
