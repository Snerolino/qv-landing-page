/* Self-contained visual enhancement. No fetch, storage, third-party libraries or app operations. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('#topo');
  const canvas = document.querySelector('#qv-motion-canvas');
  const toggle = document.querySelector('#qv-motion-toggle');
  const ctx = canvas.getContext('2d', {alpha: true});
  let paused = false, visible = true, raf = 0, last = 0, w = 1, h = 1, frames = 0;
  let pointer = {x: .6, y: .35};
  const points = Array.from({length: 28}, (_, i) => ({x: .12 + ((i * 37) % 83) / 100, y: .08 + ((i * 29) % 82) / 100, seed: i * 1.7}));

  function paint(time) {
    if (!ctx) return;
    const t = time * .00016;
    ctx.clearRect(0, 0, w, h);
    const limit = w < 600 ? 18 : 28;
    const positions = points.slice(0, limit).map(p => ({x: p.x * w + Math.sin(t + p.seed) * 15, y: p.y * h + Math.cos(t * .8 + p.seed) * 12}));
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      for (let j = i + 1; j < positions.length; j++) {
        const b = positions[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < Math.min(w * .2, 180)) {
          ctx.strokeStyle = `rgba(0,229,255,${.14 * (1 - d / 190)})`;
          ctx.lineWidth = .75;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = i % 6 === 0 ? 'rgba(255,77,77,.6)' : 'rgba(0,229,255,.5)';
      ctx.beginPath(); ctx.arc(a.x, a.y, i % 6 === 0 ? 2.6 : 1.6, 0, Math.PI * 2); ctx.fill();
    }
    const x = pointer.x * w, y = pointer.y * h;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, Math.min(w * .3, 250));
    glow.addColorStop(0, 'rgba(0,229,255,.055)'); glow.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    canvas.dataset.frames = String(++frames);
  }
  function running() {return ctx && !paused && !reduce.matches && visible && !document.hidden;}
  function tick(now) {
    raf = 0;
    if (!running()) {sync(); return;}
    if (now - last >= (w < 600 ? 50 : 1000 / 30)) {paint(now); last = now;}
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (raf) {cancelAnimationFrame(raf); raf = 0;}
    toggle.disabled = !ctx || reduce.matches;
    document.documentElement.classList.toggle('qv-effects-paused', paused || reduce.matches);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = !ctx ? 'Efeitos indisponíveis' : reduce.matches ? 'Movimento reduzido ativo' : paused ? 'Ativar efeitos' : 'Pausar efeitos';
    canvas.dataset.state = !ctx ? 'unsupported' : reduce.matches ? 'static' : paused ? 'paused' : document.hidden ? 'hidden' : !visible ? 'offscreen' : 'running';
    if (running()) {last = 0; raf = requestAnimationFrame(tick);}
  }
  function resize() {
    const box = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(1, box.width); h = Math.max(1, box.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    if (ctx) {ctx.setTransform(dpr, 0, 0, dpr, 0, 0); paint(0);}
  }
  canvas.dataset.engine = ctx ? 'canvas2d' : 'none';
  toggle.hidden = false;
  if (!ctx) canvas.hidden = true;
  resize(); sync();
  toggle.addEventListener('click', () => {paused = !paused; sync();});
  reduce.addEventListener('change', () => {paint(0); sync();});
  document.addEventListener('visibilitychange', sync);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else addEventListener('resize', resize, {passive: true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}, {threshold: .01}).observe(hero);
  hero.addEventListener('pointermove', e => {
    if (reduce.matches || paused || e.pointerType === 'touch') return;
    const box = hero.getBoundingClientRect(); pointer = {x: (e.clientX - box.left) / w, y: (e.clientY - box.top) / h};
  }, {passive: true});

  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('.qv-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (reduce.matches || paused || !fine.matches || e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${((.5 - (e.clientY - r.top) / r.height) * 3).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(((e.clientX - r.left) / r.width - .5) * 3).toFixed(2)}deg`);
    }, {passive: true});
    card.addEventListener('pointerleave', () => {card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');});
  });

  const sceneButtons = [...document.querySelectorAll('[data-qv-scene]')];
  const photo = document.querySelector('.qv-map-visual > img');
  const caption = document.querySelector('.qv-map-visual .qv-panel-card strong');
  const status = document.querySelector('#qv-scene-status');
  const scenes = {festival: {label: 'Música & noite', alt: 'Ilustração conceitual de show noturno, não evento real'}, feira: {label: 'Feiras & rua', alt: 'Ilustração conceitual de feira noturna, não evento real'}, oficina: {label: 'Cursos & oficinas', alt: 'Ilustração conceitual de oficina de cerâmica, não evento real'}, encontro: {label: 'Encontros', alt: 'Ilustração conceitual de encontro cultural, não evento real'}};
  let selected = 'feira';
  function updateScene() {
    const scene = scenes[selected];
    sceneButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qvScene === selected)));
    photo.src = `assets/event-art/${selected}.webp`; photo.alt = scene.alt;
    caption.textContent = scene.label;
    const day = document.querySelector('[data-qv-chips] .is-selected')?.textContent || 'Hoje';
    status.textContent = `${scene.label} · ${day}. Demonstração ilustrativa, sem consulta à programação real.`;
  }
  sceneButtons.forEach(button => button.addEventListener('click', () => {selected = button.dataset.qvScene; updateScene();}));
  document.querySelector('[data-qv-chips]').addEventListener('click', updateScene);
})();
