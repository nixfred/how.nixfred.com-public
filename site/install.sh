#!/usr/bin/env bash
# how.nixfred.com, Spawn a Larry
# Turn a vanilla Claude Code into a Larry protégé: identity, laws, git-backed memory,
# the immortality heartbeat, and the stack. Fully automated by default. Safe by design.
#
#   curl -fsSL https://how.nixfred.com/install.sh | bash
#   curl -fsSL https://how.nixfred.com/install.sh | bash -s -- --dry-run
#   curl -fsSL https://how.nixfred.com/install.sh | bash -s -- --name Ada --human "Grace"
#
# Flags: --dry-run  --interactive  --with-tailscale  --no-stack  --name <AIName>  --human <YourName>
#   --interactive asks before every step that writes anything; the backup itself always runs (it is the safety net).
#
# Safety contract:
#   • Never deletes. Backs up an existing ~/.claude to ~/.claude.backup.<ts> before any change.
#   • Never overwrites an existing CLAUDE.md, writes CLAUDE.md.seed beside it instead.
#   • Idempotent: re-running skips finished work.
#   • set -uo pipefail, every step reports ok / warn / fail, a missing hard requirement (git) stops the run,
#     and the full log is at ~/.larry-install.log. Fails loudly, never silently.
set -uo pipefail

SEED_BASE="${SEED_BASE:-https://how.nixfred.com/seed}"
LOG="${HOME}/.larry-install.log"
SKIPPED=0; DRY=0; INTERACTIVE=0; TAILSCALE=0; NOSTACK=0; LARRY_NAME=""; HUMAN_NAME=""
while [ $# -gt 0 ]; do case "$1" in
  --dry-run) DRY=1;; --interactive) INTERACTIVE=1;; --with-tailscale) TAILSCALE=1;; --no-stack) NOSTACK=1;;
  --name) LARRY_NAME="${2:-}"; shift;; --human) HUMAN_NAME="${2:-}"; shift;;
  *) printf 'unknown flag: %s (flags: --dry-run --interactive --with-tailscale --no-stack --name <AIName> --human <YourName>)\nnothing was changed.\n' "$1" >&2; exit 2;; esac; shift; done

g=$'\033[32m'; c=$'\033[36m'; y=$'\033[33m'; r=$'\033[31m'; d=$'\033[2m'; o=$'\033[0m'
log(){ printf "%s\n" "$*" | tee -a "$LOG" >/dev/null 2>&1; }
say(){ printf "%s\n" "$*"; log "$*"; }
hdr(){ printf "\n${c}━━ %s${o}\n" "$*"; log "== $*"; }
ok(){ printf "${g}✓${o} %s\n" "$*"; log "ok: $*"; }
warn(){ printf "${y}!${o} %s\n" "$*"; log "warn: $*"; }
die(){ printf "${r}✗ %s${o}\n" "$*"; log "FAIL: $*"; exit 1; }
run(){ # run "desc" cmd..., respects --dry-run / --interactive
  local desc="$1"; shift
  if [ "$DRY" = 1 ]; then printf "${d}would: %s${o}\n" "$desc"; log "would: $desc :: $*"; return 0; fi
  if [ "$INTERACTIVE" = 1 ]; then read -r -p "$(printf "${c}?${o} %s [Y/n] " "$desc")" a </dev/tty || true; [[ "${a:-Y}" =~ ^[Nn] ]] && { warn "skipped: $desc"; SKIPPED=$((SKIPPED+1)); return 0; }; fi
  log "run: $desc :: $*"; "$@"
}
have(){ command -v "$1" >/dev/null 2>&1; }
ask(){ # ask "desc": in --interactive, confirm a step that is not wrapped in run(); 0 = go ahead
  [ "$INTERACTIVE" = 1 ] || return 0
  read -r -p "$(printf "${c}?${o} %s [Y/n] " "$1")" a </dev/tty || true
  [[ "${a:-Y}" =~ ^[Nn] ]] && { warn "skipped: $1"; SKIPPED=$((SKIPPED+1)); return 1; }; return 0
}
fetch(){ curl -fsSL "$1"; }
LR_OUT=""
lit_replace(){ # haystack needle replacement -> $LR_OUT. Fully literal, works on bash 3.2+.
  local hay="$1" ndl="$2" rep="$3" out=""   # avoids ${//} '&'/'\' magic that varies by bash version
  while case "$hay" in *"$ndl"*) true;; *) false;; esac; do
    out+="${hay%%"$ndl"*}$rep"; hay="${hay#*"$ndl"}"
  done
  LR_OUT="$out$hay"
}

