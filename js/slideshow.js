(function () {
  const track = document.getElementById("carouselTrack");
  let slides = Array.from(track.querySelectorAll(".slide"));
  const btnPrev = document.querySelector(".carousel-btn.prev");
  const btnNext = document.querySelector(".carousel-btn.next");

  let index = 0;
  let timer = null;
  const AUTOPLAY_MS = 8000;  // TIME CONTROL FOR SLIDE

  // If an image fails to load (e.g., wrong filename/case), remove that slide
  slides.forEach((slide) => {
    const img = slide.querySelector("img");
    img.addEventListener(
      "error",
      () => {
        slide.remove();
        slides = Array.from(track.querySelectorAll(".slide"));
        if (slides.length === 0) return;
        index = Math.min(index, slides.length - 1);
        update();
      },
      { once: true }
    );
  });

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function next() {
    if (!slides.length) return;
    index = (index + 1) % slides.length;
    update();
    restart();
  }

  function prev() {
    if (!slides.length) return;
    index = (index - 1 + slides.length) % slides.length;
    update();
    restart();
  }

  function start() {
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // Buttons
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  // Keyboard (left/right)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  // Touch swipe
  let startX = 0;
  let isTouching = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      isTouching = true;
      startX = e.touches[0].clientX;
      stop(); // pause while swiping
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (!isTouching) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      const THRESHOLD = 40; // px
      if (dx > THRESHOLD) prev();
      else if (dx < -THRESHOLD) next();
      isTouching = false;
      start(); // resume autoplay
    },
    { passive: true }
  );

  // Init
  update();
  start();
})();
