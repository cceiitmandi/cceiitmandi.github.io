document.getElementById("downloadCsv").addEventListener("click", () => {
  const events = window.currentFilteredEvents || [];

  if (events.length === 0) {
    alert("No events to export.");
    return;
  }

  // Prepare data rows
  const headers = ["SNo", "Title", "Year", "Start Date", "End Date", "ID", "Coordinator", "Insite Link"];
  const rows = events.map((e, i) => {
    const base = [
      i + 1,
      e.title || "",
      e.start ? new Date(e.start).getFullYear() : "",
      e.start ? new Date(e.start).toLocaleDateString() : "",
      e.end ? new Date(e.end).toLocaleDateString() : "",
      e.id || "",
      e.coordinator || "",
      e.insitelink || ""
    ];

    const linkCols = (e.links || []).map(l => l.url || "");
    return [...base, ...linkCols];
  });

  // Determine max number of links to add as header
  const maxLinks = Math.max(...events.map(e => (e.links || []).length));
  for (let i = 1; i <= maxLinks; i++) {
    headers.push(`Link ${i}`);
  }

  // Normalize row lengths
  rows.forEach(row => {
    while (row.length < headers.length) row.push("");
  });

  const allRows = [headers, ...rows];

  // Convert to CSV format
  const csv = allRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  // Convert CSV to Excel MIME type
  const blob = new Blob(["\uFEFF" + csv], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = "CCE_Archive.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});