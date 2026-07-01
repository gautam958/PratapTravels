/* ============================================
   PRATAP TRAVELS - Audit Trail Dashboard JavaScript
   ============================================ */

// ---------- Audit Trail Init ----------
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("auditTableBody")) {
    fetchAuditFromApi().then(function () { renderAuditTable(); updateAuditKPIs(); });
  }
});



function renderAuditTable() {
  var tbody = document.getElementById("auditTableBody");
  var emptyState = document.getElementById("emptyAuditState");
  if (!tbody) return;

  var records = getAuditTrail();
  var searchInput = document.getElementById("auditSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  var typeFilter = document.getElementById("auditTypeFilter");
  var typeVal = typeFilter ? typeFilter.value : "all";

  var dateFilter = document.getElementById("auditDateFilter");
  var dateVal = dateFilter ? dateFilter.value : "all";

  tbody.innerHTML = "";

  var filtered = records;
  if (query) {
    filtered = filtered.filter(function (r) {
      var haystack = [r.id, r.type, r.page, JSON.stringify(r.details)]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }
  if (typeVal && typeVal !== "all") {
    filtered = filtered.filter(function (r) {
      return r.type === typeVal;
    });
  }
  if (dateVal && dateVal !== "all") {
    var now = new Date();
    var todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    filtered = filtered.filter(function (r) {
      var rt = new Date(r.timestamp).getTime();
      if (dateVal === "today") return rt >= todayStart;
      if (dateVal === "week") return rt >= todayStart - 7 * 86400000;
      if (dateVal === "month") return rt >= todayStart - 30 * 86400000;
      return true;
    });
  }

  var countEl = document.getElementById("auditCount");
  if (countEl) countEl.textContent = filtered.length + " events";

  if (filtered.length === 0) {
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (r) {
    var tr = document.createElement("tr");
    var typeLabel = r.type.replace(/_/g, " ");
    var detailsStr = r.details ? JSON.stringify(r.details) : "-";
    if (detailsStr.length > 80)
      detailsStr = detailsStr.substring(0, 80) + "...";
    var typeClass = "audit-type-info";
    if (r.type.indexOf("booking") !== -1) typeClass = "audit-type-booking";
    else if (r.type.indexOf("referral") !== -1)
      typeClass = "audit-type-referral";
    else if (r.type.indexOf("visit") !== -1) typeClass = "audit-type-visit";
    else if (r.type.indexOf("click") !== -1) typeClass = "audit-type-click";

    tr.innerHTML =
      '<td><code class="vid-code">' +
      escapeHtml(r.id || "-") +
      "</code></td>" +
      '<td><span class="audit-type-badge ' +
      typeClass +
      '">' +
      escapeHtml(typeLabel) +
      "</span></td>" +
      '<td><small title="' +
      escapeHtml(detailsStr) +
      '">' +
      escapeHtml(detailsStr) +
      "</small></td>" +
      "<td>" +
      escapeHtml(r.page || "-") +
      "</td>" +
      "<td><small>" +
      formatDate(r.timestamp) +
      "</small></td>" +
      '<td><code class="vid-code">' +
      escapeHtml(shortId(r.visitorId)) +
      "</code></td>";
    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}



function updateAuditKPIs() {
  var records = getAuditTrail();
  var total = records.length;
  var bookings = 0,
    referrals = 0,
    visits = 0,
    clicks = 0;
  var todayCount = 0;
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayMs = todayStart.getTime();

  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    if (r.type.indexOf("booking") !== -1) bookings++;
    if (r.type.indexOf("referral") !== -1) referrals++;
    if (r.type.indexOf("visit") !== -1) visits++;
    if (r.type.indexOf("click") !== -1) clicks++;
    if (new Date(r.timestamp).getTime() >= todayMs) todayCount++;
  }
  var elTotal = document.getElementById("audKpiTotal");
  var elBookings = document.getElementById("audKpiBookings");
  var elReferrals = document.getElementById("audKpiReferrals");
  var elToday = document.getElementById("audKpiToday");
  if (elTotal) elTotal.textContent = total;
  if (elBookings) elBookings.textContent = bookings;
  if (elReferrals) elReferrals.textContent = referrals;
  if (elToday) elToday.textContent = todayCount;
}



function exportAuditCSV() {
  var records = getAuditTrail();
  if (records.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var headers = ["ID", "Type", "Details", "Page", "Timestamp", "Visitor ID"];
  var rows = records.map(function (r) {
    return [
      r.id,
      r.type,
      JSON.stringify(r.details),
      r.page,
      r.timestamp,
      r.visitorId,
    ];
  });
  var csv =
    headers.join(",") +
    "\n" +
    rows
      .map(function (row) {
        return row
          .map(function (c) {
            return '"' + String(c || "").replace(/"/g, '""') + '"';
          })
          .join(",");
      })
      .join("\n");
  downloadFile(csv, "pratap-travels-audit-trail.csv", "text/csv");
  showToast("CSV exported.", "success");
}

/* ============================================
   VEHICLE MASTER MANAGEMENT
   CRUD for vehicles with availability tracking
   ============================================ */

var PT_VEHICLES_KEY = "pt_vehicles";
