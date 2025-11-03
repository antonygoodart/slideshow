const container = document.getElementById('slidesContainer');
const slides = container.querySelectorAll('img');

let current = 0;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let dragging = false;
let animationID;
let velocity = 0;
let lastTouchX = 0;
let lastTouchTime = 0;
let lastTap = 0;
let isFullscreen = false;

function setPositionByIndex() {
  container.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  container.style.transform = `translateX(${-current * window.innerWidth}px)`;
}

function touchStart(index) {
  return function (event) {
    container.style.transition = "none";
    startX = getPositionX(event);
    lastTouchX = startX;
    lastTouchTime = Date.now();
    dragging = true;
    animationID = requestAnimationFrame(animation);
  };
}

function touchEnd() {
  cancelAnimationFrame(animationID);
  dragging = false;

  const movedBy = currentTranslate - prevTranslate;

  // momentum-based continuation
  const distance = Math.abs(movedBy);
  const direction = movedBy < 0 ? 1 : -1;
  const momentumDistance = Math.min(Math.max(distance * 0.5, 0), window.innerWidth);
  const momentumThreshold = window.innerWidth / 4;

  if ((movedBy < -momentumThreshold || (velocity < -0.3 && current < slides.length - 1))) {
    current += 1;
  } else if ((movedBy > momentumThreshold || (velocity > 0.3 && current > 0))) {
    current -= 1;
  }

  setPositionByIndex();
}

function touchMove(event) {
  if (dragging) {
    const currentPosition = getPositionX(event);
    const delta = currentPosition - lastTouchX;
    const deltaTime = Date.now() - lastTouchTime;

    velocity = deltaTime ? delta / deltaTime : 0;
    lastTouchX = currentPosition;
    lastTouchTime = Date.now();

    currentTranslate = prevTranslate + currentPosition - startX;
  }
}

function getPositionX(event) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function animation() {
  container.style.transform = `translateX(${currentTranslate}px)`;
  if (dragging) requestAnimationFrame(animation);
  else prevTranslate = -current * window.innerWidth;
}

// --- Fullscreen controls ---
slides.forEach(img => {
  img.addEventListener("click", (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      toggleFullscreen(e.target);
    }
    lastTap = now;
  });
});

function toggleFullscreen(target) {
  if (!isFullscreen) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    target.classList.add("fullscreen-active");
    document.body.classList.add("fullscreen-mode");
    isFullscreen = true;
  } else {
    if (document.fullscreenElement) document.exitFullscreen();
    slides.forEach(i => i.classList.remove("fullscreen-active"));
    document.body.classList.remove("fullscreen-mode");
    isFullscreen = false;
  }
}

// --- Swipe events ---
slides.forEach((slide, index) => {
  const touchStartHandler = touchStart(index);
  slide.addEventListener('touchstart', touchStartHandler);
  slide.addEventListener('touchend', touchEnd);
  slide.addEventListener('touchmove', touchMove);

  slide.addEventListener('mousedown', touchStartHandler);
  slide.addEventListener('mouseup', touchEnd);
  slide.addEventListener('mouseleave', touchEnd);
  slide.addEventListener('mousemove', touchMove);
});

window.addEventListener('resize', setPositionByIndex);
setPositionByIndex();
