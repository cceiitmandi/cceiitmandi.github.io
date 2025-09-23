document.addEventListener("DOMContentLoaded", function () {
  let events = [];

  const eventList = document.getElementById("eventList");
  const yearTitle = document.getElementById("yearTitle");
  const eventCount = document.getElementById("eventCount");
  const navButtons = document.querySelectorAll(".nav-btn");
  const prevBtn = document.getElementById("prevYear");
  const nextBtn = document.getElementById("nextYear");
  const menuBtn = document.getElementById("menuToggle");
  const modalOverlay = document.getElementById("modalOverlay");

  const yearOrder = ["2022", "2023", "2024", "2025"];
  let currentIndex = -1;

  function formatDate(str) {
    const date = new Date(str);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function isOngoing(event, today) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    end.setHours(20, 0, 0, 0); // valid until 8 PM end date
    return today >= start && today <= end;
  }

  function renderEvents(filterYear = "all") {
    const today = new Date();

    
    let filtered = events.filter(e => {
      const end = new Date(e.end);
      return end < today; // only events that have fully ended
    });

    // filter by year
    if (filterYear !== "all") {
      filtered = filtered.filter(e => {
        const startYear = new Date(e.start).getFullYear();
        const endYear = new Date(e.end).getFullYear();
        const year = parseInt(filterYear, 10);
        return startYear <= year && endYear >= year;
      });
    }

    // sort
    filtered.sort((a, b) => {
      const aStart = new Date(a.start);
      const aEnd = new Date(a.end);
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);

      const aMulti = aEnd.getFullYear() !== aStart.getFullYear() || aEnd.getMonth() !== aStart.getMonth();
      const bMulti = bEnd.getFullYear() !== bStart.getFullYear() || bEnd.getMonth() !== bStart.getMonth();

      // multi-year stick to top
      if (aMulti && !bMulti) return -1;
      if (!aMulti && bMulti) return 1;

      if (filterYear === "all") {
        // ALL → latest ended first
        return bEnd - aEnd;
      } else {
        // year filter → Dec → Jan
        if (aStart.getMonth() !== bStart.getMonth()) {
          return bStart.getMonth() - aStart.getMonth(); // reverse month order
        }
        return aStart - bStart; // tie-breaker by start date
      }
    });

    eventCount.textContent = `[${filtered.length}]`;
    eventList.innerHTML = "";

    if (filtered.length === 0) {
      eventList.innerHTML = '<p style="font-size: 1.1rem; color: #888; padding: 0.8rem;">No archived events found.</p>';
      return;
    }

    filtered.forEach(e => {
  const card = document.createElement("div");
  card.className = "event-card";

  const startDate = e.start ? new Date(e.start) : null;
  const endDate = e.end ? new Date(e.end) : null;

  let details = "";

  if (e.id) details += ` 🆔 ${e.id}`;
  if (startDate && endDate) details += ` 📅 ${formatDate(e.start)} – ${formatDate(e.end)}`;
  if (e.coordinator) details += ` 👤 ${e.coordinator}`;
  if (e.participantCount) details += ` 👥 ${e.participantCount}`;

  let html = `
    <div class="event-title-row non">
      <h3 class="event-title non">${e.title}</h3>
      ${e.category ? `<span class="tag non">${e.category}</span>` : ""}
    </div>
    <div class="event-info-inline">
      ${details.trim()}
    </div>
  `;

  if (e.links && e.links.length > 0) {
    html += `<div class="event-footer">`;
    e.links.forEach(link => {
      html += `<a href="${link.url}" target="_blank">${link.label}</a>`;
    });
    html += `</div>`;
  }

  card.innerHTML = html;
  eventList.appendChild(card);
});
}

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const y = btn.getAttribute("data-year");
      currentIndex = yearOrder.indexOf(y);
      renderEvents(y);

      yearTitle.textContent = y === "all" ? "ALL Archived Events/Activities" : `Archived Events - ${y}`;
      if (window.innerWidth <= 768) modalOverlay.classList.remove("active");
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      document.querySelectorAll(`[data-year="${yearOrder[currentIndex]}"]`).forEach(btn => btn.click());
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < yearOrder.length - 1) {
      currentIndex++;
      document.querySelectorAll(`[data-year="${yearOrder[currentIndex]}"]`).forEach(btn => btn.click());
    }
  });

  menuBtn.addEventListener("click", () => modalOverlay.classList.add("active"));
  modalOverlay.addEventListener("click", e => {
    if (!e.target.closest(".sidebar")) modalOverlay.classList.remove("active");
  });

  // Load events from archive JSON
  fetch('calendararchive/calendar-archive.json?v=' + Date.now())
    .then(res => res.json())
    .then(data => {
      events = data;
      renderEvents("all");
    })
    .catch(err => {
      console.error('Failed to load calendararchive.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load archive events.</p>';
    });
});
