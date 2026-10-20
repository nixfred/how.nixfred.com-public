// how.nixfred.com client
(function(){
  // global search
  var si=document.querySelector('.search'), sr=document.querySelector('.search-results'), sidx=null, st;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  if(si&&sr){
    function run(){
      var q=si.value.trim().toLowerCase();
      if(q.length<2){sr.hidden=true;sr.innerHTML='';return;}
      function go(){
        var hits=[];
        sidx.forEach(function(e){
          var tl=e.t.toLowerCase(), xl=e.x.toLowerCase(), it=tl.indexOf(q), ix=xl.indexOf(q);
          if(it<0&&ix<0)return;
          var snip='';
          if(ix>=0){var s=Math.max(0,ix-45);snip=(s>0?'…':'')+e.x.slice(s,ix+q.length+70)+'…';}
          hits.push({e:e,sc:(it>=0?1000-it:0)+(ix>=0?5:0),snip:snip});
        });
        hits.sort(function(a,b){return b.sc-a.sc;});
        if(!hits.length){sr.innerHTML='<div class="sr-none">no matches for "'+esc(q)+'"</div>';sr.hidden=false;return;}
        sr.innerHTML=hits.slice(0,12).map(function(h){
          return '<a href="'+h.e.u+'"><b>'+esc(h.e.t)+'</b><span class="sr-p">'+esc(h.e.p)+'</span>'+(h.snip?'<em>'+esc(h.snip)+'</em>':'')+'</a>';
        }).join('');
        sr.hidden=false;
      }
      if(sidx){go();}else{fetch('search-index.json').then(function(r){return r.json();}).then(function(d){sidx=d;go();}).catch(function(){});}
    }
    si.addEventListener('input',function(){clearTimeout(st);st=setTimeout(run,150);});
    si.addEventListener('focus',run);
    si.addEventListener('keydown',function(e){if(e.key==='Escape'){sr.hidden=true;si.blur();}});
    document.addEventListener('click',function(e){if(!e.target.closest('.search-wrap'))sr.hidden=true;});
  }
  // checklist persistence
  var boxes=document.querySelectorAll('input[type=checkbox][data-k]');
  if(boxes.length){
    var KEY='larry-checklist';
    var st=JSON.parse(localStorage.getItem(KEY)||'{}');
    var bar=document.getElementById('bar'),pct=document.getElementById('pct');
    function upd(){
      var done=0; boxes.forEach(function(b){if(b.checked)done++;});
      var p=Math.round(done/boxes.length*100);
      if(bar)bar.style.width=p+'%'; if(pct)pct.textContent=p+'%';
    }
    boxes.forEach(function(b){
      b.checked=!!st[b.dataset.k];
      b.addEventListener('change',function(){st[b.dataset.k]=b.checked;localStorage.setItem(KEY,JSON.stringify(st));upd();});
    });
    upd();
    var r=document.getElementById('reset');
    if(r)r.addEventListener('click',function(){localStorage.removeItem(KEY);boxes.forEach(function(b){b.checked=false;});upd();});
  }
  // the homepage hero's one paste
  var sp=document.getElementById('spine-paste-text'), sb=document.querySelector('.spine-copy');
  if(sp&&sb){sb.addEventListener('click',function(){navigator.clipboard.writeText(sp.textContent).then(function(){sb.textContent='copied';setTimeout(function(){sb.textContent='copy';},1200);});});}
  // click-to-copy on code blocks
  document.querySelectorAll('pre').forEach(function(pre){
    var code=pre.querySelector('code');
    var text=(code||pre).textContent; // textContent (not innerText) so it captures the full command even inside a collapsed <details>, and BEFORE the button is added so its 'copy' label never leaks in
    var btn=document.createElement('button'); btn.className='copy'; btn.textContent='copy';
    btn.addEventListener('click',function(){
      navigator.clipboard.writeText(text).then(function(){btn.textContent='copied';setTimeout(function(){btn.textContent='copy';},1200);});
    });
    pre.appendChild(btn);
  });
  // copy ALL TELOS questions in one paste
  document.querySelectorAll('.copy-all').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      var out=['# My TELOS, Deep Context Interview','',
        'Interview me through every question below, section by section.',
        'For EACH question, FIRST offer me 3-5 likely answers as multiple-choice options',
        '(always plus "or type your own") so I can pick fast, THEN ask one follow-up if my',
        'pick needs depth. Lead with choices; never leave me staring at a blank question.',
        'As we finish each section, write a clean block for my ~/.claude/TELOS/<me>.md',
        'deep-context file. We can span several sessions, save progress as we go.',''];
      var total=0;
      document.querySelectorAll('.telos-sec').forEach(function(det){
        var title=det.querySelector('.tt')?det.querySelector('.tt').textContent:'';
        out.push('## '+title);
        [].forEach.call(det.querySelectorAll('ol li'),function(li,i){out.push((i+1)+'. '+li.textContent);total++;});
        out.push('');
      });
      navigator.clipboard.writeText(out.join('\n')).then(function(){
        var o=btn.textContent;btn.textContent='✓ copied all '+total+' questions';
        setTimeout(function(){btn.textContent=o;},1800);
      });
    });
  });
  // copy a TELOS section's questions
  document.querySelectorAll('.copy-sec').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      var det=btn.closest('details');
      var title=det.querySelector('.tt')?det.querySelector('.tt').textContent:'';
      var qs=[].map.call(det.querySelectorAll('ol li'),function(li,i){return (i+1)+'. '+li.textContent;});
      var instr='Interview me through these. For EACH question, first offer 3-5 likely answers as multiple-choice options (plus "or type your own") so I can pick fast, then one follow-up if needed. Write the result to my ~/.claude/TELOS/<me>.md.';
      var text='# '+title+'\n\n'+instr+'\n\n'+qs.join('\n');
      navigator.clipboard.writeText(text).then(function(){var o=btn.textContent;btn.textContent='copied '+qs.length+' questions';setTimeout(function(){btn.textContent=o;},1400);});
    });
  });
})();
// ── Ask Larry: the site chat (hero bar, sidebar "Search or ask Larry", docked panel, per-chapter ask) ──
// Talks only to the same-origin /api/ask (SSE). Safe markdown: everything is HTML-escaped first and
// links are only kept when they point at how.nixfred.com. On any API error it falls back to the
// static keyword search so a visitor always gets somewhere.
(function(){
  var panel=document.getElementById('al-panel'), pill=document.getElementById('al-pill');
  if(!panel||!pill)return;
  var log=panel.querySelector('.al-log'), form=panel.querySelector('.al-form'), ta=panel.querySelector('.al-input');
  var scopeBar=panel.querySelector('.al-scope'), KEY='larry-ask-v1', MINKEY='larry-ask-min', busy=false, scope=null, sidx=null;
  // Always docked bottom right, open on every page load. Desktop can minimize to the pill for this
  // browser session only. Phones get a compact input bar that expands on focus or when a question goes.
  var mq=window.matchMedia?window.matchMedia('(max-width:640px)'):{matches:false};
  function mobile(){return !!mq.matches;}
  function minimized(){return document.body.classList.contains('al-min');}
  if(mobile())ta.setAttribute('placeholder','Ask Larry anything…');
  var PAGE=document.body.getAttribute('data-page')||'', PTITLE=document.body.getAttribute('data-title')||'';
  var hist=[]; try{hist=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(hist))hist=[];}catch(e){hist=[];}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(hist.slice(-30)));}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function siteHref(u){
    try{var x=new URL(u,location.href);if(x.hostname==='how.nixfred.com'||x.origin===location.origin){return x.origin===location.origin?x.pathname+x.search+x.hash:x.href;}}catch(e){}
    return null;
  }
  function inline(s){
    s=s.replace(/`([^`]+)`/g,function(_,c){return '<code>'+c+'</code>';});
    s=s.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
    s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,function(m,t,u){var h=siteHref(u.replace(/&amp;/g,'&'));return h?'<a href="'+esc(h)+'">'+t+'</a>':t;});
    s=s.replace(/(^|[\s(])(https:\/\/how\.nixfred\.com\/[^\s<)]*)/g,function(m,pre,u){var h=siteHref(u.replace(/&amp;/g,'&').replace(/[.,;:]+$/,''));return pre+(h?'<a href="'+esc(h)+'">'+u+'</a>':u);});
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
    var ok=(sources||[]).map(function(s){var h=siteHref(s.url);return h?'<a class="al-cite" href="'+esc(h)+'">'+esc(String(s.title||s.url).replace(/^Chapter /,'Ch '))+'</a>':'';}).filter(Boolean);
    return ok.length?'<div class="al-cites"><span>From the site:</span>'+ok.join('')+'</div>':'';
  }
  function bubble(role,html){var d=document.createElement('div');d.className='al-msg al-'+role;d.innerHTML=html;log.appendChild(d);log.scrollTop=log.scrollHeight;return d;}
  var STARTERS=['Where do I start on a Mac?','How do you handle recall?','What is TELOS?','How was this site and its bot built?'];
  function render(){
    log.innerHTML='';
    if(!hist.length){
      bubble('bot','<p>Hi. I\'m Larry. Ask me anything about building your own AI, and I\'ll answer only from this site, with links. Try one:</p><div class="al-starters">'+STARTERS.map(function(q){return '<button type="button" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div>');
    }
    hist.forEach(function(m){bubble(m.role==='user'?'user':'bot',m.role==='user'?'<p>'+esc(m.content)+'</p>':md(m.content)+chips(m.sources));});
  }
  function setScope(s){
    scope=s; if(!scopeBar)return;
    if(s){scopeBar.hidden=false;scopeBar.innerHTML='Asking about <b>'+esc(PTITLE||s)+'</b> <button type="button" class="al-unscope" aria-label="Ask about the whole site instead">whole site</button>';}
    else{scopeBar.hidden=true;scopeBar.innerHTML='';}
  }
  function open(s,noFocus){
    document.body.classList.remove('al-min');try{sessionStorage.removeItem(MINKEY);}catch(e){}
    pill.setAttribute('aria-expanded','true');
    if(mobile())panel.classList.add('al-expanded');
    if(s!==undefined)setScope(s);
    log.scrollTop=log.scrollHeight;
    if(!noFocus)setTimeout(function(){ta.focus();},30);
  }
  function close(){
    if(mobile()){panel.classList.remove('al-expanded');ta.blur();return;}
    document.body.classList.add('al-min');try{sessionStorage.setItem(MINKEY,'1');}catch(e){}
    pill.setAttribute('aria-expanded','false');pill.focus();
  }
  function fallback(q,el,msg){
    function go(){
      var ql=q.toLowerCase(), words=ql.split(/\W+/).filter(function(w){return w.length>3;});
      var hits=sidx.map(function(e){var t=(e.t+' '+e.x).toLowerCase(),sc=0;words.forEach(function(w){if(t.indexOf(w)>=0)sc++;});return {e:e,sc:sc};}).filter(function(h){return h.sc;}).sort(function(a,b){return b.sc-a.sc;}).slice(0,4);
      el.innerHTML='<p>'+esc(msg)+'</p>'+(hits.length?'<p>Meanwhile, the pages that match your words:</p><ul>'+hits.map(function(h){return '<li><a href="'+esc(h.e.u)+'">'+esc(h.e.t)+'</a></li>';}).join('')+'</ul>':'<p>Try the search box, or start at <a href="00-start-here.html">Chapter 0</a>.</p>');
    }
    if(sidx)go();else fetch('search-index.json').then(function(r){return r.json();}).then(function(d){sidx=d;go();}).catch(function(){el.innerHTML='<p>'+esc(msg)+'</p>';});
  }
  function ask(q){
    q=String(q||'').trim(); if(!q||busy)return;
    if(q.length>500){q=q.slice(0,500);}
    if(minimized()||(mobile()&&!panel.classList.contains('al-expanded')))open(undefined,true);
    var prior=hist.slice(-6).map(function(m){return {role:m.role,content:m.content};});
    hist.push({role:'user',content:q}); save(); render();
    var el=bubble('bot','<p class="al-typing"><span></span><span></span><span></span></p>'); busy=true; form.classList.add('busy');
    var raw='', final=null;
    fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:q,history:prior,page:scope||undefined})}).then(function(res){
      if(!res.ok||!res.body){return res.json().catch(function(){return {};}).then(function(j){throw new Error(j.error||('HTTP '+res.status));});}
      var rd=res.body.getReader(), dec=new TextDecoder(), buf='';
      function pump(){return rd.read().then(function(x){
        if(x.done)return;
        buf+=dec.decode(x.value,{stream:true}); var i;
        while((i=buf.indexOf('\n\n'))>=0){
          var block=buf.slice(0,i); buf=buf.slice(i+2);
          var ev=(block.match(/^event: (.+)$/m)||[])[1]||'data', dm=block.match(/^data: (.+)$/m); if(!dm)continue;
          var d; try{d=JSON.parse(dm[1]);}catch(e){continue;}
          if(ev==='data'&&d.t){raw+=d.t;el.innerHTML=md(raw);log.scrollTop=log.scrollHeight;}
          else if(ev==='final'){final=d;}
          else if(ev==='error'){throw new Error(d.message||'error');}
        }
        return pump();
      });}
      return pump();
    }).then(function(){
      var text=final?final.answer:raw; if(!text)throw new Error('empty');
      var src=final&&!final.refused?final.sources:[];
      el.innerHTML=md(text)+chips(src); hist.push({role:'assistant',content:text,sources:src}); save();
    }).catch(function(e){
      var m=String(e&&e.message||'');
      fallback(q,el,/rate limit|tiger/i.test(m)?'Easy, tiger. You hit the rate limit, give it a minute.':'I could not reach my brain just now.');
    }).then(function(){busy=false;form.classList.remove('busy');log.scrollTop=log.scrollHeight;});
  }
  pill.addEventListener('click',function(){open();});
  panel.querySelector('.al-close').addEventListener('click',close);
  panel.querySelector('.al-clear').addEventListener('click',function(){hist=[];save();render();});
  form.addEventListener('submit',function(e){e.preventDefault();var q=ta.value;ta.value='';ask(q);});
  ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit'));}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.contains(document.activeElement)&&(mobile()?panel.classList.contains('al-expanded'):!minimized()))close();});
  ta.addEventListener('focus',function(){if(mobile()&&!panel.classList.contains('al-expanded')){panel.classList.add('al-expanded');log.scrollTop=log.scrollHeight;}});
  panel.addEventListener('click',function(e){
    var b=e.target.closest('[data-q]'); if(b){ask(b.getAttribute('data-q'));return;}
    if(e.target.closest('.al-unscope'))setScope(null);
  });
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
  // default state: open. Only a minimize from earlier in this same session keeps it tucked away (desktop).
  render();
  var wasMin=false; try{wasMin=sessionStorage.getItem(MINKEY)==='1';}catch(e){}
  if(wasMin&&!mobile()&&location.hash!=='#ask'){document.body.classList.add('al-min');pill.setAttribute('aria-expanded','false');}
  if(location.hash==='#ask')open(null);
})();
