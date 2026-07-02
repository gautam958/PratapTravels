/**
 * PRATAP TRAVELS - Driver Diary JavaScript
 */

document.addEventListener("DOMContentLoaded", function () {
  var diaryForm = document.getElementById("driverDiaryForm");
  if (diaryForm) diaryForm.addEventListener("submit", saveDriverDiaryEntry);
  var diaryModalClose = document.getElementById("driverDiaryModalClose");
  if (diaryModalClose) diaryModalClose.addEventListener("click", closeDriverDiaryModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDriverDiaryModal();
  });
  if (document.getElementById("driverDiaryTableBody")) {
    withAdminPageLoader(function () {
      return Promise.all([fetchVehiclesFromApi(), fetchDriverDiaryFromApi()]).then(function () {
        renderDriverDiaryTable();
        updateDriverDiaryKPIs();
        renderDriverDiarySummary();
      });
    });
  }
});

/* ============================================
   PRATAP TRAVELS - Driver Diary JavaScript
   ============================================ */


// ---------- Fetch Driver Diary from PratapTravels-Data API ----------
async function fetchDriverDiaryFromApi() {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) {
    console.warn("[DriverDiary] No DATA_API_URL configured in config.js");
    return null;
  }
  try {
    var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
    var fetchUrl = apiUrl + separator + "type=driver_diary";
    var resp = await fetch(fetchUrl, { method: "GET", mode: "cors" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    var result = await resp.json();
    var entries = Array.isArray(result) ? result : result.entries || [];
    _driverDiaryCache = entries;
    return entries;
  } catch (e) {
    console.warn("[DriverDiary] API GET failed:", e.message);
  }
  return null;
}

// ---------- Save Driver Diary Entry to API ----------


// ---------- Save Driver Diary Entry to API ----------
async function saveDriverDiaryToApi(entry) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return null;
  try {
    var resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "driver_diary_data", data: entry }),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  } catch (e) {
    console.warn("[DriverDiary] API POST failed:", e.message);
    return null;
  }
}

// ---------- Update Driver Diary Entry on API ----------


// ---------- Update Driver Diary Entry on API ----------
async function updateDriverDiaryOnApi(id, data) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return null;
  try {
    var resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "driver_diary_update", id: id, data: data }),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  } catch (e) {
    console.warn("[DriverDiary] API UPDATE failed:", e.message);
    return null;
  }
}

// ---------- Delete Driver Diary Entry from API ----------


// ---------- Delete Driver Diary Entry from API ----------
async function deleteDriverDiaryFromApi(id) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return null;
  try {
    var resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "driver_diary_delete", id: id }),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  } catch (e) {
    console.warn("[DriverDiary] API DELETE failed:", e.message);
    return null;
  }
}

// ---------- Get cached driver diary entries ----------


// ---------- Get cached driver diary entries ----------
function getDriverDiaryEntries() {
  return _driverDiaryCache;
}

// ---------- Open Driver Diary Modal ----------


