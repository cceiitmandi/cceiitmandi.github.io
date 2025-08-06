const items = document.querySelectorAll('.gallery-item img');
const overlay = document.getElementById('galleryOverlay');
const overlayImg = document.getElementById('overlayImage');
let currentIndex = 0;

items.forEach((img, idx) => {
  img.addEventListener('click', () => {
    currentIndex = idx;
    showOverlay();
  });
});

function showOverlay() {
  overlayImg.src = items[currentIndex].src;
  overlay.style.display = 'flex';
}

function nextImage() {
  currentIndex = (currentIndex + 1) % items.length;
  showOverlay();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  showOverlay();
}

// Close when click outside image/buttons
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.style.display = 'none';
});

// Close on ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') overlay.style.display = 'none';
});
