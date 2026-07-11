/* ============================================
   PRATAP TRAVELS - Booking Calendar Module
   Admin-only calendar view of all bookings
   ============================================ */

var _calCurrentDate = new Date();
var _calBookings = [];

// ---------- Init Calendar ----------
document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("calendarGrid")) return;

  withAdminPageLoader(function () {
    return Promise.all([fetchBookingsFromApi(), fetchVehiclesFromApi()]).then(
      function () {
        _calBookings = getBookings();
        renderCalendar();
      }
    );
  });

  // Navigation
  document.getElementById("calPrevMonth").addEventListener("click", function () {
    _calCurrentDate.setMonth(_calCurrentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("calNextMonth").addEventListener("click", function () {
    _calCurrentDate.setMonth(_calCurrentDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById("calToday").addEventListener("click", function () {
    _calCurrentDate = new Date();
    renderCalendar();
  });
  document.getElementById("closeDayDetail").addEventListener("click", function () {
    document.getElementById("dayDetailPanel").classList.add("hidden");
  });

  // Auto-refresh when user returns to this tab
  window.addEventListener("focus", function () {
    fetchBookingsFromApi().then(function () {
      _calBookings = getBookings();
      renderCalendar();
    });
  });
});

// ---------- Render Full Calendar ----------
function renderCalendar() {
  var grid = document.getElementById("calendarGrid");
  var titleEl = document.getElementById("calendarTitle");
  if (!grid || !titleEl) return;

  var year = _calCurrentDate.getFullYear();
  var month = _calCurrentDate.getMonth();

  // Title
  var monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  titleEl.textContent = monthNames[month] + " " + year;

  // First day of month & total days
  var firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  var daysInMonth = new Date(year, month + 1, 0).getDate();

  // Today reference
  var today = new Date();
  var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

  // Group bookings by date string
  var bookingsByDate = {};
  for (var i = 0; i < _calBookings.length; i++) {
    var b = _calBookings[i];
    var bDate = b.pickup_date || b.date || "";
    if (!bDate) continue;
    if (!bookingsByDate[bDate]) bookingsByDate[bDate] = [];
    bookingsByDate[bDate].push(b);
  }

  grid.innerHTML = "";

  // Empty cells before first day
  for (var e = 0; e < firstDay; e++) {
    var emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell calendar-cell-empty";
    grid.appendChild(emptyCell);
  }

  // Day cells
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr =
      year + "-" + String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    var cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (dateStr === todayStr) cell.classList.add("calendar-cell-today");

    var dayBookings = bookingsByDate[dateStr] || [];

    // Day number
    var dayNum = document.createElement("div");
    dayNum.className = "calendar-day-num";
    dayNum.textContent = d;
    cell.appendChild(dayNum);

    // Booking dots (max 6 visible)
    if (dayBookings.length > 0) {
      var dotsWrap = document.createElement("div");
      dotsWrap.className = "calendar-dots";
      var shown = Math.min(dayBookings.length, 6);
      for (var bIdx = 0; bIdx < shown; bIdx++) {
        var dot = document.createElement("span");
        var st = dayBookings[bIdx].status || "pending";
        dot.className = "calendar-dot dot-" + st;
        dotsWrap.appendChild(dot);
      }
      cell.appendChild(dotsWrap);

      // Badge count
      if (dayBookings.length > 1) {
        var badge = document.createElement("span");
        badge.className = "calendar-count-badge";
        badge.textContent = dayBookings.length;
        cell.appendChild(badge);
      }

      cell.setAttribute("data-date", dateStr);
      cell.classList.add("calendar-cell-has-bookings");
      cell.addEventListener("click", (function (ds) {
        return function () {
          openDayDetail(ds);
        };
      })(dateStr));
    }

    grid.appendChild(cell);
  }

  refreshLucideIcons();
}

// ---------- Open Day Detail ----------
function openDayDetail(dateStr) {
  var panel = document.getElementById("dayDetailPanel");
  var titleEl = document.getElementById("dayDetailTitle");
  var listEl = document.getElementById("dayBookingsList");
  if (!panel || !listEl) return;

  var dayBookings = [];
  for (var i = 0; i < _calBookings.length; i++) {
    var bDate = _calBookings[i].pickup_date || _calBookings[i].date || "";
    if (bDate === dateStr) dayBookings.push(_calBookings[i]);
  }

  // Format date for display
  var parts = dateStr.split("-");
  var displayDate = "";
  if (parts.length === 3) {
    var dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    displayDate = dObj.toLocaleDateString("en-IN", opts);
  }
  titleEl.textContent = "Bookings for " + (displayDate || dateStr);

  listEl.innerHTML = "";

  if (dayBookings.length === 0) {
    listEl.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📭</div><p>No bookings on this date.</p></div>';
    panel.classList.remove("hidden");
    return;
  }

  // Sort by time
  dayBookings.sort(function (a, b) {
    return (a.time || "").localeCompare(b.time || "");
  });

  for (var j = 0; j < dayBookings.length; j++) {
    var b = dayBookings[j];
    var card = document.createElement("div");
    card.className = "calendar-booking-card";

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
        vehicleInfo = escapeHtml(v.vehicleNumber);
        driverInfo = escapeHtml(v.driverName);
      }
    }

    // Time display
    var timeDisplay = b.time && b.time !== "Not specified" ? b.time : "-";

    card.innerHTML =
      '<div class="calendar-booking-header">' +
        '<div class="calendar-booking-time">🕐 ' + escapeHtml(timeDisplay) + '</div>' +
        '<span class="booking-status-badge ' + statusClass + '">' + (b.status || "pending") + "</span>" +
      "</div>" +
      '<div class="calendar-booking-body">' +
        '<div class="calendar-booking-route">' +
          '<span class="route-from">' + escapeHtml(b.from_location || b.route || "-") + '</span>' +
          ' → ' +
          '<span class="route-to">' + escapeHtml(b.to_location || "") + "</span>" +
        "</div>" +
        '<div class="calendar-booking-details">' +
          '<div class="detail-row"><span class="detail-label">👤 Name:</span> <span class="detail-value">' + escapeHtml(b.name || "-") + "</span></div>" +
          (b.email
            ? '<div class="detail-row"><span class="detail-label">📧 Email:</span> <span class="detail-value">' + escapeHtml(b.email) + "</span></div>"
            : "") +
          '<div class="detail-row"><span class="detail-label">📞 Phone:</span> <span class="detail-value">' + escapeHtml(b.phone || "-") + "</span></div>" +
          '<div class="detail-row"><span class="detail-label">👥 Passengers:</span> <span class="detail-value">' + escapeHtml(b.passengers || "-") + "</span></div>" +
          '<div class="detail-row"><span class="detail-label">🚗 Vehicle:</span> <span class="detail-value">' + vehicleInfo + " (" + driverInfo + ")</span></div>" +
          (b.fare ? '<div class="detail-row"><span class="detail-label">💰 Fare:</span> <span class="detail-value">₹' + escapeHtml(String(b.fare)) + "</span></div>" : "") +
        "</div>" +
      "</div>";

    listEl.appendChild(card);
  }

  panel.classList.remove("hidden");
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}
