// Careers page — talent network form (multipart, optional resume upload)
// + the interactive node-network canvas background.
(function () {
  function initForm() {
    var form = document.getElementById('artintele-talent-form');
    if (!form) return;
    var fileInput = document.getElementById('artintele-resume');
    var drop = document.getElementById('artintele-drop');
    var lbl = document.getElementById('artintele-resume-label');

    if (drop && fileInput) drop.addEventListener('click', function () { fileInput.click(); });
    if (fileInput) fileInput.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f && lbl) { lbl.textContent = f.name; lbl.style.color = '#16241c'; if (drop) drop.style.borderColor = 'rgba(var(--border),0.6)'; }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('artintele-talent-submit');
      var msg = document.getElementById('artintele-form-msg');
      function show(text, ok) {
        if (!msg) return;
        msg.style.display = 'block';
        msg.textContent = text;
        msg.style.borderColor = ok ? 'rgba(43,191,122,0.5)' : 'rgba(214,90,90,0.5)';
      }
      var fd = new FormData();
      fd.append('name', form.name.value.trim());
      fd.append('email', form.email.value.trim());
      fd.append('linkedin', form.linkedin.value.trim());
      fd.append('interest', form.interest.value);
      if (fileInput && fileInput.files[0]) fd.append('resume', fileInput.files[0]);

      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; btn.style.opacity = '0.75'; }
      fetch('/api/talent', { method: 'POST', body: fd })
        .then(function (r) { if (!r.ok) throw new Error('failed'); return r.json(); })
        .then(function () {
          show('Thank you, ' + (form.name.value.trim() || 'there') + '. Your profile is in our talent network — we’ll be in touch.', true);
          form.reset();
          if (lbl) { lbl.textContent = 'Click to upload — PDF, DOC, DOCX'; lbl.style.color = 'rgba(var(--text),0.75)'; }
        })
        .catch(function () { show('Sorry, something went wrong. Please try again in a moment.', false); })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = 'Submit Profile'; btn.style.opacity = '1'; } });
    });
  }

  function initCanvas() {
    var canvas = document.getElementById('artintele-careers-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, DPR, nodes = [];
    var resize = function () {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pre-rendered sprites replace per-draw shadowBlur and per-frame radial
    // gradients — Canvas2D runs a gaussian blur per shadowed fill and builds
    // gradients per call, which held frame cost right at Lighthouse's 50ms
    // long-task threshold on throttled mobile: one slow run tipped every
    // frame over it and /pricing TBT exploded to 9s.
    var spriteCache = {};
    var glowSprite = function (color) {   // color: 'r,g,b'
      if (spriteCache[color]) return spriteCache[color];
      var s = document.createElement('canvas'); s.width = s.height = 32;
      var sc = s.getContext('2d');
      var g = sc.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(' + color + ',1)');
      g.addColorStop(0.3, 'rgba(' + color + ',0.55)');
      g.addColorStop(1, 'rgba(' + color + ',0)');
      sc.fillStyle = g; sc.fillRect(0, 0, 32, 32);
      spriteCache[color] = s; return s;
    };
    var orbSprite = function (c) {        // c: 'rgba(r,g,b,' prefix
      if (spriteCache[c]) return spriteCache[c];
      var s = document.createElement('canvas'); s.width = s.height = 128;
      var sc = s.getContext('2d');
      var g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, c + '0.18)');
      g.addColorStop(1, c + '0)');
      sc.fillStyle = g; sc.fillRect(0, 0, 128, 128);
      spriteCache[c] = s; return s;
    };

    var N = Math.min(95, Math.round(W * H / 19000));
    for (var i = 0; i < N; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.8, ph: Math.random() * Math.PI * 2 });
    var orbHues = ['rgba(60,185,120,', 'rgba(120,200,160,', 'rgba(70,180,150,'];
    var orbs = [];
    for (var o = 0; o < 5; o++) orbs.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16, R: 130 + Math.random() * 180, c: orbHues[o % orbHues.length], ph: Math.random() * Math.PI * 2 });
    var mx = -999, my = -999, tmx = -999, tmy = -999;
    window.addEventListener('mousemove', function (e) { tmx = e.clientX; tmy = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', function () { tmx = -999; tmy = -999; }, { passive: true });
    var LINK2 = 150 * 150;
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var start = performance.now();
    var rafId = null;
    var draw = function (now) {
      if (document.hidden) { rafId = null; return; }   // pause when tab is hidden (battery/CPU)
      var tsec = (now - start) / 1000;
      var ink = document.documentElement.dataset.theme === 'dark' ? '150,226,182' : '24,112,72';
      var dot = glowSprite(ink);
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      ctx.clearRect(0, 0, W, H);
      orbs.forEach(function (ob) {
        ob.x += ob.vx + Math.sin(tsec * 0.2 + ob.ph) * 0.08;
        ob.y += ob.vy + Math.cos(tsec * 0.18 + ob.ph) * 0.08;
        if (ob.x < -ob.R) ob.x = W + ob.R; if (ob.x > W + ob.R) ob.x = -ob.R;
        if (ob.y < -ob.R) ob.y = H + ob.R; if (ob.y > H + ob.R) ob.y = -ob.R;
        ctx.drawImage(orbSprite(ob.c), ob.x - ob.R, ob.y - ob.R, ob.R * 2, ob.R * 2);
      });
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (mx > -500) { var dx = n.x - mx, dy = n.y - my, dd = dx * dx + dy * dy; if (dd < 16000 && dd > 1) { var dist = Math.sqrt(dd), f = (1 - dd / 16000) * 0.7; n.x += dx / dist * f; n.y += dy / dist * f; } }
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x)); n.y = Math.max(0, Math.min(H, n.y));
      });
      // links batched into 4 alpha buckets — one stroke per bucket, not per pair
      var buckets = [[], [], [], []];
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var na = nodes[a], nb = nodes[b];
          var ddx = na.x - nb.x, ddy = na.y - nb.y, dd2 = ddx * ddx + ddy * ddy;
          if (dd2 < LINK2) buckets[Math.min(3, ((1 - Math.sqrt(dd2) / 150) * 4) | 0)].push(na, nb);
        }
      }
      for (var bi = 0; bi < 4; bi++) {
        var bk = buckets[bi];
        if (!bk.length) continue;
        ctx.strokeStyle = 'rgba(' + ink + ',' + (0.16 * (bi + 0.5) / 4) + ')';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (var q = 0; q < bk.length; q += 2) { ctx.moveTo(bk[q].x, bk[q].y); ctx.lineTo(bk[q + 1].x, bk[q + 1].y); }
        ctx.stroke();
      }
      if (mx > -500) {
        nodes.forEach(function (n) {
          var d = Math.hypot(n.x - mx, n.y - my);
          if (d < 185) { ctx.strokeStyle = 'rgba(30,150,95,' + (0.5 * (1 - d / 185)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mx, my); ctx.stroke(); }
        });
      }
      nodes.forEach(function (n) {
        var pr = n.r * (1 + Math.sin(tsec * 1.6 + n.ph) * 0.28);
        var half = pr * 2 + 5;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(dot, n.x - half, n.y - half, half * 2, half * 2);
      });
      ctx.globalAlpha = 1;
      if (mx > -500) {
        ctx.globalAlpha = 0.92;
        ctx.drawImage(glowSprite('30,150,95'), mx - 15, my - 15, 30, 30);
        ctx.globalAlpha = 1;
      }
      if (!reduced) rafId = requestAnimationFrame(draw);
    };
    if (reduced) {
      // a11y: no animation — draw one still frame, and redraw it whenever
      // something invalidates the bitmap (resize clears the canvas) or it
      // could not paint yet (hidden tab) or the theme recolors the ink.
      var still = function () { draw(performance.now()); };
      still();
      window.addEventListener('resize', still, { passive: true });
      document.addEventListener('visibilitychange', function () { if (!document.hidden) still(); });
      new MutationObserver(still).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return;
    }
    rafId = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && rafId == null) rafId = requestAnimationFrame(draw);
    });
  }

  function init() { initForm(); initCanvas(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
