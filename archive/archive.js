document.addEventListener("DOMContentLoaded", function () {
  let events = [];

  const eventList = document.getElementById("eventList");
  const yearTitle = document.getElementById("yearTitle");
  const eventCount = document.getElementById("eventCount");
  const prevBtn = document.getElementById("prevYear");
  const nextBtn = document.getElementById("nextYear");
  const menuBtn = document.getElementById("menuToggle");
  const modalOverlay = document.getElementById("modalOverlay");
  const navButtons = document.querySelectorAll(".nav-btn");
  const categoryFilter = document.getElementById("categoryFilter");

  const yearButtons = ["2025", "2024", "2023", "2022"];
  let currentYearIndex = -1;

  function formatDate(str) {
    const date = new Date(str);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function renderEvents(filterYear = "all", filterCategory = "all") {
    const today = new Date();

    let filtered = events.filter(e => {
      const end = new Date(e.end);
      return end < today;
    });

    if (filterYear !== "all") {
      const yearNum = parseInt(filterYear, 10);
      filtered = filtered.filter(e => {
        const st = new Date(e.start);
        return st.getFullYear() === yearNum;
      });
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(e => {
        return e.category && e.category.toLowerCase() === filterCategory.toLowerCase();
      });
    }

    filtered.sort((a, b) => new Date(b.start) - new Date(a.start));

    eventCount.textContent = `[${filtered.length}]`;
    eventList.innerHTML = "";

    if (filtered.length === 0) {
      eventList.innerHTML = '<p style="font-size: 1.1rem; color: #888; padding: 0.8rem;">No Archived Events/Activities.</p>';
      window.currentFilteredEvents = [];
      return;
    }

    filtered.forEach(e => {
      const card = document.createElement("div");
      card.className = "event-card";

      let html = `
        <div class="event-title-row non">
          <h3 class="event-title non">${e.title}</h3>
          ${e.category ? `<span class="tag non">${e.category}</span>` : ""}
        </div>
        <div class="event-info-row">
          <div class="event-meta">🆔 ${e.id}</div>
          ${e.start && e.end ? `<div class="event-meta">📅 ${formatDate(e.start)} to ${formatDate(e.end)}</div>` : ""}
          ${e.coordinator ? `<div class="event-meta">👤 Coordinator(s): ${e.coordinator}</div>` : ""}
          ${e.insitelink ? `<div class="event-meta">🔗 <a href="${e.insitelink}" target="_blank">Insite OM Link</a></div>` : ""}
      `;

      if (e.links && e.links.length > 0) {
        e.links.forEach(link => {
          if (link.url) {
            html += `<div class="event-meta">🔗 <a href="${link.url}" target="_blank">${link.label || "Link"}</a></div>`;
          }
        });
      }

      html += `</div>`; // close event-info-row
      card.innerHTML = html;
      eventList.appendChild(card);
    });

    window.currentFilteredEvents = filtered;
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const yr = btn.getAttribute("data-year");
      currentYearIndex = yearButtons.indexOf(yr);
      categoryFilter.value = "all";

      renderEvents(yr, "all");
      yearTitle.textContent = (yr === "all") ? "All Years : Archived" : "Archived : " + yr;

      if (window.innerWidth <= 768) modalOverlay.classList.remove("active");
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentYearIndex > 0) {
      currentYearIndex--;
      document.querySelectorAll(`[data-year="${yearButtons[currentYearIndex]}"]`).forEach(btn => btn.click());
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentYearIndex < yearButtons.length - 1) {
      currentYearIndex++;
      document.querySelectorAll(`[data-year="${yearButtons[currentYearIndex]}"]`).forEach(btn => btn.click());
    }
  });

  menuBtn.addEventListener("click", () => modalOverlay.classList.add("active"));
  modalOverlay.addEventListener("click", e => {
    if (!e.target.closest(".sidebar")) modalOverlay.classList.remove("active");
  });

  categoryFilter.addEventListener("change", () => {
    const activeYearBtn = document.querySelector(".nav-btn.active");
    const year = activeYearBtn ? activeYearBtn.dataset.year : "all";
    renderEvents(year, categoryFilter.value);
  });

  fetch('archive/archive.json?v=' + Date.now())
    .then(res => res.json())
    .then(data => {
      events = data;
      renderEvents("all", "all");
      yearTitle.textContent = "All Years : Archived";
    })
    .catch(err => {
      console.error('Failed to load archive.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load archived events.</p>';
    });
});