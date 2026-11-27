/* Snow & toggle only. No theme, menu, payment, layout, or other UI modifications. */
(() => {
  'use strict';
  const init = () => {
    const button = document.getElementById('snow-toggle');
    if (!button) return;

    const overlay = document.createElement('div');
    overlay.className = 'snow-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const fragment = document.createDocumentFragment();

    // New randomized distribution on each page load, as requested.
    for (let i = 0; i < 32; i++) {
      const flake = document.createElement('i');
      flake.className = 'snowflake';
      flake.style.setProperty('--flake-x', `${(Math.random() * 100).toFixed(2)}%`);
      flake.style.setProperty('--flake-size', `${(2 + Math.random() * 3.9).toFixed(1)}px`);
      flake.style.setProperty('--flake-alpha', `${(0.25 + Math.random() * 0.37).toFixed(2)}`);
      flake.style.setProperty('--flake-drift', `${((Math.random() - .5) * 145).toFixed(0)}px`);
      flake.style.setProperty('--flake-duration', `${(11 + Math.random() * 13).toFixed(1)}s`);
      flake.style.setProperty('--flake-delay', `${(-Math.random() * 25).toFixed(1)}s`);
      fragment.appendChild(flake);
    }
    overlay.appendChild(fragment);
    document.body.appendChild(overlay);

    let enabled = true;
    try {
      const preference = localStorage.getItem('guide-snow-enabled');
      if (preference !== null) enabled = preference === 'true';
    } catch { /* Local storage may be disabled; snow still works. */ }

    const render = () => {
      overlay.classList.toggle('is-active', enabled);
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Выключить снег' : 'Включить снег');
    };
    button.addEventListener('click', () => {
      enabled = !enabled;
      try { localStorage.setItem('guide-snow-enabled', String(enabled)); } catch {}
      render();
    });
    render();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else init();
})();
