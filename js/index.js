/* ============================================
   PRATAP TRAVELS - Index Page JavaScript
   ============================================ */

// ---------- Generate a unique referral code from name + phone ----------
async function generateReferralCode() {
  var nameInput = document.getElementById("referNameInput");
  var phoneInput = document.getElementById("referPhoneInput");
  var outputDiv = document.getElementById("referCodeOutput");
  var codeDisplay = document.getElementById("referCodeDisplay");

  if (!nameInput || !outputDiv || !codeDisplay) return;

  var name = nameInput.value.trim();
  var phone = phoneInput ? phoneInput.value.trim().replace(/\s/g, "") : "";

  if (!name) {
    nameInput.style.borderColor = "var(--danger)";
    nameInput.focus();
    return;
  }
  nameInput.style.borderColor = "";

  // Validate phone (required for self-referral prevention)
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    if (phoneInput) {
      phoneInput.style.borderColor = "var(--danger)";
      phoneInput.focus();
    }
    showToast("Please enter a valid 10-digit phone number", "error");
    return;
  }
  if (phoneInput) phoneInput.style.borderColor = "";

  // Check if code already exists for this phone
  var existing = _referralDataCache;
  var code;
  if (existing && existing.phone === phone) {
    code = existing.code;
  } else {
    var prefix = name.replace(/\s+/g, "").substring(0, 3).toUpperCase();
    var suffix = Math.floor(1000 + Math.random() * 9000);
    code = "PT" + prefix + suffix;
  }

  // Try to register with backend API (PratapTravels-Referral)
  var apiUrl = getReferralApiUrl();
  if (apiUrl) {
    try {
      var resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ name: name, phone: phone, code: code }),
      });

      if (resp.ok) {
        var data = await resp.json();
        if (data.success) {
          code = data.code;
        }
      }
    } catch (e) {
      console.warn("Referral API failed, using local generation:", e.message);
    }
  }

  // Store locally with phone for self-referral prevention
  var refData = {
    name: name,
    phone: phone,
    code: code,
    createdAt: new Date().toISOString(),
    totalReferrals:
      existing && existing.phone === phone ? existing.totalReferrals || 0 : 0,
    totalRewards:
      existing && existing.phone === phone ? existing.totalRewards || 0 : 0,
    rewardBalance:
      existing && existing.phone === phone ? existing.rewardBalance || 0 : 0,
  };
  _referralDataCache = refData;

  codeDisplay.textContent = code;
  outputDiv.classList.remove("hidden");
  showToast("Referral code generated!", "success");

  // Audit: referral code generated
  recordAuditTrail("referral_generate", {
    code: code,
    name: name,
    phone: phone,
  });
}

// ---------- Copy referral code to clipboard ----------

// ---------- Copy referral code to clipboard ----------
function copyReferralCode() {
  var codeDisplay = document.getElementById("referCodeDisplay");
  if (!codeDisplay) return;

  var code = codeDisplay.textContent;
  if (!code) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(function () {
      showToast("Referral code copied!", "success");
    });
  } else {
    // Fallback for older browsers
    var textArea = document.createElement("textarea");
    textArea.value = code;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("Referral code copied!", "success");
    } catch (err) {
      showToast("Failed to copy. Please copy manually.", "error");
    }
    document.body.removeChild(textArea);
  }
}

// ---------- Share referral on WhatsApp ----------

// ---------- Share referral on WhatsApp ----------
function shareReferralWhatsApp() {
  var refData = _referralDataCache;
  if (!refData || !refData.code) {
    showToast("Please generate a code first.", "error");
    return;
  }

  var lang = typeof I18N !== "undefined" ? I18N.getLanguage() : "hi";
  var bookLink =
    window.location.origin + "?ref=" + encodeURIComponent(refData.code);
  var msg;
  if (lang === "hi") {
    msg = "🚔 *PRATAP TRAVELS - रेफ़रल*\n\n";
    msg +=
      "नमस्ते! मैंने PRATAP TRAVELS की सेवाओं का उपयोग किया है और बहुत अच्छा अनुभव रहा।\n\n";
    msg += "🎁 मेरा रेफ़रल कोड: *" + refData.code + "*\n\n";
    msg +=
      "इस कोड का उपयोग करके अपनी पहली यात्रा बुक करें और ₹50 की छूट पाएँ!\n\n";
    msg += "📞 अभी बुक करें: " + bookLink;
  } else {
    msg = "🚔 *PRATAP TRAVELS - Referral*\n\n";
    msg +=
      "Hi! I've used PRATAP TRAVELS services and had a great experience.\n\n";
    msg += "🎁 My referral code: *" + refData.code + "*\n\n";
    msg += "Use this code on your first booking and get ₹50 off!\n\n";
    msg += "📞 Book now: " + bookLink;
  }

  var whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(whatsappUrl, "_blank");
  showToast("Opening WhatsApp...", "success");
}