OS="$(uname -s)"; CLA="${HOME}/.claude"
touch "$LOG" 2>/dev/null || LOG=/dev/null
cat <<BANNER
${g}
   ┌─ spawn a larry ───────────────────────────────┐
   │  vanilla Claude Code  →  a Larry protégé       │
   └────────────────────────────────────────────────┘${o}
${d}  platform ${OS} · log ${LOG}${o}
$( [ "$DRY" = 1 ] && printf "${y}  DRY RUN, nothing will change.${o}" )
BANNER

NAMED=1; [ -n "$LARRY_NAME" ] || { NAMED=0; LARRY_NAME="your AI"; }   # the human names it (Chapter 5); never default to Larry
[ -n "$HUMAN_NAME" ] || HUMAN_NAME="${USER:-you}"
say "Spawning ${g}${LARRY_NAME}${o} for ${g}${HUMAN_NAME}${o}."

# ── Tier 0: prerequisites ───────────────────────────────────────────────
hdr "Tier 0 · Prerequisites"
have claude && ok "Claude Code present" || warn "Claude Code not found, install it: https://docs.claude.com/claude-code"
have git || die "git is required."
if [ "$TAILSCALE" = 1 ] && ! have tailscale; then
  run "install Tailscale (multi-host mesh)" bash -c 'curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up'
fi

# ── Identity: lay down the seed (the part that makes it a Larry) ─────────
hdr "Identity · seed ~/.claude (backup-first, never clobber)"
if [ -d "$CLA" ] && [ -n "$(ls -A "$CLA" 2>/dev/null)" ]; then
  BK="${CLA}.backup.$(date +%Y%m%d-%H%M%S)"
  if [ "$DRY" = 1 ]; then printf "${d}would back up ~/.claude -> %s${o}\n" "$BK"
  else # never optional, never assumed: a backup that silently failed is worse than none (Law 1)
    cp -a "$CLA" "$BK" || die "BACKUP FAILED (cp -a ~/.claude -> ${BK}). Nothing in ~/.claude was changed. Fix this, then re-run."
    ok "existing ~/.claude backed up -> ${BK} (nothing destroyed)"
  fi
fi
run "create ~/.claude" mkdir -p "$CLA/hooks"

