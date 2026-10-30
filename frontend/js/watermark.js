(() => {
  const st = document.createElement('style');
  st.textContent = ':root{--wm-opacity:.28}.mbwm{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;opacity:var(--wm-opacity);pointer-events:none;z-index:60}@media (prefers-reduced-motion:reduce){.mbwm{display:none}}';
  document.head.append(st);
  const v = document.createElement('video');
  v.className = 'mbwm'; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', ''); v.setAttribute('autoplay', ''); v.setAttribute('aria-hidden', 'true');
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
  v.onerror = () => console.warn('Watermark video not found: open /img/hero/hero.mp4');
  v.src = 'img/hero/hero.mp4?v=2';
  document.body.append(v);
  const go = () => v.play().catch(() => {});
  go(); addEventListener('pointerdown', go, { once: true });
})();
