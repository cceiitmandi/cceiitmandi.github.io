  function openVideo(videoUrl) {
    const overlay = document.getElementById("videoOverlay");
    const iframe = document.getElementById("videoFrame");
    iframe.src = videoUrl;
    overlay.style.display = "flex";
  }

  function closeVideo(event) {
    // Only close if clicked outside the video container
    if (!event.target.closest(".video-container")) {
      const overlay = document.getElementById("videoOverlay");
      const iframe = document.getElementById("videoFrame");
      iframe.src = ""; // stop video
      overlay.style.display = "none";
    }
  }