/* Mago Labs motion layer. Configured from <body data-*>; safe with strict CSP (no inline code). */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body, cfg = body.dataset;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = 'IntersectionObserver' in window;
  root.classList.add('mfx');
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('mfx-loaded'); }); });

  /* scroll progress bar */
  var prog = d.createElement('div'); prog.className = 'mfx-prog'; prog.setAttribute('aria-hidden', 'true'); body.appendChild(prog);

  /* count up */
  var nums = d.querySelectorAll('[data-count]');
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, node = el.firstChild, t0 = null;
    if (!node || node.nodeType !== 3) return;
    function f(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1500, 1); node.nodeValue = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  if (!reduce && IO && nums.length) {
    var no = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); no.unobserve(e.target); } }); }, { threshold: 0.6 });
    nums.forEach(function (n) { no.observe(n); });
  }

  /* generic reveal for [data-rv] */
  var rv = d.querySelectorAll('[data-rv]');
  if (reduce || !IO) rv.forEach(function (e) { e.classList.add('mfx-in'); });
  else {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('mfx-in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { ro.observe(e); });
    setTimeout(function () { rv.forEach(function (e) { e.classList.add('mfx-in'); }); }, 6000);
  }

  /* scroll-linked: progress, parallax, drawn lines, giant footer word */
  var par = [].slice.call(d.querySelectorAll('[data-par]'));
  var draws = [].slice.call(d.querySelectorAll('[data-draw]'));
  var queued = false;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function frame() {
    queued = false;
    var vh = innerHeight, max = root.scrollHeight - vh;
    prog.style.transform = 'scaleX(' + (max > 0 ? clamp(scrollY / max) : 0).toFixed(4) + ')';
    if (reduce) return;
    par.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return;
      var k = parseFloat(el.dataset.par) || 0.08;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + 'px,0) scale(' + (1 + Math.abs(k) * 1.6).toFixed(3) + ')';
    });
    draws.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--p', clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25)).toFixed(3));
    });
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  if (reduce) draws.forEach(function (el) { el.style.setProperty('--p', 1); });
  frame(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', frame); addEventListener('load', frame);

  /* pointer tilt (fine pointers only) */
  if (!reduce && cfg.tilt && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    d.querySelectorAll(cfg.tilt).forEach(function (el) {
      el.classList.add('mfx-tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg) translateZ(8px)';
        el.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%'); el.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transition = 'transform .6s cubic-bezier(.2,.75,.1,1)'; el.style.transform = ''; });
    });
  }

  /* button ripple */
  if (!reduce && cfg.ripple) d.addEventListener('pointerdown', function (e) {
    var el = e.target.closest(cfg.ripple); if (!el) return;
    var r = el.getBoundingClientRect(), s = d.createElement('span');
    s.className = 'mfx-ripple'; s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.appendChild(s);
    setTimeout(function () { s.remove(); }, 800);
  }, { passive: true });

  /* 3D scene: loaded after first paint */
  if (!reduce && d.querySelector('[data-fx3d]')) addEventListener('load', function () {
    var go = function () { var sc = d.createElement('script'); sc.src = cfg.fx3d || 'js/fx3d.min.js'; sc.async = true; d.head.appendChild(sc); };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300);
  });
})();