// ---------- Load existing referral code on page ----------
document.addEventListener("DOMContentLoaded", async function () {
  var refData = _referralDataCache;
  if (refData && refData.code) {
    var nameInput = document.getElementById("referNameInput");
    var phoneInput = document.getElementById("referPhoneInput");
    var outputDiv = document.getElementById("referCodeOutput");
    var codeDisplay = document.getElementById("referCodeDisplay");
    if (nameInput) nameInput.value = refData.name;
    if (phoneInput && refData.phone) phoneInput.value = refData.phone;
    if (codeDisplay) codeDisplay.textContent = refData.code;
    if (outputDiv) outputDiv.classList.remove("hidden");

    // Fetch latest stats from backend
    await fetchReferralStats();

    // Update stats display if elements exist
    updateReferralStatsDisplay();
  }
});

// ---------- Update referral stats display ----------

function getGoogleMapsUrl(destination) {
  var dest = ROUTE_MAP_DATA[destination] || destination;
  return 'https://www.google.com/maps/dir/Deoghar,+Jharkhand+India/' + encodeURIComponent(dest);
}

function initGoogleMapsLinks() {
  var routeRows = document.querySelectorAll('#routesBody tr');
  routeRows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length > 1) {
      var routeText = cells[1].textContent.trim();
      var match = routeText.match(/→\s*(.+?)(?:\s*$|\s*POPULAR)/);
      if (match) {
        var dest = match[1].trim();
        var mapsUrl = getGoogleMapsUrl(dest);
        var mapLink = document.createElement('a');
        mapLink.href = mapsUrl;
        mapLink.target = '_blank';
        mapLink.rel = 'noopener';
        mapLink.className = 'route-map-link';
        mapLink.title = 'Open route in Google Maps';
        mapLink.innerHTML = '\ud83d\uddfa\ufe0f';
        cells[1].insertBefore(mapLink, cells[1].firstChild);
      }
    }
  });
}

/* ============================================
   FEATURE: Price Calculator
   ============================================ */

var ROUTE_PRICES = {
  'Basukinath': { base: 1200, max: 1500, distance: 43 },
  'Tarapith': { base: 2800, max: 3200, distance: 110 },
  'Sultanganj': { base: 3500, max: 4000, distance: 150 },
  'Ranchi': { base: 5500, max: 6500, distance: 250 },
  'Patna': { base: 5000, max: 6000, distance: 220 },
  'Kolkata': { base: 6500, max: 7500, distance: 280 },
  'Dumka': { base: 1800, max: 2200, distance: 65 },
  'Dhanbad': { base: 3500, max: 4000, distance: 150 },
  'Munger': { base: 4000, max: 4500, distance: 170 },
  'Muzaffarpur': { base: 5000, max: 5500, distance: 220 },
  'AIIMS Deoghar': { base: 500, max: 700, distance: 10 },
  'Waterpark': { base: 600, max: 800, distance: 15 },
  'Sarath': { base: 800, max: 1000, distance: 25 },
  'Madhupur': { base: 800, max: 1000, distance: 25 },
  'Jamtara': { base: 1500, max: 1800, distance: 50 },
  'Budhai': { base: 1000, max: 1200, distance: 30 }
};

var VEHICLE_MULTIPLIERS = {
  'sedan': 1.0,
  'hatchback': 0.85,
  'suv': 1.3,
  'innova': 1.5,
  'tempo': 2.0
};

var TRIP_MULTIPLIERS = {
  'one-way': 1.0,
  'round-trip': 1.8,
  'full-day': 2.2,
  'rental': 2.5
};

