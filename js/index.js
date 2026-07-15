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



/* ============================================
   FEATURE: Booking Status Tracker
   ============================================ */

// ---------- Lazy-load Google Maps & Toggle Chatbot ----------
function initChatbotMapAndToggle() {
  if (!_googleMapsLoaded && typeof loadGoogleMapsApi === 'function') {
    loadGoogleMapsApi();
  }
  toggleChatbot();
}

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
    console.warn('[Places] Google Maps Places API not available');
    return;
  }
  var indiaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(6.5, 68.0),
    new google.maps.LatLng(35.5, 97.5)
  );
  var options = {
    componentRestrictions: { country: 'in' },
    bounds: indiaBounds,
    fields: ['formatted_address', 'geometry', 'name']
  };
  // Initialize autocomplete on calculator section inputs
  var calcFromInput = document.getElementById('calcFrom');
  var calcToInput = document.getElementById('calcTo');
  try {
    if (calcFromInput && !_calcFromAutocomplete) {
      _calcFromAutocomplete = new google.maps.places.Autocomplete(calcFromInput, options);
      _calcFromAutocomplete.addListener('place_changed', function() {
        var place = _calcFromAutocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          _calcFromCoords = place.geometry.location;
        }
      });
    }
    if (calcToInput && !_calcToAutocomplete) {
      _calcToAutocomplete = new google.maps.places.Autocomplete(calcToInput, options);
      _calcToAutocomplete.addListener('place_changed', function() {
        var place = _calcToAutocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          _calcToCoords = place.geometry.location;
        }
      });
    }
    // Also initialize booking form location autocomplete
    _initBookingFormAutocomplete(options);
  } catch (err) {
    console.error('[Places] Failed to initialize Google Places Autocomplete:', err);
  }
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
  try {
    if (fromInput && !_bookFromAutocomplete) {
      _bookFromAutocomplete = new google.maps.places.Autocomplete(fromInput, opts);
      _bookFromAutocomplete.addListener('place_changed', function() {
        fromInput._autocompleteSelectActive = true;
        _autoCalcBookingFare();
        // Reset flag after a short delay to allow input event to settle
        setTimeout(function() { fromInput._autocompleteSelectActive = false; }, 500);
      });
    }
    if (toInput && !_bookToAutocomplete) {
      _bookToAutocomplete = new google.maps.places.Autocomplete(toInput, opts);
      _bookToAutocomplete.addListener('place_changed', function() {
        toInput._autocompleteSelectActive = true;
        _autoCalcBookingFare();
        // Reset flag after a short delay to allow input event to settle
        setTimeout(function() { toInput._autocompleteSelectActive = false; }, 500);
      });
    }
  } catch (err) {
    console.error('[Places] Failed to initialize booking autocomplete:', err);
  }
  // Also trigger on manual input changes (debounced)
  // Skip if autocomplete just placed a value to avoid double-trigger
  if (fromInput && !fromInput._inputListenerAdded) {
    fromInput._inputListenerAdded = true;
    var debounceTimer = null;
    fromInput.addEventListener('input', function() {
      if (fromInput._autocompleteSelectActive) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() { _autoCalcBookingFare(); }, 1500);
    });
  }
  if (toInput && !toInput._inputListenerAdded) {
    toInput._inputListenerAdded = true;
    var debounceTimer2 = null;
    toInput.addEventListener('input', function() {
      if (toInput._autocompleteSelectActive) return;
      clearTimeout(debounceTimer2);
      debounceTimer2 = setTimeout(function() { _autoCalcBookingFare(); }, 1500);
    });
  }
  // Recalculate fare when trip type changes
  var typeSelect = document.getElementById('bookType');
  if (typeSelect && !typeSelect._tripTypeListenerAdded) {
    typeSelect._tripTypeListenerAdded = true;
    typeSelect.addEventListener('change', function() {
      _autoCalcBookingFare();
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
}// ---------- Auto-Calculate Fare in Booking Modal ----------
var _bookingFareData = null; // { distanceKm, distanceText, duration, fare, lowFare, highFare }

function _autoCalcBookingFare() {
  var fromInput = document.getElementById('bookFromLocation');
  var toInput = document.getElementById('bookToLocation');
  var typeSelect = document.getElementById('bookType');
  var vehicleSelect = document.getElementById('bookVehicleType');
  var summaryDiv = document.getElementById('bookingFareSummary');
  if (!fromInput || !toInput || !summaryDiv) return;

  var fromText = fromInput.value.trim();
  var toText = toInput.value.trim();
  var tripType = typeSelect ? typeSelect.value : '';
  var vehicleType = vehicleSelect ? vehicleSelect.value : '';

  // Need all 4 fields to calculate fare
  if (!fromText || !toText || !tripType || !vehicleType) {
    summaryDiv.classList.remove('hidden');
    var missingFields = [];
    if (!tripType) missingFields.push(typeof I18N !== 'undefined' ? I18N.t('modal.type') : 'Trip Type');
    if (!vehicleType) missingFields.push(typeof I18N !== 'undefined' ? I18N.t('modal.vehicleType') : 'Vehicle Type');
    if (!fromText) missingFields.push('From Location');
    if (!toText) missingFields.push('To Location');
    document.getElementById('bookingTotalKM').textContent = '—';
    document.getElementById('bookingDuration').textContent = '—';
    document.getElementById('bookingEstPrice').innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem;">⚠️ Please select: ' + escapeHtml(missingFields.join(', ')) + '</span>';
    _bookingFareData = null;
    return;
  }

  // Show loading state
  summaryDiv.classList.remove('hidden');
  document.getElementById('bookingTotalKM').textContent = '⏳';
  document.getElementById('bookingDuration').textContent = '⏳';
  document.getElementById('bookingEstPrice').textContent = '⏳';

  // Use Distance Matrix if available
  if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
    try {
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [fromText],
          destinations: [toText],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        },
        function(response, status) {
          if (status === 'OK' && response.rows[0] && response.rows[0].elements[0]) {
            var element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              var distanceKm = element.distance.value / 1000;
              _computeAndDisplayBookingFare(distanceKm, element.distance.text, element.duration.text);
              return;
            }
          }
          _autoCalcBookingFareFallback(fromText, toText);
        }
      );
    } catch (err) {
      console.error('[FareCalc] Distance Matrix error:', err);
      _autoCalcBookingFareFallback(fromText, toText);
    }
  } else {
    _autoCalcBookingFareFallback(fromText, toText);
  }
}

