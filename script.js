// Image URLs - Replace these with your Imgur links
const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
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
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

function updateImage() {
    mainImage.src = images[currentIndex];
    fullscreenImage.src = images[currentIndex];
    updateArrows();
}

function updateArrows() {
    if (currentIndex === 0) {
        prevArrow.classList.add('disabled');
    } else {
        prevArrow.classList.remove('disabled');
    }

    if (currentIndex === images.length - 1) {
        nextArrow.classList.add('disabled');
    } else {
        nextArrow.classList.remove('disabled');
    }
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
    isFullscreen = true;
    fullscreenOverlay.classList.add('active');
    document.documentElement.classList.add('fullscreen-active');
    document.body.classList.add('fullscreen-active');
    
    // Request fullscreen API
    const elem = fullscreenOverlay;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log(err));
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    isFullscreen = false;
    fullscreenOverlay.classList.remove('active');
    document.documentElement.classList.remove('fullscreen-active');
    document.body.classList.remove('fullscreen-active');
    
    // Exit fullscreen API
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Desktop: Double-click on clickable area
clickableArea.addEventListener('dblclick', (e) => {
    e.preventDefault();
    enterFullscreen();
});

// Exit fullscreen on click (desktop) or tap (mobile)
fullscreenOverlay.addEventListener('click', exitFullscreen);

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        if (isFullscreen) {
            isFullscreen = false;
            fullscreenOverlay.classList.remove('active');
            document.documentElement.classList.remove('fullscreen-active');
            document.body.classList.remove('fullscreen-active');
        }
    }
}

// Arrow navigation
prevArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
});

nextArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (isFullscreen) {
        exitFullscreen();
    } else {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    }
});

// Mobile touch handling
let tapCount = 0;
let tapTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isSwiping = false;

imageContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
    } else if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
        
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 300);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            enterFullscreen();
        }
    }
});

imageContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        
        // Pinch out (zoom in gesture)
        if (currentDistance > touchStartDistance + 50) {
            enterFullscreen();
        }
    } else if (e.touches.length === 1) {
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const deltaX = Math.abs(touchCurrentX - touchStartX);
        const deltaY = Math.abs(touchCurrentY - touchStartY);
        
        // Detect horizontal swipe (more horizontal than vertical)
        if (deltaX > deltaY && deltaX > 10) {
            isSwiping = true;
        }
    }
}, { passive: false });

imageContainer.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            
            // Swipe left (next image)
            if (swipeDistance > 50) {
                nextSlide();
            }
            // Swipe right (previous image)
            else if (swipeDistance < -50) {
                prevSlide();
            }
            
            // Reset double tap counter if user was swiping
            clearTimeout(tapTimer);
            tapCount = 0;
            isSwiping = false;
        }
        
        touchStartDistance = 0;
    }
});

// Initialize
updateImage();
