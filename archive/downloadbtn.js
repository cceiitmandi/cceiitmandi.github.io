document.getElementById("downloadCsv").addEventListener("click", () => {
  const events = window.currentFilteredEvents || [];

  if (events.length === 0) {
    alert("No events to export.");
    return;
  }

  // Build headers
  const baseHeaders = ["SNo", "Title", "Year", "Start Date", "End Date", "ID", "Coordinator", "Insite Link"];
  const maxLinks = Math.max(...events.map(e => (e.links || []).length));
  const linkHeaders = Array.from({ length: maxLinks }, (_, i) => `Link ${i + 1}`);
  const headers = [...baseHeaders, ...linkHeaders];

  // Build rows
  const rows = events.map((event, index) => {
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
    while (linkValues.length < maxLinks) linkValues.push(""); // pad missing links

    return [...baseRow, ...linkValues];
  });

  // Combine all into CSV string
  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // Create blob and trigger download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "CCE_Archive.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
