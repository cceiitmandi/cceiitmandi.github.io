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

  // Hardcoded years for prev/next navigation
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
      return end < today; // only past events
    });

    // YEAR filter
    if (filterYear !== "all") {
      const yearNum = parseInt(filterYear, 10);
      filtered = filtered.filter(e => {
        const st = new Date(e.start);
        return st.getFullYear() === yearNum;
      });
    }

    // CATEGORY filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(e => {
        return e.category && e.category.toLowerCase() === filterCategory.toLowerCase();
      });
    }

    // Sort by start date descending
    filtered.sort((a, b) => {
      const da = new Date(a.start);
      const db = new Date(b.start);
      return db - da;
    });

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

    // Save filtered list globally for CSV export
    window.currentFilteredEvents = filtered;
  }

  // Year button clicks
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const yr = btn.getAttribute("data-year");
      currentYearIndex = yearButtons.indexOf(yr);

      // Reset category filter to ALL on year change
      categoryFilter.value = "all";

      renderEvents(yr, "all");

      // Update title
      yearTitle.textContent = (yr === "all") ? "All Years : Archived" : "Archived : " + yr;

      if (window.innerWidth <= 768) modalOverlay.classList.remove("active");
    });
  });

  // Prev/Next year buttons
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

  // Mobile menu toggle
  menuBtn.addEventListener("click", () => modalOverlay.classList.add("active"));
  modalOverlay.addEventListener("click", e => {
    if (!e.target.closest(".sidebar")) modalOverlay.classList.remove("active");
  });

  // Category filter change
  categoryFilter.addEventListener("change", () => {
    const activeYearBtn = document.querySelector(".nav-btn.active");
    const year = activeYearBtn ? activeYearBtn.dataset.year : "all";
    renderEvents(year, categoryFilter.value);
  });

  // Load events JSON
  fetch('archive/archive.json?v=' + Date.now())
    .then(res => res.json())
    .then(data => {
      events = data;

      // ✅ Check query parameters
      const params = new URLSearchParams(window.location.search);
      let initialYear = params.get("year") || "all";
      let initialCategory = params.get("cat") || "all";

      // Validate year param
      if (initialYear !== "all" && !yearButtons.includes(initialYear)) {
        initialYear = "all";
      }
      // Validate category param
      const catOption = Array.from(categoryFilter.options).find(opt =>
        opt.value.toLowerCase() === initialCategory.toLowerCase()
      );
      if (!catOption) {
        initialCategory = "all";
      } else {
        categoryFilter.value = catOption.value;
      }

      // Highlight correct year button
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      const yearBtn = document.querySelector(`.nav-btn[data-year="${initialYear}"]`);
      if (yearBtn) yearBtn.classList.add("active");

      renderEvents(initialYear, initialCategory);
      yearTitle.textContent = (initialYear === "all") ? "ALL Years : Archived" : "Archived : " + initialYear;
    })
    .catch(err => {
      console.error('Failed to load archive.json', err);
      eventList.innerHTML = '<p style="color: red;">Failed to load archived events.</p>';
    });
});

// CSV Download
const downloadBtn = document.getElementById("downloadCsv");
downloadBtn.addEventListener("click", () => {
  if (!window.currentFilteredEvents || window.currentFilteredEvents.length === 0) {
    alert("No events available to export.");
    return;
  }

  const rows = [];
  // Header row
  rows.push([
    "SNo",
    "Event/Activity",
    "ID",
    "Start Date",
    "End Date",
    "Category",
    "Coordinator(s)",
    "Participants Count",
    "Insite OM Link",
    "Footer Links"
  ]);

  // Data rows
  window.currentFilteredEvents.forEach((e, index) => {
    let footerLinks = "";
    if (e.links && e.links.length > 0) {
      footerLinks = e.links.map(link => `${link.label}: ${link.url}`).join(" | ");
    }

    rows.push([
      index + 1,
      e.title || "",
      e.id || "",
      e.start || "",
      e.end || "",
      e.category || "",
      e.coordinator || "",
      e.participantsCount || "",
      e.insiteLink || "",
      footerLinks
    ]);
  });

  // Convert to CSV
  let csvContent = rows.map(r =>
    r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  // Download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Build filename from active filters
  const activeYearBtn = document.querySelector(".nav-btn.active");
  const year = activeYearBtn ? activeYearBtn.dataset.year : "all";
  const category = document.getElementById("categoryFilter").value;

  let fileName = "CCE-Archive";
  if (year !== "all") fileName += "-" + year;
  if (category !== "all") fileName += "-" + category.replace(/\s+/g, "_");
  fileName += ".csv";

  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
