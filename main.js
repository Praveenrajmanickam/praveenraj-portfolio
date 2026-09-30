(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav, progress, active link ---------- */
  const nav = $('#nav'), bar = $('#progressBar');
  const toggle = $('#navToggle'), links = $('#navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); toggle.setAttribute('aria-expanded', false);
  }));
  const sections = $$('main section[id]');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 30);
    let cur = '';
    sections.forEach(s => { if (s.offsetTop - 140 <= y) cur = s.id; });
    $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    timelineFill();
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('.count', e.target).forEach(countUp);
      if (e.target.classList.contains('count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .tl-item, #pipeline, .diss-visual').forEach(el => io.observe(el));
  $$('.count').forEach(el => { if (!el.closest('.reveal')) io.observe(el); });

  /* ---------- counters ---------- */
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
    const sep = el.dataset.sep, suf = el.dataset.suffix || '';
    const fmt = v => {
      let s = v.toFixed(dec);
      if (sep) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return s + suf;
    };
    if (reduced) { el.textContent = fmt(to); return; }
    const dur = 1600, t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- hero typed line ---------- */
  const phrases = [
    'ingest --source can_bus --frames 68,051,361',
    'fit power_curve --turbines 8 --r2 0.999',
    'serve --api fastapi --kpis realtime',
    'validate --claims evidence_only',
    'hire praveenraj --notice "15 days"'
  ];
  const typed = $('#typed');
  if (reduced) typed.textContent = phrases[phrases.length - 1];
  else (async function loop(i = 0) {
    const s = phrases[i % phrases.length];
    for (let k = 1; k <= s.length; k++) { typed.textContent = s.slice(0, k); await wait(28 + Math.random() * 40); }
    await wait(1700);
    for (let k = s.length; k >= 0; k--) { typed.textContent = s.slice(0, k); await wait(14); }
    await wait(300); loop(i + 1);
  })();
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ---------- hero signal canvas ---------- */
  const cv = $('#signalCanvas'), ctx = cv.getContext('2d');
  let W, H, t = 0;
  const size = () => { const d = devicePixelRatio || 1; W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  const waves = [
    { a: 38, f: .006, s: .012, y: .72, c: 'rgba(48,224,193,.55)' },
    { a: 24, f: .011, s: -.018, y: .76, c: 'rgba(61,139,255,.45)' },
    { a: 54, f: .003, s: .008, y: .80, c: 'rgba(165,123,255,.30)' }
  ];
  const pk = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), v: .0004 + Math.random() * .001, r: Math.random() * 1.6 + .4 }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    waves.forEach(w => {
      ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = w.c;
      for (let x = 0; x <= W; x += 6) {
        const y = H * w.y + Math.sin(x * w.f + t * w.s * 10) * w.a + Math.sin(x * w.f * 2.7 + t * .05) * w.a * .3;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    });
    pk.forEach(p => {
      p.x += p.v; if (p.x > 1) p.x = 0;
      ctx.fillStyle = 'rgba(48,224,193,.5)';
      ctx.fillRect(p.x * W, p.y * H, p.r * 4, p.r);
    });
    t++; if (!reduced) requestAnimationFrame(draw);
  }
  draw();

  /* ---------- id card oscilloscope ---------- */
  const sp = $('#scopePath');
  let ph = 0;
  function scope() {
    let d = '';
    for (let x = 0; x <= 400; x += 4) {
      const n = x / 400;
      const y = 55 + Math.sin(n * 14 + ph) * 18 * Math.sin(n * 3.1 + ph * .3) + (Math.abs(((x + ph * 40) % 120) - 60) < 3 ? -26 : 0);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    sp.setAttribute('d', d); ph += .04;
    if (!reduced) requestAnimationFrame(scope);
  }
  scope();

  /* ---------- tilt ---------- */
  $$('.tilt').forEach(el => {
    if (reduced || matchMedia('(hover: none)').matches) return;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  /* ---------- card glow ---------- */
  $$('.card').forEach(c => c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- timeline fill ---------- */
  const tl = $('#timeline'), tlFill = $('#tlFill');
  function timelineFill() {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    tlFill.style.height = p * 100 + '%';
  }

  /* ---------- scrollytelling ---------- */
  const steps = $$('.step'), img = $('#scrollyImg'), cap = $('#scrollyCap'), dots = $('#stageDots');
  steps.forEach((s, i) => {
    dots.appendChild(document.createElement('i'));
    const m = document.createElement('img');           // inline image for mobile layout
    m.className = 'step-img'; m.loading = 'lazy'; m.alt = s.dataset.cap;
    m.src = `assets/img/${s.dataset.img}.webp`; m.width = 1600; m.height = 900;
    s.appendChild(m);
    new Image().src = m.src;                            // preload
  });
  let curStep = -1;
  const setStep = i => {
    if (i === curStep) return; curStep = i;
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i));
    img.classList.add('swap');
    setTimeout(() => {
      img.src = `assets/img/${steps[i].dataset.img}.webp`;
      img.alt = steps[i].dataset.cap; cap.textContent = steps[i].dataset.cap;
      img.classList.remove('swap');
    }, 220);
  };
  const stepIO = new IntersectionObserver(ents => {
    ents.forEach(e => { if (e.isIntersecting) setStep(steps.indexOf(e.target)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepIO.observe(s));
  setStep(0);

  /* ---------- pipeline stagger ---------- */
  $$('#pipeline .pnode').forEach((n, i) => n.style.transitionDelay = i * 110 + 'ms');

  /* ---------- CAN decode demo ---------- */
  const dBtn = $('#decodeBtn'), dLines = $$('.decode-panel .dline[data-step]'), bytes = $('#bytes');
  let decoding = false;
  dBtn.addEventListener('click', async () => {
    if (decoding) return; decoding = true;
    dLines.forEach(l => l.classList.remove('on')); bytes.classList.remove('hot-on');
    dBtn.textContent = 'Decoding…';
    for (const l of dLines) {
      await wait(reduced ? 0 : 520);
      if (l.dataset.step === '3') bytes.classList.add('hot-on');
      l.classList.add('on');
    }
    dBtn.textContent = '↻ Decode again'; decoding = false;
  });
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); setTimeout(() => dBtn.click(), 600); } }, { threshold: .6 }).observe($('#decode'));

  /* ---------- power curve demo ---------- */
  const svg = $('#curveSvg'), NS = 'http://www.w3.org/2000/svg';
  const M = { l: 48, r: 16, t: 14, b: 34 }, VW = 640, VH = 380;
  const sx = v => M.l + (v - 2.5) / (17.5) * (VW - M.l - M.r);
  const sy = p => VH - M.b - p / 2200 * (VH - M.t - M.b);
  // DJM_01 fitted logistic parameters (L, k, x0) from the real run
  const L = 2000, K = 0.8046, X0 = 8.894;
  const fit = v => L / (1 + Math.exp(-K * (v - X0)));
  const theoPts = [[3, 60], [4, 170], [5, 320], [6, 545], [7, 880], [8, 1220], [9, 1580], [9.5, 1750], [10, 1895], [10.5, 1975], [11, 2000], [20, 2000]];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const el = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

  for (let p = 0; p <= 2000; p += 500) { el('line', { class: 'grid', x1: M.l, x2: VW - M.r, y1: sy(p), y2: sy(p) }); el('text', { x: M.l - 8, y: sy(p) + 3, 'text-anchor': 'end' }).textContent = p; }
  for (let v = 5; v <= 20; v += 5) { el('line', { class: 'grid', y1: M.t, y2: VH - M.b, x1: sx(v), x2: sx(v) }); el('text', { x: sx(v), y: VH - M.b + 16, 'text-anchor': 'middle' }).textContent = v; }
  el('text', { x: VW - M.r, y: VH - 4, 'text-anchor': 'end' }).textContent = 'wind speed (m/s)';
  el('text', { x: M.l, y: M.t + 2, 'text-anchor': 'start', dx: 6 }).textContent = 'power (kW)';

  const pts = el('g', {});
  const data = [];
  for (let i = 0; i < 700; i++) {
    const v = Math.min(16, 3 + Math.abs(gauss()) * 3.2 + rnd() * 3.5);
    data.push({ v, p: Math.max(0, Math.min(2050, fit(v) + gauss() * 38)), out: false });
  }
  for (let i = 0; i < 95; i++) {                    // outliers: curtailment, under-performance, sensor noise
    const v = 6 + rnd() * 9, r = rnd();
    let p = r < .3 ? (rnd() < .5 ? 1000 : 400) + gauss() * 8 : r < .75 ? fit(v) * (0.15 + rnd() * .6) : fit(v - 0.9) + gauss() * 30;
    data.push({ v, p: Math.max(0, Math.min(2050, p)), out: true });
  }
  data.forEach(d => { d.n = el('circle', { cx: sx(d.v).toFixed(1), cy: sy(d.p).toFixed(1), r: 2.3, fill: '#8b97a7', opacity: .55 }, pts); });
  el('path', { class: 'theo', d: theoPts.map((q, i) => (i ? 'L' : 'M') + sx(q[0]) + ' ' + sy(q[1])).join(' ') });
  let fd = ''; for (let v = 3; v <= 20; v += .1) fd += (fd ? 'L' : 'M') + sx(v).toFixed(1) + ' ' + sy(fit(v)).toFixed(1);
  el('path', { class: 'fit', d: fd });

  const stat = $('#curveStat');
  const setMode = m => {
    svg.classList.toggle('m-fit', m === 'fit');
    $$('#curveSeg button').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
    data.forEach(d => {
      if (m === 'raw') { d.n.setAttribute('fill', '#8b97a7'); d.n.setAttribute('opacity', .55); }
      else if (m === 'filter') { d.n.setAttribute('fill', d.out ? '#ff5d6c' : '#8b97a7'); d.n.setAttribute('opacity', d.out ? .9 : .4); }
      else { d.n.setAttribute('fill', d.out ? '#ff5d6c' : '#8b97a7'); d.n.setAttribute('opacity', d.out ? .12 : .35); }
    });
    stat.textContent = m === 'raw' ? '9,960 raw points' : m === 'filter' ? '1,098 outliers removed (σ-filter)' : 'DJM_01 real fit · R² 0.9990 · RMSE 22.18 kW';
  };
  $$('#curveSeg button').forEach(b => b.addEventListener('click', () => { autoplay = false; setMode(b.dataset.mode); }));
  setMode('raw');
  let autoplay = true;
  new IntersectionObserver(async (e, o) => {
    if (!e[0].isIntersecting) return; o.disconnect();
    await wait(900); if (autoplay) setMode('filter');
    await wait(1800); if (autoplay) setMode('fit');
  }, { threshold: .5 }).observe(svg);

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  $$('[data-full]').forEach(f => f.addEventListener('click', () => { lbImg.src = f.dataset.full; lbImg.alt = f.querySelector('img').alt; lb.classList.add('open'); }));
  $('#scrollyBrowser').addEventListener('click', () => { lbImg.src = img.src; lb.classList.add('open'); });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

  onScroll();
})();
