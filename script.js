const images = [
  "https://picsum.photos/id/1018/1200/800",
  "https://picsum.photos/id/1025/1200/800",
  "https://picsum.photos/id/1039/1200/800",
  "https://picsum.photos/id/1047/1200/800",
  "https://picsum.photos/id/1052/1200/800"
];

let current = 0;
const imgElement = document.getElementById("slide");
imgElement.src = images[current];

function changeImage(direction) {
  const animClass = direction === "left" ? "roll-left" : "roll-right";
  imgElement.classList.remove("roll-left", "roll-right");
  void imgElement.offsetWidth; // restart animation
  imgElement.src = images[current];
  imgElement.classList.add(animClass);
}

function nextImage() {
  if (current < images.length - 1) {
    current++;
    changeImage("right");
  }
}

function prevImage() {
  if (current > 0) {
    current--;
    changeImage("left");
  }
}

// Double tap / click fullscreen logic
let lastTap = 0;
let fsContainer = null;

imgElement.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap < 300) toggleFullscreen(imgElement);
  lastTap = now;
});

function toggleFullscreen(img) {
  if (!fsContainer) {
    fsContainer = document.createElement("div");
    fsContainer.classList.add("fullscreen-container");

    const clone = img.cloneNode();
    clone.classList.add("fullscreen-img");
    fsContainer.appendChild(clone);
    document.body.appendChild(fsContainer);

    if (fsContainer.requestFullscreen) fsContainer.requestFullscreen();
    else if (fsContainer.webkitRequestFullscreen) fsContainer.webkitRequestFullscreen();

    clone.addEventListener("click", exitFullscreen);
  } else {
    exitFullscreen();
  }
}

function exitFullscreen() {
  if (fsContainer) {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    fsContainer.remove();
    fsContainer = null;
  }
}
