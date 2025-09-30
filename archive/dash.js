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
  
  const dashboardBtn = document.getElementById("dashboardBtn");
  // Also handle desktop dashboard button if separate
  const dashboardBtnDesktop = document.getElementById("dashboardBtnDesktop");
  const dashboardSection = document.getElementById("dashboardSection");
  let dashboardChart = null;

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

      html += `</div>`;
      card.innerHTML = html;
      eventList.appendChild(card);
    });

    window.currentFilteredEvents = filtered;
  }

  function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function applyInitialFilters() {
    const urlYear = getURLParameter("year");
    const urlCategory = getURLParameter("category");

    const validYears = ["2025", "2024", "2023", "2022"];
    const selectedYear = validYears.includes(urlYear) ? urlYear : "all";

    // Set active year button
    const targetBtn = document.querySelector(`.nav-btn[data-year="${selectedYear}"]`);
    if (targetBtn) {
      navButtons.forEach(b => b.classList.remove("active"));
      targetBtn.classList.add("active");
      currentYearIndex = yearButtons.indexOf(selectedYear);
    }

    // Set category dropdown
    if (urlCategory) {
      categoryFilter.value = urlCategory;
    }

    renderEvents(selectedYear, urlCategory || "all");
    yearTitle.textContent =
      selectedYear === "all"
        ? "ALL Years : Archived"
        : `Archived : ${selectedYear}`;
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const yr = btn.getAttribute("data-year");
      // If this is “Dashboard” tab, we handle elsewhere
      if (!yr) {
        // dashboard case handled by dashboardBtn listener
        return;
      }

      currentYearIndex = yearButtons.indexOf(yr);
      categoryFilter.value = "all";

      // Show events list, hide dashboard
      eventList.style.display = "block";
      dashboardSection.style.display = "none";

      renderEvents(yr, "all");
      yearTitle.textContent = yr === "all" ? "ALL Years : Archived" : "Archived : " + yr;

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

  // CSV download
  document.getElementById("downloadCsv").addEventListener("click", () => {
    const eventsToExport = window.currentFilteredEvents || [];

    if (eventsToExport.length === 0) {
      alert("No events to export.");
      return;
    }

    const baseHeaders = ["SNo", "Title", "Year", "Start Date", "End Date", "ID", "Coordinator", "Insite Link"];
    const maxLinks = Math.max(...eventsToExport.map(e => (e.links || []).length));
    const linkHeaders = Array.from({ length: maxLinks }, (_, i) => `Link ${i + 1}`);
    const headers = [...baseHeaders, ...linkHeaders];

    const rows = eventsToExport.map((event, index) => {
      const baseRow = [
        index + 1,
        event.title || "",
        event.start ? new Date(event.start).getFullYear() : "",
        event.start ? new Date(event.start).toLocaleDateString() : "",
        event.end ? new Date(event.end).toLocaleDateString() : "",
        event.id || "",
        event.coordinator || "",
        event.insitelink || ""
      ];

      const linkValues = (event.links || []).map(link => link.url || "");
      while (linkValues.length < maxLinks) linkValues.push("");

      return [...baseRow, ...linkValues];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "CCE_Archive.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  function renderDashboard() {
    const yearRange = ["2022", "2023", "2024", "2025"];
    const yearData = { 2022: 0, 2023: 0, 2024: 0, 2025: 0 };

    events.forEach(e => {
      if (e.start && e.end) {
        const start = new Date(e.start);
        const end = new Date(e.end);
        // Only count if same year and same month (single-month event)
        if (
          start.getFullYear() === end.getFullYear() &&
          start.getMonth() === end.getMonth()
        ) {
          const y = start.getFullYear();
          if (yearData[y] !== undefined) {
            yearData[y]++;
          }
        }
      }
    });

    const ctx = document.getElementById("dashboardChart").getContext("2d");
    if (dashboardChart) dashboardChart.destroy();

    dashboardChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: yearRange,
        datasets: [{
          label: 'Event Count (Single‑Month Events)',
          data: yearRange.map(y => yearData[y]),
          backgroundColor: '#0f7556',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Event/Activity Count by Year'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  function activateDashboard() {
    navButtons.forEach(b => b.classList.remove("active"));
    if (dashboardBtn) dashboardBtn.classList.add("active");
    if (dashboardBtnDesktop) dashboardBtnDesktop.classList.add("active");

    eventList.style.display = "none";
    dashboardSection.style.display = "block";
    yearTitle.textContent = "CCE Dashboard 📊";
    eventCount.textContent = "";

    renderDashboard();

    if (window.innerWidth <= 768) modalOverlay.classList.remove("active");
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", activateDashboard);
  }
  if (dashboardBtnDesktop) {
    dashboardBtnDesktop.addEventListener("click", activateDashboard);
  }

  // Fetch data
  fetch('archive.json?v=' + Date.now())
    .then(res => res.json())
    .then(data => {
      events = data;
      applyInitialFilters();
    })
    .catch(err => {
      console.error('Failed to load archive.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load archived events.</p>';
    });
});
