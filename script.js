/* Sticky slide tape — rewritten modularly
   - snaps to slides (no stopping mid-frame)
   - pointer drag works on desktop + mobile
   - double-tap/double-click enters device fullscreen
   - single tap while fullscreen exits
   - left/right arrow buttons retained
*/

(() => {
  const slidesEl = document.getElementById('slides');
  const viewport = document.getElementById('viewport');
  const prevBtn = document.getElementById('btnPrev');
  const nextBtn = document.getElementById('btnNext');
  const images = Array.from(slidesEl.querySelectorAll('img'));
  let index = 0;

  // drag state
  let startX = 0;
  let currentTranslate = 0;   // px
  let baseTranslate = 0;      // px, = -index * width
  let isDragging = false;
  let width = window.innerWidth;

  // tap detection
  let lastTap = 0;
  let isFullscreen = false;

  // helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setTranslate = (tx, animate = true) => {
    if (animate) slidesEl.style.transition = 'transform 260ms cubic-bezier(0.25,0.46,0.45,0.94)';
    else slidesEl.style.transition = 'none';
    slidesEl.style.transform = `translateX(${tx}px)`;
    currentTranslate = tx;
  };

  const updateButtons = () => {
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= images.length - 1;
  };

  const snapToIndex = (dirHint = 0) => {
    // decide final index based on currentTranslate/baseTranslate and a threshold
    const moved = currentTranslate - baseTranslate; // negative means moved left -> towards next
    const threshold = width * 0.18; // ~18% drag threshold
    if (moved <= -threshold && index < images.length - 1) index += 1;
    else if (moved >= threshold && index > 0) index -= 1;
    else if (dirHint !== 0) {
      // fallback: if a button requested movement, obey it
      index = clamp(index + dirHint, 0, images.length - 1);
    }
    baseTranslate = -index * width;
    setTranslate(baseTranslate, true);
    updateButtons();
  };

  // pointer handlers (works for touch & mouse via pointer events)
  const onPointerDown = (evt) => {
    // Only left button for mouse
    if (evt.pointerType === 'mouse' && evt.button !== 0) return;
    isDragging = true;
    slidesEl.setPointerCapture(evt.pointerId);
    slidesEl.style.transition = 'none';
    startX = evt.clientX;
    baseTranslate = -index * width;
    // small immediate set so currentTranslate is baseline
    currentTranslate = baseTranslate;
  };

  const onPointerMove = (evt) => {
    if (!isDragging) return;
    const dx = evt.clientX - startX;
    const tx = baseTranslate + dx;
    // optional small resistance beyond edges
    const maxOver = width * 0.2;
    let txClamped = tx;
    if (tx > 0) txClamped = tx > maxOver ? maxOver : tx; // left overscroll
    if (tx < - (images.length - 1) * width) {
      const min = - (images.length - 1) * width - maxOver;
      txClamped = tx < min ? min : tx;
    }
    setTranslate(txClamped, false);
  };

  const onPointerUp = (evt) => {
    if (!isDragging) return;
    isDragging = false;
    try { slidesEl.releasePointerCapture(evt.pointerId); } catch (e) {}
    // Snap to nearest slide (no mid-frame stopping)
    snapToIndex();
  };

  // click / double-click logic on images
  const onImageClick = (evt) => {
    // Ignore clicks that were part of drag (if dragged more than few px recently)
    if (isDragging) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      // double-tap / double-click => enter fullscreen
      toggleFullscreen(evt.currentTarget);
    } else {
      // single click: if fullscreen, exit
      if (isFullscreen) exitFullscreen();
    }
    lastTap = now;
  };

  const toggleFullscreen = (targetImg) => {
    if (!isFullscreen) {
      // request device fullscreen on the slideshow container (so UI chrome is hidden)
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      images.forEach(i => i.classList.add('fullscreen-active'));
      document.body.classList.add('fullscreen-mode');
      isFullscreen = true;
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(()=>{});
    } else if (document.webkitFullscreenElement) {
      if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    images.forEach(i => i.classList.remove('fullscreen-active'));
    document.body.classList.remove('fullscreen-mode');
    isFullscreen = false;
  };

  // buttons
  prevBtn.addEventListener('click', () => {
    if (index > 0) {
      snapToIndex(-1);
    }
  });
  nextBtn.addEventListener('click', () => {
    if (index < images.length - 1) {
      snapToIndex(1);
    }
  });

  // pointer events on the slides element
  slidesEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  // clicks for enter/exit fullscreen
  images.forEach(img => {
    img.addEventListener('click', onImageClick);
    // prevent native drag on desktop
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // keyboard navigation accessibility (left/right)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      if (index < images.length - 1) {
        index++;
        baseTranslate = -index * width;
        setTranslate(baseTranslate, true);
        updateButtons();
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) {
        index--;
        baseTranslate = -index * width;
        setTranslate(baseTranslate, true);
        updateButtons();
      }
    } else if (e.key === 'Escape' && isFullscreen) {
      exitFullscreen();
    }
  });

  // update width & position on resize (responsive)
  const onResize = () => {
    width = window.innerWidth;
    baseTranslate = -index * width;
    setTranslate(baseTranslate, false);
  };
  window.addEventListener('resize', onResize);

  // init
  const init = () => {
    width = window.innerWidth;
    index = 0;
    baseTranslate = -index * width;
    setTranslate(baseTranslate, false);
    updateButtons();
  };

  init();
})();