function calculateEstimatedPrice() {
  var routeSelect = document.getElementById('calcRoute');
  var vehicleSelect = document.getElementById('calcVehicle');
  var tripSelect = document.getElementById('calcTrip');
  var resultDiv = document.getElementById('calcResult');
  if (!routeSelect || !vehicleSelect || !tripSelect || !resultDiv) return;
  var route = routeSelect.value;
  var vehicle = vehicleSelect.value;
  var trip = tripSelect.value;
  var customDiv = document.getElementById('calcCustomRoute');
  if (customDiv) {
    customDiv.classList.toggle('hidden', route !== 'other');
  }
  if (!route) {
    resultDiv.innerHTML = '<p class="calc-placeholder">\ud83d\udccd Select a route to see estimated fare</p>';
    return;
  }
  var routeData, distance;
  if (route === 'other') {
    var cd = parseFloat((document.getElementById('calcCustomDistance') || {}).value) || 0;
    if (!cd || cd < 1) {
      resultDiv.innerHTML = '<p class="calc-placeholder">Please enter distance in km</p>';
      return;
    }
    distance = cd;
    routeData = { base: Math.round(cd * 12), max: Math.round(cd * 14.4), distance: cd };
  } else {
    routeData = ROUTE_PRICES[route];
    distance = routeData.distance;
  }
  var vehicleMult = VEHICLE_MULTIPLIERS[vehicle] || 1.0;
  var tripMult = TRIP_MULTIPLIERS[trip] || 1.0;
  var minPrice = Math.round(routeData.base * vehicleMult * tripMult);
  var maxPrice = Math.round(routeData.max * vehicleMult * tripMult);
  resultDiv.innerHTML =
    '<div class="calc-result-content">' +
    '<div class="calc-price-range">\u20b9' + minPrice.toLocaleString() + ' \u2013 \u20b9' + maxPrice.toLocaleString() + '</div>' +
    '<div class="calc-details">' +
    '<span>\ud83d\udccd ' + distance + ' km</span>' +
    '<span>\ud83d\ude97 ' + vehicleSelect.options[vehicleSelect.selectedIndex].text + '</span>' +
    '<span>\ud83d\udd04 ' + tripSelect.options[tripSelect.selectedIndex].text + '</span>' +
    '</div>' +
    '<p class="calc-note">*Estimated fare. Actual price may vary based on tolls, parking, and seasonal demand.</p>' +
    '<button class="btn btn-primary" onclick="openBookingModal()" style="margin-top:12px;">\ud83d\udcde Book Now</button>' +
    '</div>';
}

/* ============================================
   FEATURE: Booking Status Tracker
   ============================================ */

// ---------- Toggle Chatbot Panel ----------
function toggleChatbot() {
  var panel = document.getElementById('chatbotPanel');
  var fab = document.getElementById('chatbotFab');
  if (!panel) return;
  var isOpen = !panel.classList.contains('hidden');
  if (isOpen) {
    panel.classList.add('hidden');
    if (fab) fab.style.display = '';
  } else {
    panel.classList.remove('hidden');
    if (fab) fab.style.display = 'none';
    // Lazy load Google Maps API on first open
    if (typeof loadGoogleMapsApi === 'function') loadGoogleMapsApi();
  }
}

// ---------- Initialize Places Autocomplete ----------

// ---------- Initialize Places Autocomplete ----------
function __initChatbotPlaces() {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.warn('[Chatbot] Google Maps Places API not available');
    return;
  }
  var fromInput = document.getElementById('chatFrom');
  var toInput = document.getElementById('chatTo');
  var indiaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(6.5, 68.0),   // SW corner of India
    new google.maps.LatLng(35.5, 97.5)   // NE corner of India
  );
  var options = {
    componentRestrictions: { country: 'in' },
    bounds: indiaBounds,
    fields: ['formatted_address', 'geometry', 'name']
  };
  if (fromInput) {
    _chatFromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
    _chatFromAutocomplete.addListener('place_changed', function() {
      var place = _chatFromAutocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        _chatFromCoords = place.geometry.location;
      }
    });
  }
  if (toInput) {
    _chatToAutocomplete = new google.maps.places.Autocomplete(toInput, options);
    _chatToAutocomplete.addListener('place_changed', function() {
      var place = _chatToAutocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        _chatToCoords = place.geometry.location;
      }
    });
  }
  // Also initialize booking form location autocomplete
  _initBookingFormAutocomplete(options);
}

// ---------- Booking Form Location Autocomplete ----------
var _bookFromAutocomplete = null;
var _bookToAutocomplete = null;

