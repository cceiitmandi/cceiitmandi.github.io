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
  const categorySelect = document.getElementById("categoryFilter");

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

  function renderEvents(filterYear = "all") {
    const today = new Date();

    // Base filter: only events that ended before today
    let filtered = events.filter(e => new Date(e.end) < today);

    // Year filter
    if (filterYear !== "all") {
      filtered = filtered.filter(e => {
        const startYear = new Date(e.start).getFullYear();
        const endYear = new Date(e.end).getFullYear();
        const year = parseInt(filterYear, 10);
        return startYear <= year && endYear >= year;
      });
    }

    // Category filter (single select)
    const selected = categorySelect.value;
    if (selected !== "ALL") {
      filtered = filtered.filter(e => e.category && e.category === selected);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aStart = new Date(a.start);
      const aEnd = new Date(a.end);
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);

      const aMulti = aEnd.getFullYear() !== aStart.getFullYear();
      const bMulti = bEnd.getFullYear() !== bStart.getFullYear();
      if (aMulti && !bMulti) return -1;
      if (!aMulti && bMulti) return 1;

      if (filterYear === "all") {
        return bEnd - aEnd; // latest ended first
      } else {
        if (aStart.getMonth() !== bStart.getMonth()) {
          return bStart.getMonth() - aStart.getMonth(); // Dec → Jan
        }
        return aStart - bStart;
      }
    });

    // Render
    eventCount.textContent = `[${filtered.length}]`;
    eventList.innerHTML = "";

    if (filtered.length === 0) {
      eventList.innerHTML = '<p style="font-size: 1.1rem; color: #888; padding: 0.8rem;">No archived events found.</p>';
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
        <div class="event-info-inline">
          ${e.id ? `🆔 ${e.id}` : ""}
          ${e.start && e.end ? `📅 ${formatDate(e.start)} – ${formatDate(e.end)}` : ""}
          ${e.coordinator ? `👤 ${e.coordinator}` : ""}
          ${e.participantCount ? `👥 ${e.participantCount}` : ""}
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

    return filtered;  // 🔥 return filtered list for CSV export
  }


  // Download CSV
  function downloadCSV(filteredEvents) {
  if (!filteredEvents || filteredEvents.length === 0) {
    alert("No events to export.");
    return;
  }

  const rows = [
    ["SNo", "Name of the Event/Activity", "ID", "Start Date", "End Date", "Coordinator", "Count of Participants"]
  ];

  filteredEvents.forEach((e, index) => {
    rows.push([
      index + 1,
      e.title || "",
      e.id || "",
      e.start ? new Date(e.start).toLocaleDateString() : "",
      e.end ? new Date(e.end).toLocaleDateString() : "",
      e.coordinator || "",
      e.participantCount || ""
    ]);
  });

  // Convert to CSV string
  const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Archived_Events.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  // Category filter listener
  categorySelect.addEventListener("change", () => {
    const activeYearBtn = document.querySelector(".nav-btn.active");
    const year = activeYearBtn ? activeYearBtn.getAttribute("data-year") : "all";
    renderEvents(year);
  });

  // Year filter buttons
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const y = btn.getAttribute("data-year");
      currentIndex = yearOrder.indexOf(y);
      renderEvents(y);

      yearTitle.textContent = y === "all" ? "ALL Archived" : `Archive - ${y}`;

      // Reset category filter to ALL when year changes
      categorySelect.value = "ALL";

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
      console.error('Failed to load calendar-archive.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load archive events.</p>';
    });
});

document.getElementById("downloadCSV").addEventListener("click", () => {
  const activeYearBtn = document.querySelector(".nav-btn.active");
  const year = activeYearBtn ? activeYearBtn.getAttribute("data-year") : "all";
  const filtered = renderEvents(year);
  downloadCSV(filtered);
});

