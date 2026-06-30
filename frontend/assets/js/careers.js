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
    var N = Math.min(95, Math.round(W * H / 19000));
    for (var i = 0; i < N; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.8, ph: Math.random() * Math.PI * 2 });
    var orbHues = ['rgba(60,185,120,', 'rgba(120,200,160,', 'rgba(70,180,150,'];
    var orbs = [];
    for (var o = 0; o < 5; o++) orbs.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16, R: 130 + Math.random() * 180, c: orbHues[o % orbHues.length], ph: Math.random() * Math.PI * 2 });
    var mx = -999, my = -999, tmx = -999, tmy = -999;
    window.addEventListener('mousemove', function (e) { tmx = e.clientX; tmy = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', function () { tmx = -999; tmy = -999; }, { passive: true });
    var start = performance.now();
    var draw = function (now) {
      var tsec = (now - start) / 1000;
      var ink = document.documentElement.dataset.theme === 'dark' ? '150,226,182' : '24,112,72';
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      ctx.clearRect(0, 0, W, H);
      orbs.forEach(function (ob) {
        ob.x += ob.vx + Math.sin(tsec * 0.2 + ob.ph) * 0.08;
        ob.y += ob.vy + Math.cos(tsec * 0.18 + ob.ph) * 0.08;
        if (ob.x < -ob.R) ob.x = W + ob.R; if (ob.x > W + ob.R) ob.x = -ob.R;
        if (ob.y < -ob.R) ob.y = H + ob.R; if (ob.y > H + ob.R) ob.y = -ob.R;
        var g = ctx.createRadialGradient(ob.x, ob.y, 0, ob.x, ob.y, ob.R);
        g.addColorStop(0, ob.c + '0.18)');
        g.addColorStop(1, ob.c + '0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ob.x, ob.y, ob.R, 0, 7); ctx.fill();
      });
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (mx > -500) { var dx = n.x - mx, dy = n.y - my, dd = dx * dx + dy * dy; if (dd < 16000 && dd > 1) { var dist = Math.sqrt(dd), f = (1 - dd / 16000) * 0.7; n.x += dx / dist * f; n.y += dy / dist * f; } }
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x)); n.y = Math.max(0, Math.min(H, n.y));
      });
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var na = nodes[a], nb = nodes[b];
          var d = Math.hypot(na.x - nb.x, na.y - nb.y);
          if (d < 150) { ctx.strokeStyle = 'rgba(' + ink + ',' + (0.16 * (1 - d / 150)) + ')'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke(); }
        }
      }
      if (mx > -500) {
        nodes.forEach(function (n) {
          var d = Math.hypot(n.x - mx, n.y - my);
          if (d < 185) { ctx.strokeStyle = 'rgba(30,150,95,' + (0.5 * (1 - d / 185)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mx, my); ctx.stroke(); }
        });
      }
      nodes.forEach(function (n) {
        var pr = n.r * (1 + Math.sin(tsec * 1.6 + n.ph) * 0.28);
        ctx.shadowColor = 'rgba(' + ink + ',0.7)'; ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(' + ink + ',0.74)';
        ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, 7); ctx.fill();
      });
      ctx.shadowBlur = 0;
      if (mx > -500) {
        ctx.shadowColor = 'rgba(30,150,95,0.9)'; ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(30,150,95,0.92)';
        ctx.beginPath(); ctx.arc(mx, my, 3.4, 0, 7); ctx.fill();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function init() { initForm(); initCanvas(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
