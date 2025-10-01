document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("ratingTiles");

  fetch("insight/insight.json")
    .then(response => response.json())
    .then(data => {
      data.forEach(entry => {
        const tile = document.createElement("div");
        tile.classList.add("rating-tile");

        // Circular rating block
        const circular = document.createElement("div");
        circular.classList.add("circular-rating");
        circular.innerHTML = `
          <svg class="progress-ring" width="120" height="120">
            <circle class="progress-ring__background" cx="60" cy="60" r="52" />
            <circle class="progress-ring__circle blue" cx="60" cy="60" r="52" />
          </svg>
          <div class="progress-label">
            <div class="rating-number">${entry.overallRating}</div>
            <div class="rating-scale">/10</div>
          </div>
        `;

        // Title + Subtext
        const title = document.createElement("div");
        title.classList.add("rating-title");
        title.textContent = entry.title;

        const subtext = document.createElement("div");
        subtext.classList.add("rating-subtext");
        subtext.textContent = "Average Overall Rating";

        tile.appendChild(circular);
        tile.appendChild(title);
        tile.appendChild(subtext);

        // Individual bar ratings if present
        if (entry.ratings && Object.keys(entry.ratings).length > 0) {
          const barContainer = document.createElement("div");
          barContainer.classList.add("bar-ratings");

          Object.entries(entry.ratings).forEach(([label, score]) => {
            const barItem = document.createElement("div");
            barItem.classList.add("bar-item");
            barItem.dataset.score = score;
            barItem.dataset.max = 10;

            barItem.innerHTML = `
              <span class="bar-label">${label}</span>
              <div class="bar-track"><div class="bar-fill"></div></div>
              <span class="bar-value">${score}/10</span>
            `;

            barContainer.appendChild(barItem);
          });

          tile.appendChild(barContainer);
        }

        container.appendChild(tile);
      });

      // Animate circular ratings
      document.querySelectorAll(".circular-rating").forEach(el => {
        const circle = el.querySelector(".progress-ring__circle");
        const score = parseFloat(el.querySelector(".rating-number").textContent);
        const max = 10;
        const percent = (score / max) * 100;

        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = circumference;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      });

      // Animate bar ratings
      document.querySelectorAll(".bar-item").forEach(item => {
        const score = parseFloat(item.dataset.score);
        const max = parseFloat(item.dataset.max) || 10;
        const percent = (score / max) * 100;
        const bar = item.querySelector(".bar-fill");
        bar.style.width = percent + "%";
      });
    })
    .catch(err => {
      console.error("Error loading insight.json:", err);
      container.innerHTML = "<p>Failed to load data.</p>";
    });
});