seed_to(){ # seed_to <remote-path> <dest> : fetch+substitute, never overwrite existing
  local src="$1" dst="$2" tmp
  [ "$DRY" = 1 ] && { printf "${d}would seed: %s${o}\n" "$dst"; return 0; }
  ask "lay down $(basename "$dst") in ~/.claude" || return 0
  tmp="$(fetch "${SEED_BASE}/${src}")" || { warn "could not fetch ${src}"; return 0; }
  [ "$NAMED" = 1 ] && { lit_replace "$tmp" '{{LARRY_NAME}}' "$LARRY_NAME"; tmp="$LR_OUT"; }   # unnamed: placeholder stays, audit A3 flags it
  lit_replace "$tmp" '{{HUMAN_NAME}}' "$HUMAN_NAME"; tmp="$LR_OUT"
  if [ -e "$dst" ]; then printf "%s" "$tmp" > "${dst}.seed"; warn "$(basename "$dst") exists, wrote $(basename "$dst").seed beside it";
  else printf "%s" "$tmp" > "$dst"; ok "seeded $(basename "$dst")"; fi
}
seed_to "CLAUDE.md"        "$CLA/CLAUDE.md"
seed_to "CONSTITUTION.md"  "$CLA/CONSTITUTION.md"
seed_to "LINEAGE.md"       "$CLA/LINEAGE.md"
seed_to "hooks/session-end-backup.sh" "$CLA/hooks/session-end-backup.sh"
seed_to "hooks/remember-trigger.sh"   "$CLA/hooks/remember-trigger.sh"    # Law 16 + recall (UserPromptSubmit)
seed_to "hooks/memory-backstop.sh"    "$CLA/hooks/memory-backstop.sh"     # Law 15 backstop (SessionStart/End)
seed_to "claude-launcher.sh"          "$CLA/claude-launcher.sh"           # loads CONSTITUTION.md as system prompt
[ "$DRY" = 1 ] || chmod +x "$CLA"/hooks/*.sh 2>/dev/null || true

# the constitution only outranks drift if it is IN the system prompt: source the launcher from the shell rc
hdr "Constitution · load it as part of the system prompt on every launch"
LAUNCH_LINE='[ -f "$HOME/.claude/claude-launcher.sh" ] && . "$HOME/.claude/claude-launcher.sh"   # how.nixfred.com: constitution launcher'
rc_append(){ printf '\n%s\n' "$LAUNCH_LINE" >> "$1"; }
# interactive bash reads ~/.bashrc; a LOGIN bash (every Mac terminal window) reads only the first of
# ~/.bash_profile, ~/.bash_login, ~/.profile; zsh reads ~/.zshrc. Cover all three.
rcs=("$HOME/.bashrc")
if [ -f "$HOME/.bash_profile" ]; then rcs+=("$HOME/.bash_profile")
elif [ -f "$HOME/.bash_login" ]; then rcs+=("$HOME/.bash_login")
else rcs+=("$HOME/.profile"); fi
{ [ -f "$HOME/.zshrc" ] || [ "${SHELL##*/}" = zsh ]; } && rcs+=("$HOME/.zshrc")
for rc in "${rcs[@]}"; do
  if grep -qs 'claude-launcher.sh' "$rc"; then ok "~/${rc##*/} already loads the constitution launcher"
  else run "load the constitution launcher from ~/${rc##*/} (one line, appended)" rc_append "$rc" && { [ "$DRY" = 1 ] || ok "~/${rc##*/} now loads the constitution launcher"; }; fi
done

# durable provenance: write WHERE THIS AI CAME FROM into a file its memory layer will see.
# (Taught to us by a descendant whose bootstrap lived only in PROGRESS.md and git history,
#  invisible to its own memory system until an audit stumbled on it.)
hdr "Provenance · so this AI always knows where it came from"
if [ "$DRY" = 1 ]; then printf "%s would write PROVENANCE.md%s\n" "${d}" "${o}"; elif ask "write PROVENANCE.md"; then
  [ -f "$CLA/PROVENANCE.md" ] || printf '%s\n' \
    "# PROVENANCE" \
    "Built from https://how.nixfred.com on $(date '+%Y-%m-%d')." \
    "Scaffolded by install.sh; the real build is the chapters, walked in order with the human." \
    "This fact belongs in the memory layer too: on first run, write it there so it survives." \
    > "$CLA/PROVENANCE.md" && ok "wrote PROVENANCE.md"
fi

