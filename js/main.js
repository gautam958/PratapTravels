/* ============================================
   PRATAP TRAVELS - Main JavaScript
   ============================================ */

// ---------- Navbar Toggle ----------
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
      });
    });
  }

  // ---------- Navbar scroll effect & Back to Top ----------
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(14, 47, 68, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
    } else {
      navbar.style.background = 'rgba(26, 82, 118, 0.95)';
      navbar.style.boxShadow = 'none';
    }
    // Back to top visibility
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });
  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Route Filtering ----------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const routeRows = document.querySelectorAll('#routesBody tr');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      routeRows.forEach(function (row) {
        if (filter === 'all' || row.getAttribute('data-category') === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // ---------- Slider Pause on Hover ----------
  var sliderTrack = document.getElementById('sliderTrack');
  if (sliderTrack) {
    var sliderWrapper = sliderTrack.parentElement;
    sliderWrapper.addEventListener('mouseenter', function () {
      sliderTrack.style.animationPlayState = 'paused';
    });
    sliderWrapper.addEventListener('mouseleave', function () {
      sliderTrack.style.animationPlayState = 'running';
    });

    // ---------- Slider Touch/Swipe Support ----------
    // Simple and reliable: pause on touch, resume after a short delay
    sliderWrapper.addEventListener('touchstart', function () {
      sliderTrack.style.animationPlayState = 'paused';
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', function () {
      setTimeout(function () {
        sliderTrack.style.animationPlayState = 'running';
      }, 2000);
    }, { passive: true });

    sliderWrapper.addEventListener('touchcancel', function () {
      sliderTrack.style.animationPlayState = 'running';
    }, { passive: true });
  }

  // ---------- EmailJS Initialization ----------
  if (typeof emailjs !== 'undefined') {
    emailjs.init('ApfbQ_yIjOVtMlf7L');
  }

  // ---------- Floating Book Button & Modal ----------
  var floatingBookBtn = document.getElementById('floatingBookBtn');
  var bookingModal = document.getElementById('bookingModal');
  var modalClose = document.getElementById('modalClose');

  if (floatingBookBtn && bookingModal) {
    floatingBookBtn.addEventListener('click', function () {
      bookingModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    if (modalClose) {
      modalClose.addEventListener('click', function () {
        bookingModal.classList.add('hidden');
        document.body.style.overflow = '';
      });
    }

    bookingModal.addEventListener('click', function (e) {
      if (e.target === bookingModal) {
        bookingModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !bookingModal.classList.contains('hidden')) {
        bookingModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  // ---------- Booking Form with EmailJS ----------
  var bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    // Set minimum date to today
    var dateInput = document.getElementById('bookDate');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      var errors = bookingForm.querySelectorAll('.form-error');
      errors.forEach(function (el) { el.textContent = ''; });
      var errorInputs = bookingForm.querySelectorAll('.error');
      errorInputs.forEach(function (el) { el.classList.remove('error'); });

      var valid = true;

      // Validate name
      var name = document.getElementById('bookName');
      if (!name.value.trim()) {
        document.getElementById('nameError').textContent = 'Please enter your name';
        name.classList.add('error');
        valid = false;
      }

      // Validate phone
      var phone = document.getElementById('bookPhone');
      var phoneRegex = /^[6-9]\d{9}$/;
      if (!phone.value.trim() || !phoneRegex.test(phone.value.replace(/\s/g, ''))) {
        document.getElementById('phoneError').textContent = 'Enter a valid 10-digit phone number';
        phone.classList.add('error');
        valid = false;
      }

      // Validate email (optional but must be valid if provided)
      var email = document.getElementById('bookEmail');
      if (email.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
          document.getElementById('emailError').textContent = 'Enter a valid email address';
          email.classList.add('error');
          valid = false;
        }
      }

      // Validate route
      var route = document.getElementById('bookRoute');
      if (!route.value) {
        document.getElementById('routeError').textContent = 'Please select a destination';
        route.classList.add('error');
        valid = false;
      }

      // Validate date
      var date = document.getElementById('bookDate');
      if (!date.value) {
        document.getElementById('dateError').textContent = 'Please select a travel date';
        date.classList.add('error');
        valid = false;
      }

      // Validate trip type
      var type = document.getElementById('bookType');
      if (!type.value) {
        document.getElementById('typeError').textContent = 'Please select a trip type';
        type.classList.add('error');
        valid = false;
      }

      if (!valid) return;

      // Build booking details
      var nameVal = name.value.trim();
      var phoneVal = phone.value.trim();
      var emailVal = email.value.trim();
      var routeVal = route.options[route.selectedIndex].text;
      var dateVal = date.value;
      var timeVal = document.getElementById('bookTime').value || 'Not specified';
      var passengersVal = document.getElementById('bookPassengers').value;
      var typeVal = type.options[type.selectedIndex].text;
      var remarksVal = document.getElementById('bookRemarks').value.trim();

      // Show loading state
      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.textContent = '⏳ Sending...';
        submitBtn.disabled = true;
      }

      // Send email via EmailJS
      var templateParams = {
        to_email: 'prempratap7455@gmail.com',
        from_name: nameVal,
        from_phone: phoneVal,
        from_email: emailVal || 'Not provided',
        route: routeVal,
        travel_date: dateVal,
        travel_time: timeVal,
        passengers: passengersVal,
        trip_type: typeVal,
        remarks: remarksVal || 'None'
      };

      if (typeof emailjs !== 'undefined') {
        emailjs.send('service_jhqm31f', 'template_jhcl557', templateParams)
          .then(function () {
            bookingForm.classList.add('hidden');
            document.getElementById('bookingSuccess').classList.remove('hidden');
          })
          .catch(function (error) {
            console.error('EmailJS send failed:', error);
            // Fallback: open WhatsApp
            var msg = '🚗 *PRATAP TRAVELS - Booking Request*\n\n';
            msg += '👤 *Name:* ' + nameVal + '\n';
            msg += '📞 *Phone:* ' + phoneVal + '\n';
            if (emailVal) msg += '📧 *Email:* ' + emailVal + '\n';
            msg += '🗺 *Route:* ' + routeVal + '\n';
            msg += '📅 *Date:* ' + dateVal + '\n';
            msg += '⏰ *Time:* ' + timeVal + '\n';
            msg += '👥 *Passengers:* ' + passengersVal + '\n';
            msg += '🏷 *Trip Type:* ' + typeVal + '\n';
            if (remarksVal) msg += '📝 *Remarks:* ' + remarksVal + '\n';
            var whatsappUrl = 'https://wa.me/917991182806?text=' + encodeURIComponent(msg);
            bookingForm.classList.add('hidden');
            document.getElementById('bookingSuccess').classList.remove('hidden');
            window.open(whatsappUrl, '_blank');
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.textContent = '🚗 Submit Booking Request';
              submitBtn.disabled = false;
            }
          });
      } else {
        console.error('EmailJS library not loaded. If you opened this file directly (file://), serve it via HTTP instead.');
        // EmailJS not loaded: fallback to WhatsApp
        var fallbackMsg = '🚗 *PRATAP TRAVELS - Booking Request*\n\n';
        fallbackMsg += '👤 *Name:* ' + nameVal + '\n';
        fallbackMsg += '📞 *Phone:* ' + phoneVal + '\n';
        if (emailVal) fallbackMsg += '📧 *Email:* ' + emailVal + '\n';
        fallbackMsg += '🗺 *Route:* ' + routeVal + '\n';
        fallbackMsg += '📅 *Date:* ' + dateVal + '\n';
        fallbackMsg += '⏰ *Time:* ' + timeVal + '\n';
        fallbackMsg += '👥 *Passengers:* ' + passengersVal + '\n';
        fallbackMsg += '🏷 *Trip Type:* ' + typeVal + '\n';
        if (remarksVal) fallbackMsg += '📝 *Remarks:* ' + remarksVal + '\n';
        var fallbackUrl = 'https://wa.me/917991182806?text=' + encodeURIComponent(fallbackMsg);
        bookingForm.classList.add('hidden');
        document.getElementById('bookingSuccess').classList.remove('hidden');
        window.open(fallbackUrl, '_blank');
        if (submitBtn) {
          submitBtn.textContent = '🚗 Submit Booking Request';
          submitBtn.disabled = false;
        }
      }
    });
  }

  // ---------- Drag & Drop Upload ----------
  var uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadArea.style.borderColor = '#2980b9';
      uploadArea.style.background = '#f0f7ff';
    });

    uploadArea.addEventListener('dragleave', function () {
      uploadArea.style.borderColor = '#d0d7de';
      uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.style.borderColor = '#d0d7de';
      uploadArea.style.background = '';
      if (e.dataTransfer.files.length > 0) {
        displayUploadedFiles(e.dataTransfer.files);
      }
    });
  }
});