function _initBookingFormAutocomplete(options) {
  var fromInput = document.getElementById('bookFromLocation');
  var toInput = document.getElementById('bookToLocation');
  var indiaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(6.5, 68.0),
    new google.maps.LatLng(35.5, 97.5)
  );
  var opts = options || {
    componentRestrictions: { country: 'in' },
    bounds: indiaBounds,
    fields: ['formatted_address', 'geometry', 'name']
  };
  if (fromInput && !_bookFromAutocomplete) {
    _bookFromAutocomplete = new google.maps.places.Autocomplete(fromInput, opts);
  }
  if (toInput && !_bookToAutocomplete) {
    _bookToAutocomplete = new google.maps.places.Autocomplete(toInput, opts);
  }
  // Auto-populate from/to when route dropdown changes
  var routeSelect = document.getElementById('bookRoute');
  if (routeSelect && !routeSelect._autoFromToInit) {
    routeSelect._autoFromToInit = true;
    routeSelect.addEventListener('change', function() {
      var val = routeSelect.value;
      if (!val || val === 'Other') return;
      // Default: from = Deoghar, to = selected destination
      var fi = document.getElementById('bookFromLocation');
      var ti = document.getElementById('bookToLocation');
      if (fi && !fi.value) fi.value = 'Deoghar, Jharkhand, India';
      if (ti && !ti.value) ti.value = val + ', India';
    });
  }
}

// Lazy-load Google Maps if not yet loaded, then init booking autocomplete
function _ensureGoogleMapsForBooking() {
  if (typeof google !== 'undefined' && google.maps && google.maps.places) {
    _initBookingFormAutocomplete();
    return;
  }
  if (typeof loadGoogleMapsApi === 'function' && !_googleMapsLoaded) {
    loadGoogleMapsApi();
  }
  // Poll until loaded
  var attempts = 0;
  var check = setInterval(function() {
    attempts++;
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      clearInterval(check);
      _initBookingFormAutocomplete();
    } else if (attempts > 50) {
      clearInterval(check);
      console.warn('[Booking] Google Maps Places API did not load for booking form autocomplete');
    }
  }, 200);
}

// ---------- Calculate Fare via Distance Matrix ----------

// ---------- Calculate Fare via Distance Matrix ----------
function calculateChatFare() {
  var fromInput = document.getElementById('chatFrom');
  var toInput = document.getElementById('chatTo');
  var vehicleSelect = document.getElementById('chatVehicle');
  var tripSelect = document.getElementById('chatTrip');
  var resultDiv = document.getElementById('chatResult');
  var fareResult = document.getElementById('chatFareResult');
  var calcBtn = document.getElementById('chatCalcBtn');

  if (!fromInput || !toInput || !resultDiv || !fareResult) return;

  var fromText = fromInput.value.trim();
  var toText = toInput.value.trim();

  if (!fromText || !toText) {
    showToast(typeof I18N !== 'undefined' ? I18N.t('chatbot.error.fillBoth') : 'Please enter both locations', 'error');
    return;
  }

  var vehicleType = vehicleSelect ? vehicleSelect.value : 'sedan';
  var tripType = tripSelect ? tripSelect.value : 'one-way';

  // Show loading
  resultDiv.classList.remove('hidden');
  fareResult.innerHTML = '<div class="chatbot-loading">⏳ <span>' + (typeof I18N !== 'undefined' ? I18N.t('chatbot.calculating') : 'Calculating distance & fare...') + '</span></div>';
  if (calcBtn) { calcBtn.disabled = true; }

  // Try Google Maps Distance Matrix
  if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
    var service = new google.maps.DistanceMatrixService();
    var origins = _chatFromCoords ? [_chatFromCoords] : [fromText];
    var destinations = _chatToCoords ? [_chatToCoords] : [toText];

    service.getDistanceMatrix(
      {
        origins: origins,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      },
      function(response, status) {
        if (calcBtn) { calcBtn.disabled = false; }
        if (status === 'OK' && response.rows[0] && response.rows[0].elements[0]) {
          var element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            var distanceMeters = element.distance.value;
            var distanceKm = distanceMeters / 1000;
            var duration = element.duration.text;
            var distanceText = element.distance.text;
            displayChatFare(distanceKm, distanceText, duration, vehicleType, tripType);
            return;
          }
        }
        // Fallback: geocode-based estimate
        calculateChatFareFallback(fromText, toText, vehicleType, tripType, calcBtn);
      }
    );
  } else {
    // Google Maps not loaded - use fallback
    calculateChatFareFallback(fromText, toText, vehicleType, tripType, calcBtn);
  }
}

// ---------- Fallback: Haversine distance estimation ----------

