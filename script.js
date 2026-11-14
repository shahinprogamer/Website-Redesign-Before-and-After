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

/* ===== v3 advanced layer: shader backdrop, loader, split text, cursor, magnetic, glare, particles, drift ===== */
(function advanced() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  const low = innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement, st = { mx: innerWidth / 2, my: innerHeight / 2, vel: 0 };
  addEventListener('pointermove', (e) => { st.mx = e.clientX; st.my = e.clientY; }, { passive: true });
  const rgb = (v) => { v = (v || '').trim(); if (v[0] !== '#') return [1, .3, .6]; if (v.length === 4) v = '#' + [...v.slice(1)].map((x) => x + x).join(''); return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255); };
  const pal = () => { const cs = getComputedStyle(root); return ['--a', '--b', '--c'].map((k) => rgb(cs.getPropertyValue(k))); };

  /* loader */
  (function loader() {
    const el = $('#loader'); if (!el) return;
    const num = $('#ldNum'), bar = $('#ldBar'); let seen = null; try { seen = sessionStorage.getItem('demo-seen'); } catch {}
    const t0 = performance.now(), MIN = (seen || reduce) ? 1 : 600; let loaded = document.readyState === 'complete';
    addEventListener('load', () => (loaded = true)); setTimeout(() => (loaded = true), 2000);
    (function tick(t) { const k = clamp((t - t0) / MIN, 0, 1), e = 1 - Math.pow(1 - k, 3), s = loaded ? e : Math.min(e, .92); num.textContent = Math.round(s * 100); bar.style.transform = `scaleX(${s})`; if (k >= 1 && loaded) return done(); requestAnimationFrame(tick); })(t0);
    function done() { try { sessionStorage.setItem('demo-seen', '1'); } catch {} el.classList.add('out'); document.body.classList.remove('loading'); setTimeout(() => { document.body.classList.add('ready'); intro(); }, 120); setTimeout(() => el.remove(), 900); }
  })();

  /* WebGL shader backdrop in the demo's own palette */
  (function shader() {
    const cv = $('#gl'); if (!cv) return;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); if (!gl) return;
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;
uniform vec2 uR; uniform float uT; uniform vec2 uM; uniform float uS; uniform float uV; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uR.y; float t=uT*.08;
  vec2 q=vec2(fbm(uv*1.3+t),fbm(uv*1.3+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(uv*1.7+3.6*q+vec2(1.7,9.2)+t*1.5),fbm(uv*1.7+3.6*q+vec2(8.3,2.8)-t*1.2));
  float f=fbm(uv*1.2+3.6*r);
  vec2 m=uM*vec2(uR.x/uR.y,1.); float d=distance(uv,m);
  float glow=smoothstep(.62,0.,d); float ripple=sin(d*26.-uT*3.2)*exp(-d*4.2)*(.25+uV);
  vec3 c4=mix(uA,uC,.5)*1.1; float s=uS*3.2;
  vec3 col=vec3(.02,.015,.07);
  vec3 ribbon=mix(uB,uA,smoothstep(.2,.85,r.x+.15*sin(s)));
  ribbon=mix(ribbon,uC,smoothstep(.38,.92,r.y)*.9);
  ribbon=mix(ribbon,c4,smoothstep(.72,1.,f*r.x*2.2)*.5);
  col=mix(col,ribbon,smoothstep(.2,.9,f)*1.25);
  col+=pow(f,3.2)*uC*.55;
  col+=smoothstep(.07,0.,abs(fract(f*8.+t*2.)-.5)-.4)*.07;
  col+=glow*mix(uA,uC,f)*.42+ripple*mix(uC,uA,.5)*.25;
  col*=.8; col*=1.-.38*length(gl_FragCoord.xy/uR-.5); col+=(h(gl_FragCoord.xy+uT)-.5)*.035;
  gl_FragColor=vec4(col,1.);
}`;
    const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return; gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(pr, k), uR = U('uR'), uT = U('uT'), uM = U('uM'), uS = U('uS'), uV = U('uV'), uA = U('uA'), uB = U('uB'), uC = U('uC');
    const setPal = () => { const [a, b, c] = pal(); gl.uniform3f(uA, ...a); gl.uniform3f(uB, ...b); gl.uniform3f(uC, ...c); };
    setPal(); new MutationObserver(setPal).observe(root, { attributes: true });
    const SCALE = low ? .3 : .5;
    const resize = () => { cv.width = Math.max(2, Math.floor(innerWidth * SCALE)); cv.height = Math.max(2, Math.floor(innerHeight * SCALE)); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height); };
    resize(); addEventListener('resize', resize);
    let lastT = 0, mx = .5, my = .5, pv = 0, lx = st.mx, ly = st.my;
    const draw = (t) => {
      if (!document.hidden && cv.getClientRects().length > 0 && t - lastT >= (low ? 32 : 15)) {
        lastT = t; mx = lerp(mx, st.mx / innerWidth, .06); my = lerp(my, 1 - st.my / innerHeight, .06);
        gl.uniform1f(uT, t / 1000); gl.uniform2f(uM, mx, my); gl.uniform1f(uS, scrollY / Math.max(1, root.scrollHeight - innerHeight));
        pv = lerp(pv, clamp(Math.hypot(st.mx - lx, st.my - ly) / 40, 0, 1.2), .08); lx = st.mx; ly = st.my; gl.uniform1f(uV, pv); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* split text */
  function splitInto(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    const label = el.textContent.trim().replace(/\s+/g, ' '); let ci = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return; if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'sp-w'; w.setAttribute('aria-hidden', 'true');
          [...part].forEach((ch) => { const c = document.createElement('span'); c.className = 'sp-c'; c.textContent = ch; c.style.setProperty('--ci', ci++); w.appendChild(c); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches('#role, .old-word, .caret, .nosplit')) walk(n);
    });
    walk(el); el.setAttribute('aria-label', label);
  }
  const heads = $$('h1, h2'); heads.forEach(splitInto);
  const heroHeads = $$('.hero h1, .intro h1');
  function intro() { heroHeads.forEach((h) => { h.style.setProperty('--base', '0ms'); h.classList.add('split-in'); }); }
  const hio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.style.setProperty('--base', '0ms'); e.target.classList.add('split-in'); hio.unobserve(e.target); } }), { threshold: .2, rootMargin: '0px 0px -6% 0px' });
  heads.filter((h) => !heroHeads.includes(h)).forEach((h) => hio.observe(h));
  if (!$('#loader') || reduce) { heads.forEach((h) => h.classList.add('split-in')); }

  /* cursor + magnetic buttons */
  if (fine && !reduce) {
    document.body.classList.add('has-cursor');
    const dot = $('.cur-dot'), ring = $('.cur-ring'); let rx = st.mx, ry = st.my;
    (function tick() { dot.style.transform = `translate(${st.mx}px,${st.my}px)`; rx = lerp(rx, st.mx, .16); ry = lerp(ry, st.my, .16); ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(tick); })();
    document.addEventListener('pointerover', (e) => document.body.classList.toggle('cur-hover', !!e.target.closest('a, button, .card, .knob, label')));
    $$('.btn-p, .cta .btn, .soc a').forEach((b) => { b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; }); b.addEventListener('pointerleave', () => (b.style.transform = '')); });
  }
  /* glare follows the pointer on every card */
  document.addEventListener('pointermove', (e) => { const c = e.target.closest?.('.card, [data-tilt]'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); c.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }, { passive: true });

  /* glowing particles in the first section */
  (function particles() {
    const host = $('.hero, .intro'); if (!host || reduce) return;
    const cv = document.createElement('canvas'); cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true'); host.prepend(cv);
    const ctx = cv.getContext('2d'), P = pal().map((c) => c.map((x) => Math.round(x * 255)).join(','));
    const sp = P.map((c) => { const o = document.createElement('canvas'); o.width = o.height = 64; const g = o.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${c},1)`); gr.addColorStop(.25, `rgba(${c},.55)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return o; });
    let W = 0, H = 0, run = true, pts = [], dpr = Math.min(devicePixelRatio || 1, 1.5), mouse = { x: -999, y: -999 };
    const make = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 20, z: .4 + Math.random() * 1.2, s: sp[Math.floor(Math.random() * sp.length)], vy: -(.12 + Math.random() * .4), vx: (Math.random() - .5) * .25, ph: Math.random() * 6.28 });
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); pts = Array.from({ length: clamp(Math.floor(W * H / (low ? 46000 : 26000)), 12, 48) }, () => make(true)); };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    new IntersectionObserver((es) => (run = es[0].isIntersecting)).observe(cv);
    (function draw(t) { requestAnimationFrame(draw); if (!run || document.hidden) return; ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      pts.forEach((p, i) => { const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy); if (d < 150) { const f = (1 - d / 150) * 1.6; p.x += dx / (d || 1) * f; p.y += dy / (d || 1) * f; } p.x += p.vx + Math.sin(t / 1400 + p.ph) * .25; p.y += p.vy * p.z; if (p.y < -30) pts[i] = make(false); const s = 14 + p.z * 22, tw = .55 + .45 * Math.sin(t / 700 + p.ph); ctx.globalAlpha = clamp(tw * (.35 + p.z * .35), 0, 1); ctx.drawImage(p.s, p.x - s / 2, p.y - s / 2, s, s); });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; })(0);
  })();

  /* scroll: hero drift + marquee speed follows scroll velocity */
  const drift = $('.hero-grid > :first-child') || $('.intro > .wrap'), hs = $('.hero, .intro'), mt = $('.mt');
  let last = scrollY, rate = 1, anim = null; if (mt && mt.getAnimations) anim = mt.getAnimations()[0];
  (function loop() {
    requestAnimationFrame(loop);
    const sy = scrollY; st.vel = lerp(st.vel, sy - last, .15); last = sy;
    if (anim && !reduce) { rate = lerp(rate, 1 + Math.min(5, Math.abs(st.vel) * .3), .12); anim.playbackRate = rate; }
    if (drift && hs && !reduce && sy < hs.offsetHeight) { const p = clamp(sy / (hs.offsetHeight * .8), 0, 1); drift.style.transform = `translate3d(0,${p * 60}px,0)`; drift.style.opacity = String(1 - p * .85); }
  })();
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
