// Shared command classifiers for the guided-install tools (used at index time by scripts/ask-index.ts and at
// request time by ask/install.js and ask/core.js). Pure functions, no I/O.

// A line that runs Homebrew or another Mac-only tool (brew at a command position, not inside a quoted hint).
const bare = l => String(l).replace(/'[^']*'/g, "''").replace(/"([^"]*)"/g, (_, c) => '"' + (c.match(/\$\([^)]*\)/g) || []).join(" ") + '"');
export const MAC_LINE = /(^|[;&|(`]\s*|\bsudo\s+|\$\(\s*)(brew|osascript|open\s+-a|defaults\s+write|launchctl|pbcopy|pbpaste|mdfind|softwareupdate|xcode-select)\b|~\/Library\//;
export const LINUX_LINE = /(^|[;&|(`]\s*|\bsudo\s+)(apt|apt-get|dnf|yum|pacman|zypper|systemctl|journalctl|snap)\b/;
export const isMacLine = l => MAC_LINE.test(bare(l).trim());
export const isLinuxLine = l => LINUX_LINE.test(bare(l).trim());

// Labels: the prose line or heading right above a block, e.g. "**Mac:**", "On Linux (apt):".
export function osOfLabel(label) {
  const s = String(label || "").toLowerCase();
  const mac = /\b(mac|macos|macbook|osx|homebrew|brew)\b/.test(s), lin = /\b(linux|ubuntu|debian|arch|fedora|omarchy|apt|apt-get|pacman|dnf)\b/.test(s);
  return mac && !lin ? "mac" : lin && !mac ? "linux" : "any";
}
// Whole block is clearly one OS by its content (every runnable line is brew / every runnable line is apt...).
export function osOfCode(code) {
  const ls = logicalLines(code).filter(l => l.trim() && !l.trim().startsWith("#"));
  if (!ls.length) return "any";
  if (ls.every(isMacLine)) return "mac";
  if (ls.every(isLinuxLine)) return "linux";
  return "any";
}
// Join backslash continuations so a multi-line command is judged as one.
export function logicalLines(code) {
  const out = []; let cur = "";
  for (const l of String(code).split("\n")) { if (/\\\s*$/.test(l)) { cur += l + "\n"; continue; } out.push(cur + l); cur = ""; }
  if (cur) out.push(cur.replace(/\n$/, ""));
  return out;
}

// ---- read-only verification ----
// Not a command at all: comments, ASCII diagrams, numbered list lines, table rows, prose.
export const notCommand = t => !t || /^#/.test(t) || /[←→↓↑│├└┌┐┘┬┴┼─═▶◀]/.test(t) || /^\d+[.)]\s/.test(t) || /^[-*|>]\s/.test(t) || /^[A-Z][a-z]+(\s+[a-z]+){3,}[.:]?$/.test(t);
const HARMLESS_REDIR = /\s*(\d?>|&>)\s*\/dev\/null|\s*\d>&\d/g;
const ALLOW = [
  /^command -v [\w.+-]+( [\w.+-]+)*$/, /^(which|type)( -[a-z])? [\w.+-]+( [\w.+-]+)*$/,
  /^test !? ?-[a-zA-Z] \S+$/, /^\[\[? !? ?-[a-zA-Z] \S+ \]\]?$/,
  /^(ls|cat|head|tail|wc|sort|uniq|cut|tr|grep|rg|stat|file|readlink|realpath|basename|dirname|du|df|sha256sum|shasum|diff|cmp|column)( .*)?$/,
  /^git( -C \S+)? (status|log|remote -v|remote get-url \S+|rev-parse|show|diff|ls-files|branch --show-current|config --get \S+|ls-remote)\b.*$/,
  /^claude (mcp list|mcp get \S+|--version|-v)$/,
  /^[\w.+-]+ (--version|version)$/,
  /^(tailscale (status|ip|version)|gh auth status|gh repo view( .*)?|gh api user|ollama list|crontab -l|systemctl (status|is-active|is-enabled) \S+|systemctl --user (status|is-active) \S+)( .*)?$/,
  /^jq( -[a-zA-Z]+)*( '[^']*'| "[^"]*"| \S+)+$/,
  /^(echo|printf)( .*)?$/,
  /^(uname( -[a-z]+)?|whoami|id|hostname|date|pwd|printenv( \w+)?)$/,
];
// Anything that changes the machine, its accounts, or a file.
export const WRITE = /\b(rm|mv|cp|mkdir|rmdir|chmod|chown|ln|touch|tee|dd|install|kill|pkill|reboot|shutdown|chsh|truncate|nano|vim?|code)\b|\bsed\s+-i|\bgit\s+(-C\s+\S+\s+)?(add|commit|push|pull|reset|checkout|switch|clone|init|rm|mv|merge|rebase|stash|tag|fetch|config\s+(?!--get))|\b(apt|apt-get|dnf|pacman|yum|brew|npm|pnpm|bun|pip3?|pipx|cargo|go|snap|uv)\s+(install|add|remove|uninstall|upgrade|update|i|-S\w*|bundle|run|x)\b|\|\s*(sudo\s+)?(ba|z)?sh(\s+-[a-z]+)*\s*($|[;&|)])|\bcurl\b|\bwget\b|\bsystemctl\s+(--user\s+)?(start|stop|restart|enable|disable|daemon-reload)|\bclaude\s+(mcp\s+(add|remove)|update|install)|\btailscale\s+(up|down|login|logout|set)|\bgh\s+(repo\s+(create|delete|clone)|auth\s+(login|logout))|\bsource\b|^\.\s|\bexport\b|\bcrontab\s+(?!-l)|\bsudo\b|\beval\b|\bexec\b/;
// mask quoted text so a "|" or ">" inside a jq program or an echo hint is not read as shell syntax
const mask = t => t.replace(/'[^']*'/g, "'Q'").replace(/"[^"]*"/g, m => /\$\(|`/.test(m) ? m : '"Q"');
const strip = l => String(l).replace(/^\s*\$\s+/, "").replace(/\s+#\s.*$/, "").trim();
// strict: only the allowlisted read-only forms (used when the page has no Verify: block)
// names after a lookup ("command -v jq git curl") are arguments, not commands: hide them from WRITE
const LOOKUP = /(^|[;&|(]\s*)(command -v|which|type(?: -[a-z])?)((?:\s+[\w.+-]+)+)/g;
const unlook = (r) => r.replace(LOOKUP, (_, p, c, a) => `${p}${c} ${a.trim().split(/\s+/).map(() => "x").join(" ")}`);
export function isReadOnly(line) {
  const t = strip(line); if (notCommand(t) || /\n/.test(t)) return false;
  const r = mask(t).replace(HARMLESS_REDIR, "");
  if (/[<>]|\$\(|`/.test(r) || WRITE.test(unlook(r))) return false;
  const segs = r.split(/\s*(?:&&|\|\||;|\|)\s*/).filter(Boolean);
  return segs.length > 0 && segs.every(s => ALLOW.some(rx => rx.test(s)));
}
// lenient: lines from an explicit "Verify:" block, kept unless they look like a write
export function isSafeVerify(line) {
  const t = strip(line); if (notCommand(t)) return false;
  if (isReadOnly(t)) return true;
  const r = mask(t).replace(HARMLESS_REDIR, "");
  return !/[>]/.test(r) && !WRITE.test(unlook(r));
}

// Inline `code` in prose that installs something ("install with `curl -fsSL https://bun.sh/install | bash`").
export const INSTALL_INLINE = /^(?:sudo\s+)?(?:(?:curl|wget)\s.+\|\s*(?:sudo\s+)?(?:ba|z)?sh\b|(?:brew|apt|apt-get|dnf|pacman|yum|snap|npm|pnpm|bun|pip3?|pipx|cargo|go|uv)\s+(?:install|add|-S)\s+\S)/;

// Shell-ish commands an answer might contain (used to verify ask_larry output against its passages).
export const CMD_START = /^(?:\$\s+)?(?:sudo\s+)?(?:apt|apt-get|dnf|yum|pacman|zypper|brew|snap|flatpak|systemctl|journalctl|service|curl|wget|npm|npx|pnpm|pip3?|pipx|bun|bunx|git|gh|claude|tailscale|ssh|scp|chmod|chown|mkdir|rm|mv|cp|ln|cd|echo|export|source|sed|jq|cat|ls|sh|bash|zsh|chsh|ollama|docker|make|cargo|go|uv|mem|gup|kill|pkill|touch|tee|grep|fabric|nano|vim|code|open|defaults|launchctl|crontab|python3?|node)\s+\S/;
export const normCmd = s => String(s).replace(/^\s*\$\s+/, "").replace(/\s+/g, " ").trim();

// ---- page markdown -> command blocks, Verify blocks and inline install mentions (index time) ----
const SHELL_LANG = /^(bash|sh|shell|zsh|console|)$/;
const VERIFY_LINE = /^\s*[*_]*\s*verify(\s+it)?\s*[*_]*\s*:/i;       // "Verify:", "**Verify:**", "Verify it: ..."
export function parseBlocks(md) {
  const cmds = [], verify = [], mentions = []; let verifyDropped = 0;
  const lines = md.split("\n"); let head = "", label = "", headVerify = false, pendingVerify = false, i = 0;
  while (i < lines.length) {
    const l = lines[i];
    const h = l.match(/^#{1,4}\s+(.+)/); if (h) { head = h[1].trim(); label = ""; headVerify = /^verify\b/i.test(head); pendingVerify = false; i++; continue; }
    const f = l.match(/^\s*```(\w*)/);
    if (f) {
      const body = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i++;
      const lang = f[1] || ""; const code = body.join("\n").trim(); const isVerify = pendingVerify || headVerify; pendingVerify = false;
      if (!code || !SHELL_LANG.test(lang)) continue;                    // commands only, not prose/json/diagram samples
      const lo = osOfLabel(label + " " + (osOfLabel(label) === "any" ? head : "")); const os = lo !== "any" ? lo : osOfCode(code);
      if (isVerify) { for (const x of logicalLines(code)) { if (isSafeVerify(x)) verify.push({ os: os === "any" ? (isMacLine(x) ? "mac" : isLinuxLine(x) ? "linux" : "any") : os, code: x.trim(), under: head }); else if (x.trim() && !x.trim().startsWith("#")) verifyDropped++; } continue; }
      cmds.push({ os, lang: lang || "bash", code: code.slice(0, 2000), under: head });
      continue;
    }
    if (l.trim()) {
      label = l.trim().slice(0, 160);
      pendingVerify = VERIFY_LINE.test(l);
      for (const m of l.matchAll(/`([^`\n]{6,200})`/g)) {
        const c = m[1].trim(); if (!INSTALL_INLINE.test(c)) continue;
        const ctx = l.slice(Math.max(0, m.index - 60), m.index);
        const os = isMacLine(c) ? "mac" : isLinuxLine(c) ? "linux" : osOfLabel(ctx.split(/[;.]/).pop() || "");
        if (!mentions.some(x => x.code === c)) mentions.push({ os, code: c, under: head });
      }
    }
    i++;
  }
  return { cmds: cmds.slice(0, 40), verify, mentions, verifyDropped };
}
export function checksFrom(p) {
  if (p.verify.length || p.verifyDropped) return { checks: p.verify, source: p.verify.length ? "verify" : "none", dropped: p.verifyDropped };
  const checks = []; let dropped = 0;
  for (const c of p.cmds) for (const x of logicalLines(c.code)) {
    const t = x.replace(/\s+#\s.*$/, "").trim(); if (!t || t.startsWith("#")) continue;
    if (isReadOnly(t)) { if (!checks.some(k => k.code === t)) checks.push({ os: c.os !== "any" ? c.os : isMacLine(t) ? "mac" : isLinuxLine(t) ? "linux" : "any", code: t, under: c.under }); }
    else dropped++;
  }
  return { checks: checks.slice(0, 12), source: checks.length ? "allowlist" : "none", dropped };
}
