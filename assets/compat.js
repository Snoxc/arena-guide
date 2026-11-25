// Shared compatibility helpers, loaded before the interface scripts.
window.arenaWatchMedia = function (query, listener) {
  if (query.addEventListener) query.addEventListener('change', listener);
  else if (query.addListener) query.addListener(listener);
};

// Give touch and pen users a visible press state, including on hybrid devices.
(() => {
  const selector = 'button,a[href],summary';
  let pressed = null, timer = 0, startX = 0, startY = 0;
  function clear() {
    clearTimeout(timer);
    if (pressed) pressed.classList.remove('is-pressed');
    pressed = null;
  }
  function begin(target, x, y) {
    clear();
    const control = target instanceof Element ? target.closest(selector) : null;
    if (!control || control.disabled) return;
    pressed = control; startX = x; startY = y;
    control.classList.add('is-pressed');
  }
  function move(x, y) {
    if (Math.abs(x - startX) > 10 || Math.abs(y - startY) > 10) clear();
  }
  function end() { timer = setTimeout(clear, 160); }
  if ('PointerEvent' in window) {
    document.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' && e.isPrimary) begin(e.target, e.clientX, e.clientY);
    }, {passive:true});
    document.addEventListener('pointermove', e => { if (e.isPrimary) move(e.clientX, e.clientY); }, {passive:true});
    document.addEventListener('pointerup', end, {passive:true});
    document.addEventListener('pointercancel', clear, {passive:true});
  } else {
    document.addEventListener('touchstart', e => {
      if (e.touches.length === 1) begin(e.target, e.touches[0].clientX, e.touches[0].clientY);
      else clear();
    }, {passive:true});
    document.addEventListener('touchmove', e => {
      if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive:true});
    document.addEventListener('touchend', end, {passive:true});
    document.addEventListener('touchcancel', clear, {passive:true});
  }
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);
})();

// Programmatic focus after a tap must not look like keyboard navigation.
(() => {
  const root = document.documentElement;
  const pointer = () => root.classList.add('pointer-input');
  if ('PointerEvent' in window) document.addEventListener('pointerdown', pointer, true);
  else {
    document.addEventListener('touchstart', pointer, {capture:true, passive:true});
    document.addEventListener('mousedown', pointer, true);
  }
  document.addEventListener('keydown', e => {
    if (['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) root.classList.remove('pointer-input');
  }, true);
})();