function _autoCalcBookingFareFallback(fromText, toText) {
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
        _computeAndDisplayBookingFare(dist, dist.toFixed(0) + ' km', '~' + Math.round(dist / 40 * 60) + ' mins');
      } else {
        document.getElementById('bookingFareSummary').classList.add('hidden');
        _bookingFareData = null;
      }
    }
    geocoder.geocode({ address: fromText + ', India' }, function(results, status) {
      if (status === 'OK' && results[0]) fromCoords = results[0].geometry.location.toJSON();
      checkDone();
    });
    geocoder.geocode({ address: toText + ', India' }, function(results, status) {
      if (status === 'OK' && results[0]) toCoords = results[0].geometry.location.toJSON();
      checkDone();
    });
  }
}

function _computeAndDisplayBookingFare(distanceKm, distanceText, duration) {
  var cfg = (typeof PT_CONFIG !== 'undefined' && PT_CONFIG.FARE_CONFIG) ? PT_CONFIG.FARE_CONFIG : {};
  var baseFare = cfg.baseFare || 150;
  var perKm = cfg.perKmRate || 12;
  var minFare = cfg.minimumFare || 300;
  var vehicleMults = cfg.vehicleMultipliers || { sedan: 1.0, hatchback: 0.85, suv: 1.3, innova: 1.5, tempo: 2.0 };
  var tripMults = cfg.tripMultipliers || { 'one-way': 1.0, 'round-trip': 1.8, 'full-day': 2.2, 'rental': 2.5 };

  // Read selected trip type and vehicle type from booking modal
  var bookTypeEl = document.getElementById('bookType');
  var bookVehicleEl = document.getElementById('bookVehicleType');
  var selectedTripType = (bookTypeEl && bookTypeEl.value) ? bookTypeEl.value : 'one-way';
  var selectedVehicleType = (bookVehicleEl && bookVehicleEl.value) ? bookVehicleEl.value : 'sedan';
  var vMult = vehicleMults[selectedVehicleType] || 1.0;
  var tMult = tripMults[selectedTripType] || 1.0;
  var rawFare = (baseFare + (distanceKm * perKm)) * vMult * tMult;
  var minTripFare = minFare * vMult * tMult;
  var fare = Math.max(rawFare, minTripFare);
  var lowFare = Math.round(fare * 0.85 / 10) * 10;
  var highFare = Math.round(fare * 1.15 / 10) * 10;

  _bookingFareData = {
    distanceKm: distanceKm,
    distanceText: distanceText,
    duration: duration,
    fare: Math.round(fare),
    lowFare: lowFare,
    highFare: highFare
  };

  var summaryDiv = document.getElementById('bookingFareSummary');
  if (summaryDiv) summaryDiv.classList.remove('hidden');
  document.getElementById('bookingTotalKM').textContent = distanceText;
  document.getElementById('bookingDuration').textContent = duration;
  document.getElementById('bookingEstPrice').textContent = '₹' + lowFare.toLocaleString('en-IN') + ' – ₹' + highFare.toLocaleString('en-IN');
}

