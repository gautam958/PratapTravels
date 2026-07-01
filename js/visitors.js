/**
 * PRATAP TRAVELS - Visitor Dashboard JavaScript
 */

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("visitorTableBody")) {
    fetchVisitorRecordsFromApi().then(function () { renderVisitorTable(); updateKPIs(); });
  }
});

/* ============================================
   PRATAP TRAVELS - Visitor Dashboard JavaScript
   ============================================ */


// ---------- Update KPI Cards ----------
function updateKPIs() {
  var records = getVisitorRecords();
  var now = Date.now();
  var thirtyMinAgo = now - 30 * 60 * 1000;
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayMs = todayStart.getTime();

  var totalVisitors = records.length;
  var newToday = 0;
  var returning = 0;
  var activeNow = 0;
  var countries = {};
  var pages = {};

  for (var i = 0; i < records.length; i++) {
    var r = records[i];

    // New today: firstSeen is today
    if (new Date(r.firstSeen).getTime() >= todayMs) newToday++;
    else returning++;

    // Active: lastSeen within 30 min
    if (new Date(r.lastSeen).getTime() >= thirtyMinAgo) activeNow++;

    // Countries
    if (r.country) countries[r.country] = true;

    // Pages
    if (r.pages) {
      for (var j = 0; j < r.pages.length; j++) {
        pages[r.pages[j]] = true;
      }
    }
  }

  var elTotal = document.getElementById("kpiTotal");
  var elNewToday = document.getElementById("kpiNewToday");
  var elReturning = document.getElementById("kpiReturning");
  var elActive = document.getElementById("kpiActive");
  var elCountries = document.getElementById("kpiCountries");
  var elPages = document.getElementById("kpiPages");

  if (elTotal) elTotal.textContent = totalVisitors;
  if (elNewToday) elNewToday.textContent = newToday;
  if (elReturning) elReturning.textContent = returning;
  if (elActive) elActive.textContent = activeNow;
  if (elCountries) elCountries.textContent = Object.keys(countries).length;
  if (elPages) elPages.textContent = Object.keys(pages).length;
}

// ---------- Render Visitor Table ----------


function renderVisitorTable() {
  var tbody = document.getElementById("visitorTableBody");
  var emptyState = document.getElementById("emptyVisitorState");
  if (!tbody) return;

  var records = getVisitorRecords();
  var searchInput = document.getElementById("visitorSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  tbody.innerHTML = "";

  var filtered = records;
  if (query) {
    filtered = records.filter(function (r) {
      var haystack = [
        r.ip,
        r.city,
        r.region,
        r.country,
        r.device,
        r.browser,
        r.os,
        (r.pages || []).join(" "),
        r.user,
        r.visitorId,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (r) {
    var tr = document.createElement("tr");

    var deviceInfo = r.device + " · " + r.browser + " · " + r.os;
    var pagesList = (r.pages || []).join(", ") || "-";
    var userLabel = r.user || '<span style="color:#999">anonymous</span>';

    tr.innerHTML =
      '<td><code class="vid-code" title="' +
      escapeHtml(r.visitorId) +
      '">' +
      escapeHtml(shortId(r.visitorId)) +
      "</code></td>" +
      "<td>" +
      escapeHtml(r.ip || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.country || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.region || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.city || "-") +
      "</td>" +
      "<td><small>" +
      escapeHtml(deviceInfo) +
      "</small></td>" +
      '<td><small title="' +
      escapeHtml(pagesList) +
      '">' +
      escapeHtml(
        pagesList.length > 40 ? pagesList.substring(0, 40) + "…" : pagesList,
      ) +
      "</small></td>" +
      "<td>" +
      (r.visitCount || 1) +
      "</td>" +
      "<td><small>" +
      formatDate(r.firstSeen) +
      "</small></td>" +
      "<td><small>" +
      formatDate(r.lastSeen) +
      "</small></td>" +
      "<td><small>" +
      formatDate(r.timestamp) +
      "</small></td>" +
      "<td>" +
      userLabel +
      "</td>";

    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}

// ---------- Export as CSV ----------


function exportCSV() {
  var records = getVisitorRecords();
  if (records.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var headers = [
    "Visitor ID",
    "IP",
    "Country",
    "State",
    "City",
    "Device",
    "Browser",
    "OS",
    "Pages",
    "Visits",
    "First Seen",
    "Last Seen",
    "Timestamp",
    "User",
  ];
  var rows = records.map(function (r) {
    return [
      r.visitorId || "",
      r.ip || "",
      r.country || "",
      r.region || "",
      r.city || "",
      r.device || "",
      r.browser || "",
      r.os || "",
      (r.pages || []).join(" | "),
      r.visitCount || 1,
      r.firstSeen || "",
      r.lastSeen || "",
      r.timestamp || "",
      r.user || "",
    ];
  });
  var csv =
    headers.join(",") +
    "\n" +
    rows
      .map(function (row) {
        return row
          .map(function (cell) {
            var s = String(cell).replace(/"/g, '""');
            return '"' + s + '"';
          })
          .join(",");
      })
      .join("\n");
  downloadFile(csv, "pratap-travels-visitors.csv", "text/csv");
  showToast("CSV exported successfully.", "success");
}

// ---------- Export as JSON ----------


function exportJSON() {
  var records = getVisitorRecords();
  if (records.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var json = JSON.stringify(records, null, 2);
  downloadFile(json, "pratap-travels-visitors.json", "application/json");
  showToast("JSON exported successfully.", "success");
}

// ---------- Download Helper ----------


// ---------- Refresh ----------
async function refreshVisitorData() {
  // Try fetching from Azure Function API first
  var apiRecords = await fetchVisitorRecordsFromApi();
  if (apiRecords) {
    showToast("Data refreshed from server.", "success");
  }
  renderVisitorTable();
  updateKPIs();
  if (!apiRecords) {
    showToast("Using cached data (API unavailable).", "info");
  }
}

// ---------- Clear Log ----------


function clearVisitorLog() {
  if (
    confirm(
      "Are you sure you want to clear all visitor records? This cannot be undone.",
    )
  ) {
    _visitorRecordsCache = [];
    renderVisitorTable();
    updateKPIs();
    showToast("Visitor log cleared.", "info");
  }
}
