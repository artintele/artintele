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
  // scoped to the current viewport: content further down (services,
  // industries, process) keeps its pop-in as the user scrolls to it
  setTimeout(function(){els.forEach(function(e){if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in');});},4000);
})();

// hero headline typing — the full headline is laid out invisibly from the
// first frame (zero layout shift) and characters are revealed in place.
// No cursor. Skipped for reduced-motion users.
(function(){
  var h1=document.getElementById('hero-type');
  if(!h1||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var sizer=document.createElement('span');sizer.className='type-sizer';sizer.setAttribute('aria-hidden','true');
  sizer.innerHTML='Automate Your Business<br><span class="with">with</span><br><span class="ai-word">AI</span>';
  var live=document.createElement('span');live.className='type-live';
  h1.innerHTML='';h1.appendChild(sizer);h1.appendChild(live);

  function addChars(target,text,seq){
    for(var i=0;i<text.length;i++){
      var s=document.createElement('span');
      s.textContent=text.charAt(i);s.style.visibility='hidden';
      target.appendChild(s);seq.push(s);
    }
  }
  var seq=[];
  addChars(live,'Automate Your Business',seq);
  live.appendChild(document.createElement('br'));
  var withEl=document.createElement('span');withEl.className='with';live.appendChild(withEl);
  addChars(withEl,'with',seq);
  live.appendChild(document.createElement('br'));
  var acc=document.createElement('span');acc.className='ai-word';live.appendChild(acc);
  addChars(acc,'AI',seq);

  var i=0;
  function tick(){
    if(i>=seq.length)return;
    seq[i].style.visibility='visible';
    i++;
    setTimeout(tick,7+Math.random()*9);
  }
  setTimeout(tick,120);
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

// close mobile menu on any tap outside the nav (hero, cards, anywhere)
document.addEventListener('click',function(e){
  var m=document.getElementById('navmenu');
  if(m&&m.classList.contains('open')&&!(e.target.closest&&e.target.closest('#topnav')))m.classList.remove('open');
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){var m=document.getElementById('navmenu');if(m)m.classList.remove('open');}
});

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
    // same 34vw throw everywhere (vw scales with the screen by nature);
    // only the fixed-px drop shrinks so Scale. stays inside the section
    var drop=innerWidth<=640?80:190;
    L.style.transform='translateX('+(-e*34)+'vw)';
    R.style.transform='translateX('+(e*34)+'vw)';
    D.style.transform='translateY('+(e*drop)+'px)';
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
    bar.innerHTML='<p>We use essential cookies to keep the site working. We don\u2019t currently set any '+
      'analytics or advertising cookies \u2014 if that changes, we\u2019ll ask first. '+
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
  var indCards=document.querySelectorAll('.ind[data-ind]');

  var DETAIL={
    1:{lead:'Human-like voice agents that answer and place calls around the clock, so every caller reaches a real conversation instead of a queue.',
       points:['Answers on the first ring, 24/7 — no hold music, no voicemail, no missed leads','Handles many calls at once, so a rush never becomes a backlog','Qualifies the caller, books the appointment and writes it straight into your CRM','Escalates to a human the moment a call needs one, with full context attached']},
    2:{lead:'An always-on front desk and outbound telecaller in one — greeting every caller and chasing every lead without a rota to manage.',
       points:['Greets, routes and books exactly to your script and business hours','Runs outbound follow-up campaigns on your lead list automatically','Never calls in sick, never churns, and needs no retraining cycle','Every call logged, transcribed and searchable in your dashboard']},
    3:{lead:'The repetitive steps between your tools, running end to end without a person copying data across screens.',
       points:['Connects the systems you already use — CRM, sheets, billing, messaging','Removes the manual re-entry where most costly errors creep in','Runs on a trigger or a schedule, silently, at any hour','Full audit trail so you can see exactly what ran and when']},
    4:{lead:'Conversational agents on your website and WhatsApp that converse with visitors around the clock \u2014 qualifying and supporting them, and converting leads into customers while your team sleeps.',
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


  // industry deep-dives — same panel, sector-specific content
  var IND_DETAIL={
    1:{lead:'Clinics and hospitals lose bookings to busy lines and after-hours calls. An ArtIntele agent answers every one — and does the admin that follows.',
       points:['Appointment booking and rescheduling handled inside the call, synced to your calendar','Automated reminders on WhatsApp and voice that cut no-shows sharply','Insurance and document workflows — collect, check and file without front-desk time','Patient support in the caller\u2019s own language, any hour of the night']},
    2:{lead:'Admissions season floods coaching institutes and colleges with the same questions. Answer all of them instantly — and never lose a serious enquiry.',
       points:['Every admissions enquiry answered on the first ring or first message','Leads qualified by course, budget and intent before a counsellor steps in','Fee reminders and enrolment follow-ups run automatically','Parents and students get updates on WhatsApp in their own language']},
    3:{lead:'In real estate, the first agent to respond usually wins the client. Make that response instant, every time.',
       points:['Instant response to every portal lead, at 2 pm or 2 am','Site visits scheduled inside the conversation and written to your CRM','Automated follow-up sequences that keep warm buyers engaged','Listing questions — price, area, amenities — answered without an agent']},
    4:{lead:'Manufacturing runs on coordination — vendors, orders, status checks. Automate the communication layer and the plant keeps moving.',
       points:['Vendor calls and follow-ups handled by the agent, logged automatically','Order status and dispatch updates pushed to customers proactively','Process and shift reports compiled and delivered on schedule','Document intake — POs, invoices, challans — captured and filed']},
    5:{lead:'Financial services need speed on the front end and rigour underneath. Our agents deliver both, with every interaction logged.',
       points:['KYC documents requested, collected and checked automatically','Payment and renewal reminders that customers actually answer','Support queries resolved instantly, escalated with full context when needed','A complete, searchable log of every conversation for compliance']},
    6:{lead:'Retail customers ask the same questions all day — and buy from whoever answers first. Put the answers on autopilot.',
       points:['Order status, returns and exchange requests handled end to end','Customer engagement campaigns on WhatsApp — offers, restocks, festivals','Every enquiry answered instantly during sale-season spikes','Feedback collected after purchase, flagged to you when it needs action']}
  };

  var numEl=document.getElementById('svc-modal-num'),
      titleEl=document.getElementById('svc-modal-title'),
      leadEl=document.getElementById('svc-modal-lead'),
      listEl=document.getElementById('svc-modal-list'),
      closeEl=modal.querySelector('.svc-modal-close'),
      lastFocus=null;

  function open(card){
    var isInd=card.hasAttribute('data-ind');
    var id=parseInt(card.getAttribute(isInd?'data-ind':'data-svc'),10);
    var d=(isInd?IND_DETAIL:DETAIL)[id];if(!d)return;
    lastFocus=card;
    numEl.textContent=isInd?'/ Industry':'/ Service';
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
  indCards.forEach(function(c){c.addEventListener('click',function(){open(c);});});
  closeEl.addEventListener('click',close);
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)close();});
})();

// email links open a real compose window in a new tab. A bare mailto: does
// nothing for the many visitors with no default mail app registered (normal
// on desktop when you live in webmail), so the address looked dead. We open
// Gmail's compose view pre-addressed to us — the visitor just types and
// sends — and offer Outlook / their own mail app as alternatives.
(function(){
  var toast=null,timer=null;

  function compose(service,addr,subject){
    var to=encodeURIComponent(addr), su=encodeURIComponent(subject||'');
    if(service==='gmail')
      return 'https://mail.google.com/mail/?view=cm&fs=1&to='+to+'&su='+su;
    if(service==='outlook')
      return 'https://outlook.live.com/mail/0/deeplink/compose?to='+to+'&subject='+su;
    return 'mailto:'+addr+(subject?'?subject='+su:'');
  }

  function show(addr,subject){
    if(!toast){toast=document.createElement('div');toast.className='mail-toast';document.body.appendChild(toast);}
    toast.innerHTML='';
    var p=document.createElement('span');
    p.className='mail-toast-text';
    p.textContent='Opening Gmail — not your provider?';
    toast.appendChild(p);
    [['Outlook','outlook'],['Mail app','app']].forEach(function(o){
      var a=document.createElement('a');
      a.textContent=o[0];
      a.href=compose(o[1],addr,subject);
      if(o[1]!=='app'){a.target='_blank';a.rel='noopener';}
      toast.appendChild(a);
    });
    var copy=document.createElement('button');
    copy.type='button';copy.textContent='Copy address';
    copy.addEventListener('click',function(){
      if(navigator.clipboard&&navigator.clipboard.writeText)
        navigator.clipboard.writeText(addr).then(function(){copy.textContent='Copied';});
    });
    toast.appendChild(copy);
    requestAnimationFrame(function(){toast.classList.add('show');});
    clearTimeout(timer);
    timer=setTimeout(function(){toast.classList.remove('show');},9000);
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="mailto:"]');
    if(!a)return;
    if(e.metaKey||e.ctrlKey||e.shiftKey)return;      // let power users override
    var href=a.getAttribute('href').replace(/^mailto:/,'');
    var addr=href.split('?')[0];
    var m=/[?&]subject=([^&]*)/i.exec(href);
    var subject=m?decodeURIComponent(m[1]):'Enquiry for ArtIntele.ai';
    e.preventDefault();
    window.open(compose('gmail',addr,subject),'_blank','noopener');
    show(addr,subject);
  });
})();
