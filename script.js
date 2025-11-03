* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background: #f0f0f0;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.slideshow-wrapper {
    position: relative;
    width: 90vmin;
    height: 90vmin;
    max-width: 800px;
    max-height: 800px;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    position: relative;
    overflow: hidden;
}

.image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-select: none;
}

.clickable-area {
    position: absolute;
    width: 50%;
    height: 50%;
    top: 25%;
    left: 25%;
    cursor: pointer;
    z-index: 10;
}

.arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    cursor: pointer;
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    color: rgba(150, 150, 150, 0.5);
    user-select: none;
    transition: color 0.2s;
}

.arrow:hover {
    color: rgba(100, 100, 100, 0.8);
}

.arrow.disabled {
    opacity: 0.2;
    cursor: default;
    pointer-events: none;
}

.arrow-left {
    left: 10px;
}

.arrow-right {
    right: 10px;
}

.fullscreen-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    z-index: 1000;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.fullscreen-overlay.active {
    display: flex;
}

.fullscreen-overlay img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

@media (max-width: 768px) {
    .slideshow-wrapper {
        width: 95vmin;
        height: 95vmin;
    }

    .arrow {
        width: 40px;
        height: 40px;
        font-size: 24px;
    }

    .clickable-area {
        display: none;
    }
}