// ---------- Fallback: Haversine distance estimation ----------
function calculateChatFareFallback(fromText, toText, vehicleType, tripType, calcBtn) {
  // Try geocoding both locations
  if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
    var geocoder = new google.maps.Geocoder();
    var fromCoords = null;
    var toCoords = null;
    var done = 0;

    function checkDone() {
      done++;
      if (done < 2) return;
      if (fromCoords && toCoords) {
        var dist = haversineDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
        displayChatFare(dist, dist.toFixed(0) + ' km (est.)', '~' + Math.round(dist / 40 * 60) + ' mins (est.)', vehicleType, tripType);
      } else {
        displayChatFareFallback(vehicleType, tripType);
      }
      if (calcBtn) calcBtn.disabled = false;
    }

    geocoder.geocode({ address: fromText + ', India' }, function(results, status) {
      if (status === 'OK' && results[0]) fromCoords = results[0].geometry.location.toJSON();
      checkDone();
    });
    geocoder.geocode({ address: toText + ', India' }, function(results, status) {
      if (status === 'OK' && results[0]) toCoords = results[0].geometry.location.toJSON();
      checkDone();
    });
  } else {
    displayChatFareFallback(vehicleType, tripType);
    if (calcBtn) calcBtn.disabled = false;
  }
}

// ---------- Haversine formula ----------

// ---------- Haversine formula ----------
function haversineDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ---------- Display fare result ----------

// ---------- Display fare result ----------
function displayChatFare(distanceKm, distanceText, duration, vehicleType, tripType) {
  var fareResult = document.getElementById('chatFareResult');
  if (!fareResult) return;

  // Get fare config
  var cfg = (typeof PT_CONFIG !== 'undefined' && PT_CONFIG.FARE_CONFIG) ? PT_CONFIG.FARE_CONFIG : {};
  var baseFare = cfg.baseFare || 150;
  var perKm = cfg.perKmRate || 12;
  var minFare = cfg.minimumFare || 300;
  var vehicleMults = cfg.vehicleMultipliers || { sedan: 1.0, hatchback: 0.85, suv: 1.3, innova: 1.5, tempo: 2.0 };
  var tripMults = cfg.tripMultipliers || { 'one-way': 1.0, 'round-trip': 1.8, 'full-day': 2.2, 'rental': 2.5 };

  var vMult = vehicleMults[vehicleType] || 1.0;
  var tMult = tripMults[tripType] || 1.0;
  var rawFare = (baseFare + (distanceKm * perKm)) * vMult * tMult;
  var minTripFare = minFare * vMult * tMult;
  var fare = Math.max(rawFare, minTripFare);
  var lowFare = Math.round(fare * 0.85 / 10) * 10;
  var highFare = Math.round(fare * 1.15 / 10) * 10;

  var lang = typeof I18N !== 'undefined' ? I18N.getLanguage() : 'hi';
  var vehicleLabels = {
    sedan: lang === 'hi' ? 'सेडान (Swift Dzire)' : 'Sedan (Swift Dzire)',
    hatchback: lang === 'hi' ? 'हैचबैक (Celerio)' : 'Hatchback (Celerio)',
    suv: lang === 'hi' ? 'SUV (Brezza/XUV)' : 'SUV (Brezza/XUV)',
    innova: lang === 'hi' ? 'इनोवा / अर्टिगा' : 'Innova / Ertiga',
    tempo: lang === 'hi' ? 'टेम्पो ट्रैवलर' : 'Tempo Traveller'
  };
  var tripLabels = {
    'one-way': lang === 'hi' ? 'एक तरफ़ा' : 'One Way',
    'round-trip': lang === 'hi' ? 'राउंड ट्रिप' : 'Round Trip',
    'full-day': lang === 'hi' ? 'पूरा दिन' : 'Full Day',
    'rental': lang === 'hi' ? 'किराया' : 'Rental'
  };

  fareResult.innerHTML = '<div class="chat-fare-price">₹' + lowFare.toLocaleString('en-IN') + ' – ₹' + highFare.toLocaleString('en-IN') + '</div>' +
    '<hr class="chat-fare-divider">' +
    '<div class="chat-fare-detail"><span>' + (lang === 'hi' ? '📏 दूरी' : '📏 Distance') + '</span><span>' + escapeHtml(distanceText) + '</span></div>' +
    '<div class="chat-fare-detail"><span>' + (lang === 'hi' ? '⏱️ समय' : '⏱️ Duration') + '</span><span>' + escapeHtml(duration) + '</span></div>' +
    '<div class="chat-fare-detail"><span>' + (lang === 'hi' ? '🚗 वाहन' : '🚗 Vehicle') + '</span><span>' + escapeHtml(vehicleLabels[vehicleType] || vehicleType) + '</span></div>' +
    '<div class="chat-fare-detail"><span>' + (lang === 'hi' ? '🔄 ट्रिप' : '🔄 Trip') + '</span><span>' + escapeHtml(tripLabels[tripType] || tripType) + '</span></div>' +
    '<hr class="chat-fare-divider">' +
    '<div class="chat-fare-note">*' + (lang === 'hi' ? 'अनुमानित किराया। वास्तविक कीमत टोल, पार्किंग और माँग के अनुसार बदल सकती है।' : 'Estimated fare. Actual price may vary based on tolls, parking, and demand.') + '</div>' +
    '<button class="chat-fare-book-btn" onclick="openBookingFromChatbot();">' + (lang === 'hi' ? '📞 अभी बुक करें' : '📞 Book Now') + '</button>';
  resultDiv.classList.remove('hidden');
  refreshLucideIcons();
}

