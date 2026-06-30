// Shared dark/light theme toggle (replaces the DC runtime's toggleTheme).
(function () {
  function icons(dark) {
    var s = document.getElementById('artintele-theme-sun');
    var m = document.getElementById('artintele-theme-moon');
    if (s) { s.style.opacity = dark ? '0' : '1'; s.style.transform = dark ? 'rotate(40deg)' : 'rotate(0deg)'; }
    if (m) { m.style.opacity = dark ? '1' : '0'; m.style.transform = dark ? 'rotate(0deg)' : 'rotate(-40deg)'; }
  }
  // Swap the round badge (favicon + brand marks) to match the theme.
  var BRAND_VER = '20260701';
  function updateBrand(theme) {
    var src = '/assets/img/logo-' + (theme === 'dark' ? 'dark' : 'light') + '.png?v=' + BRAND_VER;
    document.querySelectorAll('img.brand-logo').forEach(function (i) { i.src = src; });
    var fav = document.getElementById('favicon');
    if (fav) fav.href = src;
  }
  function initTheme() {
    var t = 'light';
    try { t = localStorage.getItem('artintele-theme') === 'dark' ? 'dark' : 'light'; } catch (e) {}
    document.documentElement.setAttribute('data-theme', t);
    icons(t === 'dark');
    updateBrand(t);
  }
  window.toggleTheme = function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('artintele-theme', next); } catch (e) {}
    icons(next === 'dark');
    updateBrand(next);
  };
  // Mobile hamburger menu toggle.
  window.toggleMenu = function (btn) {
    var nav = btn && btn.closest ? btn.closest('nav') : null;
    var menu = nav ? nav.querySelector('.nav-menu') : document.querySelector('.nav-menu');
    if (menu) menu.classList.toggle('open');
  };
  function wireMenuClose() {
    document.querySelectorAll('.nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        var m = a.closest('.nav-menu');
        if (m) m.classList.remove('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initTheme(); wireMenuClose(); });
  } else {
    initTheme(); wireMenuClose();
  }
})();
