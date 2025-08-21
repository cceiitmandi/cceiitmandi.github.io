document.addEventListener("DOMContentLoaded", function () {
  const events = [
    {
      title: "Advances in Electron Microscopy and Its Applications (AEMA-2025)",
      category: "Conference",
      id: "IITM/Conf/PFS/269",
      start: "2025-12-11",
      end: "2025-12-12",
      coordinator: "Prof. Prem Felix Siril, SCS",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/08-188",
    },
    {
      title: "Workshop on “Advanced Instrumentation”",
      category: "Workshop",
      id: "IITM/WS-AMRC/AH/274",
      start: "2025-12-10",
      end: "2025-12-11",
      coordinator: "Dr. Aditi Halder, SCS",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/08-187",
    },
    {
      title: "Workshop on Building Cognitive Experiments",
      category: "Workshop",
      id: "IITM/WS/RG/272",
      start: "2025-09-18",
      end: "2025-09-20",
      location: "IKSHMA",
      coordinator: "Dr. Ramajayam Govindaraji, IKSHMA",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/07-184",
    },
    {
      title: "GIAN Course on Elements of Smart Structures",
      category: "GIAN Course",
      id: "IITM/GIAN/VSC/271",
      start: "2025-12-15",
      end: "2025-12-20",
      coordinator: "Prof. Vishal Singh Chauhan, SMME",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/07-182",
      website: "#",
      registration: "#",
      payment: "#",
    },
    {
      title: "Computer Vision, Graphics and Image Processing",
      category: "Conference",
      id: "IITM/Conf/ABV-AN/259",
      start: "2025-12-17",
      end: "2025-12-20",
      coordinator: "Dr. Arnav Bhavsar Vinayak and Dr. Adity Nigam, SCEE",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/07-177",
    },
    {
      title: "Indigeneity in the Global South",
      category: "Conference",
      id: "IITM/Conf/SSD/263",
      start: "2025-09-10",
      end: "2025-09-12",
      coordinator: "Dr. Shyamsree Dasgupta, SHSS",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/05-171",
    },
    {
      title: "XIII Biennial Conference of INSEE on Ecological Restoration for a Resilient Society: Economics, Policies and Institutions",
      category: "Conference",
      id: "IITM/Conf/SSD/258",
      start: "2026-01-10",
      end: "2026-01-14",
      coordinator: "Dr. Shyamsree Dasgupta, SHSS",
      insiteLink: "https://insite.iitmandi.ac.in/circulars/show.php?ID=IITM/CCE/2025/05-165",
    }
  ];

  const eventList = document.getElementById("eventList");
  const monthTitle = document.getElementById("monthTitle");
  const eventCount = document.getElementById("eventCount");
  const navButtons = document.querySelectorAll(".nav-btn");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");

  const monthOrder = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];
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
  const today = new Date("2025-08-01");
  let filtered = events.filter(e => new Date(e.end) >= today);

  if (filterMonth !== "all") {
    filtered = filtered.filter(e => e.start.startsWith(filterMonth));
  }

  filtered.sort((a, b) => {
    const sa = new Date(a.start), sb = new Date(b.start);
    if (sa - sb !== 0) return sa - sb;
    const ea = new Date(a.end), eb = new Date(b.end);
    return Math.abs(ea - today) - Math.abs(eb - today);
  });

  eventCount.textContent = `[${filtered.length}]`;
  eventList.innerHTML = "";

  // ✅ SHOW NO EVENTS MESSAGE
  if (filtered.length === 0) {
    eventList.innerHTML = '<p style="font-size: 1.1rem; color: #888; padding: 10px;">No Events/Activities this month yet.</p>';
    return;
  }

  filtered.forEach(e => {
    const card = document.createElement("div");
    card.className = "event-card";

    let html = `
      <div class="event-title-row">
        <div class="event-title">${e.title}</div>
        ${e.category ? `<span class="tag">${e.category}</span>` : ""}
      </div>
      <div class="event-info-row">
        <div class="event-meta">🆔 ${e.id}</div>`;

    if (e.start && e.end) {
      html += `<div class="event-meta">📅 ${formatDate(e.start)} to ${formatDate(e.end)}</div>`;
    }

    if (e.location) {
      html += `<div class="event-meta">📍 ${e.location}</div>`;
    }

    if (e.coordinator) {
      html += `<div class="event-meta">👤 Coordinator(s): ${e.coordinator}</div>`;
    }

    if (e.lastDate) {
      html += `<div class="event-meta last-date">Last Date: ${e.lastDate}</div>`;
    }

    if (e.insiteLink) {
      html += `<div class="event-meta">🔗 <a href="${e.insiteLink}" target="_blank">Insite OM Link</a></div>`;
    }

    html += `</div>`; // close event-info-row

    const hasFooterLinks = e.website || e.registration || e.payment;

    if (hasFooterLinks) {
      html += `<div class="event-footer">`;

      if (e.website) {
        html += `<a href="${e.website}" target="_blank">Website</a>`;
      }

      if (e.registration) {
        html += `<a href="${e.registration}" target="_blank">Registration Link</a>`;
      }

      if (e.payment) {
        html += `<a href="${e.payment}" target="_blank">Payment link</a>`;
      }

      html += `</div>`;
    }

    card.innerHTML = html;
    eventList.appendChild(card);
  });

  monthTitle.textContent =
    filterMonth === "all"
      ? "All Upcoming Events/Activities"
      : new Date(filterMonth + "-01").toLocaleString("default", {
          month: "long",
          year: "numeric"
        });
}


  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const m = btn.getAttribute("data-month");
      renderEvents(m);
      currentIndex = monthOrder.indexOf(m);
      if (window.innerWidth <= 768) sidebar.classList.remove("active");
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      const m = monthOrder[currentIndex];
      document.querySelector(`[data-month="${m}"]`).click();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < monthOrder.length - 1) {
      currentIndex++;
      const m = monthOrder[currentIndex];
      document.querySelector(`[data-month="${m}"]`).click();
    }
  });

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  renderEvents();
});