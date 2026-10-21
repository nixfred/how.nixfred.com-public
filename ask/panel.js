
// ── Ask Larry panel core: ONE source for the docked chat panel and its phone ask bar ──
// Concatenated at build time into how.nixfred.com's assets/app.js (driven by ask/widget.js) and into /embed.js
// (driven by ask/embed.js), so every fleet site gets how.nixfred.com's exact chat. Markup: ask/panel-build.js.
// CSS: the "ask-larry-panel" block of site/assets/style.css (the embed gets the same block, extracted at build).
// Desktop: a floating card docked bottom right (the embed, and how.nixfred.com below 1200px), or on how.nixfred.com at 1200px+
// a full-height sticky right rail (CSS only: .wrap .al-panel); the close button minimizes either to the pill for this browser session.
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
    var ok=(sources||[]).map(function(s){var h=o.href(s.url);return h?'<a class="al-cite" href="'+esc(h)+'"'+(o.newTab&&o.newTab(h)?' target="_blank" rel="noopener"':'')+'>'+esc(AskLarryPanel.dedupe(o.citeLabel(s)))+'</a>':'';}).filter(Boolean);
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
    // the server needs each answer's cited pages (not just its text) to know where the chat is in the guide, so "then what" moves forward
    var prior=hist.slice(-6).map(function(m){var x={role:m.role,content:m.content};if(m.role==='assistant'&&m.sources&&m.sources.length){x.sources=m.sources.slice(0,4).map(function(s){return s.url;});}return x;});
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
// Source chips: the host appears once. A title that is only the host or the URL ("how.nixfred.com" for the home page) shows
// the host (plus the path when there is one); any other title gets " · host" only when the host is not this page's and the
// title does not already say it. dedupe() also collapses a repeated segment ("how.nixfred.com · how.nixfred.com").
AskLarryPanel.dedupe=function(label){
  var n=function(x){return String(x).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'').trim();}, seen={};
  return String(label).split(' · ').filter(function(seg){var k=n(seg); if(!k||seen[k])return false; seen[k]=1; return true;}).join(' · ');
};
AskLarryPanel.citeText=function(s,here){
  var t=String(s.title||'').trim(), h='', path='';
  try{var x=new URL(s.url);h=x.hostname;path=x.pathname.replace(/\/+$/,'');}catch(e){}
  var n=function(v){return String(v).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'');};
  if(!h)return AskLarryPanel.dedupe(t.slice(0,60)||String(s.url));
  var bare=!t||n(t)===h||n(t)===h+path.toLowerCase();
  var label=bare?(h===here&&path?path:h+path):(h!==here&&n(t).indexOf(h)<0?t.slice(0,60)+' · '+h:t.slice(0,60));
  return AskLarryPanel.dedupe(label);
};
