
// ── Ask Larry: the site chat (hero bar, sidebar "Search or ask Larry", docked panel, per-chapter ask) ──
// The panel itself (render, markdown, open/close, the phone ask bar) is the shared core in ask/panel.js, the same
// code /embed.js runs on the other fleet sites. This file is how.nixfred.com's glue: the same-origin /api/ask (SSE),
// links kept only when they point at how.nixfred.com, chapter scope, the sidebar ask row, and on any API error a
// fall back to the static keyword search so a visitor always gets somewhere.
(function(){
  var panel=document.getElementById('al-panel'), pill=document.getElementById('al-pill');
  if(!panel||!pill)return;
  var scopeBar=panel.querySelector('.al-scope'), scope=null, sidx=null;
  var PAGE=document.body.getAttribute('data-page')||'', PTITLE=document.body.getAttribute('data-title')||'';
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function siteHref(u){
    try{var x=new URL(u,location.href);if(x.hostname==='how.nixfred.com'||x.origin===location.origin){return x.origin===location.origin?x.pathname+x.search+x.hash:x.href;}}catch(e){}
    return null;
  }
  var STARTERS=['Where do I start on a Mac?','How do you handle recall?','What is TELOS?','How was this site and its bot built?'];
  function setScope(s){
    scope=s; if(!scopeBar)return;
    if(s){scopeBar.hidden=false;scopeBar.innerHTML='Asking about <b>'+esc(PTITLE||s)+'</b> <button type="button" class="al-unscope" aria-label="Ask about the whole site instead">whole site</button>';}
    else{scopeBar.hidden=true;scopeBar.innerHTML='';}
  }
  function fallback(q,el,msg){
    function go(){
      var ql=q.toLowerCase(), words=ql.split(/\W+/).filter(function(w){return w.length>3;});
      var hits=sidx.map(function(e){var t=(e.t+' '+e.x).toLowerCase(),sc=0;words.forEach(function(w){if(t.indexOf(w)>=0)sc++;});return {e:e,sc:sc};}).filter(function(h){return h.sc;}).sort(function(a,b){return b.sc-a.sc;}).slice(0,4);
      el.innerHTML='<p>'+esc(msg)+'</p>'+(hits.length?'<p>Meanwhile, the pages that match your words:</p><ul>'+hits.map(function(h){return '<li><a href="'+esc(h.e.u)+'">'+esc(h.e.t)+'</a></li>';}).join('')+'</ul>':'<p>Try the search box, or start at <a href="00-start-here.html">Chapter 0</a>.</p>');
    }
    if(sidx)go();else fetch('search-index.json').then(function(r){return r.json();}).then(function(d){sidx=d;go();}).catch(function(){el.innerHTML='<p>'+esc(msg)+'</p>';});
  }
  function send(q,prior,paint){
    var raw='', final=null;
    return fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:q,history:prior,page:scope||undefined})}).then(function(res){
      if(!res.ok||!res.body){return res.json().catch(function(){return {};}).then(function(j){throw new Error(j.error||('HTTP '+res.status));});}
      var rd=res.body.getReader(), dec=new TextDecoder(), buf='';
      function pump(){return rd.read().then(function(x){
        if(x.done)return;
        buf+=dec.decode(x.value,{stream:true}); var i;
        while((i=buf.indexOf('\n\n'))>=0){
          var block=buf.slice(0,i); buf=buf.slice(i+2);
          var ev=(block.match(/^event: (.+)$/m)||[])[1]||'data', dm=block.match(/^data: (.+)$/m); if(!dm)continue;
          var d; try{d=JSON.parse(dm[1]);}catch(e){continue;}
          if(ev==='data'&&d.t){raw+=d.t;paint(raw);}
          else if(ev==='final'){final=d;}
          else if(ev==='error'){throw new Error(d.message||'error');}
        }
        return pump();
      });}
      return pump();
    }).then(function(){
      var text=final?final.answer:raw; if(!text)throw new Error('empty');
      return {text:text,sources:final&&!final.refused?final.sources:[]};
    });
  }
  var al=AskLarryPanel({panel:panel,pill:pill,state:document.body,key:'larry-ask-v1',minKey:'larry-ask-min',
    href:siteHref,bare:/(^|[\s(])(https:\/\/how\.nixfred\.com\/[^\s<)]*)/g,
    citeLabel:function(s){return String(s.title||s.url).replace(/^Chapter /,'Ch ');},
    hello:"Hi. I'm Larry. Ask me anything about building your own AI, and I'll answer only from this site, with links. Try one:",
    starters:STARTERS,onScope:setScope,send:send,forceOpen:location.hash==='#ask',
    fail:function(q,el,e){var m=String(e&&e.message||'');fallback(q,el,/rate limit|tiger/i.test(m)?'Easy, tiger. You hit the rate limit, give it a minute.':'I could not reach my brain just now.');}});
  var open=al.open, ask=al.ask;
  panel.addEventListener('click',function(e){if(e.target.closest('.al-unscope'))setScope(null);});
  // homepage hero bar + its starter chips
  document.querySelectorAll('[data-al-hero]').forEach(function(f){
    var inp=f.querySelector('input');
    f.addEventListener('submit',function(e){e.preventDefault();var q=inp.value;inp.value='';open(null);ask(q);});
    f.addEventListener('click',function(e){var b=e.target.closest('[data-q]');if(b){e.preventDefault();open(null);ask(b.getAttribute('data-q'));}});
  });
  // "Ask about this chapter" biases retrieval to the current page
  document.querySelectorAll('[data-al-scope]').forEach(function(b){b.addEventListener('click',function(){open(PAGE||null);});});
  // sidebar: "Search or ask Larry" , an Ask Larry row on top of the keyword results
  var si=document.querySelector('.search'), sr=document.querySelector('.search-results');
  if(si&&sr){
    function askRow(){
      var q=si.value.trim(); var old=sr.querySelector('.sr-ask'); if(old)old.remove();
      if(q.length<2)return;
      var a=document.createElement('a'); a.href='#'; a.className='sr-ask'; a.innerHTML='<b>💬 Ask Larry:</b> <em>'+esc(q.slice(0,120))+'</em>';
      a.addEventListener('click',function(e){e.preventDefault();sr.hidden=true;si.value='';open(null);ask(q);});
      sr.insertBefore(a,sr.firstChild); sr.hidden=false;
    }
    new MutationObserver(function(){if(!sr.querySelector('.sr-ask'))askRow();}).observe(sr,{childList:true});
    si.addEventListener('keydown',function(e){if(e.key==='Enter'&&si.value.trim().length>1){e.preventDefault();var q=si.value.trim();sr.hidden=true;si.value='';open(null);ask(q);}});
  }
  if(location.hash==='#ask')open(null);
})();