// ---------- Fallback when geocoding fails ----------

// ---------- Fallback when geocoding fails ----------
function displayChatFareFallback(vehicleType, tripType) {
  var fareResult = document.getElementById('chatFareResult');
  if (!fareResult) return;
  var lang = typeof I18N !== 'undefined' ? I18N.getLanguage() : 'hi';
  fareResult.innerHTML = '<div style="padding:8px 0;font-size:0.88rem;">' + (lang === 'hi' ? '⚠️ दूरी की गणना नहीं हो सकी। कृपया स्थान का नाम स्पष्ट रूप से दर्ज करें (जैसे: Deoghar, Ranchi, Patna)।<br><br>या आप <a href="#calculator" onclick="toggleChatbot();" style="color:var(--accent);font-weight:600;">मूल कैलकुलेटर</a> का उपयोग कर सकते हैं।' : '⚠️ Could not calculate distance. Please enter a clear location name (e.g., Deoghar, Ranchi, Patna).<br><br>Or you can use the <a href="#calculator" onclick="toggleChatbot();" style="color:var(--accent);font-weight:600;">basic calculator</a>.') + '</div>';
}

/* ============================================
   CHATBOT: Clear Result, FAQ, and Book Now Data Copy
   ============================================ */

// ---------- Clear Chat Result ----------

// ---------- Clear Chat Result ----------
function clearChatResult() {
  var resultDiv = document.getElementById('chatResult');
  var fareResult = document.getElementById('chatFareResult');
  if (resultDiv) resultDiv.classList.add('hidden');
  if (fareResult) fareResult.innerHTML = '';
  // Reset input fields
  var fromInput = document.getElementById('chatFrom');
  var toInput = document.getElementById('chatTo');
  if (fromInput) fromInput.value = '';
  if (toInput) toInput.value = '';
  _chatFromCoords = null;
  _chatToCoords = null;
}

// ---------- Book Now with Data Copy ----------

// ---------- Book Now with Data Copy ----------
function openBookingFromChatbot() {
  var fromInput = document.getElementById('chatFrom');
  var toInput = document.getElementById('chatTo');
  var vehicleSelect = document.getElementById('chatVehicle');
  var tripSelect = document.getElementById('chatTrip');

  var fromText = fromInput ? fromInput.value.trim() : '';
  var toText = toInput ? toInput.value.trim() : '';
  var vehicleType = vehicleSelect ? vehicleSelect.value : '';
  var tripType = tripSelect ? tripSelect.value : '';

  // Close chatbot and open booking modal
  toggleChatbot();
  setTimeout(function() {
    openBookingModal();
    // Pre-fill the booking route dropdown if a match exists
    var routeSelect = document.getElementById('bookRoute');
    if (routeSelect && fromText && toText) {
      var routeText = fromText + ' to ' + toText;
      // Try to find matching route option
      for (var i = 0; i < routeSelect.options.length; i++) {
        var opt = routeSelect.options[i];
        if (opt.value && routeText.toLowerCase().indexOf(opt.value.toLowerCase()) !== -1) {
          routeSelect.value = opt.value;
          break;
        }
      }
      // If no match, set to 'Other'
      var matched = false;
      for (var i = 0; i < routeSelect.options.length; i++) {
        if (routeSelect.options[i].value === routeSelect.value) { matched = true; break; }
      }
      if (!matched) routeSelect.value = 'Other';
    }
    // Pre-fill from/to location fields
    var fromLocInput = document.getElementById('bookFromLocation');
    var toLocInput = document.getElementById('bookToLocation');
    if (fromLocInput && fromText) fromLocInput.value = fromText;
    if (toLocInput && toText) toLocInput.value = toText;
    // Pre-fill trip type
    var typeSelect = document.getElementById('bookType');
    if (typeSelect && tripType) {
      for (var i = 0; i < typeSelect.options.length; i++) {
        if (typeSelect.options[i].value === tripType) {
          typeSelect.value = tripType;
          break;
        }
      }
    }
    // Add route details to remarks
    var remarksField = document.getElementById('bookRemarks');
    if (remarksField && (fromText || toText)) {
      var existing = remarksField.value.trim();
      var routeInfo = 'Pickup: ' + (fromText || 'N/A') + ' | Drop: ' + (toText || 'N/A');
      if (vehicleType) routeInfo += ' | Vehicle: ' + vehicleType;
      remarksField.value = existing ? existing + '\n' + routeInfo : routeInfo;
    }
  }, 300);
}

