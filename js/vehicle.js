/* ============================================
   PRATAP TRAVELS - Vehicle Management JavaScript
   ============================================ */

// ---------- Vehicle Page Init ----------
document.addEventListener("DOMContentLoaded", function () {
  var vehicleForm = document.getElementById("vehicleForm");
  if (vehicleForm) vehicleForm.addEventListener("submit", saveVehicleForm);
  var quickVehicleForm = document.getElementById("quickVehicleForm");
  if (quickVehicleForm) quickVehicleForm.addEventListener("submit", saveQuickVehicle);
  var vehicleModalClose = document.getElementById("vehicleModalClose");
  if (vehicleModalClose) vehicleModalClose.addEventListener("click", closeVehicleModal);
  var quickVehicleModalClose = document.getElementById("quickVehicleModalClose");
  if (quickVehicleModalClose) quickVehicleModalClose.addEventListener("click", closeQuickVehicleModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeVehicleModal(); closeQuickVehicleModal(); }
  });
});



function renderVehicleTable() {
  var tbody = document.getElementById("vehicleTableBody");
  var emptyState = document.getElementById("emptyVehicleState");
  if (!tbody) return;

  var vehicles = getVehicles();
  var searchInput = document.getElementById("vehicleSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  var statusFilter = document.getElementById("vehicleStatusFilter");
  var statusVal = statusFilter ? statusFilter.value : "all";

  tbody.innerHTML = "";
  var filtered = vehicles;
  if (query) {
    filtered = filtered.filter(function (v) {
      var haystack = [
        v.vehicleNumber,
        v.driverName,
        v.vehicleType,
        v.driverPhone,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }
  if (statusVal && statusVal !== "all") {
    filtered = filtered.filter(function (v) {
      return v.status === statusVal;
    });
  }

  var countEl = document.getElementById("vehicleCount");
  if (countEl) countEl.textContent = filtered.length + " vehicles";

  if (filtered.length === 0) {
    if (emptyState) {
      var emptyMsg = emptyState.querySelector("p");
      if (vehicles.length === 0) {
        emptyMsg.textContent =
          "No vehicles yet. Add vehicles to start assigning them to bookings.";
      } else {
        emptyMsg.textContent = "No results found.";
      }
      emptyState.classList.remove("hidden");
    }
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (v) {
    var tr = document.createElement("tr");
    var statusClass =
      v.status === "available"
        ? "vehicle-available"
        : v.status === "booked"
          ? "vehicle-booked"
          : "vehicle-maintenance";
    var statusText =
      v.status === "available"
        ? "Available"
        : v.status === "booked"
          ? "Booked"
          : "Maintenance";
    tr.innerHTML =
      '<td><code class="vid-code">' +
      escapeHtml(v.vehicleNumber || "-") +
      "</code></td>" +
      "<td>" +
      escapeHtml(v.vehicleType || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(v.driverName || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(v.driverPhone || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(v.seats || "-") +
      "</td>" +
      '<td><span class="vehicle-status-badge ' +
      statusClass +
      '">' +
      statusText +
      "</span></td>" +
      "<td><small>" +
      formatDate(v.createdAt) +
      "</small></td>" +
      "<td>" +
      '<button class="btn-action-edit" onclick="editVehicle(\'' +
      v.id +
      '\')" title="Edit"><i data-lucide="pencil" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
      '<button class="btn-action-confirm" onclick="renderVehicleSchedule(\'' +
      v.id +
      '\')" title="View Schedule"><i data-lucide="calendar" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
      '<button class="btn-action-delete" onclick="deleteVehicleConfirm(\'' +
      v.id +
      '\')" title="Delete">🗑️</button>' +
      "</td>";
    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}



function updateVehicleKPIs() {
  var vehicles = getVehicles();
  var total = vehicles.length;
  var available = 0,
    booked = 0,
    maintenance = 0;
  for (var i = 0; i < vehicles.length; i++) {
    if (vehicles[i].status === "available") available++;
    else if (vehicles[i].status === "booked") booked++;
    else maintenance++;
  }
  var elTotal = document.getElementById("vhKpiTotal");
  var elAvailable = document.getElementById("vhKpiAvailable");
  var elBooked = document.getElementById("vhKpiBooked");
  var elMaintenance = document.getElementById("vhKpiMaintenance");
  if (elTotal) elTotal.textContent = total;
  if (elAvailable) elAvailable.textContent = available;
  if (elBooked) elBooked.textContent = booked;
  if (elMaintenance) elMaintenance.textContent = maintenance;
}



function openAddVehicleModal() {
  var modal = document.getElementById("vehicleModal");
  var title = document.getElementById("vehicleModalTitle");
  var form = document.getElementById("vehicleForm");
  var idField = document.getElementById("vehicleEditId");
  if (!modal || !form) return;
  if (title) title.textContent = "➕ Add Vehicle";
  form.reset();
  if (idField) idField.value = "";
  var statusField = document.getElementById("vehicleStatus");
  if (statusField) statusField.value = "available";
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}



function editVehicle(id) {
  var vehicle = getVehicleById(id);
  if (!vehicle) return;
  var modal = document.getElementById("vehicleModal");
  var title = document.getElementById("vehicleModalTitle");
  var form = document.getElementById("vehicleForm");
  var idField = document.getElementById("vehicleEditId");
  if (!modal || !form) return;
  if (title) title.textContent = "✏️ Edit Vehicle";
  if (idField) idField.value = id;
  document.getElementById("vehicleNumber").value = vehicle.vehicleNumber || "";
  document.getElementById("vehicleType").value = vehicle.vehicleType || "";
  document.getElementById("vehicleSeats").value = vehicle.seats || "4";
  document.getElementById("vehicleDriverName").value = vehicle.driverName || "";
  document.getElementById("vehicleDriverPhone").value =
    vehicle.driverPhone || "";
  document.getElementById("vehicleNotes").value = vehicle.notes || "";
  var statusField = document.getElementById("vehicleStatus");
  if (statusField) statusField.value = vehicle.status || "available";
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}



function saveVehicleForm(e) {
  if (e) e.preventDefault();
  var editId = document.getElementById("vehicleEditId").value;
  var vehicleNumber = document.getElementById("vehicleNumber").value.trim();
  var vehicleType = document.getElementById("vehicleType").value.trim();
  var seats = document.getElementById("vehicleSeats").value;
  var driverName = document.getElementById("vehicleDriverName").value.trim();
  var driverPhone = document.getElementById("vehicleDriverPhone").value.trim();
  var notes = document.getElementById("vehicleNotes").value.trim();
  var status = document.getElementById("vehicleStatus").value;

  if (!vehicleNumber || !driverName) {
    showToast("Vehicle number and driver name are required.", "error");
    return;
  }

  var data = {
    vehicleNumber: vehicleNumber,
    vehicleType: vehicleType,
    seats: seats,
    driverName: driverName,
    driverPhone: driverPhone,
    notes: notes,
    status: status,
  };

  if (editId) {
    updateVehicle(editId, data);
    showToast("Vehicle updated successfully.", "success");
  } else {
    addVehicle(data);
    showToast("Vehicle added successfully.", "success");
  }

  closeVehicleModal();
  renderVehicleTable();
  updateVehicleKPIs();
  updateVehicleDropdowns();
}



function deleteVehicleConfirm(id) {
  if (
    confirm(
      "Are you sure you want to delete this vehicle? This cannot be undone.",
    )
  ) {
    deleteVehicle(id);
    renderVehicleTable();
    updateVehicleKPIs();
    updateVehicleDropdowns();
    showToast("Vehicle deleted.", "info");
  }
}



function closeVehicleModal() {
  var modal = document.getElementById("vehicleModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}



function exportVehiclesCSV() {
  var vehicles = getVehicles();
  if (vehicles.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var headers = [
    "Vehicle Number",
    "Type",
    "Seats",
    "Driver Name",
    "Driver Phone",
    "Status",
    "Notes",
    "Created",
  ];
  var rows = vehicles.map(function (v) {
    return [
      v.vehicleNumber,
      v.vehicleType,
      v.seats,
      v.driverName,
      v.driverPhone,
      v.status,
      v.notes,
      v.createdAt,
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
  downloadFile(csv, "pratap-travels-vehicles.csv", "text/csv");
  showToast("CSV exported.", "success");
}

// ---------- Vehicle dropdown for booking confirmation ----------


// ---------- Vehicle dropdown for booking confirmation ----------
function updateVehicleDropdowns(filterDate, filterTime) {
  var selects = document.querySelectorAll(".vehicle-select-dropdown");
  var available = getAvailableVehicles(filterDate || null, filterTime || null);
  // Also include the currently assigned vehicle (if any) so it appears in dropdown
  var allVehicles = getVehicles();
  selects.forEach(function (sel) {
    var currentVal = sel.value;
    // Check if there is a currently assigned vehicle that should be included
    var bookingIdVal = document.getElementById("confirmBookingId")
      ? document.getElementById("confirmBookingId").value
      : null;
    var currentVehicleId = null;
    if (bookingIdVal) {
      var bookings = getBookings();
      for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].bookingId === bookingIdVal && bookings[i].vehicleId) {
          currentVehicleId = bookings[i].vehicleId;
          break;
        }
      }
    }
    sel.innerHTML = '<option value="">-- Select Vehicle --</option>';
    available.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent =
        v.vehicleNumber + " (" + v.vehicleType + ") - " + v.driverName;
      sel.appendChild(opt);
    });
    // Add currently assigned vehicle if not already in available list
    if (currentVehicleId) {
      var alreadyInList = false;
      for (var i = 0; i < available.length; i++) {
        if (available[i].id === currentVehicleId) {
          alreadyInList = true;
          break;
        }
      }
      if (!alreadyInList) {
        for (var i = 0; i < allVehicles.length; i++) {
          if (allVehicles[i].id === currentVehicleId) {
            var v = allVehicles[i];
            var opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent =
              v.vehicleNumber +
              " (" +
              v.vehicleType +
              ") - " +
              v.driverName +
              " [Currently Assigned]";
            sel.appendChild(opt);
            break;
          }
        }
      }
    }
    // Add 'Add New' option
    var addOpt = document.createElement("option");
    addOpt.value = "__new__";
    addOpt.textContent = "+ Add New Vehicle";
    sel.appendChild(addOpt);
    if (currentVal) sel.value = currentVal;
  });
}

// Handle 'Add New Vehicle' selection from dropdown


// Handle 'Add New Vehicle' selection from dropdown
function handleVehicleSelectChange(sel) {
  if (sel.value === "__new__") {
    sel.value = "";
    // Open quick-add modal
    var quickModal = document.getElementById("quickVehicleModal");
    if (quickModal) {
      quickModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }
}



function saveQuickVehicle(e) {
  if (e) e.preventDefault();
  var vehicleNumber = document
    .getElementById("quickVehicleNumber")
    .value.trim();
  var driverName = document
    .getElementById("quickVehicleDriverName")
    .value.trim();
  var vehicleType = document.getElementById("quickVehicleType").value.trim();
  var driverPhone = document
    .getElementById("quickVehicleDriverPhone")
    .value.trim();

  if (!vehicleNumber || !driverName) {
    showToast("Vehicle number and driver name are required.", "error");
    return;
  }

  var vehicle = addVehicle({
    vehicleNumber: vehicleNumber,
    driverName: driverName,
    vehicleType: vehicleType || "Sedan",
    driverPhone: driverPhone,
    seats: "4",
    status: "available",
    notes: "Added from booking confirmation",
  });

  closeQuickVehicleModal();
  updateVehicleDropdowns();
  // Auto-select the new vehicle
  var selects = document.querySelectorAll(".vehicle-select-dropdown");
  selects.forEach(function (sel) {
    sel.value = vehicle.id;
  });
  showToast("Vehicle added and selected.", "success");
}



function closeQuickVehicleModal() {
  var modal = document.getElementById("quickVehicleModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

// ---------- Fetch Vehicles from PratapTravels-Data API ----------