// ---------- Google Sign-In (Mock) ----------
function handleGoogleSignIn() {
  // Simulate Google Sign-In with a mock user
  var mockUser = {
    name: 'Guest User',
    email: 'guest@prataptravels.com',
    initial: 'G'
  };

  // In production, replace with actual Google Sign-In API
  // gapi.load('auth2', function() { ... });

  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');

  document.getElementById('userName').textContent = mockUser.name;
  document.getElementById('userEmail').textContent = mockUser.email;
  document.getElementById('userAvatar').textContent = mockUser.initial;

  // Store login state
  sessionStorage.setItem('pt_logged_in', 'true');
  sessionStorage.setItem('pt_user', JSON.stringify(mockUser));
}

// ---------- Logout ----------
function handleLogout() {
  sessionStorage.removeItem('pt_logged_in');
  sessionStorage.removeItem('pt_user');

  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
}

// ---------- Check login state on page load ----------
document.addEventListener('DOMContentLoaded', function () {
  if (sessionStorage.getItem('pt_logged_in') === 'true') {
    var user = JSON.parse(sessionStorage.getItem('pt_user'));
    if (user && document.getElementById('authSection')) {
      document.getElementById('authSection').classList.add('hidden');
      document.getElementById('dashboardSection').classList.remove('hidden');
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userAvatar').textContent = user.initial;
    }
  }
});

