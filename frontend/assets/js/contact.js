// Contact page — submit the lead to the backend (stores it + emails sales)
// and run the multilingual glyph canvas background.
(function () {
  function initForm() {
    var form = document.getElementById('artintele-contact-form');
    if (!form) return;
    var msg = document.getElementById('artintele-contact-msg');

    // Use form.elements so `name` isn't shadowed by the form's own .name prop.
    var nameEl = form.elements['name'];
    var emailEl = form.elements['email'];
    var phoneEl = form.elements['phone'];
    var websiteEl = form.elements['website'];
    var intentEl = form.elements['intent'];
    var companyEl = form.elements['company'];
    var callVolEl = form.elements['call_volume'];

    function checked(name) {
      return Array.prototype.slice
        .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
        .map(function (c) { return c.value; });
    }

    // --- validators ----------------------------------------------------
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim()); }
    function phoneDigits(raw) {
      var d = (raw || '').replace(/[^\d]/g, '');
      if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);   // +91…
      else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1); // leading 0
      return d;
    }
    function validPhone(raw) { return phoneDigits(raw).length === 10; }
    // Not everyone types the protocol — add it for them so the link works.
    function normalizeWebsite(raw) {
      var v = (raw || '').trim();
      if (!v) return '';
      if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
      return v;
    }
    function validWebsite(raw) {
      var v = (raw || '').trim().replace(/^https?:\/\//i, '');
      if (!v) return true; // optional
      return /^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v);
    }

    // --- inline error helpers -----------------------------------------
    function setErr(el, spanId, text) {
      if (el) el.classList.add('ai-invalid');
      var s = document.getElementById(spanId);
      if (s) { s.textContent = text; s.classList.add('show'); }
    }
    function clearErr(el, spanId) {
      if (el) el.classList.remove('ai-invalid');
      var s = document.getElementById(spanId);
      if (s) { s.classList.remove('show'); s.textContent = ''; }
    }

    function checkEmail(report) {
      var v = emailEl.value.trim();
      if (!v) { if (report) setErr(emailEl, 'err-email', 'Please enter your email address.'); return false; }
      if (!validEmail(v)) { if (report) setErr(emailEl, 'err-email', 'That doesn’t look like a valid email — check for typos.'); return false; }
      clearErr(emailEl, 'err-email'); return true;
    }
    function checkPhone(report) {
      var v = phoneEl.value.trim();
      if (!v) { if (report) setErr(phoneEl, 'err-phone', 'Please enter your phone number.'); return false; }
      if (!validPhone(v)) { if (report) setErr(phoneEl, 'err-phone', 'Enter a valid 10-digit phone number.'); return false; }
      clearErr(phoneEl, 'err-phone'); return true;
    }
    function checkWebsite(report) {
      if (!websiteEl) return true;
      if (!validWebsite(websiteEl.value)) { if (report) setErr(websiteEl, 'err-website', 'Enter a valid website, like yourcompany.com.'); return false; }
      clearErr(websiteEl, 'err-website'); return true;
    }

    // Report on blur; clear the moment the user starts fixing it.
    if (emailEl) {
      emailEl.addEventListener('blur', function () { checkEmail(true); });
      emailEl.addEventListener('input', function () { clearErr(emailEl, 'err-email'); });
    }
    if (phoneEl) {
      phoneEl.addEventListener('blur', function () { checkPhone(true); });
      phoneEl.addEventListener('input', function () { clearErr(phoneEl, 'err-phone'); });
    }
    if (websiteEl) {
      websiteEl.addEventListener('blur', function () { checkWebsite(true); });
      websiteEl.addEventListener('input', function () { clearErr(websiteEl, 'err-website'); });
    }

    function show(text, ok) {
      if (!msg) return;
      msg.style.display = 'block';
      msg.textContent = text;
      msg.style.borderColor = ok ? 'rgba(43,191,122,0.5)' : 'rgba(214,90,90,0.5)';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('artintele-contact-submit');

      var okName = !!nameEl.value.trim();
      var okEmail = checkEmail(true);
      var okPhone = checkPhone(true);
      var okWebsite = checkWebsite(true);
      var okIntent = !!intentEl.value;
      if (nameEl) nameEl.classList.toggle('ai-invalid', !okName);
      if (intentEl) intentEl.classList.toggle('ai-invalid', !okIntent);

      if (!okName || !okEmail || !okPhone || !okWebsite || !okIntent) {
        var first = !okName ? nameEl : !okEmail ? emailEl : !okPhone ? phoneEl
                  : !okWebsite ? websiteEl : intentEl;
        if (first && first.focus) first.focus();
        show('Please fix the highlighted fields and try again.', false);
        return;
      }

      var payload = {
        name: nameEl.value.trim(),
        company: companyEl ? companyEl.value.trim() : '',
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        intent: intentEl.value,
        website: websiteEl ? normalizeWebsite(websiteEl.value) : '',
        call_volume: callVolEl ? callVolEl.value : '',
        services: checked('services'),
        lead_source: checked('lead_source').join(', '),
        source: 'contact-page'
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; btn.style.opacity = '0.75'; }

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error('Request failed');
        return r.json();
      }).then(function () {
        var isDemo = /demo/i.test(payload.intent);
        show('Thanks, ' + (payload.name || 'there') + '! ' +
          (isDemo ? 'Your demo request is in — our team will reach out to schedule it within one business day.'
                  : 'We’ve received your request and will reach out within one business day.'), true);
        form.reset();
        [nameEl, emailEl, phoneEl, websiteEl, intentEl].forEach(function (el) { if (el) el.classList.remove('ai-invalid'); });
      }).catch(function () {
        show('Sorry, something went wrong sending your request. Please try again in a moment.', false);
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send & Book →'; btn.style.opacity = '1'; }
      });
    });
  }

  function initCanvas() {
    var canvas = document.getElementById('artintele-lang-canvas');
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

    var glyphs = [
      { ch: 'ನ', f: "'Noto Sans Kannada'" }, { ch: 'ಕ', f: "'Noto Sans Kannada'" }, { ch: 'ಮ', f: "'Noto Sans Kannada'" }, { ch: 'ಅ', f: "'Noto Sans Kannada'" },
      { ch: 'अ', f: "'Noto Sans Devanagari'" }, { ch: 'क', f: "'Noto Sans Devanagari'" }, { ch: 'म', f: "'Noto Sans Devanagari'" }, { ch: 'स', f: "'Noto Sans Devanagari'" },
      { ch: 'அ', f: "'Noto Sans Tamil'" }, { ch: 'க', f: "'Noto Sans Tamil'" }, { ch: 'ந', f: "'Noto Sans Tamil'" }, { ch: 'ம', f: "'Noto Sans Tamil'" },
      { ch: 'అ', f: "'Noto Sans Telugu'" }, { ch: 'క', f: "'Noto Sans Telugu'" }, { ch: 'మ', f: "'Noto Sans Telugu'" }, { ch: 'న', f: "'Noto Sans Telugu'" },
      { ch: 'അ', f: "'Noto Sans Malayalam'" }, { ch: 'ക', f: "'Noto Sans Malayalam'" }, { ch: 'മ', f: "'Noto Sans Malayalam'" }, { ch: 'ന', f: "'Noto Sans Malayalam'" },
      { ch: 'A', f: "'Sora'" }, { ch: 'I', f: "'Sora'" }, { ch: 'N', f: "'Sora'" }, { ch: 'अ', f: "'Noto Sans Devanagari'" }, { ch: 'ॐ', f: "'Noto Sans Devanagari'" }
    ];
    var count = Math.min(60, Math.round(W * H / 24000));
    var items = [];
    for (var i = 0; i < count; i++) {
      var g = glyphs[Math.floor(Math.random() * glyphs.length)];
      var z = Math.random();
      items.push({ x: Math.random() * W, y: Math.random() * H, z: z, ch: g.ch, f: g.f, vy: 0.08 + z * 0.5, rot: (Math.random() - 0.5) * 0.4, drift: (Math.random() - 0.5) * 0.25, baseSize: 16 + z * 64, phase: Math.random() * Math.PI * 2, alpha: 0.05 + z * 0.42 });
    }
    var mx = W / 2, my = H / 2, tmx = W / 2, tmy = H / 2;
    window.addEventListener('mousemove', function (e) { tmx = e.clientX; tmy = e.clientY; }, { passive: true });
    var start = performance.now();
    var draw = function (now) {
      var tsec = (now - start) / 1000;
      var ink = document.documentElement.dataset.theme === 'dark' ? '150,226,182' : '24,112,72';
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      var ox = (mx - W / 2) / W, oy = (my - H / 2) / H;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      items.forEach(function (it) {
        it.y -= it.vy; it.x += it.drift * Math.sin(tsec * 0.3 + it.phase) * 0.4;
        if (it.y < -80) { it.y = H + 60; it.x = Math.random() * W; }
        var px = it.x - ox * (40 + it.z * 120);
        var py = it.y - oy * (40 + it.z * 120);
        var sz = it.baseSize * (1 + Math.sin(tsec * 0.6 + it.phase) * 0.04);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(it.rot * Math.sin(tsec * 0.2 + it.phase) * 0.5);
        ctx.font = (it.z > 0.62 ? 600 : 400) + ' ' + sz + 'px ' + it.f;
        if (it.z > 0.72) { ctx.shadowColor = 'rgba(30,150,95,0.55)'; ctx.shadowBlur = 14; }
        ctx.fillStyle = 'rgba(' + ink + ',' + (it.alpha + 0.12) + ')';
        ctx.fillText(it.ch, 0, 0);
        ctx.restore();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function init() {
    initForm();
    // The glyph canvas is decorative background; starting it at idle keeps
    // its 5 Noto script fonts (~150 KB) out of the critical load window.
    var idle = window.requestIdleCallback || function (cb) { setTimeout(cb, 200); };
    idle(function () { initCanvas(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
