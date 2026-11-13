/* ===== Shared behaviour: reveal, spotlight, nav, ripple, counters, progress ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const toast = (msg) => { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800); };
(function base() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  window.observeReveal = (root = document) => $$('[data-r]:not(.in)', root).forEach((el) => io.observe(el));
  observeReveal();
  // counters
  const co = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; co.unobserve(e.target); const el = e.target, to = +el.dataset.count, suf = el.dataset.suf || ''; if (reduce) { el.textContent = to + suf; return; } const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1600), v = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * v).toLocaleString() + suf; if (k < 1) requestAnimationFrame(f); })(t0); }), { threshold: .6 });
  $$('[data-count]').forEach((el) => co.observe(el));
  // spotlight + progress + nav state
  const spot = $('.spot'), bar = $('.bar'), nav = $('.nav');
  let mx = innerWidth / 2, my = innerHeight / 3, sx = mx, sy = my;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() { sx += (mx - sx) * .12; sy += (my - sy) * .12; if (spot) spot.style.transform = `translate(${sx}px,${sy}px)`; requestAnimationFrame(loop); })();
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; if (nav) nav.classList.toggle('sm', scrollY > 30); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // nav links highlight + burger
  const links = $$('.links a[href^="#"]');
  const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { threshold: .5 });
  links.forEach((a) => { const s = $(a.getAttribute('href')); if (s) so.observe(s); a.addEventListener('click', () => $('.links')?.classList.remove('open')); });
  $('.burger')?.addEventListener('click', (e) => { const o = $('.links').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
  // ripple
  document.addEventListener('pointerdown', (e) => { const b = e.target.closest('.btn'); if (!b) return; const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span'); d.className = 'rp'; d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`; b.append(d); setTimeout(() => d.remove(), 750); });
  // tilt
  if (!reduce && matchMedia('(hover:hover)').matches) document.addEventListener('pointermove', (e) => { const t = e.target.closest?.('[data-tilt]'); $$('[data-tilt].tilting').forEach((x) => { if (x !== t) { x.classList.remove('tilting'); x.style.transform = ''; } }); if (!t) return; const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; t.classList.add('tilting'); t.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 9}deg) translateY(-6px)`; });
  $$('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));
})();
/* ===== Demo 4: before/after slider ===== */
(function () {
  const stage = $('#stage'), knob = $('#knob');
  let pos = 50;
  const set = (p) => { pos = Math.max(2, Math.min(98, p)); stage.style.setProperty('--p', pos + '%'); knob.setAttribute('aria-valuenow', Math.round(pos)); };
  const fromX = (x) => { const r = stage.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
  let drag = false;
  stage.addEventListener('pointerdown', (e) => { if (stage.className.includes('view-')) return; drag = true; stage.setPointerCapture(e.pointerId); fromX(e.clientX); });
  stage.addEventListener('pointermove', (e) => drag && fromX(e.clientX));
  stage.addEventListener('pointerup', () => (drag = false)); stage.addEventListener('pointercancel', () => (drag = false));
  knob.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') set(pos - 4); if (e.key === 'ArrowRight') set(pos + 4); });
  set(50);
  // intro sweep so visitors notice it is interactive
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { const t0 = performance.now(); (function f(t) { if (drag) return; const k = (t - t0) / 2200; if (k < 1) { set(50 + Math.sin(k * Math.PI * 2) * 28 * (1 - k)); requestAnimationFrame(f); } else set(50); })(t0); }
  $$('.mode').forEach((b) => b.addEventListener('click', () => { $$('.mode').forEach((x) => x.classList.toggle('on', x === b)); stage.classList.remove('view-before', 'view-after'); if (b.dataset.m !== 'slide') stage.classList.add('view-' + b.dataset.m); $$('.lab').forEach((l, i) => (l.style.display = b.dataset.m === 'slide' || (b.dataset.m === 'before' ? i === 0 : i === 1) ? '' : 'none')); }));
  $('#mobile').addEventListener('change', (e) => stage.classList.toggle('m', e.target.checked));
  // typography playground
  const fs = $('#fs'), lh = $('#lh'), sample = $('#sample');
  const upd = () => { sample.style.setProperty('--fs', fs.value + 'px'); sample.style.setProperty('--lh', lh.value / 10); $('#fsv').textContent = fs.value + 'px'; $('#lhv').textContent = (lh.value / 10).toFixed(1); };
  fs.oninput = lh.oninput = upd; upd();
})();
