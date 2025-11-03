// Image URLs - Replace these with your links
const images = [
    'https://i.imgur.com/9Ce48cb.jpeg',
    'https://i.imgur.com/1ahttZA.jpeg',
    'https://i.imgur.com/u6OQkfj.jpeg',
    'https://i.imgur.com/nVtBeIT.jpeg',
    'https://i.imgur.com/LaiENV8.jpeg',
    'https://i.imgur.com/ITxrZSu.jpeg',
    'https://i.imgur.com/IJRaK1W.jpeg'
];

let currentIndex = 0;
let isFullscreen = false;
let touchStartDistance = 0;

const mainImage = document.getElementById('mainImage');
const fullscreenOverlay = document.getElementById('fullscreenOverlay');
const fullscreenImage = document.getElementById('fullscreenImage');
const prevArrow = document.getElementById('prevArrow');
const nextArrow = document.getElementById('nextArrow');
const clickableArea = document.getElementById('clickableArea');
const imageContainer = document.getElementById('imageContainer');

function vibrateDevice() {
    if ('vibrate' in navigator) navigator.vibrate(10);
}

function updateImage() {
    mainImage.src = images[currentIndex];
    fullscreenImage.src = images[currentIndex];
    updateArrows();
}

function updateArrows() {
    prevArrow.classList.toggle('disabled', currentIndex === 0);
    nextArrow.classList.toggle('disabled', currentIndex === images.length - 1);
}

function nextSlide() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        updateImage();
        vibrateDevice();
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
        updateImage();
        vibrateDevice();
    }
}

function enterFullscreen() {
    if (isFullscreen) return;
    isFullscreen = true;
    fullscreenOverlay.classList.add('active');
    document.documentElement.classList.add('fullscreen-active');
    
    const elem = fullscreenOverlay;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(console.log);
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

function exitFullscreen() {
    if (!isFullscreen) return;
    isFullscreen = false;
    fullscreenOverlay.classList.remove('active');
    document.documentElement.classList.remove('fullscreen-active');
    
    if (document.exitFullscreen) document.exitFullscreen().catch(console.log);
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
}

// --- Desktop Listeners ---

// Desktop: Double-click on clickable area
clickableArea.addEventListener('dblclick', (e) => {
    e.preventDefault();
    enterFullscreen();
});

// Arrow navigation (Desktop)
prevArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
});

nextArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
});

// Keyboard navigation (Desktop)
document.addEventListener('keydown', (e) => {
    if (isFullscreen) {
        exitFullscreen();
    } else {
        if (e.key === 'ArrowLeft') prevSlide();
        else if (e.key === 'ArrowRight') nextSlide();
    }
});

// --- Fullscreen State Management ---

// Exit fullscreen on click/tap on the overlay
fullscreenOverlay.addEventListener('click', exitFullscreen);

// Listen for fullscreen change events (e.g., user pressing 'Esc')
function handleFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        if (isFullscreen) exitFullscreen(); // Sync state
    }
}
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// --- Mobile Touch Handling ---

let tapCount = 0;
let tapTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isSwiping = false;

// Listen on the image container for all touch events
imageContainer.addEventListener('touchstart', (e) => {
    if (isFullscreen) return;

    if (e.touches.length === 2) {
        // --- PINCH START ---
        isSwiping = false;
        clearTimeout(tapTimer);
        tapCount = 0;
        touchStartDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
    } else if (e.touches.length === 1) {
        // --- SWIPE START or TAP START ---
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
        
        // --- DOUBLE TAP LOGIC ---
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => { tapCount = 0; }, 300);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            enterFullscreen(); // Double tap
        }
    }
}, { passive: true });

imageContainer.addEventListener('touchmove', (e) => {
    if (isFullscreen) return;

    if (e.touches.length === 2) {
        // --- PINCH MOVE ---
        e.preventDefault(); 
        const currentDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        
        // Pinch out (zoom in gesture)
        if (currentDistance > touchStartDistance + 50) { // 50px threshold
            enterFullscreen();
        }
    } else if (e.touches.length === 1) {
        // --- SWIPE MOVE ---
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const deltaX = Math.abs(touchCurrentX - touchStartX);
        const deltaY = Math.abs(touchCurrentY - touchStartY);
        
        if (deltaX > deltaY && deltaX > 10) {
            isSwiping = true;
            e.preventDefault(); // Prevent vertical scroll while swiping
        }
    }
}, { passive: false }); // passive:false is needed for preventDefault()

imageContainer.addEventListener('touchend', (e) => {
    if (isFullscreen) return;

    if (e.touches.length === 0) {
        if (isSwiping) {
            // --- SWIPE END ---
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            
            if (swipeDistance > 50) nextSlide();
            else if (swipeDistance < -50) prevSlide();
            
            clearTimeout(tapTimer);
            tapCount = 0;
        }
        isSwiping = false;
        touchStartDistance = 0;
    }
});

// Initialize
updateImage();

