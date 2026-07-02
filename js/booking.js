/* ============================================
   PRATAP TRAVELS - Booking Dashboard JavaScript
   ============================================ */


// ---------- Booking Dashboard Init ----------
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("bookingTableBody")) {
    withAdminPageLoader(function () {
      return Promise.all([fetchBookingsFromApi(), fetchVehiclesFromApi()]).then(function () {
        renderBookingTable();
        updateBookingKPIs();
        if (typeof updateVehicleDropdowns === "function") updateVehicleDropdowns();
      });
    });
  }
  // Note: confirmBookingForm submit handler is in common.js to avoid duplicate listeners on booking.html
  var confirmModalClose = document.getElementById("confirmBookingModalClose");
  if (confirmModalClose) confirmModalClose.addEventListener("click", closeConfirmBookingModal);
  var emailModalClose = document.getElementById("emailConfirmModalClose");
  if (emailModalClose) emailModalClose.addEventListener("click", closeEmailConfirmModal);
  var emailConfirmSendBtn = document.getElementById("emailConfirmSendBtn");
  if (emailConfirmSendBtn) emailConfirmSendBtn.addEventListener("click", sendEmailConfirmation);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeConfirmBookingModal(); closeEmailConfirmModal(); }
  });
});

function renderBookingTable() {
  var tbody = document.getElementById("bookingTableBody");
  var emptyState = document.getElementById("emptyBookingState");
  if (!tbody) return;

  var bookings = getBookings();
  var searchInput = document.getElementById("bookingSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // Status filter
  var statusFilter = document.getElementById("bookingStatusFilter");
  var statusVal = statusFilter ? statusFilter.value : "all";

  // Date filter
  var dateFilter = document.getElementById("bookingDateFilter");
  var dateVal = dateFilter ? dateFilter.value : "all";

  tbody.innerHTML = "";

  var filtered = bookings;
  if (query) {
    filtered = filtered.filter(function (b) {
      var haystack = [
        b.bookingId,
        b.name,
        b.phone,
        b.email,
        b.route,
        b.referral_code,
        b.trip_type,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }
  if (statusVal && statusVal !== "all") {
    filtered = filtered.filter(function (b) {
      return b.status === statusVal;
    });
  }
  if (dateVal && dateVal !== "all") {
    var now = new Date();
    var todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    filtered = filtered.filter(function (b) {
      var bt = new Date(b.createdAt).getTime();
      if (dateVal === "today") return bt >= todayStart;
      if (dateVal === "week") return bt >= todayStart - 7 * 86400000;
      if (dateVal === "month") return bt >= todayStart - 30 * 86400000;
      return true;
    });
  }

  // Update count
  var countEl = document.getElementById("bookingCount");
  if (countEl) countEl.textContent = filtered.length + " bookings";

  if (filtered.length === 0) {
    if (emptyState) {
      var emptyMsg = emptyState.querySelector("p");
      if (bookings.length === 0) {
        emptyMsg.textContent =
          "No bookings yet. Bookings will appear here as users submit them.";
      } else {
        emptyMsg.textContent = "No results found.";
      }
      emptyState.classList.remove("hidden");
    }
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (b) {
    var tr = document.createElement("tr");
    var statusClass =
      b.status === "confirmed"
        ? "status-confirmed"
        : b.status === "completed"
          ? "status-completed"
          : b.status === "cancelled"
            ? "status-cancelled"
            : "status-pending";
    var vehicleInfo = "-";
    var driverInfo = "-";
    if (b.vehicleId) {
      var v = getVehicleById(b.vehicleId);
      if (v) {
        vehicleInfo =
          '<code class="vid-code">' + escapeHtml(v.vehicleNumber) + "</code>";
        driverInfo = escapeHtml(v.driverName);
      }
    }
    // Action buttons: enable/disable based on booking status
    // Pending:   Edit ✅ Delete ✅ Confirm ✅ Complete ❌
    // Confirmed: Edit ✅ Delete ✅ Confirm ❌ Complete ✅
    // Completed/Cancelled: all disabled
    var isPending = b.status === 'pending';
    var isConfirmed = b.status === 'confirmed';
    var isTerminal = b.status === 'completed' || b.status === 'cancelled';
    var actionBtn =
      '<button class="btn-action-edit" onclick="openConfirmBooking(\'' + b.bookingId + '\')" title="Edit Booking"' + (isTerminal ? ' disabled' : '') + '><i data-lucide="pencil" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
      '<button class="btn-action-delete" onclick="deleteBooking(\'' + b.bookingId + '\')" title="Delete Booking"' + (isTerminal ? ' disabled' : '') + '><i data-lucide="trash-2" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
      '<button class="btn-action-confirm" onclick="openConfirmBooking(\'' + b.bookingId + '\')" title="Confirm & Assign Vehicle"' + (!isPending ? ' disabled' : '') + '><i data-lucide="circle-check" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
      '<button class="btn-action-confirm" onclick="completeBooking(\'' + b.bookingId + '\')" title="Mark Trip Completed"' + (!isConfirmed ? ' disabled' : '') + '><i data-lucide="check-circle" style="width:16px;height:16px;vertical-align:middle"></i></button>';
    tr.innerHTML =
      '<td><code class="vid-code">' +
      escapeHtml(b.bookingId || "-") +
      "</code></td>" +
      "<td>" +
      escapeHtml(b.name || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.phone || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.route || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.date || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.time || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.trip_type || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(b.passengers || "-") +
      "</td>" +
      "<td>" +
      vehicleInfo +
      "</td>" +
      "<td>" +
      driverInfo +
      "</td>" +
      "<td>" +
      (b.referral_code
        ? '<code class="vid-code">' + escapeHtml(b.referral_code) + "</code>"
        : '<span style="color:#999">-</span>') +
      "</td>" +
      '<td><span class="booking-status-badge ' +
      statusClass +
      '">' +
      (b.status || "pending") +
      "</span></td>" +
      "<td>" +
      (function () {
        if (b.email_sent) {
          var ccInfo =
            b.email_sent_cc && b.email_sent_cc.length > 0
              ? " | CC: " + b.email_sent_cc.join(", ")
              : "";
          return (
            '<span class="notified-badge notified-sent" title="Sent to ' +
            (b.email_sent_to || b.email || "") +
            ccInfo +
            " | " +
            (b.notified_at || "") +
            '">&#9993; Sent ✓</span>'
          );
        } else if (b.notification_sent && b.notification_type === "whatsapp") {
          return (
            '<span class="notified-badge notified-sent" title="' +
            (b.notified_at || "") +
            '">WhatsApp ✓</span>'
          );
        } else if (b.needs_notification) {
          return (
            '<span class="notified-badge notified-flagged">' +
            (typeof I18N !== "undefined" && I18N.t ? I18N.t("booking.notified.needsAction") : "Needs Action") +
            '</span> <button class="btn-action-confirm" style="padding:3px 8px;font-size:0.75rem;" onclick="sendBookingNotification(\'' +
            b.bookingId +
            '\')" title="' +
            (typeof I18N !== "undefined" && I18N.t ? I18N.t("booking.action.sendEmail") : "Send Email") +
            '">\u2709\ufe0f</button>'
          );
        } else if (b.status === "confirmed") {
          return (
            '<button class="btn-action-confirm" style="padding:3px 8px;font-size:0.75rem;" onclick="sendBookingNotification(\'' +
            b.bookingId +
            '\')" title="' +
            (typeof I18N !== "undefined" && I18N.t ? I18N.t("booking.action.sendEmail") : "Send Email") +
            '">\u2709\ufe0f</button>'
          );
        } else {
          return '<span style="color:#999;font-size:0.75rem;">—</span>';
        }
      })() +
      "</td>" +
      "<td>" +
      actionBtn +
      "</td>";
    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}



function updateBookingKPIs() {
  var bookings = getBookings();
  var total = bookings.length;
  var confirmed = 0,
    pending = 0,
    completed = 0,
    withReferral = 0;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].status === "confirmed") confirmed++;
    else if (bookings[i].status === "completed") completed++;
    else if (bookings[i].status !== "cancelled") pending++;
    if (bookings[i].referral_code) withReferral++;
  }
  var elTotal = document.getElementById("bkKpiTotal");
  var elConfirmed = document.getElementById("bkKpiConfirmed");
  var elPending = document.getElementById("bkKpiPending");
  var elCompleted = document.getElementById("bkKpiCompleted");
  var elReferral = document.getElementById("bkKpiReferral");
  if (elTotal) elTotal.textContent = total;
  if (elConfirmed) elConfirmed.textContent = confirmed;
  if (elPending) elPending.textContent = pending;
  if (elCompleted) elCompleted.textContent = completed;
  if (elReferral) elReferral.textContent = withReferral;
}


function completeBooking(bookingId) {
  if (!confirm("Mark this trip as completed? Completed bookings will be reflected in Revenue."))
    return;
  changeBookingStatus(bookingId, "completed");
  renderBookingTable();
  updateBookingKPIs();
  showToast("Trip marked as completed.", "success");
}



async function deleteBooking(bookingId) {
  if (!confirm("Are you sure you want to permanently delete this booking? This cannot be undone."))
    return;
  var bookings = getBookings();
  var deletedBooking = null;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      deletedBooking = bookings[i];
      break;
    }
  }
  if (!deletedBooking) {
    showToast("Booking not found.", "error");
    return;
  }

  var apiUrl = getDataApiUrl();
  if (apiUrl) {
    try {
      var resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ type: "booking_delete", id: bookingId, data: { bookingId: bookingId } }),
      });
      if (!resp.ok) {
        var errText = "";
        try {
          errText = await resp.text();
        } catch (_) {}
        throw new Error("HTTP " + resp.status + (errText ? ": " + errText : ""));
      }
    } catch (e) {
      console.error("[Bookings] Delete failed:", e);
      showToast("Booking delete failed on server. Please try again.", "error");
      return;
    }
  }

  for (var j = 0; j < bookings.length; j++) {
    if (bookings[j].bookingId === bookingId) {
      var vehicleId = bookings[j].vehicleId;
      if (vehicleId) {
        var vehicles = getVehicles();
        for (var v = 0; v < vehicles.length; v++) {
          if (vehicles[v].id === vehicleId) {
            vehicles[v].status = "available";
            vehicles[v].updatedAt = new Date().toISOString();
            saveVehicles(vehicles);
            break;
          }
        }
        recordAuditTrail("vehicle_released", { bookingId: bookingId, vehicleId: vehicleId });
      }
      bookings.splice(j, 1);
      recordAuditTrail("booking_delete", { bookingId: bookingId });
      break;
    }
  }
  renderBookingTable();
  updateBookingKPIs();
  showToast("Booking deleted permanently.", "info");
}



function exportBookingsCSV() {
  var bookings = getBookings();
  if (bookings.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var headers = [
    "Booking ID",
    "Name",
    "Phone",
    "Email",
    "Route",
    "Date",
    "Time",
    "Passengers",
    "Trip Type",
    "Vehicle",
    "Driver",
    "Referral Code",
    "Status",
    "Created",
  ];
  var rows = bookings.map(function (b) {
    var vName = "",
      dName = "";
    if (b.vehicleId) {
      var v = getVehicleById(b.vehicleId);
      if (v) {
        vName = v.vehicleNumber;
        dName = v.driverName;
      }
    }
    return [
      b.bookingId,
      b.name,
      b.phone,
      b.email,
      b.route,
      b.date,
      b.time,
      b.passengers,
      b.trip_type,
      vName,
      dName,
      b.referral_code,
      b.status,
      b.createdAt,
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
  downloadFile(csv, "pratap-travels-bookings.csv", "text/csv");
  showToast(I18N.t("dd.toast.csvExported"), "success");
}

/* ============================================
   AUDIT TRAIL ADMIN DASHBOARD
   ============================================ */