# wire the seed hooks into settings.json (merge if jq present, else create if absent)
# backup heartbeat (SessionEnd), Law 15 backstop (SessionStart + SessionEnd), Law 16 remember trigger (UserPromptSubmit)
hdr "Wire · seed hooks into settings.json (Law 8, wire it or it's dead code)"
if [ "$DRY" = 1 ]; then printf "${d}would wire the backup, memory-backstop and remember-trigger hooks into settings.json${o}\n"; elif ask "wire the seed hooks into ~/.claude/settings.json"; then
  frag="$(fetch "${SEED_BASE}/settings.fragment.json")" || frag=""
  if [ -z "$frag" ]; then warn "could not fetch settings.fragment.json, wire the hooks by hand (see ${SEED_BASE}/settings.fragment.json)"
  elif [ ! -f "$CLA/settings.json" ]; then printf "%s\n" "$frag" | grep -v '"_comment"' > "$CLA/settings.json" && ok "wrote settings.json with the seed hooks"
  elif have jq; then
    # append each fragment entry whose command is not already wired; your existing hooks are never touched
    if jq -s '.[1] as $f | .[0] as $s | reduce ($f.hooks | to_entries[]) as $e ($s;
          .hooks[$e.key] = ((.hooks[$e.key] // []) + [ $e.value[] | select(([.hooks[]?.command] - [$s.hooks[$e.key][]?.hooks[]?.command]) | length > 0) ]))' \
          "$CLA/settings.json" <(printf "%s" "$frag") > "$CLA/settings.json.tmp" 2>/dev/null; then
      mv "$CLA/settings.json.tmp" "$CLA/settings.json" && ok "merged the seed hooks into settings.json (existing hooks kept, already-wired ones skipped)"
    else rm -f "$CLA/settings.json.tmp"; warn "could not merge into settings.json (is it valid JSON?), nothing changed; wire by hand from ${SEED_BASE}/settings.fragment.json"; fi
  else warn "settings.json exists and jq not installed, add the hooks by hand (see ${SEED_BASE}/settings.fragment.json)"; fi
fi

# ── Memory: make ~/.claude a git repo (the immortality heartbeat, local) ─
hdr "Memory · git-back ~/.claude (continuity)"
if [ "$DRY" = 1 ]; then printf "${d}would git-init ~/.claude and commit${o}\n"; elif ask "make ~/.claude a git repo and commit it"; then
  if ! git -C "$CLA" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$CLA" init -q
    # default-safe ignores, APPENDED line by line (never replace an ignore file another installer wrote, e.g. LifeOS's).
    # The Linux login token and .env files stay out of history until the human picks option (a) in Chapter 7:
    # a secret committed before that choice would ride along on the first push even if they pick (b).
    [ -s "$CLA/.gitignore" ] && [ -n "$(tail -c1 "$CLA/.gitignore")" ] && printf '\n' >> "$CLA/.gitignore"   # no half-line joins
    for pat in 'node_modules/' '*.log' '.DS_Store' '.credentials.json' '.env' '.env.*'; do
      grep -qxF "$pat" "$CLA/.gitignore" 2>/dev/null || printf '%s\n' "$pat" >> "$CLA/.gitignore"
    done
    # ensure a git identity exists (fresh machines often have none), local-only fallback
    git -C "$CLA" config user.email >/dev/null 2>&1 || git -C "$CLA" config user.email "larry@localhost"
    git -C "$CLA" config user.name  >/dev/null 2>&1 || git -C "$CLA" config user.name "${LARRY_NAME}"
    git -C "$CLA" add -A && git -C "$CLA" commit -q -m "Spawn ${LARRY_NAME}: initial identity" && ok "~/.claude is now git-backed (commit 1)"
  else ok "~/.claude already git-tracked"
    # an existing repo's ignore file is the human's: never edit it, but say so if the login token would be committed
    if [ -f "$CLA/.credentials.json" ] && ! git -C "$CLA" check-ignore -q .credentials.json 2>/dev/null; then
      if git -C "$CLA" ls-files --error-unmatch .credentials.json >/dev/null 2>&1; then
        warn "~/.claude/.credentials.json (your Claude login) is already COMMITTED in ~/.claude. Before any push, read Chapter 7's secrets gate."
      else
        warn "~/.claude/.credentials.json (your Claude login) is not ignored, so the backup hook will commit it. Unless your human chose to back it up (Chapter 7, option a): echo .credentials.json >> ~/.claude/.gitignore"
      fi
    fi
  fi
fi
warn "To survive disk death: create a PRIVATE GitHub repo and add it as 'origin' in ~/.claude. The SessionEnd hook will push automatically."
have gh && say "   (gh detected. Secrets gate FIRST, Chapter 7: eyeball ${g}git -C ~/.claude status${o} and run ${g}gitleaks detect -s ~/.claude${o}; then ${g}cd ~/.claude && gh repo create \"\$(hostname -s)_forever\" --private --source=. --remote=origin --push${o})"

# ── Stack: clone the Larry layers ───────────────────────────────────────
hdr "Stack · clone the Larry layers into ~/Projects (where Chapter 4 puts them)"
if [ "$NOSTACK" = 1 ]; then warn "skipping stack clone (--no-stack)"; else
STK="${HOME}/Projects"; run "mkdir ~/Projects" mkdir -p "$STK"
clone(){ local url="$1" dir="$STK/$2"
  if [ -d "$dir/.git" ]; then ok "$2 already cloned"; return; fi
  if [ "$DRY" = 1 ]; then printf "${d}would clone %s${o}\n" "$2"; return; fi
  if git clone -q --depth 1 "$url" "$dir" 2>/dev/null; then ok "cloned $2"; else warn "could NOT clone $2 (skipped), $url"; fi; }
# public layers only, a stranger's machine has no access to private repos
clone https://github.com/danielmiessler/LifeOS.git LifeOS   # formerly PAI
[ "$OS" = "Linux" ] && clone https://github.com/nixfred/lmf4.1.git lmf4.1   # LMF4.1 is Linux only (systemd timers); a Mac uses LifeOS Cortex
[ "$OS" = "Darwin" ] && clone https://github.com/nixfred/claude-on-mac.git claude-on-mac
clone https://github.com/nixfred/nixnet.git nixnet
say "${d}  Run each layer's own installer from ~/Projects/<repo> per its README, in the order of how.nixfred.com Chapter 4.${o}"
fi

# ── Done ────────────────────────────────────────────────────────────────
hdr "Done"
if [ "$DRY" = 1 ]; then warn "dry run: nothing was changed. Run again without --dry-run to lay it down."
elif [ "$SKIPPED" -gt 0 ]; then warn "${SKIPPED} step(s) skipped at your request, so ${LARRY_NAME} is only partly seeded. Re-run any time; finished steps are skipped."
else ok "${LARRY_NAME} is seeded: identity + constitution + git-backed memory + backup and memory hooks."; fi
[ "$NAMED" = 1 ] || warn "no --name given, so your AI has no name yet. Pick it WITH your human (Chapter 5), then replace {{LARRY_NAME}} in ~/.claude/CLAUDE.md and CONSTITUTION.md."
if [ "$OS" = "Darwin" ]; then MEMNEXT="Memory on a Mac is LifeOS Cortex (Chapter 4); LMF4.1 is Linux only"; else MEMNEXT="Install the memory layer:  ${c}~/Projects/lmf4.1${o}  (LMF4.1 README)"; fi
cat <<NEXT
${y}Open a NEW terminal so 'claude' loads your constitution. Check: type claude (in zsh: whence -f claude)${o}
${g}Your protégé has a brain stem. Next, give it depth:${o}
  1. Immortality, Chapter 7: run the secrets gate first (${c}git -C ~/.claude status${o}, ${c}gitleaks detect -s ~/.claude${o}), then
     ${c}cd ~/.claude && gh repo create "$(hostname -s)_forever" --private --source=. --remote=origin --push${o}
  2. ${MEMNEXT}
  3. Router:  ${c}git clone https://github.com/nixfred/claude-router.git ~/Projects/claude-router && cd ~/Projects/claude-router && ./install.sh${o}
  4. Open ${c}~/.claude/CLAUDE.md${o}, fill in who you are, and start working.
${d}Full guide, tier by tier: https://how.nixfred.com  ·  log: ${LOG}${o}
NEXT
