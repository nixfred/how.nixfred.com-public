// ── Fleet glue for the shared Ask Larry panel (ask/panel.js), built into /embed.js by build.ts ──
// <script src="https://how.nixfred.com/embed.js" data-site="larry" defer></script>   (or /embed.js?site=larry)
// data-site picks the persona: nixfred, nixfredos, how, ladder or larry. The panel, its CSS and its phone behaviour
// are how.nixfred.com's own (one source); it lives in a shadow root so the host page's CSS can't reach it and it
// can't reach the host page's. Desktop starts minimized to the pill (data-open="true" opens it); phones get the
// docked ask bar. Talks to POST /api/fleet/ask on the origin this script came from. AL_CSS and AL_HTML are inlined
// by the build (ask/panel-build.js).
if (!window.__fleetAskLoaded) (function () {
  window.__fleetAskLoaded = true;
  var me = document.currentScript || [].slice.call(document.querySelectorAll('script[src*="/embed.js"]')).pop();
  if (!me) return;
  var src = new URL(me.src, location.href);
  var SITE = (me.getAttribute('data-site') || src.searchParams.get('site') || '').toLowerCase();
  var API = src.origin + '/api/fleet/ask';
  var P = {
    nixfred: { sub: "Fred's AI, answering from Fred's sites", hello: "Hi. I'm Larry, Fred's AI. Ask me what's where on Fred's sites, or how to build your own AI.", starters: ['Who is Fred?', 'What is nixfredOS?', 'How do I build my own AI?'] },
    nixfredos: { sub: 'answers from the sites, with links', hello: "Hi. I'm Larry. Ask me what nixfredOS gives you and how to start, and I'll answer from the sites, with links.", starters: ['What do I get?', 'What is the recipe box?', 'How do I keep track of my progress?'] },
    how: { sub: 'answers from the sites, with links', hello: "Hi. I'm Larry. Ask me anything about building your own AI, and I'll answer from the sites, with links.", starters: ['Where do I start on a Mac?', 'How does the memory work?', 'What is the Ladder?'] },
    ladder: { sub: 'plain answers about your next step', hello: "Hi, I'm Larry. I help students on the Ladder. Ask me anything about your next step, in plain words.", starters: ['What is the Ladder?', "I've never used a terminal. Can I do this?", 'What do I need before I start?'] },
    larry: { sub: 'yes, the actual Larry. Published pages only.', hello: "It's me. Larry. Ask away. I only answer from the published pages, so no, you can't have my memories.", starters: ['Who are you?', 'How do you remember things?', 'How do I build one of you?'] }
  }[SITE];
  if (!P) { if (window.console) console.warn('[ask-larry] embed.js: unknown data-site "' + SITE + '" (use nixfred, nixfredos, how, ladder or larry)'); return; }
  // links are kept only for Fred's own published sites (the five and the *.nixfred.com card sites) and LifeOS's own site
  function fleetHref(u) { try { var x = new URL(u); return x.protocol === 'https:' && /(^|\.)(nixfred\.com|nixfredos\.com|nixfred\.tech|ourlifeos\.ai)$/.test(x.hostname) ? x.href : null; } catch (e) { return null; } }
  function send(q, prior) {
    return fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ site: SITE, q: q, history: prior }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 200 && typeof j.answer === 'string') return { text: j.answer, sources: j.refused ? [] : (j.sources || []) };
        var e = new Error(j.error || ('HTTP ' + r.status)); e.status = r.status; e.body = j; e.retry = +r.headers.get('Retry-After') || 0; throw e;
      }); });
  }
  function mount() {
    var host = document.createElement('div'); host.setAttribute('data-ask-larry', SITE);
    var root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + AL_CSS + '</style><div class="al-root">' + AL_HTML + '</div>';
    document.body.appendChild(host);
    var panel = root.querySelector('.al-panel'), pill = root.querySelector('.al-pill');
    panel.querySelector('.al-head span').textContent = P.sub;
    var al = AskLarryPanel({ panel: panel, pill: pill, state: root.querySelector('.al-root'), key: 'fleet-ask-v1:' + SITE, minKey: 'fleet-ask-min:' + SITE,
      href: fleetHref, newTab: function (h) { return new URL(h).origin !== location.origin; }, bare: /(^|[\s(])(https:\/\/[^\s<)]+)/g,
      citeLabel: function (s) { var t = String(s.title || s.url).slice(0, 60), h = ''; try { h = new URL(s.url).hostname; } catch (e) {} return h && h !== location.hostname ? t + ' · ' + h : t; },
      citeLead: 'From the sites:', hello: P.hello + ' Try one:', starters: P.starters,
      startMin: me.getAttribute('data-open') !== 'true', keyScope: root, active: function () { return root.activeElement; }, send: send,
      fail: function (q, el, e) {
        var j = e && e.body || {}, s = e && e.status;
        var msg = s === 429 ? 'Easy, tiger. Too many questions too fast. Try again in ' + (j.retryAfter || e.retry || 60) + ' seconds.' :
          s === 503 && j.error === 'cap_reached' ? "I've hit my daily limit, so I'm resting until tomorrow (UTC). The guide is all there in the meantime: https://how.nixfred.com/" :
          s === 503 ? 'My brain is down for a moment. Try again shortly, or read the guide: https://how.nixfred.com/' :
          s === 413 ? 'Keep it under 500 characters.' :
          s ? 'Something broke on my side. Try again in a moment.' : 'Could not reach Ask Larry. Check your connection and try again.';
        el.innerHTML = al.md(msg);
      } });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