// ---------- FAQ Handler ----------

// ---------- FAQ Handler ----------
function handleChatFaq(topic) {
  var resultDiv = document.getElementById('chatResult');
  var fareResult = document.getElementById('chatFareResult');
  if (!resultDiv || !fareResult) return;

  var lang = typeof I18N !== 'undefined' ? I18N.getLanguage() : 'hi';
  var responses = {
    vehicles: {
      hi: '<strong>हमारे उपलब्ध वाहन:</strong><br>🚗 <strong>Sedan</strong> - Swift Dzire (4 सीटर)<br>🚗 <strong>Hatchback</strong> - Celerio (4 सीटर)<br>🚙 <strong>SUV</strong> - Brezza/XUV (6 सीटर)<br>🚐 <strong>Innova/Ertiga</strong> (7 सीटर)<br>🚌 <strong>Tempo Traveller</strong> (12-20 सीटर)<br><br>ऊपर कैलकुलेटर में वाहन चुनकर किराया देखें! 💰',
      en: '<strong>Our Available Vehicles:</strong><br>🚗 <strong>Sedan</strong> - Swift Dzire (4 seater)<br>🚗 <strong>Hatchback</strong> - Celerio (4 seater)<br>🚙 <strong>SUV</strong> - Brezza/XUV (6 seater)<br>🚐 <strong>Innova/Ertiga</strong> (7 seater)<br>🚌 <strong>Tempo Traveller</strong> (12-20 seater)<br><br>Use the calculator above to check fares! 💰'
    },
    booking: {
      hi: '<strong>बुकिंग कैसे करें:</strong><br>1️⃣ ऊपर <strong>From/To</strong> लोकेशन भरें<br>2️⃣ वाहन और ट्रिप टाइप चुनें<br>3️⃣ <strong>"किराया जानें"</strong> बटन दबाएँ<br>4️⃣ <strong>"अभी बुक करें"</strong> पर क्लिक करें<br>5️⃣ फ़ॉर्म भरकर सबमिट करें<br><br>📞 या सीधे कॉल करें: <strong>+91 79911 82086</strong>',
      en: '<strong>How to Book:</strong><br>1️⃣ Enter <strong>From/To</strong> locations above<br>2️⃣ Select vehicle and trip type<br>3️⃣ Click <strong>"Get Fare"</strong> button<br>4️⃣ Click <strong>"Book Now"</strong><br>5️⃣ Fill the form and submit<br><br>📞 Or call directly: <strong>+91 79911 82086</strong>'
    },
    payment: {
      hi: '<strong>भुगतान के तरीके:</strong><br>💵 <strong>Cash</strong> - यात्रा के अंत में<br>📱 <strong>UPI</strong> - Google Pay / PhonePe / Paytm<br>💳 <strong>Online Transfer</strong> - बैंक ट्रांसफर<br><br>⚠️ एडवांस भुगतान आवश्यक नहीं है। यात्रा पूरी होने के बाद भुगतान करें।',
      en: '<strong>Payment Methods:</strong><br>💵 <strong>Cash</strong> - Pay at end of trip<br>📱 <strong>UPI</strong> - Google Pay / PhonePe / Paytm<br>💳 <strong>Online Transfer</strong> - Bank transfer<br><br>⚠️ No advance payment required. Pay after trip completion.'
    },
    cancellation: {
      hi: '<strong>कैंसलेशन पॉलिसी:</strong><br>✅ <strong>24 घंटे पहले:</strong> मुफ़्त कैंसलेशन<br>⚠️ <strong>12-24 घंटे पहले:</strong> 25% शुल्क<br>❌ <strong>12 घंटे के अंदर:</strong> 50% शुल्क<br><br>📞 कैंसल करने के लिए कॉल करें: <strong>+91 79911 82086</strong>',
      en: '<strong>Cancellation Policy:</strong><br>✅ <strong>24+ hours before:</strong> Free cancellation<br>⚠️ <strong>12-24 hours before:</strong> 25% charge<br>❌ <strong>Within 12 hours:</strong> 50% charge<br><br>📞 To cancel, call: <strong>+91 79911 82086</strong>'
    },
    contact: {
      hi: '<strong>संपर्क करें:</strong><br>📞 <strong>Phone:</strong> +91 79911 82086 / +91 87978 71251<br>💬 <strong>WhatsApp:</strong> +91 79911 82086<br>📍 <strong>Address:</strong> Belabagan, Deoghar, Jharkhand<br>🕐 <strong>समय:</strong> सुबह 6:00 - रात 10:00<br><br>🌐 <strong>Website:</strong> ' + window.location.origin,
      en: '<strong>Contact Us:</strong><br>📞 <strong>Phone:</strong> +91 79911 82086 / +91 87978 71251<br>💬 <strong>WhatsApp:</strong> +91 79911 82086<br>📍 <strong>Address:</strong> Belabagan, Deoghar, Jharkhand<br>🕐 <strong>Hours:</strong> 6:00 AM - 10:00 PM<br><br>🌐 <strong>Website:</strong> ' + window.location.origin
    }
  };

  var response = responses[topic];
  if (!response) return;
  var text = response[lang] || response.hi;

  fareResult.innerHTML = '<div style="font-size:0.88rem;line-height:1.6;">' + text + '</div>';
  resultDiv.classList.remove('hidden');
}