// ---------- Calculate Fare via Distance Matrix ----------
// ---------- Calculate Fare via Distance Matrix ----------
/* ============================================
   CALCULATOR SECTION: Distance Matrix Fare
   ============================================ */
var _calcFromCoords = null;
var _calcToCoords = null;
var _calcFromAutocomplete = null;
var _calcToAutocomplete = null;

function calculateSectionFare() {
  var fromInput = document.getElementById('calcFrom');
  var toInput = document.getElementById('calcTo');
  var vehicleSelect = document.getElementById('calcVehicle');
  var tripSelect = document.getElementById('calcTrip');
  var resultDiv = document.getElementById('calcResult');

  if (!fromInput || !toInput || !resultDiv) return;

  var fromText = fromInput.value.trim();
  var toText = toInput.value.trim();

  if (!fromText || !toText) {
    showToast(typeof I18N !== 'undefined' ? I18N.t('calc.error.fillBoth') : 'Please enter both From and To locations', 'error');
    return;
  }

  var vehicleType = vehicleSelect ? vehicleSelect.value : 'sedan';
  var tripType = tripSelect ? tripSelect.value : 'one-way';

  // Show loading
  resultDiv.innerHTML = '<p class="calc-placeholder">⏳ ' + (typeof I18N !== 'undefined' ? I18N.t('chatbot.calculating') : 'Calculating distance & fare...') + '</p>';

  // Try Google Maps Distance Matrix
  if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
    var service = new google.maps.DistanceMatrixService();
    var origins = _calcFromCoords ? [_calcFromCoords] : [fromText];
    var destinations = _calcToCoords ? [_calcToCoords] : [toText];

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
        if (status === 'OK' && response.rows[0] && response.rows[0].elements[0]) {
          var element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            var distanceKm = element.distance.value / 1000;
            var duration = element.duration.text;
            var distanceText = element.distance.text;
            displaySectionFare(distanceKm, distanceText, duration, vehicleType, tripType);
            return;
          }
        }
        // Fallback: geocode-based estimate
        calculateSectionFareFallback(fromText, toText, vehicleType, tripType);
      }
    );
  } else {
    // Google Maps not loaded - load it and try
    if (typeof loadGoogleMapsApi === 'function') {
      loadGoogleMapsApi();
      resultDiv.innerHTML = '<p class="calc-placeholder">⏳ Loading Google Maps... Please try again.</p>';
    } else {
      calculateSectionFareFallback(fromText, toText, vehicleType, tripType);
    }
  }
}

function calculateSectionFareFallback(fromText, toText, vehicleType, tripType) {
  var resultDiv = document.getElementById('calcResult');
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
        displaySectionFare(dist, dist.toFixed(0) + ' km (est.)', '~' + Math.round(dist / 40 * 60) + ' mins (est.)', vehicleType, tripType);
      } else {
        resultDiv.innerHTML = '<p class="calc-placeholder">⚠️ ' + (typeof I18N !== 'undefined' ? I18N.t('calc.error.geocodeFailed') : 'Could not calculate distance. Please enter clear location names.') + '</p>';
      }
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
    resultDiv.innerHTML = '<p class="calc-placeholder">⚠️ ' + (typeof I18N !== 'undefined' ? I18N.t('calc.error.mapsUnavailable') : 'Google Maps not loaded. Please check your API key.') + '</p>';
  }
}

