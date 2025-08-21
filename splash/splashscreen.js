// Splash Screen SCRIPT (2/2)


(function () {
  // --- CONFIG ---
  const SHOW_ONCE_PER_SESSION = true; // set false to show every visit
  const MIN_MS = 1200;                // min time splash stays visible
  const MAX_MS = 2200;                // hard timeout: hide no matter what

  function ready(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // DOM already parsed
      setTimeout(fn, 0);
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  }

  ready(function () {
    const splash = document.getElementById("splash");
    if (!splash) return;

    // Skip if we already showed it this tab session
    if (SHOW_ONCE_PER_SESSION && sessionStorage.getItem("cceSplashSeen") === "1") {
      splash.classList.add("hidden");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
      return;
    }

    const start = performance.now();
    let hidden = false;

    const hideSplash = () => {
      if (hidden) return;
      hidden = true;
      splash.classList.add("hidden");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
      if (SHOW_ONCE_PER_SESSION) sessionStorage.setItem("cceSplashSeen", "1");
    };

    const hideAfterMin = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_MS - elapsed);
      setTimeout(hideSplash, wait);
    };

    // Prefer full load (all assets), but ensure MIN_MS
    window.addEventListener("load", hideAfterMin, { once: true });

    // Hard fallback so it never sticks
    setTimeout(hideSplash, MAX_MS);
  });
})();
