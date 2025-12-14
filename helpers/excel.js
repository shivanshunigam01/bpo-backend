const XLSX = require("xlsx");

function parseLeadsFromFile(buffer, filename = "file") {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const normalized = rows.map((r) => {
    const obj = {};
    for (const [k, v] of Object.entries(r)) {
      obj[String(k).trim().toLowerCase()] = v;
    }
    return obj;
  });

  return normalized.map((r) => ({
    name: String(r.name || r.fullname || r.customer || "").trim(),
    phone: String(r.phone || r.mobile || r.number || "").replace(/\D/g, ""),
    city: String(r.city || "").trim(),
    place: String(r.place || r.location || "").trim(),
    status: String(r.status || "New").trim() || "New",
    notes: String(r.notes || r.remark || "").trim(),
  }));
}

function exportLeadsToCSV(leads) {
  const ws = XLSX.utils.json_to_sheet(leads);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  return XLSX.write(wb, { type: "buffer", bookType: "csv" });
}

function exportLeadsToXLSX(leads) {
  const ws = XLSX.utils.json_to_sheet(leads);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

module.exports = { parseLeadsFromFile, exportLeadsToCSV, exportLeadsToXLSX };