// ---------- Open Driver Diary Modal ----------
function openDriverDiaryModal(editEntry) {
  var modal = document.getElementById("driverDiaryModal");
  var title = document.getElementById("driverDiaryModalTitle");
  var form = document.getElementById("driverDiaryForm");
  var idField = document.getElementById("driverDiaryEditId");
  if (!modal || !form) return;
  form.reset();
  if (idField) idField.value = "";
  var now = new Date();
  var localISO = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + "T" +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");
  document.getElementById("ddDateTime").value = localISO;
  populateDriverDiaryVehicleDropdown();
  if (editEntry) {
    if (title) title.textContent = "✏️ एंट्री संपादित करें";
    if (idField) idField.value = editEntry.id || "";
    document.getElementById("ddVehicleSelect").value = editEntry.vehicleId || "";
    document.getElementById("ddDriverName").value = editEntry.driverName || "";
    document.getElementById("ddStartPoint").value = editEntry.startPoint || "";
    document.getElementById("ddEndPoint").value = editEntry.endPoint || "";
    document.getElementById("ddTotalKM").value = editEntry.totalKM || "";
    document.getElementById("ddDriverPhone").value = editEntry.driverPhone || "";
    document.getElementById("ddNotes").value = editEntry.notes || "";
    if (editEntry.date) {
      var d = new Date(editEntry.date);
      if (!isNaN(d.getTime())) {
        var local = d.getFullYear() + "-" +
          String(d.getMonth() + 1).padStart(2, "0") + "-" +
          String(d.getDate()).padStart(2, "0") + "T" +
          String(d.getHours()).padStart(2, "0") + ":" +
          String(d.getMinutes()).padStart(2, "0");
        document.getElementById("ddDateTime").value = local;
      }
    }
  } else {
    if (title) title.textContent = "➕ ड्राइवर डायरी एंट्री जोड़ें";
  }
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// ---------- Populate Vehicle Dropdown for Driver Diary ----------


// ---------- Populate Vehicle Dropdown for Driver Diary ----------
function populateDriverDiaryVehicleDropdown() {
  var sel = document.getElementById("ddVehicleSelect");
  if (!sel) return;
  var vehicles = getVehicles();
  var currentVal = sel.value;
  sel.innerHTML = '<option value="">-- वाहन चुनें --</option>';
  vehicles.forEach(function (v) {
    var opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.vehicleNumber + " (" + (v.vehicleType || "-") + ") - " + v.driverName;
    sel.appendChild(opt);
  });
  if (currentVal) sel.value = currentVal;
}

// ---------- On Vehicle Change in Driver Diary ----------


// ---------- On Vehicle Change in Driver Diary ----------
function onDriverDiaryVehicleChange() {
  var sel = document.getElementById("ddVehicleSelect");
  var driverNameInput = document.getElementById("ddDriverName");
  var driverPhoneInput = document.getElementById("ddDriverPhone");
  if (!sel || !driverNameInput) return;
  if (sel.value) {
    var vehicle = getVehicleById(sel.value);
    if (vehicle) {
      driverNameInput.value = vehicle.driverName || "";
      if (driverPhoneInput) driverPhoneInput.value = vehicle.driverPhone || "";
    }
  }
}

// ---------- Close Driver Diary Modal ----------


// ---------- Close Driver Diary Modal ----------
function closeDriverDiaryModal() {
  var modal = document.getElementById("driverDiaryModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

// ---------- Save Driver Diary Entry ----------


// ---------- Save Driver Diary Entry ----------
async function saveDriverDiaryEntry(e) {
  if (e) e.preventDefault();
  var editId = document.getElementById("driverDiaryEditId").value;
  var vehicleId = document.getElementById("ddVehicleSelect").value;
  var driverName = document.getElementById("ddDriverName").value.trim();
  var startPoint = document.getElementById("ddStartPoint").value.trim();
  var endPoint = document.getElementById("ddEndPoint").value.trim();
  var totalKM = document.getElementById("ddTotalKM").value;
  var driverPhone = document.getElementById("ddDriverPhone").value.trim();
  var dateTime = document.getElementById("ddDateTime").value;
  var notes = document.getElementById("ddNotes").value.trim();
  if (!vehicleId || !driverName || !startPoint || !endPoint || !totalKM || !dateTime) {
    showToast("कृपया सभी आवश्यक फ़ील्ड भरें।", "error");
    return;
  }
  var vehicle = getVehicleById(vehicleId);
  var entry = {
    vehicleId: vehicleId,
    vehicleNumber: vehicle ? vehicle.vehicleNumber : "-",
    driverName: driverName,
    startPoint: startPoint,
    endPoint: endPoint,
    totalKM: parseFloat(totalKM),
    driverPhone: driverPhone || "",
    date: new Date(dateTime).toISOString(),
    notes: notes || "",
  };
  if (editId) {
    var result = await updateDriverDiaryOnApi(editId, entry);
    if (result) {
      showToast(I18N.t("dd.toast.updated"), "success");
    } else {
      showToast("अपडेट विफल (API offline)।", "info");
    }
  } else {
    var result = await saveDriverDiaryToApi(entry);
    if (result) {
      showToast(I18N.t("dd.toast.saved"), "success");
    } else {
      showToast("सेव विफल (API offline)।", "info");
    }
  }
  closeDriverDiaryModal();
  await refreshDriverDiary();
}

// ---------- Delete Driver Diary Entry ----------


// ---------- Delete Driver Diary Entry ----------
async function deleteDriverDiaryEntry(id) {
  if (!confirm(I18N.t("dd.toast.confirmDelete"))) return;
  var result = await deleteDriverDiaryFromApi(id);
  if (result) {
    showToast(I18N.t("dd.toast.deleted"), "success");
  } else {
    showToast("हटाना विफल (API offline)।", "info");
  }
  await refreshDriverDiary();
}

// ---------- Refresh Driver Diary ----------


// ---------- Refresh Driver Diary ----------
async function refreshDriverDiary() {
  var apiEntries = await fetchDriverDiaryFromApi();
  if (apiEntries) {
    showToast(I18N.t("dd.toast.refreshed"), "success");
  } else {
    showToast("API उपलब्ध नहीं है।", "info");
  }
  renderDriverDiaryTable();
  updateDriverDiaryKPIs();
  renderDriverDiarySummary();
}

// ---------- Update Driver Diary KPIs ----------


// ---------- Update Driver Diary KPIs ----------
function updateDriverDiaryKPIs() {
  var entries = getDriverDiaryEntries();
  var total = entries.length;
  var vehicles = {};
  var totalKM = 0;
  var todayCount = 0;
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayMs = todayStart.getTime();
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.vehicleId) vehicles[e.vehicleId] = true;
    totalKM += parseFloat(e.totalKM) || 0;
    if (new Date(e.date).getTime() >= todayMs) todayCount++;
  }
  var elTotal = document.getElementById("ddKpiTotal");
  var elVehicles = document.getElementById("ddKpiVehicles");
  var elTotalKM = document.getElementById("ddKpiTotalKM");
  var elToday = document.getElementById("ddKpiToday");
  if (elTotal) elTotal.textContent = total;
  if (elVehicles) elVehicles.textContent = Object.keys(vehicles).length;
  if (elTotalKM) elTotalKM.textContent = Math.round(totalKM);
  if (elToday) elToday.textContent = todayCount;
}

// ---------- Render KM Summary (grouped by vehicle + driver) ----------


// ---------- Render KM Summary (grouped by vehicle + driver) ----------
function renderDriverDiarySummary() {
  var tbody = document.getElementById("driverDiarySummaryBody");
  var emptyState = document.getElementById("emptyDriverDiarySummary");
  if (!tbody) return;

  var entries = getDriverDiaryEntries();
  tbody.innerHTML = "";

  if (entries.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  // Group by vehicleId + driverName
  var summary = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var key = (e.vehicleId || "unknown") + "|" + (e.driverName || "unknown");
    if (!summary[key]) {
      summary[key] = {
        vehicleNumber: e.vehicleNumber || "-",
        driverName: e.driverName || "-",
        trips: 0,
        totalKM: 0,
      };
    }
    summary[key].trips++;
    summary[key].totalKM += parseFloat(e.totalKM) || 0;
  }

  var rows = Object.values(summary).sort(function (a, b) {
    return b.totalKM - a.totalKM;
  });

  rows.forEach(function (row) {
    var tr = document.createElement("tr");
    var avgKM = row.trips > 0 ? Math.round(row.totalKM / row.trips) : 0;
    tr.innerHTML =
      '<td><code class="vid-code">' + escapeHtml(row.vehicleNumber) + "</code></td>" +
      "<td>" + escapeHtml(row.driverName) + "</td>" +
      "<td><b>" + row.trips + "</b></td>" +
      "<td><b>" + Math.round(row.totalKM) + " km</b></td>" +
      "<td>" + avgKM + " km</td>";
    tbody.appendChild(tr);
  });
}

// ---------- Render Driver Diary Table ----------


// ---------- Render Driver Diary Table ----------
function renderDriverDiaryTable() {
  var tbody = document.getElementById("driverDiaryTableBody");
  var emptyState = document.getElementById("emptyDriverDiaryState");
  if (!tbody) return;
  var entries = getDriverDiaryEntries();
  var searchInput = document.getElementById("driverDiarySearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  var vehicleFilter = document.getElementById("driverDiaryVehicleFilter");
  var vehicleVal = vehicleFilter ? vehicleFilter.value : "all";
  var driverFilter = document.getElementById("driverDiaryDriverFilter");
  var driverVal = driverFilter ? driverFilter.value : "all";
  var dateFrom = document.getElementById("driverDiaryDateFrom");
  var dateFromVal = dateFrom ? dateFrom.value : "";
  var dateTo = document.getElementById("driverDiaryDateTo");
  var dateToVal = dateTo ? dateTo.value : "";
  tbody.innerHTML = "";
  var filtered = entries;
  if (query) {
    filtered = filtered.filter(function (e) {
      var haystack = [e.driverName, e.vehicleNumber, e.startPoint, e.endPoint, e.notes].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }
  if (vehicleVal && vehicleVal !== "all") {
    filtered = filtered.filter(function (e) { return e.vehicleId === vehicleVal; });
  }
  if (driverVal && driverVal !== "all") {
    filtered = filtered.filter(function (e) { return e.driverName === driverVal; });
  }
  if (dateFromVal) {
    var fromMs = new Date(dateFromVal).getTime();
    filtered = filtered.filter(function (e) { return new Date(e.date).getTime() >= fromMs; });
  }
  if (dateToVal) {
    var toMs = new Date(dateToVal).getTime() + 86400000;
    filtered = filtered.filter(function (e) { return new Date(e.date).getTime() < toMs; });
  }
  var countEl = document.getElementById("driverDiaryCount");
  if (countEl) countEl.textContent = filtered.length + " entries";
  populateDriverDiaryVehicleFilter();
  populateDriverDiaryDriverFilter();
  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");
  filtered.forEach(function (e) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><small>" + formatDate(e.date) + "</small></td>" +
      '<td><code class="vid-code">' + escapeHtml(e.vehicleNumber || "-") + "</code></td>" +
      "<td>" + escapeHtml(e.startPoint || "-") + "</td>" +
      "<td>" + escapeHtml(e.endPoint || "-") + "</td>" +
      "<td><b>" + escapeHtml(String(e.totalKM || "-")) + " km</b></td>" +
      "<td>" + escapeHtml(e.driverName || "-") + "</td>" +
      "<td>" + escapeHtml(e.driverPhone || "-") + "</td>" +
      "<td><small>" + formatDate(e.savedAt || e.date) + "</small></td>" +
      '<td>' +
      '<button class="btn-action-edit" onclick="editDriverDiaryEntry(\'' + (e.id || "") + '\')" title="Edit">✏️</button> ' +
      '<button class="btn-action-delete" onclick="deleteDriverDiaryEntry(\'' + (e.id || "") + '\')" title="Delete">🗑️</button>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

// ---------- Edit Driver Diary Entry ----------


// ---------- Edit Driver Diary Entry ----------
function editDriverDiaryEntry(id) {
  var entries = getDriverDiaryEntries();
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].id === id) {
      openDriverDiaryModal(entries[i]);
      return;
    }
  }
  showToast(I18N.t("dd.toast.notFound"), "error");
}

// ---------- Populate Vehicle Filter Dropdown ----------


// ---------- Populate Vehicle Filter Dropdown ----------
function populateDriverDiaryVehicleFilter() {
  var sel = document.getElementById("driverDiaryVehicleFilter");
  if (!sel) return;
  var vehicles = getVehicles();
  var currentVal = sel.value;
  sel.innerHTML = '<option value="all">सभी वाहन</option>';
  vehicles.forEach(function (v) {
    var opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.vehicleNumber + " - " + v.driverName;
    sel.appendChild(opt);
  });
  if (currentVal) sel.value = currentVal;
}

// ---------- Populate Driver Name Filter Dropdown ----------


// ---------- Populate Driver Name Filter Dropdown ----------
function populateDriverDiaryDriverFilter() {
  var sel = document.getElementById("driverDiaryDriverFilter");
  if (!sel) return;
  var entries = getDriverDiaryEntries();
  var drivers = {};
  entries.forEach(function (e) { if (e.driverName) drivers[e.driverName] = true; });
  var currentVal = sel.value;
  sel.innerHTML = '<option value="all">सभी ड्राइवर</option>';
  Object.keys(drivers).sort().forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  if (currentVal) sel.value = currentVal;
}

// ---------- Export Driver Diary as CSV ----------


// ---------- Export Driver Diary as CSV ----------
function exportDriverDiaryCSV() {
  var entries = getDriverDiaryEntries();
  if (entries.length === 0) {
    showToast(I18N.t("dd.toast.noData"), "error");
    return;
  }
  var headers = ["Date", "Vehicle Number", "Start Point", "End Point", "Total KM", "Driver Name", "Driver Phone", "Notes", "Created"];
  var rows = entries.map(function (e) {
    return [e.date, e.vehicleNumber, e.startPoint, e.endPoint, e.totalKM, e.driverName, e.driverPhone, e.notes, e.savedAt || e.date];
  });
  var csv = headers.join(",") + "\n" + rows.map(function (row) {
    return row.map(function (c) {
      return '"' + String(c || "").replace(/"/g, '""') + '"';
    }).join(",");
  }).join("\n");
  downloadFile(csv, "pratap-travels-driver-diary.csv", "text/csv");
  showToast("CSV exported.", "success");
}
