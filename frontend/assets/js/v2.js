// nav border on scroll
var nav=document.getElementById('topnav');
addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>10);},{passive:true});

// live-call simulation for the Custom AI Voices section: an AI agent and a
// caller taking turns, so the animation explains itself. Only runs while the
// section is on screen.
(function(){
  var root=document.getElementById('voicecall');if(!root)return;
  var log=document.getElementById('vc-log'),bars=document.getElementById('vc-bars'),
      stateEl=document.getElementById('vc-state'),roleEl=document.getElementById('vc-role'),
      timeEl=document.getElementById('vc-time');

  for(var i=0;i<5;i++){var b=document.createElement('i');b.style.animationDelay=(i*0.12)+'s';bars.appendChild(b);}

  var SCRIPT=[
    {who:'ai',   tag:'ArtIntele AI', text:'Good evening, thanks for calling Sunrise Clinic. How can I help?'},
    {who:'caller',tag:'Caller',      text:'Hi — I need to book an appointment for tomorrow.'},
    {who:'ai',   tag:'ArtIntele AI', text:'Of course. Dr. Rao has 11:30 am or 4 pm free tomorrow.'},
    {who:'caller',tag:'Caller',      text:'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಆಗುತ್ತಾ?'},
    {who:'ai',   tag:'ArtIntele AI', text:'ಖಂಡಿತ — 11:30ಕ್ಕೆ ಬುಕ್ ಮಾಡಿದ್ದೇನೆ. Confirmation is on its way via WhatsApp.'},
    {who:'ai',   tag:'ArtIntele AI', text:'Saved to your CRM as a booked appointment. Anything else?'}
  ];

  var idx=0,secs=0,timer=null,tick=null,running=false;
  function two(n){return (n<10?'0':'')+n;}

  function step(){
    var m=SCRIPT[idx];
    root.classList.toggle('speaking', m.who==='ai');
    roleEl.textContent = m.who==='ai' ? 'ArtIntele AI agent' : 'Caller';
    stateEl.textContent = m.who==='ai' ? 'Speaking…' : 'Listening…';

    var el=document.createElement('div');
    el.className='vc-msg '+m.who;
    el.innerHTML='<span class="tag"></span>';
    el.querySelector('.tag').textContent=m.tag;
    el.appendChild(document.createTextNode(m.text));
    log.appendChild(el);
    while(log.children.length>3)log.removeChild(log.firstChild);

    idx++;
    if(idx>=SCRIPT.length){
      timer=setTimeout(function(){log.innerHTML='';idx=0;secs=0;step();},3200);
    }else{
      timer=setTimeout(step, 1900 + m.text.length*22);
    }
  }
  function start(){
    if(running)return;running=true;
    step();
    tick=setInterval(function(){secs++;timeEl.textContent=two(Math.floor(secs/60))+':'+two(secs%60);},1000);
  }
  function stop(){running=false;clearTimeout(timer);clearInterval(tick);root.classList.remove('speaking');}

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){e.isIntersecting?start():stop();});
    },{threshold:0.25}).observe(root);
  }else{start();}
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