/* ============================================
   FEATURE: Revenue Dashboard
   ============================================ */

// ---------- Open Booking Modal (called from onclick handlers) ----------
function openBookingModal() {
  var modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    // Pre-fill referral code from URL if present
    var urlParams = new URLSearchParams(window.location.search);
    var refCode = urlParams.get("ref");
    if (refCode) {
      var refInput = document.getElementById("bookReferral");
      if (refInput) refInput.value = refCode;
    }
    // Initialize Google Places autocomplete for booking form fields
    _ensureGoogleMapsForBooking();
  }
}

/* ============================================
   REFERRAL SYSTEM
   Generate, share, and track referral codes
   ============================================ */

var PT_REFER_KEY = "pt_referral";
var PT_REFER_STATS_KEY = "pt_referral_stats";
var PT_LOCAL_REDEMPTIONS_KEY = "pt_local_redemptions";
var PT_BOOKINGS_KEY = "pt_bookings";
var PT_AUDIT_KEY = "pt_audit_trail";

// ---------- In-memory cache (replaces localStorage for data storage) ----------
var _bookingsCache = [];
var _auditCache = [];
var _vehiclesCache = [];
var _visitorRecordsCache = [];
var _referralDataCache = null;
var _allReferralsCache = [];
var _redemptionsCache = {};
var _localRedemptionsCache = [];

// ---------- Get Referral API URL ----------

// ---------- File Upload ----------
function handleFileUpload(event) {
  var files = event.target.files;
  if (files.length > 0) {
    displayUploadedFiles(files);
  }
}

function displayUploadedFiles(files) {
  var container = document.getElementById("uploadedFiles");
  if (!container) return;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var div = document.createElement("div");
    div.style.cssText =
      "display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f0f7ff;border-radius:8px;margin-bottom:8px;font-size:0.9rem;";
    div.innerHTML =
      "<span>📎</span><span>" +
      escapeHtml(file.name) +
      '</span><span style="margin-left:auto;color:#27ae60;font-weight:700;">✓ Uploaded</span>';
    container.appendChild(div);
  }
}

// ---------- Reset Booking Form ----------
function resetBookingForm() {
  var form = document.getElementById("bookingForm");
  var success = document.getElementById("bookingSuccess");
  if (form && success) {
    form.reset();
    form.classList.remove("hidden");
    success.classList.add("hidden");
    // Clear from/to location autocomplete fields
    var fi = document.getElementById('bookFromLocation');
    var ti = document.getElementById('bookToLocation');
    if (fi) fi.value = '';
    if (ti) ti.value = '';
    var errors = form.querySelectorAll(".form-error");
    errors.forEach(function (el) {
      el.textContent = "";
    });
    var errorInputs = form.querySelectorAll(".error");
    errorInputs.forEach(function (el) {
      el.classList.remove("error");
    });
  }
  var modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

/* ============================================
   VISITOR TRACKING (Azure Function API)
   Same data structure & logic as gautam958web.in
   ============================================ */

var PT_VISITOR_ID_KEY = "pt_vid";
var VISITOR_RECORDS_KEY = "pt_visitor_records";
var MAX_VISITOR_RECORDS = 5000;

// ---------- Stable Visitor ID ----------