function displaySectionFare(distanceKm, distanceText, duration, vehicleType, tripType) {
  var resultDiv = document.getElementById('calcResult');
  if (!resultDiv) return;

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

  var vehicleSelect = document.getElementById('calcVehicle');
  var tripSelect = document.getElementById('calcTrip');
  var vehicleLabel = vehicleSelect ? vehicleSelect.options[vehicleSelect.selectedIndex].text : vehicleType;
  var tripLabel = tripSelect ? tripSelect.options[tripSelect.selectedIndex].text : tripType;

  resultDiv.innerHTML =
    '<div class="calc-result-content">' +
    '<div class="calc-price-range">₹' + lowFare.toLocaleString('en-IN') + ' – ₹' + highFare.toLocaleString('en-IN') + '</div>' +
    '<div class="calc-details">' +
    '<span>📏 ' + escapeHtml(distanceText) + '</span>' +
    '<span>⏱️ ' + escapeHtml(duration) + '</span>' +
    '<span>🚗 ' + escapeHtml(vehicleLabel) + '</span>' +
    '<span>🔄 ' + escapeHtml(tripLabel) + '</span>' +
    '</div>' +
    '<p class="calc-note">*Estimated fare. Actual price may vary based on tolls, parking, and seasonal demand.</p>' +
    '<button class="btn btn-primary" onclick="openBookingModal()" style="margin-top:12px;">📞 ' + (typeof I18N !== 'undefined' ? I18N.t('chatbot.book') : 'Book Now') + '</button>' +
    '</div>';
}

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
}

// ---------- Book Now with Data Copy ----------

// ---------- Book Now with Data Copy ----------
function openBookingFromSectionCalc() {
  var fromInput = document.getElementById('calcFrom');
  var toInput = document.getElementById('calcTo');
  var fromText = fromInput ? fromInput.value.trim() : '';
  var toText = toInput ? toInput.value.trim() : '';

  setTimeout(function() {
    openBookingModal();
    // Pre-fill from/to location fields in booking modal
    var fromLocInput = document.getElementById('bookFromLocation');
    var toLocInput = document.getElementById('bookToLocation');
    if (fromLocInput && fromText) fromLocInput.value = fromText;
    if (toLocInput && toText) toLocInput.value = toText;
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
    fare: {
      hi: '<strong>💰 किराया कैसे पता करें:</strong><br><br>ऊपर <strong>फ़ेयर कैल्कुलेटर</strong> में अपना From/To लोकेशन, वाहन और ट्रिप टाइप चुनकर <strong>"किराया जानें"</strong> बटन दबाएँ।<br><br>या <a href="#calculator" onclick="toggleChatbot();" style="color:var(--accent);font-weight:600;">कैल्कुलेटर पर जाएँ →</a>',
      en: '<strong>💰 How to check fare:</strong><br><br>Use the <strong>Fare Calculator</strong> above — enter From/To locations, select vehicle and trip type, then click <strong>"Get Fare"</strong>.<br><br>Or <a href="#calculator" onclick="toggleChatbot();" style="color:var(--accent);font-weight:600;">go to the calculator →</a>'
    },
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
    // Register vehicle type change listener (independent of Google Maps)
    var vehicleSelect = document.getElementById('bookVehicleType');
    if (vehicleSelect && !vehicleSelect._vehicleTypeListenerAdded) {
      vehicleSelect._vehicleTypeListenerAdded = true;
      vehicleSelect.addEventListener('change', function() {
        _autoCalcBookingFare();
      });
    }
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
    // Clear from/to location autocomplete fields and vehicle type
    var fi = document.getElementById('bookFromLocation');
    var ti = document.getElementById('bookToLocation');
    var vt = document.getElementById('bookVehicleType');
    if (fi) fi.value = '';
    if (ti) ti.value = '';
    if (vt) vt.value = '';
    // Clear fare summary
    var summaryDiv = document.getElementById('bookingFareSummary');
    if (summaryDiv) summaryDiv.classList.add('hidden');
    _bookingFareData = null;
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
