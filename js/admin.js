/* ============================================
   PRATAP TRAVELS - Admin Dashboard JavaScript
   ============================================ */


// ---------- Refresh dashboard tables after login ----------

// ---------- Cancel Booking ----------
function cancelBooking(bookingId) {
  if (
    !confirm(
      "Are you sure you want to cancel this booking? This will release the assigned vehicle.",
    )
  )
    return;
  changeBookingStatus(bookingId, "cancelled");
  renderBookingTable();
  updateBookingKPIs();
  showToast("Booking cancelled and vehicle released.", "info");
}



function completeBooking(bookingId) {
  if (!confirm("Mark this trip as completed? Completed bookings will be reflected in Revenue."))
    return;
  changeBookingStatus(bookingId, "completed");
  renderBookingTable();
  updateBookingKPIs();
  showToast("Trip marked as completed.", "success");
}



function deleteBooking(bookingId) {
  if (!confirm("Are you sure you want to permanently delete this booking? This cannot be undone."))
    return;
  var bookings = getBookings();
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      var vehicleId = bookings[i].vehicleId;
      if (vehicleId) {
        updateVehicle(vehicleId, { status: "available" });
        recordAuditTrail("vehicle_released", { bookingId: bookingId, vehicleId: vehicleId });
      }
      bookings.splice(i, 1);
      var apiUrl = getDataApiUrl();
      if (apiUrl) {
        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ type: "booking_delete", data: { bookingId: bookingId } }),
        }).catch(function() {});
      }
      recordAuditTrail("booking_delete", { bookingId: bookingId });
      break;
    }
  }
  renderBookingTable();
  updateBookingKPIs();
  showToast("Booking deleted permanently.", "info");
}



function _refreshCurrentDashboard() {
  if (document.getElementById("visitorTableBody")) {
    fetchVisitorRecordsFromApi().then(function () {
      renderVisitorTable();
      updateKPIs();
    });
  }
  if (document.getElementById("referralDashboardPanel")) {
    fetchAllReferrals().then(function () {
      renderReferralTable();
      updateReferralKPIs();
    });
  }
  if (document.getElementById("bookingTableBody")) {
    fetchBookingsFromApi().then(function () {
      renderBookingTable();
      updateBookingKPIs();
    });
  }
  if (document.getElementById("auditTableBody")) {
    fetchAuditFromApi().then(function () {
      renderAuditTable();
      updateAuditKPIs();
    });
  }
  if (document.getElementById("vehicleTableBody")) {
    fetchVehiclesFromApi().then(function () {
      renderVehicleTable();
      updateVehicleKPIs();
    });
  }
  if (document.getElementById("driverDiaryTableBody")) {
    fetchVehiclesFromApi().then(function () {
      return fetchDriverDiaryFromApi();
    }).then(function () {
      renderDriverDiaryTable();
      updateDriverDiaryKPIs();
      renderDriverDiarySummary();
    });
  }
  if (document.getElementById("calendarGrid")) {
    fetchBookingsFromApi().then(function () {
      if (typeof _calBookings !== 'undefined') {
        _calBookings = getBookings();
        renderCalendar();
      }
    });
  }
}

// ---------- File Upload ----------


function trackUserClick(element, action) {
  recordAuditTrail("click", {
    action: action,
    element: element,
    page: window.location.pathname.split("/").pop() || "index.html",
  });
}

// ---------- Init All Dashboards ----------
document.addEventListener("DOMContentLoaded", async function () {
  // Init visitor dashboard if on visitors page
  if (document.getElementById("visitorTableBody")) {
    await fetchVisitorRecordsFromApi();
    renderVisitorTable();
    updateKPIs();
  }

  // Init referral dashboard independently (works on referral.html too)
  if (document.getElementById("referralDashboardPanel")) {
    await fetchAllReferrals();
    renderReferralTable();
    updateReferralKPIs();
  }
  // Also update user's own referral stats if on index page
  if (document.getElementById("referStats")) {
    await fetchReferralStats();
    updateReferralStatsDisplay();
  }

  // Init booking dashboard (booking.html)
  if (document.getElementById("bookingTableBody")) {
    await fetchBookingsFromApi();
    await fetchVehiclesFromApi();
    renderBookingTable();
    updateBookingKPIs();
  }

  // Init vehicle dashboard (vehicle.html)
  if (document.getElementById("vehicleTableBody")) {
    await fetchVehiclesFromApi();
    renderVehicleTable();
    updateVehicleKPIs();
  }

  // Init audit trail dashboard (audit-trail.html)
  if (document.getElementById("auditTableBody")) {
    await fetchAuditFromApi();
    renderAuditTable();
    updateAuditKPIs();
  }

  // Auto-track only the public homepage. Admin pages must not create visitor records.
  if (typeof trackVisit === "function") {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (currentPage === "index.html" && !_indexVisitTracked) {
      _indexVisitTracked = true;
      trackVisit().catch(function () {
        /* fire-and-forget tracking */
      });
      // Record audit trail for page visit
      recordAuditTrail("page_visit", { page: currentPage });
    }
  }
});

/* ============================================
   FEATURE: Google Maps Route Integration
   ============================================ */

var ROUTE_MAP_DATA = {
  'Basukinath': 'Basukinath,+Jharkhand',
  'Tarapith': 'Tarapith,+West+Bengal',
  'Sultanganj': 'Sultanganj,+Bihar',
  'Ranchi': 'Ranchi,+Jharkhand',
  'Patna': 'Patna,+Bihar',
  'Kolkata': 'Kolkata,+West+Bengal',
  'Dumka': 'Dumka,+Jharkhand',
  'Dhanbad': 'Dhanbad,+Jharkhand',
  'Munger': 'Munger,+Bihar',
  'Muzaffarpur': 'Muzaffarpur,+Bihar',
  'AIIMS Deoghar': 'AIIMS+Deoghar',
  'Waterpark': 'Deoghar+Waterpark,+Jharkhand',
  'Sarath': 'Sarath,+Jharkhand',
  'Madhupur': 'Madhupur,+Jharkhand',
  'Jamtara': 'Jamtara,+Jharkhand',
  'Budhai': 'Budhai,+Jharkhand'
};
