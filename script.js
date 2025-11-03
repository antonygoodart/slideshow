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
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
        updateImage();
    }
}

function enterFullscreen() {
    isFullscreen = true;
    fullscreenOverlay.classList.add('active');
}

function exitFullscreen() {
    isFullscreen = false;
    fullscreenOverlay.classList.remove('active');
}

// Desktop: Double-click on clickable area
clickableArea.addEventListener('dblclick', (e) => {
    e.preventDefault();
    enterFullscreen();
});

// Exit fullscreen on click (desktop) or tap (mobile)
fullscreenOverlay.addEventListener('click', exitFullscreen);

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

imageContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
    } else if (e.touches.length === 1) {
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
    }
}, { passive: false });

// Prevent default touch behavior
imageContainer.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        touchStartDistance = 0;
    }
});

// Initialize
updateImage();
