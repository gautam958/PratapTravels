/* ============================================
   PRATAP TRAVELS - Revenue Dashboard JavaScript
   ============================================ */


async function fetchRevenueData() {
  var dataApiUrl = getDataApiUrl();
  if (!dataApiUrl) return null;
  try {
    var separator = dataApiUrl.indexOf('?') !== -1 ? '&' : '?';
    var fetchUrl = dataApiUrl + separator + 'type=revenue';
    var resp = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
  } catch (e) {
    console.warn('Revenue API failed:', e.message);
    return null;
  }
}

// ---------- Local Revenue Calculation (fallback when API unavailable) ----------


// ---------- Local Revenue Calculation (fallback when API unavailable) ----------
function calculateLocalRevenue() {
  var bookings = getBookings();
  var totalBookings = bookings.length;
  var confirmed = 0, completed = 0, pending = 0, cancelled = 0;
  var routeMap = {}, monthMap = {};
  var totalRevenue = 0, completedCount = 0;
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (b.status === 'confirmed') confirmed++;
    else if (b.status === 'completed') completed++;
    else if (b.status === 'cancelled') cancelled++;
    else pending++;
    if (b.status === 'completed') {
      completedCount++;
      var route = b.route || 'Unknown';
      if (!routeMap[route]) routeMap[route] = { route: route, count: 0, revenue: 0 };
      routeMap[route].count++;
      routeMap[route].revenue += 500; // Default fare per completed booking
      totalRevenue += 500;
      if (b.date) {
        var monthKey = b.date.substring(0, 7);
        if (!monthMap[monthKey]) monthMap[monthKey] = { month: monthKey, count: 0, revenue: 0 };
        monthMap[monthKey].count++;
        monthMap[monthKey].revenue += 500;
      }
    }
  }
  var revenueByRoute = Object.values(routeMap).map(function(r) {
    r.average = r.count > 0 ? Math.round(r.revenue / r.count) : 0;
    return r;
  });
  var revenueByMonth = Object.values(monthMap).sort(function(a, b) { return b.month > a.month ? 1 : -1; });
  return {
    totalBookings: totalBookings, confirmedBookings: confirmed, completedBookings: completed,
    pendingBookings: pending, cancelledBookings: cancelled, totalRevenue: totalRevenue,
    averageOrderValue: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
    revenueByRoute: revenueByRoute, revenueByMonth: revenueByMonth
  };
}



function renderRevenueDashboard(data) {
  if (!data) return;
  var elTotal = document.getElementById('revTotalBookings');
  var elConfirmed = document.getElementById('revConfirmed');
  var elCompleted = document.getElementById('revCompleted');
  var elPending = document.getElementById('revPending');
  var elCancelled = document.getElementById('revCancelled');
  var elRevenue = document.getElementById('revTotalRevenue');
  var elAvg = document.getElementById('revAvgOrder');
  if (elTotal) elTotal.textContent = data.totalBookings || 0;
  if (elConfirmed) elConfirmed.textContent = data.confirmedBookings || 0;
  if (elCompleted) elCompleted.textContent = data.completedBookings || 0;
  if (elPending) elPending.textContent = data.pendingBookings || 0;
  if (elCancelled) elCancelled.textContent = data.cancelledBookings || 0;
  if (elRevenue) elRevenue.textContent = '\u20b9' + (data.totalRevenue || 0).toLocaleString();
  if (elAvg) elAvg.textContent = '\u20b9' + (data.averageOrderValue || 0).toLocaleString();
  var routeBody = document.getElementById('revenueByRouteBody');
  if (routeBody && data.revenueByRoute) {
    routeBody.innerHTML = '';
    data.revenueByRoute.forEach(function(r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + escapeHtml(r.route || '-') + '</td><td>' + (r.count || 0) + '</td><td>\u20b9' + (r.revenue || 0).toLocaleString() + '</td><td>\u20b9' + (r.average || 0).toLocaleString() + '</td>';
      routeBody.appendChild(tr);
    });
  }
  var monthBody = document.getElementById('revenueByMonthBody');
  if (monthBody && data.revenueByMonth) {
    monthBody.innerHTML = '';
    data.revenueByMonth.forEach(function(m) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + escapeHtml(m.month || '-') + '</td><td>' + (m.count || 0) + '</td><td>\u20b9' + (m.revenue || 0).toLocaleString() + '</td>';
      monthBody.appendChild(tr);
    });
  }

  refreshLucideIcons();
}

/* ============================================
   FEATURE: Driver Location Sharing
   ============================================ */



