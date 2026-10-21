// Ask Larry for every fleet site. Built by build.ts from ask/panel-build.js + ask/panel.js + ask/embed.js: the same
// panel, CSS and behaviour as how.nixfred.com's own chat. Do not edit site/embed.js by hand.
(function(){
var AL_CSS=":host{all:initial;display:block;height:0}\n@media(max-width:640px){:host{height:170px}}\n.al-root{--bg:#0e1116; --bg2:#151a21; --bg3:#1b222b; --line:#262f3a;\n  --ink:#dbe3ec; --ink2:#9aa7b6; --ink3:#8893a3;\n  --accent:#39d0a8; --accent2:#5aa9ff; --warn:#f2b441;\n  --max:760px; --nav:300px;\n  --mono:ui-monospace,\"SF Mono\",Menlo,Consolas,monospace;\n  --sans:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Inter,Roboto,Helvetica,Arial,sans-serif;;color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.7;-webkit-font-smoothing:antialiased}\n*{box-sizing:border-box}\na{color:var(--accent2);text-decoration:none}\na:hover{text-decoration:underline}\n.al-send{background:var(--accent);color:#06281f;border:0;border-radius:10px;padding:0 20px;font-weight:800;font-size:16px;cursor:pointer;font-family:var(--sans)}\n.al-send:hover{filter:brightness(1.08)}\n.al-starters{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 4px}\n.al-starters button{background:var(--bg2);border:1px solid var(--line);color:var(--ink2);border-radius:999px;\n  padding:6px 12px;font-size:13.5px;cursor:pointer;font-family:var(--sans)}\n.al-starters button:hover{border-color:var(--accent);color:var(--accent)}\n.al-pill{position:fixed;right:20px;bottom:20px;z-index:60;display:flex;align-items:center;gap:8px;background:var(--accent);color:#06281f;\n  border:0;border-radius:999px;padding:12px 20px;font-weight:800;font-size:16px;cursor:pointer;font-family:var(--sans);\n  box-shadow:0 8px 28px rgba(0,0,0,.45),0 0 0 4px rgba(57,208,168,.18)}\n.al-pill:hover{filter:brightness(1.08)}\n.al-dot{width:8px;height:8px;border-radius:50%;background:#06281f;animation:alpulse 2.4s ease-in-out infinite}\n@keyframes alpulse{0%,100%{opacity:.35}50%{opacity:1}}\n.al-root:not(.al-min) .al-pill{display:none}\n.al-panel{position:fixed;right:16px;bottom:16px;z-index:70;width:380px;max-width:calc(100vw - 32px);\n  height:min(520px,60vh);min-height:min(380px,calc(100vh - 32px));\n  display:flex;flex-direction:column;background:var(--bg2);border:1px solid var(--line);border-radius:16px;\n  box-shadow:0 18px 60px rgba(0,0,0,.6);overflow:hidden}\n.al-panel[hidden],.al-root.al-min .al-panel{display:none}\n@media(min-width:641px) and (max-width:1023.98px){.al-panel{width:340px;height:min(460px,55vh)}}\n.al-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--bg3)}\n.al-head div{flex:1;min-width:0}\n.al-head b{display:block;color:var(--accent);font-size:16px}\n.al-head span{display:block;font-size:12px;color:var(--ink3)}\n.al-head button{background:transparent;border:1px solid var(--line);color:var(--ink2);border-radius:8px;padding:4px 9px;cursor:pointer;font-size:13px}\n.al-head button:hover{color:var(--ink);border-color:var(--ink3)}\n.al-scope{padding:7px 14px;font-size:13px;color:var(--ink2);background:rgba(90,169,255,.08);border-bottom:1px solid var(--line)}\n.al-scope[hidden]{display:none}\n.al-scope b{color:var(--accent2)}\n.al-unscope{margin-left:6px;background:transparent;border:1px solid var(--line);color:var(--ink3);border-radius:999px;padding:1px 8px;font-size:12px;cursor:pointer}\n.al-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:15px;line-height:1.6}\n.al-msg{max-width:92%;padding:9px 12px;border-radius:12px;overflow-wrap:anywhere}\n.al-msg p{margin:0 0 8px}\n.al-msg p:last-child{margin-bottom:0}\n.al-msg ul,.al-msg ol{margin:4px 0 8px;padding-left:20px}\n.al-msg pre{margin:6px 0;padding:9px 10px;font-size:12.5px;white-space:pre-wrap}\n.al-msg code{font-size:.9em}\n.al-user{align-self:flex-end;background:rgba(90,169,255,.16);border:1px solid rgba(90,169,255,.35)}\n.al-bot{align-self:flex-start;background:var(--bg);border:1px solid var(--line)}\n.al-cites{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;align-items:center}\n.al-cites span{font-size:11.5px;color:var(--ink3)}\n.al-cite{font-size:12px;border:1px solid var(--accent);color:var(--accent);border-radius:999px;padding:2px 9px}\n.al-cite:hover{background:rgba(57,208,168,.1);text-decoration:none}\n.al-typing{display:flex;gap:5px;padding:4px 0}\n.al-typing span{width:7px;height:7px;border-radius:50%;background:var(--ink3);animation:alpulse 1.1s infinite}\n.al-typing span:nth-child(2){animation-delay:.18s}\n.al-typing span:nth-child(3){animation-delay:.36s}\n.al-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line)}\n.al-form.busy .al-send{opacity:.55;pointer-events:none}\n.al-input{flex:1;resize:none;background:var(--bg);border:1px solid var(--line);color:var(--ink);border-radius:10px;padding:9px 11px;\n  font-size:15px;font-family:var(--sans);line-height:1.4}\n.al-input:focus{outline:2px solid var(--accent);border-color:var(--accent)}\n.al-foot{margin:0;padding:0 14px 10px;font-size:11.5px;color:var(--ink3)}\n@media(max-width:640px){.al-panel,.al-root.al-min .al-panel{display:flex;left:0;right:0;bottom:0;width:100%;max-width:100%;height:auto;min-height:0;\n    border-radius:14px 14px 0 0;border-width:1px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.5);padding-bottom:env(safe-area-inset-bottom)}.al-panel.al-expanded{height:72vh;height:72dvh}.al-panel:not(.al-expanded) .al-head,.al-panel:not(.al-expanded) .al-scope,.al-panel:not(.al-expanded) .al-log,.al-panel:not(.al-expanded) .al-foot{display:none}.al-panel:not(.al-expanded) .al-form{border-top:0;padding:9px 10px}.al-panel:not(.al-expanded) .al-input{height:44px}.al-input{font-size:16px}.al-pill,.al-root.al-min .al-pill{display:none}}";
var AL_HTML="<button type=\"button\" class=\"al-pill\" id=\"al-pill\" aria-controls=\"al-panel\" aria-expanded=\"true\" title=\"Open Ask Larry\"><span class=\"al-dot\"></span>💬 Ask Larry</button>\n<aside class=\"al-panel\" id=\"al-panel\" aria-label=\"Ask Larry\">\n  <header class=\"al-head\"><div><b>Ask Larry</b><span>answers from Fred's sites, with links</span></div><button type=\"button\" class=\"al-clear\" title=\"Clear this conversation\">clear</button><button type=\"button\" class=\"al-close\" aria-label=\"Minimize Ask Larry\" title=\"Minimize\">▾</button></header>\n  <div class=\"al-scope\" hidden></div>\n  <div class=\"al-log\" aria-live=\"polite\"></div>\n  <form class=\"al-form\"><textarea class=\"al-input\" rows=\"2\" maxlength=\"500\" placeholder=\"Ask Larry anything…\" aria-label=\"Your question for Larry\"></textarea><button type=\"submit\" class=\"al-send\">Ask</button></form>\n  <p class=\"al-foot\">Answers only from published pages, 500 characters max. <a href=\"https://how.nixfred.com/ask-larry\" target=\"_blank\" rel=\"noopener\">Don't trust me, audit it →</a></p>\n</aside>";

// ── Ask Larry panel core: ONE source for the docked chat panel and its phone ask bar ──
// Concatenated at build time into how.nixfred.com's assets/app.js (driven by ask/widget.js) and into /embed.js
// (driven by ask/embed.js), so every fleet site gets how.nixfred.com's exact chat. Markup: ask/panel-build.js.
// CSS: the "ask-larry-panel" block of site/assets/style.css (the embed gets the same block, extracted at build).
// Desktop: docked bottom right; the close button minimizes it to the pill for this browser session.
// Phones (max-width 640px): a compact ask bar docked across the bottom that expands to a 72dvh sheet on focus or
// when a question goes; the close button folds it back to the bar. Safe markdown: everything is HTML-escaped
// first, and a link is kept only when o.href() accepts its URL.
function AskLarryPanel(o){
  var panel=o.panel, pill=o.pill, state=o.state||document.body;
  var log=panel.querySelector('.al-log'), form=panel.querySelector('.al-form'), ta=panel.querySelector('.al-input');
  var busy=false;
  var mq=window.matchMedia?window.matchMedia('(max-width:640px)'):{matches:false};
  function mobile(){return !!mq.matches;}
  function minimized(){return state.classList.contains('al-min');}
  if(mobile())ta.setAttribute('placeholder','Ask Larry anything…');
  var hist=[]; try{hist=JSON.parse(localStorage.getItem(o.key)||'[]');if(!Array.isArray(hist))hist=[];}catch(e){hist=[];}
  function save(){try{localStorage.setItem(o.key,JSON.stringify(hist.slice(-30)));}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function inline(s){
    s=s.replace(/`([^`]+)`/g,function(_,c){return '<code>'+c+'</code>';});
    s=s.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
    s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,function(m,t,u){var h=o.href(u.replace(/&amp;/g,'&'));return h?'<a href="'+esc(h)+'"'+(o.newTab&&o.newTab(h)?' target="_blank" rel="noopener"':'')+'>'+t+'</a>':t;});
    s=s.replace(o.bare,function(m,pre,u){var h=o.href(u.replace(/&amp;/g,'&').replace(/[.,;:]+$/,''));return pre+(h?'<a href="'+esc(h)+'"'+(o.newTab&&o.newTab(h)?' target="_blank" rel="noopener"':'')+'>'+u+'</a>':u);});
    return s;
  }
  function md(src){
    var parts=esc(src).split(/```[a-z]*\n?/), html='';
    parts.forEach(function(p,i){
      if(i%2){html+='<pre><code>'+p.replace(/\n$/,'')+'</code></pre>';return;}
      var lines=p.split('\n'), list=null, para=[];
      function flushP(){if(para.length){html+='<p>'+inline(para.join('<br>'))+'</p>';para=[];}}
      function flushL(){if(list){html+='</'+list+'>';list=null;}}
      lines.forEach(function(l){
        var ul=l.match(/^\s*[-*]\s+(.*)/), ol=l.match(/^\s*\d+[.)]\s+(.*)/);
        if(ul||ol){flushP();var t=ul?'ul':'ol';if(list!==t){flushL();html+='<'+t+'>';list=t;}html+='<li>'+inline((ul||ol)[1])+'</li>';}
        else if(!l.trim()){flushP();flushL();}
        else if(/^#{1,4}\s/.test(l)){flushP();flushL();html+='<p><b>'+inline(l.replace(/^#+\s*/,''))+'</b></p>';}
        else{flushL();para.push(l);}
      });
      flushP();flushL();
    });
    return html;
  }
  function chips(sources){
    var ok=(sources||[]).map(function(s){var h=o.href(s.url);return h?'<a class="al-cite" href="'+esc(h)+'"'+(o.newTab&&o.newTab(h)?' target="_blank" rel="noopener"':'')+'>'+esc(o.citeLabel(s))+'</a>':'';}).filter(Boolean);
    return ok.length?'<div class="al-cites"><span>'+esc(o.citeLead||'From the site:')+'</span>'+ok.join('')+'</div>':'';
  }
  function bubble(role,html){var d=document.createElement('div');d.className='al-msg al-'+role;d.innerHTML=html;log.appendChild(d);log.scrollTop=log.scrollHeight;return d;}
  function render(){
    log.innerHTML='';
    if(!hist.length){
      bubble('bot','<p>'+esc(o.hello)+'</p><div class="al-starters">'+o.starters.map(function(q){return '<button type="button" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div>');
    }
    hist.forEach(function(m){bubble(m.role==='user'?'user':'bot',m.role==='user'?'<p>'+esc(m.content)+'</p>':md(m.content)+chips(m.sources));});
  }
  function open(s,noFocus){
    state.classList.remove('al-min');try{sessionStorage.removeItem(o.minKey);}catch(e){}
    pill.setAttribute('aria-expanded','true');
    if(mobile())panel.classList.add('al-expanded');
    if(s!==undefined&&o.onScope)o.onScope(s);
    log.scrollTop=log.scrollHeight;
    if(!noFocus)setTimeout(function(){ta.focus();},30);
  }
  function close(){
    if(mobile()){panel.classList.remove('al-expanded');ta.blur();return;}
    state.classList.add('al-min');try{sessionStorage.setItem(o.minKey,'1');}catch(e){}
    pill.setAttribute('aria-expanded','false');pill.focus();
  }
  // o.send(q, prior, paint) -> Promise of {text, sources}; paint(raw) shows a streamed answer as it arrives.
  // o.fail(q, el, error) writes the failure message into the bubble.
  function ask(q){
    q=String(q||'').trim(); if(!q||busy)return;
    if(q.length>500){q=q.slice(0,500);}
    if(minimized()||(mobile()&&!panel.classList.contains('al-expanded')))open(undefined,true);
    var prior=hist.slice(-6).map(function(m){return {role:m.role,content:m.content};});
    hist.push({role:'user',content:q}); save(); render();
    var el=bubble('bot','<p class="al-typing"><span></span><span></span><span></span></p>'); busy=true; form.classList.add('busy');
    o.send(q,prior,function(raw){el.innerHTML=md(raw);log.scrollTop=log.scrollHeight;}).then(function(r){
      el.innerHTML=md(r.text)+chips(r.sources); hist.push({role:'assistant',content:r.text,sources:r.sources}); save();
    }).catch(function(e){o.fail(q,el,e);}).then(function(){busy=false;form.classList.remove('busy');log.scrollTop=log.scrollHeight;});
  }
  pill.addEventListener('click',function(){open();});
  panel.querySelector('.al-close').addEventListener('click',close);
  panel.querySelector('.al-clear').addEventListener('click',function(){hist=[];save();render();});
  form.addEventListener('submit',function(e){e.preventDefault();var q=ta.value;ta.value='';ask(q);});
  ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit'));}});
  (o.keyScope||document).addEventListener('keydown',function(e){var a=o.active?o.active():document.activeElement;if(e.key==='Escape'&&panel.contains(a)&&(mobile()?panel.classList.contains('al-expanded'):!minimized()))close();});
  ta.addEventListener('focus',function(){if(mobile()&&!panel.classList.contains('al-expanded')){panel.classList.add('al-expanded');log.scrollTop=log.scrollHeight;}});
  panel.addEventListener('click',function(e){var b=e.target.closest('[data-q]'); if(b){ask(b.getAttribute('data-q'));}});
  // default state: open. Only a minimize from earlier in this same session (or o.startMin) keeps it tucked away (desktop).
  render();
  var wasMin=false; try{wasMin=sessionStorage.getItem(o.minKey)==='1';}catch(e){}
  if((wasMin||o.startMin)&&!mobile()&&!o.forceOpen){state.classList.add('al-min');pill.setAttribute('aria-expanded','false');}
  return {open:open,close:close,ask:ask,esc:esc,md:md,bubble:bubble,mobile:mobile};
}

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

})();