// cookie consent — banner on first visit, and a re-openable settings panel
// so consent can be WITHDRAWN as easily as it was given (DPDP / GDPR both
// require that; previously the choice was final once made).
(function(){
  var KEY='at-cookie-consent';
  function get(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function set(v){try{localStorage.setItem(KEY,v);}catch(e){}
    document.dispatchEvent(new CustomEvent('at-consent',{detail:v}));}

  var bar=null;
  function build(current){
    if(bar)return bar;
    bar=document.createElement('div');
    bar.className='cookie-bar';bar.setAttribute('role','dialog');
    bar.setAttribute('aria-label','Cookie consent');
    bar.innerHTML='<p>We use cookies to improve your experience and understand how our site is used. '+
      'Essential cookies keep the site working; non-essential ones are only set if you accept. '+
      'Read our <a href="/cookies">Cookie Policy</a> and <a href="/privacy">Privacy Policy</a>.</p>'+
      '<div class="cookie-actions"><button type="button" class="cookie-accept">Accept</button>'+
      '<button type="button" class="cookie-decline">Decline</button></div>';
    document.body.appendChild(bar);
    bar.querySelector('.cookie-accept').addEventListener('click',function(){set('accepted');close();});
    bar.querySelector('.cookie-decline').addEventListener('click',function(){set('declined');close();});
    return bar;
  }
  function close(){if(bar){bar.remove();bar=null;}}

  // public hook — the footer "Cookie Settings" link and the cookie policy
  // page both use this to bring the choice back up at any time.
  window.artinteleCookieSettings=function(){build(get());};
  window.artinteleConsent=get;

  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('#cookie-settings,[data-cookie-settings]');
    if(t){e.preventDefault();window.artinteleCookieSettings();}
  });

  if(!get())build(null);   // first visit only
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

// service detail modal — each "/ What we deliver" card opens an in-depth
// panel that reuses the hero's drifting-aurora gradient.
(function(){
  var modal=document.getElementById('svc-modal');if(!modal)return;
  var cards=document.querySelectorAll('.svc[data-svc]');if(!cards.length)return;

  var DETAIL={
    1:{lead:'Human-like voice agents that answer and place calls around the clock, so every caller reaches a real conversation instead of a queue.',
       points:['Answers on the first ring, 24/7 — no hold music, no voicemail, no missed leads','Handles many calls at once, so a rush never becomes a backlog','Qualifies the caller, books the appointment and writes it straight into your CRM','Escalates to a human the moment a call needs one, with full context attached']},
    2:{lead:'An always-on front desk and outbound telecaller in one — greeting every caller and chasing every lead without a rota to manage.',
       points:['Greets, routes and books exactly to your script and business hours','Runs outbound follow-up campaigns on your lead list automatically','Never calls in sick, never churns, and needs no retraining cycle','Every call logged, transcribed and searchable in your dashboard']},
    3:{lead:'The repetitive steps between your tools, running end to end without a person copying data across screens.',
       points:['Connects the systems you already use — CRM, sheets, billing, messaging','Removes the manual re-entry where most costly errors creep in','Runs on a trigger or a schedule, silently, at any hour','Full audit trail so you can see exactly what ran and when']},
    4:{lead:'Conversational agents on your website and WhatsApp that qualify, support and convert while your team sleeps.',
       points:['Answers product questions instantly, in your customer’s language','Captures and qualifies the lead inside the conversation','Hands off to a human with the full chat history attached','Learns from your real content — not generic canned replies']},
    5:{lead:'Turn the documents, SOPs and tribal knowledge sitting in folders into an assistant your team can simply ask.',
       points:['Answers grounded in your own documents, with the source cited','Cuts the "who knows how to do this?" delay for new staff','Works for internal teams and customer-facing support alike','Updates as your documents update — no manual re-training']},
    6:{lead:'A clear-eyed look at where AI actually pays off in your business, and a roadmap to get there in the right order.',
       points:['We map your current workflows before proposing a single tool','Highest-ROI opportunities identified and sequenced first','Honest about what AI should not do in your operation','You keep the roadmap whether or not you build it with us']},
    7:{lead:'When an off-the-shelf tool cannot fit the way you work, ArtIntele builds the system around your process instead.',
       points:['Built to your exact workflow — never a rigid template','Integrates with the systems and databases you already run','Designed to scale as your volume grows','You own the result, documented and handed over properly']},
    8:{lead:'A branded voice that sounds like your business, speaking whichever language your customers actually use.',
       points:['Custom voice identity matched to your brand and industry','Any regional language or dialect — the listed six are examples, not a limit','Natural turn-taking, interruptions and pacing, not robotic read-out','Consistent across every call, every hour, every campaign']},
    9:{lead:'High-performance websites engineered to be found by search engines and quoted by AI answer engines alike.',
       points:['Built for SEO, AEO, GEO and GAIO from the first line of markup','Fast by construction — performance is a requirement, not a retrofit','Structured data so AI assistants can read and cite your business','Wired to your lead pipeline, so traffic turns into enquiries']},
    10:{lead:'Consistent, on-brand social presence handled end to end, so the channel keeps working without eating your week.',
       points:['Content planned, produced and scheduled to a steady rhythm','Engagement and replies handled in your brand voice','Creative shaped by what actually performs, not guesswork','Reporting that ties activity back to enquiries, not vanity metrics']},
    11:{lead:'Automated WhatsApp journeys on the official Business Platform — the channel your customers already answer.',
       points:['Built on the official WhatsApp Business Platform, fully compliant','Opt-in flows that keep your number in good standing','Qualifies leads, sends updates and replies instantly, at scale','No grey-market tools and no ban risk from bulk-blasting']},
    12:{lead:'A CRM set up around how your team actually sells, so no enquiry quietly goes cold.',
       points:['Every lead captured automatically from every channel you run','Follow-ups organised, assigned and chased on schedule','Integrated with your calls, WhatsApp and web forms','Reporting that shows where leads come from and where they stall']}
  };

  var numEl=document.getElementById('svc-modal-num'),
      titleEl=document.getElementById('svc-modal-title'),
      leadEl=document.getElementById('svc-modal-lead'),
      listEl=document.getElementById('svc-modal-list'),
      closeEl=modal.querySelector('.svc-modal-close'),
      lastFocus=null;

  function open(card){
    var id=parseInt(card.getAttribute('data-svc'),10),d=DETAIL[id];if(!d)return;
    lastFocus=card;
    numEl.textContent=card.querySelector('.num').textContent;
    titleEl.textContent=card.querySelector('h3').textContent;
    leadEl.textContent=d.lead;
    listEl.innerHTML='';
    d.points.forEach(function(p){var li=document.createElement('li');li.textContent=p;listEl.appendChild(li);});
    modal.hidden=false;
    requestAnimationFrame(function(){modal.classList.add('open');});
    document.body.classList.add('modal-open');
    closeEl.focus();
  }
  function close(){
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    setTimeout(function(){modal.hidden=true;},300);
    if(lastFocus)lastFocus.focus();
  }

  cards.forEach(function(c){c.addEventListener('click',function(){open(c);});});
  closeEl.addEventListener('click',close);
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)close();});
})();
