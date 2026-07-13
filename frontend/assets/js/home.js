// Home page — data rendering + all animations (ported from the DC component
// into plain, framework-free JS).
(function () {
  var timers = [];
  function T(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  var DATA = {
    services: [
      { n: '01', title: 'AI Voice Agents', desc: 'Human-like agents handle inbound and outbound calls 24/7, so no lead or customer ever goes unanswered.' },
      { n: '02', title: 'AI Receptionists', desc: 'A tireless front desk that greets callers, routes requests, and books appointments — no hold music, no missed calls.' },
      { n: '03', title: 'Workflow Automation', desc: 'Connect your tools and let AI run the repetitive steps end to end, cutting manual work and costly errors.' },
      { n: '04', title: 'AI Chatbots', desc: 'Conversational assistants on your site and WhatsApp that qualify, support, and convert visitors around the clock.' },
      { n: '05', title: 'Knowledge Assistants', desc: 'Turn your documents and SOPs into an assistant your team and customers can simply ask.' },
      { n: '06', title: 'AI Consulting', desc: 'We map where AI pays off fastest and build the roadmap to get you there.' },
      { n: '07', title: 'Custom AI Development', desc: 'Bespoke agents and integrations built around your exact processes — never a rigid template.' },
      { n: '08', title: 'Custom AI Voices', desc: 'Branded, multilingual voices that sound like your business, in the languages your customers speak.' },
      { n: '09', title: 'Website Development & SEO', desc: 'High-performance websites engineered for SEO, AEO, GEO & GAIO — so you rank in search and surface in AI answers.' },
      { n: '10', title: 'Social Media Handling', desc: 'End-to-end social media management — content, scheduling, and engagement that keeps your brand active and growing.' },
      { n: '11', title: 'WhatsApp Automation', desc: 'Automated WhatsApp journeys that qualify leads, send updates, and reply instantly — at scale, around the clock.' },
      { n: '12', title: 'CRM Tools', desc: 'Custom CRM setups and integrations that capture every lead and keep your follow-ups organised.' },
      { n: '13', title: 'Customized AI Tools', desc: 'Bespoke AI tools built around your exact workflows — from internal copilots to customer-facing assistants.' }
    ],
    voiceCaps: [
      'Custom voice personalities', 'Multilingual voices', 'Brand-aligned communication', 'Voice cloning with consent',
      'Receptionist voices', 'Sales voices', 'Educational counsellor voices', 'Healthcare support voices'
    ],
    languages: ['English', 'Kannada', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'],
    industries: [
      { name: 'Healthcare', items: ['Appointment booking', 'Insurance workflows', 'Patient support'] },
      { name: 'Education', items: ['Admissions', 'Lead qualification', 'Student support'] },
      { name: 'Real Estate', items: ['Lead handling', 'Site visit scheduling', 'Follow-up automation'] },
      { name: 'Manufacturing', items: ['Reporting', 'Vendor communication', 'Process tracking'] },
      { name: 'Finance', items: ['Document processing', 'Customer support', 'KYC workflows'] },
      { name: 'Retail', items: ['Customer engagement', 'Order support', 'Returns handling'] }
    ],
    processSteps: [
      { n: '1', title: 'Discovery', desc: 'We learn your business and goals.' },
      { n: '2', title: 'Workflow Analysis', desc: 'We map the processes worth automating.' },
      { n: '3', title: 'Solution Design', desc: 'We architect the right agents and flows.' },
      { n: '4', title: 'Development', desc: 'We build and integrate with your stack.' },
      { n: '5', title: 'Deployment', desc: 'We launch into your live operations.' },
      { n: '6', title: 'Optimization', desc: 'We measure, tune, and improve continuously.' },
      { n: '7', title: 'Maintenance', desc: 'We keep systems patched, monitored, and reliably running.' }
    ],
    caseStudies: [
      { n: '01', title: 'Hospital AI Receptionist', desc: 'Answers patient calls, books appointments, and routes emergencies — clearing routine queries off the front desk automatically.' },
      { n: '02', title: 'Educational Admissions Assistant', desc: 'Qualifies prospective students, answers program questions, and schedules counsellor calls across multiple languages.' },
      { n: '03', title: 'Lead Qualification Agent', desc: 'Calls and chats with inbound leads instantly, scores them, and hands the hot ones to sales.' },
      { n: '04', title: 'Customer Support Automation', desc: 'Resolves common tickets end to end and escalates the rest with full context attached.' },
      { n: '05', title: 'Invoice Processing Workflow', desc: 'Reads, validates, and files invoices into your systems — with humans only on the exceptions.' }
    ]
  };

  var indTags = { Healthcare: 'Patient-facing care, 24/7', Education: 'From inquiry to enrollment', 'Real Estate': 'Never let a lead go cold', Manufacturing: 'Operations that run themselves', Finance: 'Compliant, accurate, automated', Retail: 'Always-on customer care' };

  // ---- static data sections --------------------------------------------
  function renderStatic() {
    var sv = document.getElementById('artintele-services');
    if (sv) sv.innerHTML = DATA.services.map(function (s) {
      return '<div class="ai-card" data-reveal style="position:relative;padding:26px;border-radius:18px;border:1px solid rgba(var(--border),0.22);background:linear-gradient(160deg,rgba(var(--surface),0.88),rgba(var(--surface),0.53));backdrop-filter:blur(20px) saturate(120%);-webkit-backdrop-filter:blur(20px);box-shadow:0 24px 60px -24px rgba(var(--shadow),0.22),inset 0 1px 0 rgba(var(--edge),0.85);min-height:188px;display:flex;flex-direction:column;">'
        + '<span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:6px;height:6px;border-radius:50%;background:#2bbf7a;box-shadow:0 0 8px rgba(43,191,122,0.7);animation:ai-pulse 2s ease-in-out infinite;"></span><span style="font-family:\'Space Mono\';font-size:12px;color:rgba(var(--label),0.62);">' + s.n + '</span></span>'
        + '<h3 style="font-family:\'Sora\';font-weight:600;font-size:19px;letter-spacing:-0.01em;margin:14px 0 10px;">' + s.title + '</h3>'
        + '<p style="margin:0;font-size:13.5px;line-height:1.5;color:rgba(var(--text),0.66);">' + s.desc + '</p></div>';
    }).join('');

    var lg = document.getElementById('artintele-languages');
    if (lg) lg.innerHTML = DATA.languages.map(function (l) {
      return '<span style="font-family:\'Space Mono\';font-size:12.5px;padding:8px 14px;border-radius:100px;border:1px solid rgba(var(--border),0.3);background:rgba(var(--surface),0.55);color:rgba(var(--text),0.85);">' + l + '</span>';
    }).join('') +
      // the listed languages are examples — voices are built for any regional language
      '<span style="font-family:\'Space Mono\';font-size:12.5px;padding:8px 14px;border-radius:100px;border:1px dashed rgba(40,150,95,0.55);background:rgba(31,157,91,0.10);color:rgba(var(--label),0.95);">+ your regional language</span>';

    var vc = document.getElementById('artintele-voicecaps');
    if (vc) vc.innerHTML = DATA.voiceCaps.map(function (c) {
      return '<div style="display:flex;align-items:center;gap:10px;font-size:13.5px;color:rgba(var(--label),0.92);padding:11px 14px;border-radius:11px;border:1px solid rgba(var(--border),0.18);background:rgba(var(--surface),0.5);"><span style="width:6px;height:6px;border-radius:50%;background:#2bbf7a;box-shadow:0 0 8px rgba(43,191,122,0.7);flex:none;"></span>' + c + '</div>';
    }).join('');

    var pr = document.getElementById('artintele-process');
    if (pr) DATA.processSteps.forEach(function (st) {
      var d = document.createElement('div');
      d.style.cssText = 'position:relative;padding:0 12px;text-align:center;';
      d.innerHTML = '<div style="width:46px;height:46px;margin:0 auto 20px;border-radius:50%;border:1px solid rgba(var(--border),0.36);background:var(--chip);display:flex;align-items:center;justify-content:center;font-family:\'Space Mono\';font-size:14px;color:rgba(var(--head),1);box-shadow:0 0 24px rgba(35,150,95,0.2),inset 0 1px 0 rgba(var(--edge),0.9);">' + st.n + '</div>'
        + '<h3 style="font-family:\'Sora\';font-weight:600;font-size:15.5px;margin:0 0 8px;letter-spacing:-0.01em;">' + st.title + '</h3>'
        + '<p style="margin:0;font-size:12.5px;line-height:1.5;color:rgba(var(--text),0.6);">' + st.desc + '</p>';
      pr.appendChild(d);
    });

    var cs = document.getElementById('artintele-cases');
    if (cs) cs.innerHTML = DATA.caseStudies.map(function (c) {
      return '<div class="ai-card" data-reveal style="position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;padding:24px 30px;border-radius:18px;border:1px solid rgba(var(--border),0.22);background:linear-gradient(160deg,rgba(var(--surface),0.86),rgba(var(--surface),0.49));backdrop-filter:blur(20px) saturate(120%);-webkit-backdrop-filter:blur(20px);box-shadow:0 24px 60px -24px rgba(var(--shadow),0.22),inset 0 1px 0 rgba(var(--edge),0.85);">'
        + '<span style="font-family:\'Space Mono\';font-size:12px;color:rgba(var(--label),0.62);">' + c.n + '</span>'
        + '<div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><h3 style="font-family:\'Sora\';font-weight:600;font-size:19px;margin:0;letter-spacing:-0.01em;">' + c.title + '</h3>'
        + '<span style="font-family:\'Space Mono\';font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:100px;border:1px solid rgba(var(--edge),0.2);color:rgba(var(--text),0.68);">Sample Solution</span></div>'
        + '<p style="margin:9px 0 0;font-size:14px;line-height:1.5;color:rgba(var(--text),0.66);max-width:78ch;">' + c.desc + '</p></div>'
        + '<span style="font-size:22px;color:rgba(35,140,90,0.6);">&rarr;</span></div>';
    }).join('');
  }

  // ---- reveal on scroll -------------------------------------------------
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length || !('IntersectionObserver' in window)) return;
    els.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1)';
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---- hero typing ------------------------------------------------------
  function startTyping() {
    var target = document.getElementById('artintele-type-text');
    if (!target) return;
    var full = 'Automate Your Business With AI';
    var i = 0;
    var tick = function () {
      target.textContent = full.slice(0, i);
      if (i <= full.length) { i++; T(tick, 48 + Math.random() * 70); }
    };
    T(tick, 350);
  }

  // ---- WhatsApp demo ----------------------------------------------------
  function startWhatsApp() {
    var box = document.getElementById('artintele-wa-chat');
    if (!box) return;
    var script = [
      { side: 'in', text: 'Hi, do you have any slots today?' },
      { side: 'typing' },
      { side: 'out', text: "Yes — we're open till 9 PM. Want me to book one?" },
      { side: 'in', text: 'Yes, 6 PM please' },
      { side: 'typing' },
      { side: 'out', text: 'Booked for 6:00 PM. Confirmation sent.', read: true }
    ];
    var mkBubble = function (m) {
      var out = m.side === 'out';
      var wrap = document.createElement('div');
      wrap.style.cssText = 'align-self:' + (out ? 'flex-end' : 'flex-start') + ';max-width:82%;opacity:0;transform:translateY(8px) scale(0.96);transition:opacity .35s ease,transform .35s ease;';
      var b = document.createElement('div');
      b.style.cssText = 'position:relative;font-size:12.5px;line-height:1.45;padding:8px 11px;border-radius:12px;border-' + (out ? 'bottom-right' : 'bottom-left') + '-radius:3px;color:#2a3a30;background:' + (out ? '#d6f5cc' : '#ffffff') + ';box-shadow:0 1px 1.5px rgba(0,0,0,0.08);';
      b.textContent = m.text;
      if (out) { var t = document.createElement('span'); t.textContent = ' ✓✓'; t.style.cssText = 'font-size:10px;color:' + (m.read ? '#3aa3ff' : 'rgba(0,0,0,0.28)') + ';margin-left:3px;white-space:nowrap;'; b.appendChild(t); }
      wrap.appendChild(b);
      return wrap;
    };
    var mkTyping = function () {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'align-self:flex-start;opacity:0;transform:translateY(8px);transition:opacity .3s ease,transform .3s ease;';
      var b = document.createElement('div');
      b.style.cssText = 'display:flex;gap:4px;padding:11px 12px;border-radius:12px;border-bottom-left-radius:3px;background:#fff;box-shadow:0 1px 1.5px rgba(0,0,0,0.08);';
      for (var i = 0; i < 3; i++) { var d = document.createElement('span'); d.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#9aa5a0;animation:ai-dot 1.2s ' + (i * 0.18) + 's infinite;'; b.appendChild(d); }
      wrap.appendChild(b);
      return wrap;
    };
    var i = 0, nodes = [];
    var run = function () {
      if (i >= script.length) {
        T(function () {
          nodes.forEach(function (n) { n.style.opacity = '0'; n.style.transform = 'translateY(-6px)'; });
          T(function () { box.innerHTML = ''; nodes = []; i = 0; run(); }, 520);
        }, 2800);
        return;
      }
      var step = script[i];
      if (step.side === 'typing') {
        var el = mkTyping(); box.appendChild(el); nodes.push(el);
        requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
        T(function () { el.remove(); nodes = nodes.filter(function (n) { return n !== el; }); i++; run(); }, 1300);
      } else {
        var b = mkBubble(step); box.appendChild(b); nodes.push(b);
        requestAnimationFrame(function () { b.style.opacity = '1'; b.style.transform = 'none'; });
        i++; T(run, step.side === 'in' ? 850 : 1500);
      }
    };
    T(run, 600);
  }

  // ---- workflow demo ----------------------------------------------------
  function startWorkflow() {
    var host = document.getElementById('artintele-flow');
    if (!host || host.childElementCount) return;
    var steps = ['Lead captured', 'AI qualifies lead', 'CRM updated', 'Meeting booked'];
    var nodeBase = function () { return "position:relative;z-index:2;width:27px;height:27px;border-radius:50%;flex:none;border:1px solid rgba(var(--border),0.4);background:rgba(var(--surface),0.85);display:flex;align-items:center;justify-content:center;font-family:'Space Mono';font-size:11px;color:#9a7ec8;transition:all .45s ease;"; };
    var rows = [];
    steps.forEach(function (s, idx) {
      var row = document.createElement('div');
      row.style.cssText = 'position:relative;display:flex;align-items:center;gap:14px;padding:8px 0;';
      if (idx < steps.length - 1) {
        var line = document.createElement('span');
        line.style.cssText = 'position:absolute;left:13px;top:31px;width:2px;height:24px;background:rgba(var(--border),0.2);z-index:1;border-radius:2px;overflow:hidden;';
        var fill = document.createElement('span');
        fill.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:0%;background:linear-gradient(to bottom,#1f9d5b,#36c07e);transition:height .5s ease;';
        line.appendChild(fill); row.appendChild(line); row._fill = fill;
      }
      var node = document.createElement('span'); node.style.cssText = nodeBase(); node.textContent = String(idx + 1);
      var label = document.createElement('span'); label.style.cssText = 'font-size:13.5px;color:rgba(var(--text),0.55);transition:color .45s ease,font-weight .45s ease;'; label.textContent = s;
      row.appendChild(node); row.appendChild(label);
      row._node = node; row._label = label;
      host.appendChild(row); rows.push(row);
    });
    var i = 0;
    var activate = function () {
      var row = rows[i];
      row._node.style.background = 'linear-gradient(135deg,#1f9d5b,#36c07e)';
      row._node.style.borderColor = 'transparent';
      row._node.style.color = '#fff';
      row._node.style.boxShadow = '0 6px 16px -4px rgba(35,150,95,0.6)';
      row._node.textContent = '✓';
      row._label.style.color = '#16241c';
      row._label.style.fontWeight = '600';
      if (row._fill) T(function () { row._fill.style.height = '100%'; }, 150);
      i++;
      if (i < rows.length) { T(activate, 850); }
      else {
        T(function () {
          rows.forEach(function (r, idx) { r._node.style.cssText = nodeBase(); r._node.textContent = String(idx + 1); r._label.style.color = 'rgba(var(--text),0.55)'; r._label.style.fontWeight = '400'; if (r._fill) r._fill.style.height = '0%'; });
          i = 0; T(activate, 650);
        }, 2600);
      }
    };
    T(activate, 700);
  }

  // ---- voice agent demo -------------------------------------------------
  function startVoice() {
    var bars = document.getElementById('artintele-voice-bars');
    var status = document.getElementById('artintele-voice-status');
    var tr = document.getElementById('artintele-voice-transcript');
    if (bars && !bars.childElementCount) {
      for (var i = 0; i < 22; i++) { var b = document.createElement('span'); var d = Math.abs(i - 11) / 11; var h = 6 + (1 - d) * 26; b.style.cssText = 'width:3px;height:' + h + 'px;border-radius:2px;background:linear-gradient(to top,#1f9d5b,#36c07e);transform-origin:center;transform:scaleY(0.3);'; bars.appendChild(b); }
    }
    var lines = ['Hi, thanks for calling Artintele. How can I help today?', 'Of course — I can book that appointment for you right now.'];
    var setActive = function (on) { if (!bars) return; Array.prototype.forEach.call(bars.children, function (b) { if (on) { b.style.animation = 'ai-wave ' + (0.5 + Math.random() * 0.6) + 's ease-in-out ' + (Math.random() * 0.5) + 's infinite'; } else { b.style.animation = 'none'; b.style.transform = 'scaleY(0.3)'; } }); };
    var phase = 0;
    var cycle = function () {
      if (status) { status.textContent = 'Incoming call…'; status.style.color = 'rgba(var(--text),0.7)'; }
      if (tr) tr.textContent = '';
      setActive(false);
      T(function () {
        if (status) { status.textContent = 'Connected · 00:0' + (1 + Math.floor(Math.random() * 4)); status.style.color = '#2c9e6a'; }
        setActive(true);
        var line = lines[phase % lines.length]; phase++;
        var c = 0; var type = function () { if (!tr) return; tr.textContent = line.slice(0, c); if (c++ <= line.length) T(type, 30); };
        T(type, 450);
        T(function () { setActive(false); if (status) { status.textContent = 'Call completed'; status.style.color = 'rgba(var(--text),0.6)'; } T(cycle, 1600); }, 4400);
      }, 1900);
    };
    cycle();
  }

  // ---- industries -------------------------------------------------------
  var indState = { active: 0, token: 0, tabEls: [] };
  function startIndustries() {
    var tabHost = document.getElementById('artintele-ind-tabs');
    if (!tabHost || tabHost.childElementCount) return;
    DATA.industries.forEach(function (ind, i) {
      var t = document.createElement('button'); t.type = 'button';
      t.style.cssText = 'position:relative;text-align:left;cursor:pointer;padding:15px 16px 15px 20px;border-radius:14px;border:1px solid rgba(var(--border),0.2);background:rgba(var(--surface),0.5);transition:all .3s ease;font-family:inherit;';
      var bar = document.createElement('span'); bar.style.cssText = 'position:absolute;left:0;top:13px;bottom:13px;width:3px;border-radius:3px;background:linear-gradient(to bottom,#1f9d5b,#36c07e);opacity:0;transition:opacity .3s ease;';
      var name = document.createElement('div'); name.textContent = ind.name; name.style.cssText = "font-family:'Sora';font-weight:600;font-size:16px;color:rgba(var(--text),0.78);transition:color .3s ease;";
      var sub = document.createElement('div'); sub.textContent = ind.items.length + ' automations'; sub.style.cssText = 'font-size:11.5px;color:rgba(var(--label),0.6);margin-top:2px;';
      t.appendChild(bar); t.appendChild(name); t.appendChild(sub); t._bar = bar; t._name = name;
      t.addEventListener('mouseenter', function () { if (i !== indState.active) { t.style.borderColor = 'rgba(var(--border),0.4)'; t.style.background = 'rgba(var(--surface),0.72)'; } });
      t.addEventListener('mouseleave', function () { if (i !== indState.active) { t.style.borderColor = 'rgba(var(--border),0.2)'; t.style.background = 'rgba(var(--surface),0.5)'; } });
      t.addEventListener('click', function () { indShow(i); });
      tabHost.appendChild(t); indState.tabEls.push(t);
    });
    indShow(0);
  }
  function indShow(idx) {
    indState.active = idx;
    var token = ++indState.token;
    indState.tabEls.forEach(function (t, i) {
      var on = i === idx;
      t.style.background = on ? 'linear-gradient(135deg,rgba(70,190,130,0.2),rgba(120,205,165,0.16))' : 'rgba(var(--surface),0.5)';
      t.style.borderColor = on ? 'rgba(var(--border),0.5)' : 'rgba(var(--border),0.2)';
      t._bar.style.opacity = on ? '1' : '0';
      t._name.style.color = on ? '#16241c' : 'rgba(var(--text),0.78)';
    });
    var ind = DATA.industries[idx];
    var nameEl = document.getElementById('artintele-ind-name');
    var tagEl = document.getElementById('artintele-ind-tag');
    var box = document.getElementById('artintele-ind-items');
    if (nameEl) { nameEl.style.opacity = '0'; nameEl.style.transform = 'translateY(10px)'; T(function () { if (token !== indState.token) return; nameEl.textContent = ind.name; nameEl.style.opacity = '1'; nameEl.style.transform = 'none'; }, 130); }
    if (tagEl) { tagEl.style.opacity = '0'; T(function () { if (token !== indState.token) return; tagEl.textContent = indTags[ind.name] || ''; tagEl.style.opacity = '1'; }, 190); }
    if (box) { box.innerHTML = ''; ind.items.forEach(function (it, k) { T(function () { if (token !== indState.token) return; indAddRow(box, it); }, 280 + k * 640); }); }
    var total = 280 + ind.items.length * 640 + 2200;
    T(function () { if (token !== indState.token) return; indShow((idx + 1) % DATA.industries.length); }, total);
  }
  function indAddRow(box, label) {
    var row = document.createElement('div');
    row.style.cssText = 'position:relative;display:flex;align-items:center;gap:13px;padding:12px 14px;border-radius:12px;border:1px solid rgba(var(--border),0.18);background:rgba(var(--surface),0.55);overflow:hidden;opacity:0;transform:translateX(-10px);transition:opacity .4s ease,transform .4s ease;';
    var icon = document.createElement('span');
    icon.style.cssText = 'width:22px;height:22px;border-radius:50%;flex:none;box-sizing:border-box;border:2px solid rgba(var(--border),0.35);border-top-color:#1f9d5b;animation:ai-spin .7s linear infinite;';
    var lab = document.createElement('span'); lab.textContent = label; lab.style.cssText = 'font-size:14px;color:rgba(var(--text),0.8);flex:1;';
    var st = document.createElement('span'); st.textContent = 'Automating'; st.style.cssText = "font-family:'Space Mono';font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(var(--label),0.6);";
    var prog = document.createElement('span'); prog.style.cssText = 'position:absolute;left:0;bottom:0;height:2px;width:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(to right,#1f9d5b,#36c07e);transition:transform 1s ease;';
    row.appendChild(icon); row.appendChild(lab); row.appendChild(st); row.appendChild(prog);
    box.appendChild(row);
    requestAnimationFrame(function () { row.style.opacity = '1'; row.style.transform = 'none'; prog.style.transform = 'scaleX(1)'; });
    T(function () { icon.style.animation = 'none'; icon.style.border = 'none'; icon.style.background = 'linear-gradient(135deg,#1f9d5b,#36c07e)'; icon.style.boxShadow = '0 4px 12px -3px rgba(35,150,95,0.6)'; icon.style.display = 'flex'; icon.style.alignItems = 'center'; icon.style.justifyContent = 'center'; icon.style.color = '#fff'; icon.style.fontSize = '12px'; icon.textContent = '✓'; st.textContent = 'Automated'; st.style.color = '#2c9e6a'; }, 1000);
  }

  // ---- voice waveform ---------------------------------------------------
  function buildVoiceWave() {
    var host = document.getElementById('artintele-voicewave');
    if (!host || host.childElementCount) return;
    var N = 44;
    for (var i = 0; i < N; i++) {
      var b = document.createElement('div');
      var d = Math.abs(i - N / 2) / (N / 2);
      var h = 14 + (1 - d) * 74 + Math.random() * 10;
      b.style.cssText = 'width:4px;height:' + h + 'px;border-radius:3px;background:linear-gradient(to top,rgba(150,100,215,0.72),#c773b4);transform-origin:center;animation:ai-wave ' + (0.7 + Math.random() * 0.9) + 's ease-in-out ' + (Math.random() * 1.2) + 's infinite;';
      host.appendChild(b);
    }
  }

  // ---- scroll progress --------------------------------------------------
  // rAF-throttled with cached document metrics: scroll events never read
  // layout (scrollHeight/innerHeight forced a reflow per event before), and
  // the rail moves via transform so it stays compositor-only.
  var scrollGlow = null, scrollFill = null, scrollMax = 1, scrollWinH = 0, scrollTicking = false;
  function measureScroll() {
    scrollGlow = scrollGlow || document.getElementById('artintele-scroll-glow');
    scrollFill = scrollFill || document.getElementById('artintele-scroll-fill');
    scrollWinH = window.innerHeight;
    scrollMax = (document.documentElement.scrollHeight - scrollWinH) || 1;
  }
  function applyScroll() {
    scrollTicking = false;
    var p = Math.min(1, Math.max(0, window.scrollY / scrollMax));
    window.__artintele_scrollP = p;
    if (scrollGlow) scrollGlow.style.transform = 'translateY(' + (p * (scrollWinH - 96)) + 'px)';
    if (scrollFill) scrollFill.style.transform = 'scaleY(' + p + ')';
  }
  function onScroll() {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(applyScroll); }
  }

  // ---- 3D wireframe robot canvas ---------------------------------------
  function startRobot() {
    var canvas = document.getElementById('artintele-robot-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, DPR;
    var resize = function () {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var t = (1 + Math.sqrt(5)) / 2;
    var norm = function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
    var verts = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(norm);
    var faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    var midCache = {};
    var midpoint = function (a, b) {
      var key = a < b ? a + '_' + b : b + '_' + a;
      if (midCache[key] !== undefined) return midCache[key];
      var m = norm([(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2, (verts[a][2] + verts[b][2]) / 2]);
      verts.push(m); var idx = verts.length - 1; midCache[key] = idx; return idx;
    };
    var faces2 = [];
    faces.forEach(function (f) {
      var a = midpoint(f[0], f[1]), b = midpoint(f[1], f[2]), c = midpoint(f[2], f[0]);
      faces2.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]);
    });
    faces = faces2;
    var edgeSet = {}, edges = [];
    faces.forEach(function (f) {
      for (var i = 0; i < 3; i++) {
        var a = f[i], b = f[(i + 1) % 3];
        var key = a < b ? a + '_' + b : b + '_' + a;
        if (!edgeSet[key]) { edgeSet[key] = 1; edges.push([a, b]); }
      }
    });
    var eyes = [[-0.34, 0.16, 0.97], [0.34, 0.16, 0.97]];
    var mouth = [[-0.26, -0.42, 0.92], [-0.09, -0.46, 0.94], [0.09, -0.46, 0.94], [0.26, -0.42, 0.92]];
    var rotY = function (v, a) { var c = Math.cos(a), s = Math.sin(a); return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]]; };
    var rotX = function (v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]]; };
    var auto = 0;
    var start = performance.now();
    var rafId = null;
    var draw = function (now) {
      if (document.hidden) { rafId = null; return; }   // pause when tab is hidden (battery/CPU)
      var time = (now - start) / 1000;
      var ink = document.documentElement.dataset.theme === 'dark' ? '150,226,182' : '24,112,72';
      auto += 0.0016;
      var sp = window.__artintele_scrollP || 0;
      var ay = auto + sp * Math.PI * 2.2;
      var ax = -0.14 + Math.sin(time * 0.25) * 0.06;
      var cx = W * (W > 900 ? 0.66 : 0.5);
      var cy = H * 0.46;
      var R = Math.min(W, H) * 0.27;
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6);
      g.addColorStop(0, 'rgba(60,190,130,0.34)');
      g.addColorStop(0.45, 'rgba(150,205,165,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var P = new Array(verts.length);
      for (var i = 0; i < verts.length; i++) {
        var v = rotY(verts[i], ay); v = rotX(v, ax);
        var persp = 1 / (1 - v[2] * 0.32);
        P[i] = { x: cx + v[0] * R * persp, y: cy + v[1] * R * persp, z: v[2] };
      }
      edges.forEach(function (e) {
        var a = P[e[0]], b = P[e[1]];
        if (!a || !b) return;
        var fz = ((a.z + b.z) / 2 + 1) / 2;
        ctx.strokeStyle = 'rgba(' + ink + ',' + (0.12 + fz * 0.58) + ')';
        ctx.lineWidth = 0.4 + fz * 1.0;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.shadowColor = 'rgba(' + ink + ',0.85)';
      for (var k = 0; k < P.length; k++) {
        var fz2 = (P[k].z + 1) / 2;
        ctx.shadowBlur = fz2 * 8;
        ctx.fillStyle = 'rgba(' + ink + ',' + (0.34 + fz2 * 0.58) + ')';
        ctx.beginPath(); ctx.arc(P[k].x, P[k].y, 0.8 + fz2 * 1.7, 0, 7); ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (var r = 0; r < 3; r++) {
        var rr = R * (1.45 + r * 0.32);
        var tilt = 0.7 + r * 0.5;
        var spin = ay * (0.5 + r * 0.3) + r * 1.3;
        ctx.strokeStyle = 'rgba(' + ink + ',0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        var pts = [];
        for (var q = 0; q <= 80; q++) {
          var a2 = (q / 80) * Math.PI * 2;
          var p = [Math.cos(a2) * rr, Math.sin(a2) * rr * 0.34, 0];
          p = rotX(p, tilt); p = rotY(p, spin); p = rotX(p, ax);
          var persp2 = 1 / (1 - p[2] * 0.0009);
          var x = cx + p[0] * persp2, y = cy + p[1] * persp2;
          pts.push({ x: x, y: y, z: p[2] });
          if (q === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        var pk = 3;
        for (var d2 = 0; d2 < pk; d2++) {
          var idx2 = Math.min(pts.length - 1, Math.max(0, Math.floor(((time * (0.12 + r * 0.05) + d2 / pk) % 1) * (pts.length - 1))));
          var pt = pts[idx2];
          if (!pt) continue;
          var fz3 = (pt.z / rr + 1) / 2;
          ctx.shadowColor = '#2fae74'; ctx.shadowBlur = 12;
          ctx.fillStyle = 'rgba(40,165,105,' + (0.55 + fz3 * 0.45) + ')';
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.2, 0, 7); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      var drawFeat = function (ptsF, size, baseAlpha) {
        ptsF.forEach(function (fp) {
          var v = rotY(fp, ay); v = rotX(v, ax);
          if (v[2] < 0.05) return;
          var persp3 = 1 / (1 - v[2] * 0.32);
          var x = cx + v[0] * R * persp3, y = cy + v[1] * R * persp3;
          var fz4 = Math.max(0, v[2]);
          ctx.shadowColor = '#2fae74'; ctx.shadowBlur = 18 * fz4;
          ctx.fillStyle = 'rgba(' + ink + ',' + (baseAlpha * fz4) + ')';
          ctx.beginPath(); ctx.arc(x, y, size * (0.6 + fz4 * 0.7), 0, 7); ctx.fill();
          ctx.shadowBlur = 0;
        });
      };
      drawFeat(eyes, 6, 1);
      drawFeat(mouth, 2.4, 0.85);
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && rafId == null) rafId = requestAnimationFrame(draw);
    });
  }

  // Start a widget only when its container nears the viewport, so page load
  // does one short task (hero) instead of building every demo at once —
  // that single long task was 240ms of mobile TBT.
  function lazyStart(pairs) {
    if (!('IntersectionObserver' in window)) { pairs.forEach(function (p) { p[1](); }); return; }
    pairs.forEach(function (p) {
      var el = document.getElementById(p[0]);
      if (!el) return;
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); p[1](); }
      }, { rootMargin: '400px 0px' });
      io.observe(el);
    });
  }

  function init() {
    // Above the fold — eager.
    startRobot();
    startTyping();
    measureScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measureScroll(); onScroll(); }, { passive: true });
    window.addEventListener('load', function () { measureScroll(); onScroll(); });
    onScroll();
    // Below the fold — content injection at idle, widgets on approach.
    var idle = window.requestIdleCallback || function (cb) { setTimeout(cb, 1); };
    idle(function () {
      renderStatic();
      initReveal();
      measureScroll();
      lazyStart([
        ['artintele-wa-chat', startWhatsApp],
        ['artintele-flow', startWorkflow],
        ['artintele-voice-bars', startVoice],
        ['artintele-voicewave', buildVoiceWave],
        ['artintele-ind-tabs', startIndustries]
      ]);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
