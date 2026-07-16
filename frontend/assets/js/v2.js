// nav border on scroll
var nav=document.getElementById('topnav');
addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>10);},{passive:true});

// waveform bars
(function(){
  var w=document.getElementById('wave');if(!w)return;
  for(var i=0;i<34;i++){var b=document.createElement('i');b.style.animationDelay=(i*0.07)+'s';b.style.height=(28+Math.abs(Math.sin(i*0.9))*62)+'%';w.appendChild(b);}
})();

// reveal on scroll — only engages when IntersectionObserver exists;
// otherwise content stays visible (hidden state is scoped to html.jsreveal)
(function(){
  if(!('IntersectionObserver' in window))return;
  document.documentElement.classList.add('jsreveal');
  var els=document.querySelectorAll('[data-reveal]');
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});
  },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e);});
  // safety net: never leave content invisible (frozen tabs, odd embeds)
  setTimeout(function(){els.forEach(function(e){e.classList.add('in');});},4000);
})();

// hero headline typing — retypes the h1 character by character with a
// blinking caret; skipped for reduced-motion users (full text stays)
(function(){
  var h1=document.getElementById('hero-type');
  if(!h1||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var segs=[{t:'Automate your business'},{br:true},{t:'with '},{t:'AI.',accent:true}];
  h1.innerHTML='';
  var caret=document.createElement('span');caret.className='type-caret';
  h1.appendChild(caret);
  var si=0,ci=0,cur=null;
  function tick(){
    if(si>=segs.length){setTimeout(function(){caret.style.opacity='0';},1400);return;}
    var seg=segs[si];
    if(seg.br){h1.insertBefore(document.createElement('br'),caret);si++;cur=null;setTimeout(tick,120);return;}
    if(!cur){
      cur=seg.accent?document.createElement('span'):document.createTextNode('');
      if(seg.accent)cur.className='accent';
      h1.insertBefore(cur,caret);ci=0;
    }
    ci++;cur.textContent=seg.t.slice(0,ci);
    if(ci>=seg.t.length){si++;cur=null;}
    setTimeout(tick,48+Math.random()*70);
  }
  setTimeout(tick,350);
})();

// interactive aurora orb — lerps toward the cursor inside each dark card
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('.hero-aurora').forEach(function(au){
    var bi=au.querySelector('.bi');if(!bi)return;
    var host=au.parentElement,tx=null,ty=null,cx=null,cy=null,running=false;
    function tick(){
      cx+=(tx-cx)/14;cy+=(ty-cy)/14;
      bi.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)';
      if(Math.abs(tx-cx)+Math.abs(ty-cy)>0.4){requestAnimationFrame(tick);}else{running=false;}
    }
    host.addEventListener('mousemove',function(e){
      var r=host.getBoundingClientRect();
      tx=e.clientX-r.left;ty=e.clientY-r.top;
      if(cx===null){cx=r.width/2;cy=r.height/2;}
      if(!running){running=true;requestAnimationFrame(tick);}
    });
  });
})();

// close mobile menu on link tap
document.querySelectorAll('.nav-menu a').forEach(function(a){a.addEventListener('click',function(){document.getElementById('navmenu').classList.remove('open');});});

// page loader — rotating mark, fades once the page is ready (2.5s hard cap)
(function(){
  var l=document.getElementById('page-loader');if(!l)return;
  var hidden=false;
  function hide(){if(hidden)return;hidden=true;l.classList.add('hide');setTimeout(function(){l.remove();},600);}
  if(document.readyState==='complete'){setTimeout(hide,200);}
  else{addEventListener('load',function(){setTimeout(hide,200);});}
  setTimeout(hide,2500);
})();

// scroll-driven statement — Automate slides left, Engage right, Scale down,
// and the mark between them rotates, all proportional to scroll progress
(function(){
  var st=document.getElementById('statement');if(!st)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var L=st.querySelector('.st-left'),R=st.querySelector('.st-right'),
      D=st.querySelector('.st-down'),G=st.querySelector('.st-logo');
  var ticking=false;
  function update(){
    ticking=false;
    var r=st.getBoundingClientRect(),vh=innerHeight;
    var p=(vh-r.top)/(vh+r.height);      // 0 = entering below, 1 = left above
    p=Math.max(0,Math.min(1,p));
    var e=Math.max(0,(p-0.25)/0.75);     // hold together until well in view
    L.style.transform='translateX('+(-e*34)+'vw)';
    R.style.transform='translateX('+(e*34)+'vw)';
    D.style.transform='translateY('+(e*190)+'px)';
    G.style.transform='rotate('+(p*540)+'deg)';   // mark spins the whole way
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);
  update();
})();

// liquid glass — the rim highlight angle follows scroll, so glass edges
// appear to refract the light of the content moving beneath them
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var ticking=false;
  addEventListener('scroll',function(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      document.documentElement.style.setProperty('--lg-angle',(135+scrollY*0.12)%360+'deg');
    });
  },{passive:true});
})();

// cookie consent — shown once, choice kept in localStorage
(function(){
  try{if(localStorage.getItem('at-cookie-consent'))return;}catch(e){return;}
  var bar=document.createElement('div');
  bar.className='cookie-bar';bar.setAttribute('role','dialog');bar.setAttribute('aria-label','Cookie consent');
  bar.innerHTML='<p>We use cookies to improve your experience and understand how our site is used. Non-essential cookies are only set if you accept.</p>'+
    '<div class="cookie-actions"><button type="button" class="cookie-accept">Accept</button><button type="button" class="cookie-decline">Decline</button></div>';
  document.body.appendChild(bar);
  function choose(v){try{localStorage.setItem('at-cookie-consent',v);}catch(e){}bar.remove();}
  bar.querySelector('.cookie-accept').addEventListener('click',function(){choose('accepted');});
  bar.querySelector('.cookie-decline').addEventListener('click',function(){choose('declined');});
})();

// back to top — appears after the hero, smooth-scrolls home
(function(){
  var b=document.getElementById('totop');if(!b)return;
  addEventListener('scroll',function(){b.classList.toggle('show',scrollY>600);},{passive:true});
  b.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
})();

// regional languages — drives Google Translate via its googtrans cookie:
// pick a language, cookie is set, page reloads, GT translates in place.
(function(){
  var menu=document.getElementById('langmenu');if(!menu)return;
  function current(){var m=document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-z-]+)/i);return m?m[1]:'en';}
  var cur=menu.querySelector('.lang-cur');
  if(cur)cur.textContent=current().toUpperCase();
  if(current()!=='en'){ // returning translated visitor: boot the GT engine
    var d=document.createElement('div');d.id='google_translate_element';document.body.appendChild(d);
    window.googleTranslateElementInit=function(){new google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'google_translate_element');};
    var s=document.createElement('script');s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';s.defer=true;document.head.appendChild(s);
  }
  menu.querySelectorAll('.lang-list button').forEach(function(btn){
    btn.addEventListener('click',function(){
      var code=btn.getAttribute('data-lang');
      if(code==='en'){
        document.cookie='googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie='googtrans=;path=/;domain='+location.hostname+';expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie='googtrans=;path=/;domain=.'+location.hostname+';expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }else{
        document.cookie='googtrans=/en/'+code+';path=/';
      }
      location.reload();
    });
  });
  document.addEventListener('click',function(e){if(menu.open&&!menu.contains(e.target))menu.open=false;});
})();
