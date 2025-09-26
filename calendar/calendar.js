document.addEventListener("DOMContentLoaded", function () {
  let events = [];

  const eventList = document.getElementById("eventList");
  const monthTitle = document.getElementById("monthTitle");
  const eventCount = document.getElementById("eventCount");
  const navButtons = document.querySelectorAll(".nav-btn");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const menuBtn = document.getElementById("menuToggle");
  const modalOverlay = document.getElementById("modalOverlay");

  const monthOrder = ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];
  let currentIndex = -1;

  function formatDate(str) {
    const date = new Date(str);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function renderEvents(filterMonth = "all") {
    const today = new Date();

    let filtered = events.filter(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      end.setHours(20, 0, 0, 0);

      const isCurrentMonth =
        start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth();

      // Keep event if:
      // 1. It’s ongoing/upcoming, OR
      // 2. It belongs to the current month (even if completed)
      return end >= today || isCurrentMonth;
    });

    if (filterMonth !== "all") {
      const [year, month] = filterMonth.split("-").map(Number);

      filtered = filtered.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        return start <= monthEnd && end >= monthStart;
      });
    }

    filtered.sort((a, b) => {
      const aStart = new Date(a.start);
      const aEnd = new Date(a.end);
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);

      const aMultiMonth = (aEnd.getFullYear() !== aStart.getFullYear()) || (aEnd.getMonth() !== aStart.getMonth());
      const bMultiMonth = (bEnd.getFullYear() !== bStart.getFullYear()) || (bEnd.getMonth() !== bStart.getMonth());

      if (aMultiMonth && !bMultiMonth) return -1;
      if (!aMultiMonth && bMultiMonth) return 1;

      return aStart - bStart;
    });

    eventCount.textContent = `[${filtered.length}]`;
    eventList.innerHTML = "";

    if (filtered.length === 0) {
      eventList.innerHTML = '<p style="font-size: 1.1rem; color: #888; padding: 0.8rem;">No Events/Activities this month yet.</p>';
      return;
    }

    filtered.forEach(e => {
      const card = document.createElement("div");
      card.className = "event-card";

      const startDate = new Date(e.start);
      const endDate = new Date(e.end);
      endDate.setHours(20, 0, 0, 0);

      const isOngoing = today >= startDate && today <= endDate;
      const isCurrentMonth =
        startDate.getFullYear() === today.getFullYear() &&
        startDate.getMonth() === today.getMonth();
      const isConcluded = isCurrentMonth && today > endDate;

      let html = `
        <div class="event-title-row non">
          <h3 class="event-title non">
            ${e.title}
            ${isOngoing ? '<span class="ongoing-tag">ONGOING</span>' : ''}
            ${isConcluded ? '<span class="concluded-tag">CONCLUDED</span>' : ''}
          </h3>
          ${e.category ? `<span class="tag non">${e.category}</span>` : ""}
        </div>
        <div class="event-info-row">
          <div class="event-meta">🆔 ${e.id}</div>
          ${e.start && e.end ? `<div class="event-meta">📅 ${formatDate(e.start)} to ${formatDate(e.end)}</div>` : ""}
          ${e.location ? `<div class="event-meta">📍 ${e.location}</div>` : ""}
          ${e.coordinator ? `<div class="event-meta">👤 Coordinator(s): ${e.coordinator}</div>` : ""}
          ${e.lastDate ? `<div class="event-meta last-date">Last Date: ${e.lastDate}</div>` : ""}
          ${e.insiteLink ? `<div class="event-meta">🔗 <a href="${e.insiteLink}" target="_blank">Insite OM Link</a></div>` : ""}
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

      const m = btn.getAttribute("data-month");
      currentIndex = monthOrder.indexOf(m);
      renderEvents(m);

      monthTitle.textContent = m === "all" ? "ALL Events/Activities" : btn.textContent.trim();
      if (window.innerWidth <= 768) modalOverlay.classList.remove("active");
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      document.querySelectorAll(`[data-month="${monthOrder[currentIndex]}"]`).forEach(btn => btn.click());
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < monthOrder.length - 1) {
      currentIndex++;
      document.querySelectorAll(`[data-month="${monthOrder[currentIndex]}"]`).forEach(btn => btn.click());
    }
  });

  menuBtn.addEventListener("click", () => modalOverlay.classList.add("active"));
  modalOverlay.addEventListener("click", e => {
    if (!e.target.closest(".sidebar")) modalOverlay.classList.remove("active");
  });

  fetch('calendar/calendar.json?v=' + Date.now())
    .then(res => res.json())
    .then(data => {
      events = data;
      renderEvents();
    })
    .catch(err => {
      console.error('Failed to load events.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load events.</p>';
    });
});