// ---------- File Upload ----------
function handleFileUpload(event) {
  var files = event.target.files;
  if (files.length > 0) {
    displayUploadedFiles(files);
  }
}

function displayUploadedFiles(files) {
  var container = document.getElementById('uploadedFiles');
  if (!container) return;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f0f7ff;border-radius:8px;margin-bottom:8px;font-size:0.9rem;';
    div.innerHTML = '<span>📎</span><span>' + escapeHtml(file.name) + '</span><span style="margin-left:auto;color:#27ae60;font-weight:700;">✓ Uploaded</span>';
    container.appendChild(div);
  }
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ---------- Open Booking Modal (called from onclick handlers) ----------
function openBookingModal() {
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

// ---------- Reset Booking Form ----------
function resetBookingForm() {
  var form = document.getElementById('bookingForm');
  var success = document.getElementById('bookingSuccess');
  if (form && success) {
    form.reset();
    form.classList.remove('hidden');
    success.classList.add('hidden');
    var errors = form.querySelectorAll('.form-error');
    errors.forEach(function (el) { el.textContent = ''; });
    var errorInputs = form.querySelectorAll('.error');
    errorInputs.forEach(function (el) { el.classList.remove('error'); });
  }
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/* ============================================
   VISITOR TRACKING (Sello-style)
   ============================================ */

var PT_VISITOR_ID_KEY = 'pt_vid';
var PT_GEO_CACHE_KEY = 'pt_geo_cache';
var VISITOR_RECORDS_KEY = 'pt_visitor_records';
var MAX_VISITOR_RECORDS = 5000;

// ---------- Stable Visitor ID ----------
function getVisitorId() {
  var vid = localStorage.getItem(PT_VISITOR_ID_KEY);
  if (!vid) {
    vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(PT_VISITOR_ID_KEY, vid);
  }
  return vid;
}

// ---------- Parse User Agent ----------
function parseUA(ua) {
  var device = 'Unknown';
  var browser = 'Unknown';
  var os = 'Unknown';

  // Device
  if (/Mobile|Android.*Mobile|iPhone/i.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) device = 'Tablet';
  else device = 'Desktop';

  // Browser
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  // OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

  return { device: device, browser: browser, os: os };
}

// ---------- Geo Lookup (cached 24h) ----------
// Multi-source with graceful fallback. Geo APIs block file:// origins;
// when running locally, only IP (via ipify) is captured. Full geo
// works when deployed to HTTPS (Azure, GitHub Pages, etc.).
var GEO_SOURCES = [
  {
    url: 'https://ipapi.co/json/',
    parse: function (d) {
      return { ip: d.ip || '', city: d.city || '', region: d.region || '', country: d.country_name || d.country || '', timezone: d.timezone || '' };
    }
  },
  {
    url: 'https://ipwho.is/',
    parse: function (d) {
      return { ip: d.ip || '', city: d.city || '', region: d.region || '', country: d.country || '', timezone: (d.timezone && d.timezone.id) || '' };
    }
  }
];

var EMPTY_GEO = { ip: '', city: '', region: '', country: '', timezone: '' };

async function lookupGeo() {
  // Check cache first
  try {
    var cached = localStorage.getItem(PT_GEO_CACHE_KEY);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        return parsed.geo;
      }
    }
  } catch (e) { /* ignore */ }

  // Try each geo source until one works
  for (var i = 0; i < GEO_SOURCES.length; i++) {
    var src = GEO_SOURCES[i];
    try {
      var resp = await fetch(src.url, { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      var geo = src.parse(data);
      localStorage.setItem(PT_GEO_CACHE_KEY, JSON.stringify({ ts: Date.now(), geo: geo }));
      return geo;
    } catch (e) {
      continue;
    }
  }

  // All geo sources failed — this is expected when running from file:// protocol.
  // Geo data will work when deployed to HTTPS (Azure, GitHub Pages, etc.).
  return EMPTY_GEO;
}

// ---------- Read / Write Visitor Records ----------
function getVisitorRecords() {
  try {
    var data = localStorage.getItem(VISITOR_RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveVisitorRecords(records) {
  try {
    // Cap at MAX_VISITOR_RECORDS
    if (records.length > MAX_VISITOR_RECORDS) {
      records = records.slice(0, MAX_VISITOR_RECORDS);
    }
    localStorage.setItem(VISITOR_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving visitor records:', e);
  }
}

// ---------- Track Visit (fires on every page load) ----------
async function trackVisit() {
  var vid = getVisitorId();
  var ua = navigator.userAgent;
  var parsed = parseUA(ua);
  var path = window.location.pathname + window.location.hash;
  var referrer = document.referrer || '';
  var loggedUser = '';

  try {
    var userStr = sessionStorage.getItem('pt_user');
    if (userStr) {
      var user = JSON.parse(userStr);
      loggedUser = user.email || user.name || '';
    }
  } catch (e) { /* ignore */ }

  var geo = await lookupGeo();

  var records = getVisitorRecords();
  var existing = null;
  for (var i = 0; i < records.length; i++) {
    if (records[i].visitorId === vid) {
      existing = records[i];
      break;
    }
  }

  var now = new Date().toISOString();

  if (existing) {
    // Returning visitor — update
    existing.lastSeen = now;
    existing.visitCount = (existing.visitCount || 1) + 1;
    existing.ip = geo.ip || existing.ip;
    existing.device = parsed.device;
    existing.browser = parsed.browser;
    existing.os = parsed.os;
    existing.city = geo.city || existing.city;
    existing.region = geo.region || existing.region;
    existing.country = geo.country || existing.country;
    existing.timezone = geo.timezone || existing.timezone;
    existing.referrer = referrer || existing.referrer;
    // Add path to pages if not already there
    if (!existing.pages) existing.pages = [];
    if (existing.pages.indexOf(path) === -1) {
      existing.pages.push(path);
      if (existing.pages.length > 20) existing.pages = existing.pages.slice(-20);
    }
    if (loggedUser) existing.user = loggedUser;
  } else {
    // New visitor
    records.unshift({
      visitorId: vid,
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      timezone: geo.timezone,
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
      pages: [path],
      referrer: referrer,
      user: loggedUser,
      firstSeen: now,
      lastSeen: now,
      visitCount: 1
    });
  }

  saveVisitorRecords(records);
}

/* ============================================
   VISITOR DASHBOARD (admin page)
   ============================================ */

// ---------- Format Date ----------
function formatDate(isoString) {
  if (!isoString) return '-';
  var d = new Date(isoString);
  if (isNaN(d.getTime())) return '-';
  var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('en-IN', options);
}

// ---------- Toast Notification ----------
function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toastContainer');
  if (!container) return;

  // Cap at 3 visible toasts
  while (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<span class="toast-icon">' + (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️') + '</span><span class="toast-message">' + escapeHtml(message) + '</span>';
  container.appendChild(toast);

  setTimeout(function () { toast.classList.add('toast-show'); }, 10);

  setTimeout(function () {
    toast.classList.remove('toast-show');
    setTimeout(function () {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 400);
  }, 4000);
}

// ---------- Truncate Visitor ID for display ----------
function shortId(vid) {
  if (!vid) return '-';
  return vid.length > 16 ? vid.substring(0, 16) + '…' : vid;
}

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

  var elTotal = document.getElementById('kpiTotal');
  var elNewToday = document.getElementById('kpiNewToday');
  var elReturning = document.getElementById('kpiReturning');
  var elActive = document.getElementById('kpiActive');
  var elCountries = document.getElementById('kpiCountries');
  var elPages = document.getElementById('kpiPages');

  if (elTotal) elTotal.textContent = totalVisitors;
  if (elNewToday) elNewToday.textContent = newToday;
  if (elReturning) elReturning.textContent = returning;
  if (elActive) elActive.textContent = activeNow;
  if (elCountries) elCountries.textContent = Object.keys(countries).length;
  if (elPages) elPages.textContent = Object.keys(pages).length;
}

// ---------- Render Visitor Table ----------
function renderVisitorTable() {
  var tbody = document.getElementById('visitorTableBody');
  var emptyState = document.getElementById('emptyVisitorState');
  if (!tbody) return;

  var records = getVisitorRecords();
  var searchInput = document.getElementById('visitorSearch');
  var query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  tbody.innerHTML = '';

  var filtered = records;
  if (query) {
    filtered = records.filter(function (r) {
      var haystack = [
        r.ip, r.city, r.region, r.country, r.device, r.browser, r.os,
        (r.pages || []).join(' '), r.user, r.visitorId
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(function (r) {
    var tr = document.createElement('tr');

    var deviceInfo = r.device + ' · ' + r.browser + ' · ' + r.os;
    var pagesList = (r.pages || []).join(', ') || '-';
    var userLabel = r.user || '<span style="color:#999">anonymous</span>';

    tr.innerHTML =
      '<td><code class="vid-code" title="' + escapeHtml(r.visitorId) + '">' + escapeHtml(shortId(r.visitorId)) + '</code></td>' +
      '<td>' + escapeHtml(r.ip || '-') + '</td>' +
      '<td>' + escapeHtml(r.country || '-') + '</td>' +
      '<td>' + escapeHtml(r.region || '-') + '</td>' +
      '<td>' + escapeHtml(r.city || '-') + '</td>' +
      '<td><small>' + escapeHtml(deviceInfo) + '</small></td>' +
      '<td><small title="' + escapeHtml(pagesList) + '">' + escapeHtml(pagesList.length > 40 ? pagesList.substring(0, 40) + '…' : pagesList) + '</small></td>' +
      '<td>' + (r.visitCount || 1) + '</td>' +
      '<td><small>' + formatDate(r.firstSeen) + '</small></td>' +
      '<td><small>' + formatDate(r.lastSeen) + '</small></td>' +
      '<td>' + userLabel + '</td>';

    tbody.appendChild(tr);
  });
}

// ---------- Refresh ----------
function refreshVisitorData() {
  renderVisitorTable();
  updateKPIs();
  showToast('Visitor data refreshed.', 'info');
}

// ---------- Clear Log ----------
function clearVisitorLog() {
  if (confirm('Are you sure you want to clear all visitor records? This cannot be undone.')) {
    localStorage.removeItem(VISITOR_RECORDS_KEY);
    renderVisitorTable();
    updateKPIs();
    showToast('Visitor log cleared.', 'info');
  }
}

// ---------- Init Visitor Dashboard ----------
document.addEventListener('DOMContentLoaded', function () {
  // Only init dashboard if we're on the visitors page
  if (document.getElementById('visitorTableBody')) {
    renderVisitorTable();
    updateKPIs();
  }

  // Auto-track this page visit (fires on every page that loads main.js)
  if (typeof trackVisit === 'function') {
    trackVisit().catch(function () { /* fire-and-forget tracking */ });
  }
});