function refreshRevenuePage() {
  var refreshBtn = document.getElementById('revenueRefreshBtn');
  if (refreshBtn) { refreshBtn.innerHTML = lucideIcon("loader",14) + " Loading..."; refreshBtn.disabled = true; }
  fetchRevenueData().then(function(data) {
    if (!data) { data = calculateLocalRevenue(); data._fromLocal = true; }
    renderRevenueDashboard(data);
    if (refreshBtn) { refreshBtn.innerHTML = lucideIcon("refresh-cw",14) + " Refresh"; refreshBtn.disabled = false; }
    showToast(data._fromLocal ? 'Showing local data (API unavailable)' : 'Revenue data refreshed.', 'success');
  });
}



function shareDriverLocation(bookingId) {
  var bookings = getBookings();
  var booking = null;
  var bookingIdx = -1;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) { booking = bookings[i]; bookingIdx = i; break; }
  }
  if (!booking) { showToast('Booking not found', 'error'); return; }
  var msg = '\ud83d\ude98 *PRATAP TRAVELS - Driver Assignment*\n\n';
  msg += 'Hi ' + (booking.name || 'Customer') + '!\n\n';
  msg += 'Your booking has been confirmed!\n\n';
  msg += '\ud83d\udccb *Booking ID:* ' + bookingId + '\n';
  msg += '\ud83d\uddfa\ufe0f *Route:* ' + (booking.route || '-') + '\n';
  msg += '\ud83d\udcc5 *Date:* ' + (booking.date || '-') + '\n';
  msg += '\u23f0 *Time:* ' + (booking.time || '-') + '\n';
  if (booking.vehicleNumber) msg += '\ud83d\ude97 *Vehicle:* ' + booking.vehicleNumber + '\n';
  if (booking.driverName) msg += '\ud83d\udc64 *Driver:* ' + booking.driverName + '\n';
  if (booking.pickup_address) msg += '\ud83d\udccd *Pickup:* ' + booking.pickup_address + '\n';
  msg += '\n\ud83d\udcde For queries, call +91 76313 82174';
  var phone = booking.phone ? '91' + booking.phone : '';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
  // Mark notification as sent via WhatsApp
  if (bookingIdx >= 0) {
    bookings[bookingIdx].notification_sent = true;
    bookings[bookingIdx].notification_type = 'whatsapp';
    bookings[bookingIdx].notified_at = new Date().toISOString();
    bookings[bookingIdx].needs_notification = false;
    _bookingsCache = bookings;
    persistBookingToApi(bookingId, {
      notification_sent: true,
      notification_type: 'whatsapp',
      notified_at: new Date().toISOString(),
      needs_notification: false
    });
    renderBookingTable();
  }
  showToast('Opening WhatsApp to share driver details...', 'success');
}

/* ============================================
   Initialize features on page load
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('routesBody')) {
    initGoogleMapsLinks();
  }
  if (document.getElementById('calcRoute')) {
    var calcRoute = document.getElementById('calcRoute');
    var calcVehicle = document.getElementById('calcVehicle');
    var calcTrip = document.getElementById('calcTrip');
    if (calcRoute) calcRoute.addEventListener('change', calculateEstimatedPrice);
    if (calcVehicle) calcVehicle.addEventListener('change', calculateEstimatedPrice);
    if (calcTrip) calcTrip.addEventListener('change', calculateEstimatedPrice);
    var calcCustomDist = document.getElementById('calcCustomDistance');
    var calcCustomFromEl = document.getElementById('calcCustomFrom');
    var calcCustomToEl = document.getElementById('calcCustomTo');
    if (calcCustomDist) calcCustomDist.addEventListener('input', calculateEstimatedPrice);
    if (calcCustomFromEl) calcCustomFromEl.addEventListener('input', calculateEstimatedPrice);
    if (calcCustomToEl) calcCustomToEl.addEventListener('input', calculateEstimatedPrice);
  }
  if (document.getElementById('revTotalBookings')) {
    withAdminPageLoader(function () {
      return fetchRevenueData().then(function(data) {
        if (!data) data = calculateLocalRevenue();
        renderRevenueDashboard(data);
      });
    });
  }
  // Driver Diary Form
  var ddForm = document.getElementById('driverDiaryForm');
  if (ddForm) { ddForm.addEventListener('submit', saveDriverDiaryEntry); }
  var ddCloseBtn = document.getElementById('driverDiaryModalClose');
  var ddOverlay = document.getElementById('driverDiaryModal');
  if (ddCloseBtn) ddCloseBtn.addEventListener('click', closeDriverDiaryModal);
  if (ddOverlay) ddOverlay.addEventListener('click', function(e) { if (e.target === ddOverlay) closeDriverDiaryModal(); });
});

/* ============================================
   DRIVER DIARY MANAGEMENT
   Track daily vehicle running and trip data
   ============================================ */

var _driverDiaryCache = [];

// ---------- Fetch Driver Diary from PratapTravels-Data API ----------
