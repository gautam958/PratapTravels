/* ============================================
   PRATAP TRAVELS - Main JavaScript
   ============================================ */


// ---------- Lucide Icon Helper ----------
function lucideIcon(name, size) {
  size = size || 18;
  return '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px;vertical-align:middle"></i>';
}
function refreshLucideIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// ---------- Navbar Toggle ----------
document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("open");
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
      });
    });
  }

  // ---------- Navbar scroll effect & Back to Top ----------
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(14, 47, 68, 0.98)";
      navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.15)";
    } else {
      navbar.style.background = "rgba(26, 82, 118, 0.95)";
      navbar.style.boxShadow = "none";
    }
    // Back to top visibility
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }
  });
  // Back to top click
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Route Filtering ----------
  const filterBtns = document.querySelectorAll(".filter-btn");
  const routeRows = document.querySelectorAll("#routesBody tr");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Update active button
      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");

      routeRows.forEach(function (row) {
        if (filter === "all" || row.getAttribute("data-category") === filter) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });

  // ---------- Slider Pause on Hover ----------
  var sliderTrack = document.getElementById("sliderTrack");
  if (sliderTrack) {
    var sliderWrapper = sliderTrack.parentElement;
    sliderWrapper.addEventListener("mouseenter", function () {
      sliderTrack.style.animationPlayState = "paused";
    });
    sliderWrapper.addEventListener("mouseleave", function () {
      sliderTrack.style.animationPlayState = "running";
    });

    // ---------- Slider Touch/Swipe Support ----------
    // Simple and reliable: pause on touch, resume after a short delay
    sliderWrapper.addEventListener(
      "touchstart",
      function () {
        sliderTrack.style.animationPlayState = "paused";
      },
      { passive: true },
    );

    sliderWrapper.addEventListener(
      "touchend",
      function () {
        setTimeout(function () {
          sliderTrack.style.animationPlayState = "running";
        }, 2000);
      },
      { passive: true },
    );

    sliderWrapper.addEventListener(
      "touchcancel",
      function () {
        sliderTrack.style.animationPlayState = "running";
      },
      { passive: true },
    );
  }

  // ---------- Floating Book Button & Modal ----------
  var floatingBookBtn = document.getElementById("floatingBookBtn");
  var bookingModal = document.getElementById("bookingModal");
  var modalClose = document.getElementById("modalClose");

  if (floatingBookBtn && bookingModal) {
    floatingBookBtn.addEventListener("click", function () {
      bookingModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    });

    if (modalClose) {
      modalClose.addEventListener("click", function () {
        bookingModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }

    bookingModal.addEventListener("click", function (e) {
      if (e.target === bookingModal) {
        bookingModal.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !bookingModal.classList.contains("hidden")) {
        bookingModal.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });
  }

  // ---------- Booking Form ----------
  var bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    // Set minimum date to today
    var dateInput = document.getElementById("bookDate");
    if (dateInput) {
      var today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }

    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous errors
      var errors = bookingForm.querySelectorAll(".form-error");
      errors.forEach(function (el) {
        el.textContent = "";
      });
      var errorInputs = bookingForm.querySelectorAll(".error");
      errorInputs.forEach(function (el) {
        el.classList.remove("error");
      });

      var valid = true;

      // Validate name
      var name = document.getElementById("bookName");
      if (!name.value.trim()) {
        document.getElementById("nameError").textContent =
          "Please enter your name";
        name.classList.add("error");
        valid = false;
      }

      // Validate phone
      var phone = document.getElementById("bookPhone");
      var phoneRegex = /^[6-9]\d{9}$/;
      if (
        !phone.value.trim() ||
        !phoneRegex.test(phone.value.replace(/\s/g, ""))
      ) {
        document.getElementById("phoneError").textContent =
          "Enter a valid 10-digit phone number";
        phone.classList.add("error");
        valid = false;
      }

      // Validate email (optional but must be valid if provided)
      var email = document.getElementById("bookEmail");
      if (email.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
          document.getElementById("emailError").textContent =
            "Enter a valid email address";
          email.classList.add("error");
          valid = false;
        }
      }

      // Validate route
      var route = document.getElementById("bookRoute");
      if (!route.value) {
        document.getElementById("routeError").textContent =
          "Please select a destination";
        route.classList.add("error");
        valid = false;
      }

      // Validate date
      var date = document.getElementById("bookDate");
      if (!date.value) {
        document.getElementById("dateError").textContent =
          "Please select a travel date";
        date.classList.add("error");
        valid = false;
      }

      // Validate trip type
      var type = document.getElementById("bookType");
      if (!type.value) {
        document.getElementById("typeError").textContent =
          "Please select a trip type";
        type.classList.add("error");
        valid = false;
      }

      if (!valid) return;

      // Build booking details
      var nameVal = name.value.trim();
      var phoneVal = phone.value.trim();
      var emailVal = email.value.trim();
      var routeVal = route.value;
      var dateVal = date.value;
      var timeVal =
        document.getElementById("bookTime").value || "Not specified";
      var passengersVal = document.getElementById("bookPassengers").value;
      var typeVal = type.value;
      var remarksVal = document.getElementById("bookRemarks").value.trim();

      // Show loading state
      var submitBtn = document.getElementById("submitBtn");
      if (submitBtn) {
        submitBtn.textContent = "⏳ Sending...";
        submitBtn.disabled = true;
      }

      // Get referral code if provided
      var referralVal = "";
      var referralInput = document.getElementById("bookReferral");
      if (referralInput && referralInput.value.trim()) {
        var validated = validateReferralCode(referralInput.value.trim());
        if (validated) {
          referralVal = validated;
        }
      }

      // Self-referral prevention: check if booking phone matches code owner's phone
      if (referralVal) {
        var codeOwnerData = _referralDataCache;
        if (
          codeOwnerData &&
          codeOwnerData.phone &&
          codeOwnerData.phone === phoneVal
        ) {
          showToast("You cannot use your own referral code!", "error");
          referralVal = "";
          if (referralInput) referralInput.value = "";
        }
      }

      // Validate referral code against backend API (not just local format)
      if (referralVal) {
        var refValidationResult = { valid: true };
        try {
          refValidationResult = await validateReferralCodeServer(referralVal);
        } catch (e) {
          /* proceed anyway on network error */
        }
        if (!refValidationResult || !refValidationResult.valid) {
          showToast(
            "Referral code is invalid or not found on server. Proceeding without referral.",
            "error",
          );
          referralVal = "";
          if (referralInput) referralInput.value = "";
        }
      }

      // Generate booking ID before building bookingData
      var bookingId = "BK" + Date.now() + phoneVal.slice(-4);
      var dataApiUrl = getDataApiUrl();

      // Booking data to save (used for both API and local storage)
      var bookingData = {
        bookingId: bookingId,
        name: nameVal,
        phone: phoneVal,
        email: emailVal || "",
        route: routeVal,
        date: dateVal,
        time: timeVal,
        passengers: passengersVal,
        trip_type: typeVal,
        remarks: remarksVal || "",
        referral_code: referralVal || "",
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      // Helper: build WhatsApp fallback message
      function buildWhatsAppMsg() {
        var msg = "🚗 *PRATAP TRAVELS - Booking Request*\n\n";
        msg += "👤 *Name:* " + nameVal + "\n";
        msg += "📞 *Phone:* " + phoneVal + "\n";
        if (emailVal) msg += "📧 *Email:* " + emailVal + "\n";
        msg += "🗺 *Route:* " + routeVal + "\n";
        msg += "📅 *Date:* " + dateVal + "\n";
        msg += "⏰ *Time:* " + timeVal + "\n";
        msg += "👥 *Passengers:* " + passengersVal + "\n";
        msg += "🏷 *Trip Type:* " + typeVal + "\n";
        if (referralVal) msg += "🎁 *Referral Code:* " + referralVal + "\n";
        if (remarksVal) msg += "📝 *Remarks:* " + remarksVal + "\n";
        return msg;
      }

      // Helper: show success UI
      function showBookingSuccess(openWhatsApp) {
        bookingForm.classList.add("hidden");
        document.getElementById("bookingSuccess").classList.remove("hidden");
        if (openWhatsApp) {
          var whatsappUrl =
            "https://wa.me/917991182806?text=" +
            encodeURIComponent(buildWhatsAppMsg());
          window.open(whatsappUrl, "_blank");
        }
      }

      // Helper: record referral redemption
      function handleReferralRedemption(bookingId) {
        if (referralVal) {
          recordReferralRedemption(referralVal, bookingId, phoneVal);
          storeLocalRedemption({
            referralCode: referralVal,
            bookingId: bookingId,
            newCustomerPhone: phoneVal,
            rewardAmount: 50,
            createdAt: new Date().toISOString(),
            status: "completed",
          });
          // Update referrer's stats locally
          updateReferrerStatsOnRedemption(referralVal, phoneVal, bookingId);
        }
      }

      if (dataApiUrl) {
        fetch(dataApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ type: "booking_data", data: bookingData }),
        })
          .then(function (resp) {
            if (!resp.ok) throw new Error("HTTP " + resp.status);
            return resp.json();
          })
          .then(function () {
            showBookingSuccess(false);
            handleReferralRedemption(bookingId);
            // Save booking locally (API already saved via booking_data above)
            _bookingsCache.unshift(bookingData);
            recordAuditTrail("booking_submit", {
              bookingId: bookingId,
              name: nameVal,
              phone: phoneVal,
              route: routeVal,
              referral_code: referralVal,
            });
          })
          .catch(function (error) {
            console.error("Booking API failed:", error);
            showBookingSuccess(true);
            handleReferralRedemption(bookingId);
            // Save booking locally even on API failure (fire-and-forget to API)
            saveBookingLocally(bookingData);
            recordAuditTrail("booking_submit", {
              bookingId: bookingId,
              name: nameVal,
              phone: phoneVal,
              route: routeVal,
              referral_code: referralVal,
            });
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.textContent = "🚗 Submit Booking Request";
              submitBtn.disabled = false;
            }
          });
      } else {
        // No API configured: fallback to WhatsApp directly
        showBookingSuccess(true);
        handleReferralRedemption(bookingId);
        saveBookingLocally({
          bookingId: bookingId,
          name: nameVal,
          phone: phoneVal,
          email: emailVal,
          route: routeVal,
          date: dateVal,
          time: timeVal,
          passengers: passengersVal,
          trip_type: typeVal,
          remarks: remarksVal,
          referral_code: referralVal,
          createdAt: new Date().toISOString(),
          status: "pending",
        });
        recordAuditTrail("booking_submit", {
          bookingId: bookingId,
          name: nameVal,
          phone: phoneVal,
          route: routeVal,
          referral_code: referralVal,
        });
        if (submitBtn) {
          submitBtn.textContent = "🚗 Submit Booking Request";
          submitBtn.disabled = false;
        }
      }
    });
  }

  // ---------- Drag & Drop Upload ----------
  var uploadArea = document.getElementById("uploadArea");
  if (uploadArea) {
    uploadArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      uploadArea.style.borderColor = "#2980b9";
      uploadArea.style.background = "#f0f7ff";
    });

    uploadArea.addEventListener("dragleave", function () {
      uploadArea.style.borderColor = "#d0d7de";
      uploadArea.style.background = "";
    });

    uploadArea.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadArea.style.borderColor = "#d0d7de";
      uploadArea.style.background = "";
      if (e.dataTransfer.files.length > 0) {
        displayUploadedFiles(e.dataTransfer.files);
      }
    });
  }
});

// ---------- Google Sign-In ----------
function handleGoogleSignIn() {
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
    // Initialize Google ID configuration if it wasn't automatically initialized
    google.accounts.id.initialize({
      client_id:
        "529204997074-5upkbf81uq05ueef0ai1ik606vpmeg6p.apps.googleusercontent.com",
      callback: handleGoogleCredentialResponse,
      use_fedcm_for_prompt: false, // Continues to disable FedCM inside Incognito
    });

    // 1. Try to display the overlay prompt
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn(
          "One-tap prompt skipped or blocked in Incognito. Triggering pop-up selector directly.",
        );

        // 2. Fallback: If the overlay prompt is blocked by the browser, force the standard Google Pop-up window
        google.accounts.id.login();
      }
    });
  } else {
    // Fallback: mock sign-in for local development
    console.warn(
      "Google Identity Services not loaded. Using mock sign-in for development.",
    );
    var mockUser = {
      name: "Guest User",
      email: "guest@prataptravels.com",
      initial: "G",
    };
    _handleAuthSuccess(mockUser);
  }
}

// Callback from Google Identity Services (credential response)
function handleGoogleCredentialResponse(response) {
  try {
    // Decode the JWT token from Google
    var payload = JSON.parse(atob(response.credential.split(".")[1]));
    var email = payload.email || "";
    var name = payload.name || "";
    var picture = payload.picture || "";

    // Check if email is in allowed list
    var allowed =
      typeof PT_CONFIG !== "undefined" && PT_CONFIG.ALLOWED_EMAILS
        ? PT_CONFIG.ALLOWED_EMAILS
        : [];
    if (allowed.length > 0 && allowed.indexOf(email) === -1) {
      alert(
        "Access denied. Your email (" +
          email +
          ") is not authorized.\n\nContact the site owner for access.",
      );
      return;
    }

    var user = {
      name: name,
      email: email,
      picture: picture,
      initial: name
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase(),
    };

    _handleAuthSuccess(user);
  } catch (e) {
    console.error("Google credential parsing failed:", e);
    alert("Google sign-in failed. Please try again.");
  }
}

// Common auth success handler
function _handleAuthSuccess(user) {
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");

  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userAvatar").textContent = user.initial;

  // Store login state
  sessionStorage.setItem("pt_logged_in", "true");
  sessionStorage.setItem("pt_user", JSON.stringify(user));
}



// ---------- Logout ----------
function handleLogout() {
  sessionStorage.removeItem("pt_logged_in");
  sessionStorage.removeItem("pt_user");

  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("dashboardSection").classList.add("hidden");
}

// ---------- Check login state on page load ----------
document.addEventListener("DOMContentLoaded", function () {
  if (sessionStorage.getItem("pt_logged_in") === "true") {
    var user = JSON.parse(sessionStorage.getItem("pt_user"));
    if (user && document.getElementById("authSection")) {
      document.getElementById("authSection").classList.add("hidden");
      document.getElementById("dashboardSection").classList.remove("hidden");

      document.getElementById("userName").textContent = user.name;
      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("userAvatar").textContent = user.initial;

      // Re-render dashboards after auth so tables show fresh data
      _refreshCurrentDashboard();
    }
  }
});

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
    });
  }
}

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

function escapeHtml(text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

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
function getReferralApiUrl() {
  if (typeof PT_CONFIG !== "undefined" && PT_CONFIG.REFERRAL_API_URL) {
    var url = PT_CONFIG.REFERRAL_API_URL;
    if (
      PT_CONFIG.REFERRAL_API_KEY &&
      PT_CONFIG.REFERRAL_API_KEY !== "YOUR_FUNCTION_KEY_HERE"
    ) {
      url += "?code=" + encodeURIComponent(PT_CONFIG.REFERRAL_API_KEY);
    }
    return url;
  }
  return null;
}

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
function updateReferralStatsDisplay() {
  var refData = _referralDataCache;
  if (!refData) return;

  var statsEl = document.getElementById("referStats");
  if (statsEl) {
    var totalReferrals = refData.totalReferrals || 0;
    var totalRewards = refData.totalRewards || 0;
    var rewardBalance = refData.rewardBalance || 0;

    statsEl.innerHTML =
      '<div class="refer-stat"><span class="refer-stat-num">' +
      totalReferrals +
      '</span><span class="refer-stat-label">Total Referrals</span></div>' +
      '<div class="refer-stat"><span class="refer-stat-num">₹' +
      totalRewards +
      '</span><span class="refer-stat-label">Total Earned</span></div>' +
      '<div class="refer-stat"><span class="refer-stat-num">₹' +
      rewardBalance +
      '</span><span class="refer-stat-label">Balance</span></div>';
    statsEl.classList.remove("hidden");
  }
}

// ---------- Validate referral code ----------
function validateReferralCode(code) {
  if (!code || code.trim() === "") return null;
  // Basic format check: PT + 3 letters + 4 digits
  var regex = /^PT[A-Z]{3}\d{4}$/;
  if (!regex.test(code.toUpperCase())) return null;
  return code.toUpperCase();
}

// ---------- Local Redemption Storage (localStorage fallback) ----------
function getLocalRedemptions() {
  return _localRedemptionsCache;
}

function storeLocalRedemption(redemption) {
  _localRedemptionsCache.push(redemption);
}

// ---------- Validate referral code against backend ----------
async function validateReferralCodeServer(code) {
  var apiUrl = getReferralApiUrl();
  if (!apiUrl) return { valid: false };

  try {
    var resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ _action: "validate", code: code }),
    });

    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn("Referral validate API failed:", e.message);
  }

  return { valid: false };
}

// ---------- Record referral redemption against backend ----------
async function recordReferralRedemption(code, bookingId, customerPhone) {
  var apiUrl = getReferralApiUrl();
  if (!apiUrl) return null;

  try {
    var resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({
        _action: "redeem",
        code: code,
        bookingId: bookingId,
        newCustomerPhone: customerPhone,
      }),
    });

    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn("Referral redeem API failed:", e.message);
  }

  return null;
}

// ---------- Fetch referral stats for current user ----------
async function fetchReferralStats() {
  var refData = _referralDataCache;
  if (!refData || !refData.code) return;

  var apiUrl = getReferralApiUrl();
  if (!apiUrl) return;

  // Append referral code param - use ? or & depending on existing query
  var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
  var statsUrl =
    apiUrl + separator + "referral_code=" + encodeURIComponent(refData.code);

  try {
    var resp = await fetch(statsUrl, {
      method: "GET",
      mode: "cors",
    });

    if (resp.ok) {
      var stats = await resp.json();
      refData.totalReferrals = stats.totalReferrals || 0;
      refData.totalRedemptions = stats.totalRedemptions || 0;
      refData.totalRewards = stats.totalRewards || 0;
      refData.rewardBalance = stats.rewardBalance || 0;
      _referralDataCache = refData;
    }
  } catch (e) {
    console.warn("Referral stats API failed:", e.message);
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
function getVisitorId() {
  var vid = localStorage.getItem(PT_VISITOR_ID_KEY);
  if (!vid) {
    vid =
      "vid_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substring(2, 11);
    localStorage.setItem(PT_VISITOR_ID_KEY, vid);
  }
  return vid;
}

// ---------- Parse User Agent ----------
function parseUA(ua) {
  var device = "Unknown";
  var browser = "Unknown";
  var os = "Unknown";

  // Device
  if (/Mobile|Android.*Mobile|iPhone/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) device = "Tablet";
  else device = "Desktop";

  // Browser
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  // OS
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";

  return { device: device, browser: browser, os: os };
}

// ---------- Get Azure Function URL (visitors) ----------
function getVisitorApiUrl() {
  if (typeof PT_CONFIG !== "undefined" && PT_CONFIG.AZURE_FUNCTION_URL) {
    var url = PT_CONFIG.AZURE_FUNCTION_URL;
    if (
      PT_CONFIG.AZURE_FUNCTION_KEY &&
      PT_CONFIG.AZURE_FUNCTION_KEY !== "YOUR_FUNCTION_KEY_HERE"
    ) {
      url += "?code=" + encodeURIComponent(PT_CONFIG.AZURE_FUNCTION_KEY);
    }
    return url;
  }
  return null;
}

// ---------- Get PratapTravels-Data Azure Function URL ----------
function getDataApiUrl() {
  if (typeof PT_CONFIG !== "undefined" && PT_CONFIG.DATA_API_URL) {
    var url = PT_CONFIG.DATA_API_URL;
    if (
      PT_CONFIG.DATA_API_KEY &&
      PT_CONFIG.DATA_API_KEY !== "YOUR_FUNCTION_KEY_HERE"
    ) {
      url += "?code=" + encodeURIComponent(PT_CONFIG.DATA_API_KEY);
    }
    return url;
  }
  return null;
}

// ---------- Read / Write Visitor Records (localStorage fallback) ----------
function getVisitorRecords() {
  return _visitorRecordsCache;
}

function saveVisitorRecords(records) {
  if (records.length > MAX_VISITOR_RECORDS) {
    records = records.slice(0, MAX_VISITOR_RECORDS);
  }
  _visitorRecordsCache = records;
}

// ---------- Track Visit (fires on every page load) ----------
// Sends visitor data to Azure Function API (same structure as gautam958web.in)
async function trackVisit() {
  var vid = getVisitorId();
  var ua = navigator.userAgent;
  var parsed = parseUA(ua);
  var path = window.location.pathname + window.location.hash;
  var referrer = document.referrer || "";
  var screenRes = window.screen.width + "x" + window.screen.height;
  var lang = navigator.language || navigator.userLanguage || "";
  var loggedUser = "";

  try {
    var userStr = sessionStorage.getItem("pt_user");
    if (userStr) {
      var user = JSON.parse(userStr);
      loggedUser = user.email || user.name || "";
    }
  } catch (e) {
    /* ignore */
  }

  var now = new Date().toISOString();

  // Build visitor record matching gautam958web.in data structure
  var visitorData = {
    visitorId: vid,
    sello_vid: vid,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    screen: screenRes,
    language: lang,
    referrer: referrer,
    page: path,
    user: loggedUser,
    timestamp: now,
    firstSeen: now,
    lastSeen: now,
    visitCount: 1,
  };

  // Also save to localStorage as fallback
  var records = getVisitorRecords();
  var existing = null;
  for (var i = 0; i < records.length; i++) {
    if (records[i].visitorId === vid) {
      existing = records[i];
      break;
    }
  }

  if (existing) {
    existing.lastSeen = now;
    existing.timestamp = now;
    existing.visitCount = (existing.visitCount || 1) + 1;
    existing.device = parsed.device;
    existing.browser = parsed.browser;
    existing.os = parsed.os;
    existing.screen = screenRes;
    existing.language = lang;
    existing.referrer = referrer || existing.referrer;
    if (!existing.pages) existing.pages = [];
    if (existing.pages.indexOf(path) === -1) {
      existing.pages.push(path);
      if (existing.pages.length > 20)
        existing.pages = existing.pages.slice(-20);
    }
    if (loggedUser) existing.user = loggedUser;
    visitorData = existing;
  } else {
    visitorData.pages = [path];
    records.unshift(visitorData);
  }

  saveVisitorRecords(records);

  // POST to Azure Function API (fire-and-forget)
  var apiUrl = getVisitorApiUrl();
  if (apiUrl) {
    try {
      var headers = { "Content-Type": "application/json" };
      var body = JSON.stringify(visitorData);

      // Use PUT if returning visitor (Azure Function updates by sello_vid/visitorId)
      var method = existing ? "PUT" : "POST";

      var resp = await fetch(apiUrl, {
        method: method,
        headers: headers,
        body: body,
        mode: "cors",
      });

      // If PUT fails with 404 (server data lost), fall back to POST
      if (resp.status === 404 && method === "PUT") {
        await fetch(apiUrl, {
          method: "POST",
          headers: headers,
          body: body,
          mode: "cors",
        });
      }
    } catch (e) {
      console.warn("Visitor API POST failed (stored locally):", e.message);
    }
  }
}

// ---------- Fetch Visitor Records from Azure Function API ----------
async function fetchVisitorRecordsFromApi() {
  var apiUrl = getVisitorApiUrl();
  if (!apiUrl) return null;

  try {
    var resp = await fetch(apiUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) throw new Error("HTTP " + resp.status);
    var data = await resp.json();

    if (Array.isArray(data)) {
      _visitorRecordsCache = data;
      return data;
    }
  } catch (e) {
    console.warn("Visitor API GET failed:", e.message);
  }

  return null;
}

/* ============================================
   VISITOR DASHBOARD (admin page)
   ============================================ */

// ---------- Format Date ----------
function formatDate(isoString) {
  if (!isoString) return "-";
  var d = new Date(isoString);
  if (isNaN(d.getTime())) return "-";
  var options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleDateString("en-IN", options);
}

// ---------- Toast Notification ----------
function showToast(message, type) {
  type = type || "success";
  var container = document.getElementById("toastContainer");
  if (!container) return;

  // Cap at 3 visible toasts
  while (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  var toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.innerHTML =
    '<span class="toast-icon">' +
    (type === "success" ? lucideIcon("circle-check",20) : type === "error" ? lucideIcon("circle-x",20) : lucideIcon("info",20)) +
    '</span><span class="toast-message">' +
    escapeHtml(message) +
    "</span>";
  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add("toast-show");
  }, 10);

  setTimeout(function () {
    toast.classList.remove("toast-show");
    setTimeout(function () {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 400);
  }, 4000);
}

// ---------- Truncate Visitor ID for display ----------
function shortId(vid) {
  if (!vid) return "-";
  return vid.length > 16 ? vid.substring(0, 16) + "…" : vid;
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

  var elTotal = document.getElementById("kpiTotal");
  var elNewToday = document.getElementById("kpiNewToday");
  var elReturning = document.getElementById("kpiReturning");
  var elActive = document.getElementById("kpiActive");
  var elCountries = document.getElementById("kpiCountries");
  var elPages = document.getElementById("kpiPages");

  if (elTotal) elTotal.textContent = totalVisitors;
  if (elNewToday) elNewToday.textContent = newToday;
  if (elReturning) elReturning.textContent = returning;
  if (elActive) elActive.textContent = activeNow;
  if (elCountries) elCountries.textContent = Object.keys(countries).length;
  if (elPages) elPages.textContent = Object.keys(pages).length;
}

// ---------- Render Visitor Table ----------
function renderVisitorTable() {
  var tbody = document.getElementById("visitorTableBody");
  var emptyState = document.getElementById("emptyVisitorState");
  if (!tbody) return;

  var records = getVisitorRecords();
  var searchInput = document.getElementById("visitorSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  tbody.innerHTML = "";

  var filtered = records;
  if (query) {
    filtered = records.filter(function (r) {
      var haystack = [
        r.ip,
        r.city,
        r.region,
        r.country,
        r.device,
        r.browser,
        r.os,
        (r.pages || []).join(" "),
        r.user,
        r.visitorId,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (r) {
    var tr = document.createElement("tr");

    var deviceInfo = r.device + " · " + r.browser + " · " + r.os;
    var pagesList = (r.pages || []).join(", ") || "-";
    var userLabel = r.user || '<span style="color:#999">anonymous</span>';

    tr.innerHTML =
      '<td><code class="vid-code" title="' +
      escapeHtml(r.visitorId) +
      '">' +
      escapeHtml(shortId(r.visitorId)) +
      "</code></td>" +
      "<td>" +
      escapeHtml(r.ip || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.country || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.region || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(r.city || "-") +
      "</td>" +
      "<td><small>" +
      escapeHtml(deviceInfo) +
      "</small></td>" +
      '<td><small title="' +
      escapeHtml(pagesList) +
      '">' +
      escapeHtml(
        pagesList.length > 40 ? pagesList.substring(0, 40) + "…" : pagesList,
      ) +
      "</small></td>" +
      "<td>" +
      (r.visitCount || 1) +
      "</td>" +
      "<td><small>" +
      formatDate(r.firstSeen) +
      "</small></td>" +
      "<td><small>" +
      formatDate(r.lastSeen) +
      "</small></td>" +
      "<td><small>" +
      formatDate(r.timestamp) +
      "</small></td>" +
      "<td>" +
      userLabel +
      "</td>";

    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}

// ---------- Export as CSV ----------
function exportCSV() {
  var records = getVisitorRecords();
  if (records.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var headers = [
    "Visitor ID",
    "IP",
    "Country",
    "State",
    "City",
    "Device",
    "Browser",
    "OS",
    "Pages",
    "Visits",
    "First Seen",
    "Last Seen",
    "Timestamp",
    "User",
  ];
  var rows = records.map(function (r) {
    return [
      r.visitorId || "",
      r.ip || "",
      r.country || "",
      r.region || "",
      r.city || "",
      r.device || "",
      r.browser || "",
      r.os || "",
      (r.pages || []).join(" | "),
      r.visitCount || 1,
      r.firstSeen || "",
      r.lastSeen || "",
      r.timestamp || "",
      r.user || "",
    ];
  });
  var csv =
    headers.join(",") +
    "\n" +
    rows
      .map(function (row) {
        return row
          .map(function (cell) {
            var s = String(cell).replace(/"/g, '""');
            return '"' + s + '"';
          })
          .join(",");
      })
      .join("\n");
  downloadFile(csv, "pratap-travels-visitors.csv", "text/csv");
  showToast("CSV exported successfully.", "success");
}

// ---------- Export as JSON ----------
function exportJSON() {
  var records = getVisitorRecords();
  if (records.length === 0) {
    showToast("No data to export.", "error");
    return;
  }
  var json = JSON.stringify(records, null, 2);
  downloadFile(json, "pratap-travels-visitors.json", "application/json");
  showToast("JSON exported successfully.", "success");
}

// ---------- Download Helper ----------
function downloadFile(content, filename, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Refresh ----------
async function refreshVisitorData() {
  // Try fetching from Azure Function API first
  var apiRecords = await fetchVisitorRecordsFromApi();
  if (apiRecords) {
    showToast("Data refreshed from server.", "success");
  }
  renderVisitorTable();
  updateKPIs();
  if (!apiRecords) {
    showToast("Using cached data (API unavailable).", "info");
  }
}

// ---------- Clear Log ----------
function clearVisitorLog() {
  if (
    confirm(
      "Are you sure you want to clear all visitor records? This cannot be undone.",
    )
  ) {
    _visitorRecordsCache = [];
    renderVisitorTable();
    updateKPIs();
    showToast("Visitor log cleared.", "info");
  }
}

/* ============================================
   REFERRAL ADMIN DASHBOARD
   View all referral codes, redemptions, and rewards
   ============================================ */

var REFERRAL_ALL_KEY = "pt_referral_all";

// ---------- Merge local redemptions into referral records ----------
function mergeLocalRedemptions(referrals) {
  var localRedemptions = getLocalRedemptions();
  if (localRedemptions.length === 0) return referrals;

  var localByCode = {};
  for (var i = 0; i < localRedemptions.length; i++) {
    var code = localRedemptions[i].referralCode;
    if (!localByCode[code]) localByCode[code] = { count: 0, rewards: 0 };
    localByCode[code].count++;
    localByCode[code].rewards += localRedemptions[i].rewardAmount || 50;
  }

  for (var i = 0; i < referrals.length; i++) {
    var local = localByCode[referrals[i].code];
    if (local) {
      referrals[i].totalRedemptions =
        (referrals[i].totalRedemptions || referrals[i].redeemedCount || 0) +
        local.count;
      referrals[i].totalReferrals =
        (referrals[i].totalReferrals || 0) + local.count;
      referrals[i].totalRewards =
        (referrals[i].totalRewards || 0) + local.rewards;
      referrals[i].rewardBalance =
        (referrals[i].rewardBalance || 0) + local.rewards;
    }
  }

  return referrals;
}

// ---------- Fetch all referrals from backend (admin) ----------
async function fetchAllReferrals() {
  var apiUrl = getReferralApiUrl();
  if (!apiUrl)
    return {
      data: mergeLocalRedemptions(getAllReferralRecords()),
      fromServer: false,
    };

  try {
    var resp = await fetch(apiUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) throw new Error("HTTP " + resp.status);
    var data = await resp.json();

    // Handle both array and object responses
    var referrals = Array.isArray(data) ? data : data.referrals || [];
    _allReferralsCache = referrals;
    return { data: mergeLocalRedemptions(referrals), fromServer: true };
  } catch (e) {
    console.warn("Referral admin API failed, using cached data:", e.message);
    return {
      data: mergeLocalRedemptions(getAllReferralRecords()),
      fromServer: false,
    };
  }
}

// ---------- Get cached referral data ----------
function getAllReferralRecords() {
  return _allReferralsCache;
}

// ---------- Update Referral KPI Cards ----------
function updateReferralKPIs() {
  var records = getAllReferralRecords();
  var totalCodes = records.length;
  var totalRedemptions = 0;
  var totalRewardsPaid = 0;
  var pendingRewards = 0;

  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    totalRedemptions += r.totalReferrals || 0;
    totalRewardsPaid += r.totalRewards || 0;
    pendingRewards += r.rewardBalance || 0;
  }

  var elTotalCodes = document.getElementById("refKpiTotalCodes");
  var elRedemptions = document.getElementById("refKpiRedemptions");
  var elTotalRewards = document.getElementById("refKpiTotalRewards");
  var elPending = document.getElementById("refKpiPending");

  if (elTotalCodes) elTotalCodes.textContent = totalCodes;
  if (elRedemptions) elRedemptions.textContent = totalRedemptions;
  if (elTotalRewards) elTotalRewards.textContent = "₹" + totalRewardsPaid;
  if (elPending) elPending.textContent = "₹" + pendingRewards;
}

// ---------- Render Referral Table ----------
function renderReferralTable() {
  var tbody = document.getElementById("referralTableBody");
  var emptyState = document.getElementById("emptyReferralState");
  if (!tbody) return;

  var records = getAllReferralRecords();
  var searchInput = document.getElementById("referralSearch");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  tbody.innerHTML = "";

  var filtered = records;
  if (query) {
    filtered = records.filter(function (r) {
      var haystack = [r.code, r.name, r.email, r.phone].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  if (filtered.length === 0) {
    if (emptyState) {
      var emptyMsg = emptyState.querySelector("p");
      if (records.length === 0) {
        emptyMsg.textContent =
          "No referral codes yet. Codes will appear here as users generate them.";
      } else {
        emptyMsg.textContent =
          "No results found for '" + escapeHtml(query) + "'";
      }
      emptyState.classList.remove("hidden");
    }
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach(function (r) {
    var tr = document.createElement("tr");
    var totalReferrals = r.totalReferrals || 0;
    var rewardsPaid = r.totalRewards || 0;
    var balance = r.rewardBalance || 0;
    var statusClass, statusText;
    if (totalReferrals > 0 && balance > 0) {
      statusClass = "active";
      statusText = "Active";
    } else if (totalReferrals > 0 && balance === 0) {
      statusClass = "pending";
      statusText = "Completed";
    } else {
      statusClass = "inactive";
      statusText = "New";
    }

    tr.className = "clickable-row";
    tr.setAttribute("data-code", r.code);
    tr.style.cursor = "pointer";
    tr.addEventListener("click", function () {
      openRedemptionHistory(r.code);
    });

    tr.innerHTML =
      '<td><code class="vid-code" title="' +
      escapeHtml(r.code) +
      '">' +
      escapeHtml(r.code) +
      "</code></td>" +
      "<td>" +
      escapeHtml(r.name || "-") +
      "</td>" +
      "<td>" +
      totalReferrals +
      "</td>" +
      "<td>" +
      (r.totalRedemptions || r.redeemedCount || 0) +
      "</td>" +
      "<td>₹" +
      rewardsPaid +
      "</td>" +
      "<td>₹" +
      balance +
      "</td>" +
      "<td><small>" +
      formatDate(r.createdAt) +
      "</small></td>" +
      '<td><span class="referral-status-badge ' +
      statusClass +
      '">' +
      statusText +
      "</span></td>";

    tbody.appendChild(tr);
  });

  refreshLucideIcons();
}

// ---------- Refresh Referral Data ----------
async function refreshReferralData() {
  var result = await fetchAllReferrals();
  if (result.fromServer) {
    showToast("Referral data refreshed from server.", "success");
  } else {
    showToast("Using cached referral data (API unavailable).", "info");
  }
  renderReferralTable();
  updateReferralKPIs();
}

/* ============================================
   REDEMPTION HISTORY
   Individual redemption events per referral code
   ============================================ */

var REDEMPTION_CACHE_KEY = "pt_redemptions_";

// ---------- Fetch redemptions for a specific referral code ----------
async function fetchRedemptionsForCode(code) {
  var apiUrl = getReferralApiUrl();
  if (!apiUrl) return null;

  var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
  var url = apiUrl + separator + "referral_code=" + encodeURIComponent(code);

  try {
    var resp = await fetch(url, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) throw new Error("HTTP " + resp.status);
    var data = await resp.json();

    // Extract redemptions array from response
    var redemptions = data.redemptions || data.events || [];
    if (!Array.isArray(redemptions)) redemptions = [];

    // Cache in localStorage
    _redemptionsCache[code] = {
      redemptions: redemptions,
      totalReferrals: data.totalReferrals || 0,
      totalRewards: data.totalRewards || 0,
      rewardBalance: data.rewardBalance || 0,
      fetchedAt: new Date().toISOString(),
    };

    return redemptions;
  } catch (e) {
    console.warn("Redemption fetch failed for code " + code + ":", e.message);
    // Try cache
    var cached = _redemptionsCache[code] || null;
    return cached ? cached.redemptions : null;
  }
}

// ---------- Open Redemption History Modal ----------
async function openRedemptionHistory(code) {
  var modal = document.getElementById("redemptionModal");
  var subtitle = document.getElementById("redemptionModalSubtitle");
  var tbody = document.getElementById("redemptionTableBody");
  var emptyState = document.getElementById("emptyRedemptionState");
  if (!modal || !tbody) return;

  // Set subtitle with code
  if (subtitle) subtitle.textContent = "Referral code: " + code;

  // Show modal immediately with loading state
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light);">⏳ Loading redemption history...</td></tr>';
  if (emptyState) emptyState.classList.add("hidden");

  // Fetch redemption data from API/cache
  var redemptions = await fetchRedemptionsForCode(code);
  if (!redemptions) redemptions = [];

  // Also include locally recorded redemptions for this code
  var localRedemptions = getLocalRedemptions();
  for (var i = 0; i < localRedemptions.length; i++) {
    if (localRedemptions[i].referralCode === code) {
      // Avoid duplicates by checking bookingId
      var isDuplicate = false;
      for (var j = 0; j < redemptions.length; j++) {
        if (redemptions[j].bookingId === localRedemptions[i].bookingId) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        redemptions.push(localRedemptions[i]);
      }
    }
  }

  // Get cached stats for the summary
  var cachedStats = null;
  try {
    cachedStats = _redemptionsCache[code] || null;
  } catch (e) {
    /* ignore */
  }

  // Update summary stats
  var allRecords = getAllReferralRecords();
  var refRecord = null;
  for (var i = 0; i < allRecords.length; i++) {
    if (allRecords[i].code === code) {
      refRecord = allRecords[i];
      break;
    }
  }

  var totalRedemptions =
    (cachedStats && cachedStats.totalReferrals) ||
    (refRecord ? refRecord.totalReferrals : 0) ||
    0;
  var totalRewards =
    (cachedStats && cachedStats.totalRewards) ||
    (refRecord ? refRecord.totalRewards : 0) ||
    0;
  var pendingBalance =
    (cachedStats && cachedStats.rewardBalance) ||
    (refRecord ? refRecord.rewardBalance : 0) ||
    0;

  var elTotal = document.getElementById("redTotalRedemptions");
  var elRewards = document.getElementById("redTotalRewards");
  var elPending = document.getElementById("redPendingRewards");
  if (elTotal) elTotal.textContent = totalRedemptions;
  if (elRewards) elRewards.textContent = "₹" + totalRewards;
  if (elPending) elPending.textContent = "₹" + pendingBalance;

  // Render redemption events
  tbody.innerHTML = "";

  if (!redemptions || redemptions.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  redemptions.forEach(function (red, idx) {
    var tr = document.createElement("tr");
    var phone = red.newCustomerPhone || red.customerPhone || red.phone || "-";
    var bookingId = red.bookingId || red.booking_id || "-";
    var amount = red.rewardAmount || red.amount || 50;
    var redeemedAt = red.redeemedAt || red.timestamp || red.date || null;
    var status = red.status || (redeemedAt ? "completed" : "pending");

    var statusClass = "completed";
    if (status === "pending") statusClass = "pending";
    else if (status === "failed") statusClass = "failed";

    tr.innerHTML =
      "<td>" +
      (idx + 1) +
      "</td>" +
      "<td>" +
      escapeHtml(phone) +
      "</td>" +
      '<td><code class="vid-code">' +
      escapeHtml(shortId(bookingId)) +
      "</code></td>" +
      "<td>₹" +
      amount +
      "</td>" +
      "<td><small>" +
      formatDate(redeemedAt) +
      "</small></td>" +
      '<td><span class="redemption-status-badge ' +
      statusClass +
      '">' +
      status.charAt(0).toUpperCase() +
      status.slice(1) +
      "</span></td>";

    tbody.appendChild(tr);
  });
}

// ---------- Close Redemption Modal ----------
function closeRedemptionModal() {
  var modal = document.getElementById("redemptionModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

// ---------- Init Redemption Modal event listeners ----------
document.addEventListener("DOMContentLoaded", function () {
  var closeBtn = document.getElementById("redemptionModalClose");
  var overlay = document.getElementById("redemptionModal");

  if (closeBtn) closeBtn.addEventListener("click", closeRedemptionModal);

  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeRedemptionModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      overlay &&
      !overlay.classList.contains("hidden")
    ) {
      closeRedemptionModal();
    }
  });
});

/* ============================================
   UPDATE REFERRER STATS ON REDEMPTION
   When someone uses a referral code, update
   the code owner's stats in cache
   ============================================ */

function updateReferrerStatsOnRedemption(
  referralCode,
  customerPhone,
  bookingId,
) {
  // Update the local referral data if this is the current user's code
  var refData = _referralDataCache;
  if (refData && refData.code === referralCode) {
    refData.totalReferrals = (refData.totalReferrals || 0) + 1;
    refData.totalRewards = (refData.totalRewards || 0) + 50;
    refData.rewardBalance = (refData.rewardBalance || 0) + 50;
    _referralDataCache = refData;
    updateReferralStatsDisplay();
  }

  // Also update the all-referrals cache used by the admin dashboard
  var allReferrals = _allReferralsCache;
  var found = false;
  for (var i = 0; i < allReferrals.length; i++) {
    if (allReferrals[i].code === referralCode) {
      allReferrals[i].totalReferrals =
        (allReferrals[i].totalReferrals || 0) + 1;
      allReferrals[i].totalRewards = (allReferrals[i].totalRewards || 0) + 50;
      allReferrals[i].rewardBalance = (allReferrals[i].rewardBalance || 0) + 50;
      allReferrals[i].totalRedemptions =
        (allReferrals[i].totalRedemptions || 0) + 1;
      found = true;
      break;
    }
  }
  if (!found) {
    allReferrals.push({
      code: referralCode,
      name: refData && refData.code === referralCode ? refData.name : "-",
      phone: refData && refData.code === referralCode ? refData.phone : "",
      totalReferrals: 1,
      totalRedemptions: 1,
      totalRewards: 50,
      rewardBalance: 50,
      createdAt: new Date().toISOString(),
    });
  }
  _allReferralsCache = allReferrals;
}

/* ============================================
   BOOKING DATA STORAGE
   Save all bookings via API / cache for
   admin dashboard viewing
   ============================================ */

function saveBookingLocally(booking) {
  var bookings = _bookingsCache;
  bookings.unshift(booking);
  // Keep max 2000 bookings
  if (bookings.length > 2000) bookings = bookings.slice(0, 2000);
  _bookingsCache = bookings;

  // Try to save to PratapTravels-Data Azure Function API (fire-and-forget)
  var apiUrl = getDataApiUrl();
  if (apiUrl) {
    try {
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ type: "booking_data", data: booking }),
      }).catch(function () {
        /* fire-and-forget */
      });
    } catch (e) {
      /* ignore */
    }
  }
}

function getBookings() {
  return _bookingsCache;
}

// ---------- Fetch Bookings from PratapTravels-Data Azure Function API ----------
async function fetchBookingsFromApi() {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) {
    console.warn("[Bookings] No DATA_API_URL configured in config.js");
    return null;
  }

  try {
    var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
    var fetchUrl = apiUrl + separator + "type=booking";
    console.log("[Bookings] Fetching:", fetchUrl);
    var resp = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) {
      var errBody = "";
      try {
        errBody = await resp.text();
      } catch (_) {}
      console.error("[Bookings] HTTP " + resp.status + " —", errBody);
      throw new Error("HTTP " + resp.status);
    }
    var result = await resp.json();
    console.log("[Bookings] Response:", result);

    // Response format: { total: N, bookings: [...] }
    var bookings = Array.isArray(result) ? result : result.bookings || [];

    // Merge: prefer server data, keep any local-only records
    var localBookings = getBookings();
    var serverIds = {};
    for (var i = 0; i < bookings.length; i++) {
      serverIds[bookings[i].bookingId] = true;
    }
    for (var i = 0; i < localBookings.length; i++) {
      if (!serverIds[localBookings[i].bookingId]) {
        bookings.push(localBookings[i]);
      }
    }
    // Sort by createdAt descending
    bookings.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    _bookingsCache = bookings;
    return bookings;
  } catch (e) {
    console.warn("[Bookings] API GET failed:", e.message);
  }

  return getBookings().length > 0 ? getBookings() : null;
}

// ---------- Fetch Audit Trail from PratapTravels-Data Azure Function API ----------
async function fetchAuditFromApi() {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) {
    console.warn("[Audit] No DATA_API_URL configured in config.js");
    return null;
  }

  try {
    var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
    var fetchUrl = apiUrl + separator + "type=audit_trail";
    console.log("[Audit] Fetching:", fetchUrl);
    var resp = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) {
      var errBody = "";
      try {
        errBody = await resp.text();
      } catch (_) {}
      console.error("[Audit] HTTP " + resp.status + " —", errBody);
      throw new Error("HTTP " + resp.status);
    }
    var result = await resp.json();
    console.log("[Audit] Response:", result);

    var events = Array.isArray(result) ? result : result.events || [];

    var localAudit = getAuditTrail();
    var serverIds = {};
    for (var i = 0; i < events.length; i++) {
      serverIds[events[i].id] = true;
    }
    for (var i = 0; i < localAudit.length; i++) {
      if (!serverIds[localAudit[i].id]) {
        events.push(localAudit[i]);
      }
    }
    events.sort(function (a, b) {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
    _auditCache = events;
    return events;
  } catch (e) {
    console.warn("[Audit] API GET failed:", e.message);
  }

  return getAuditTrail().length > 0 ? getAuditTrail() : null;
}

/* ============================================
   AUDIT TRAIL
   Record all user activities on index.html
   ============================================ */

function recordAuditTrail(activityType, details) {
  var record = {
    id: "AUD" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type: activityType,
    details: details || {},
    page: window.location.pathname.split("/").pop() || "index.html",
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
  };

  var auditLog = _auditCache;
  auditLog.unshift(record);
  // Keep max 5000 records
  if (auditLog.length > 5000) auditLog = auditLog.slice(0, 5000);
  _auditCache = auditLog;

  // Try to send to PratapTravels-Data Azure Function API (fire-and-forget)
  var apiUrl = getDataApiUrl();
  if (apiUrl) {
    try {
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ type: "audit_trail", data: record }),
      }).catch(function () {
        /* fire-and-forget */
      });
    } catch (e) {
      /* ignore */
    }
  }
}

function getAuditTrail() {
  return _auditCache;
}

/* ============================================
   BOOKING ADMIN DASHBOARD
   ============================================ */

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
    var actionBtn = "";
    if (b.status !== "confirmed" && b.status !== "cancelled") {
      actionBtn =
        '<button class="btn-action-confirm" onclick="openConfirmBooking(\'' +
        b.bookingId +
        '\')" title="Confirm & Assign Vehicle"><i data-lucide="circle-check" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
        '<button class="btn-action-cancel" onclick="cancelBooking(\'' +
        b.bookingId +
        '\')" title="Cancel Booking"><i data-lucide="circle-x" style="width:16px;height:16px;vertical-align:middle"></i></button>';
    } else if (b.status === "confirmed") {
      actionBtn =
        '<button class="btn-refresh" style="padding:4px 10px;font-size:0.75rem;" onclick="openConfirmBooking(\'' +
        b.bookingId +
        '\')" title="Update"><i data-lucide="pencil" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
        '<button class="btn-action-confirm" onclick="completeBooking(\'' +
        b.bookingId +
        '\')" title="Mark Trip Completed"><i data-lucide="circle-check" style="width:16px;height:16px;vertical-align:middle"></i></button> ' +
        '<button class="btn-action-cancel" onclick="cancelBooking(\'' +
        b.bookingId +
        '\')" title="Cancel Booking"><i data-lucide="circle-x" style="width:16px;height:16px;vertical-align:middle"></i></button>';
    }
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
  showToast("CSV exported.", "success");
}

/* ============================================
   AUDIT TRAIL ADMIN DASHBOARD
   ============================================ */

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

function getVehicles() {
  return _vehiclesCache;
}

function saveVehicles(vehicles) {
  _vehiclesCache = vehicles;
}

function addVehicle(vehicle) {
  var vehicles = getVehicles();
  vehicle.id =
    "VH" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  vehicle.status = vehicle.status || "available";
  vehicle.createdAt = new Date().toISOString();
  vehicles.unshift(vehicle);
  saveVehicles(vehicles);
  recordAuditTrail("vehicle_add", {
    vehicleId: vehicle.id,
    vehicleNumber: vehicle.vehicleNumber,
    driverName: vehicle.driverName,
  });
  saveVehicleToApi(vehicle);
  return vehicle;
}

function updateVehicle(id, updates) {
  var vehicles = getVehicles();
  for (var i = 0; i < vehicles.length; i++) {
    if (vehicles[i].id === id) {
      for (var key in updates) {
        if (updates.hasOwnProperty(key)) vehicles[i][key] = updates[key];
      }
      vehicles[i].updatedAt = new Date().toISOString();
      saveVehicles(vehicles);
      recordAuditTrail("vehicle_update", { vehicleId: id, changes: updates });
      updateVehicleOnApi(id, updates);
      return vehicles[i];
    }
  }
  return null;
}

function deleteVehicle(id) {
  var vehicles = getVehicles();
  var filtered = vehicles.filter(function (v) {
    return v.id !== id;
  });
  saveVehicles(filtered);
  recordAuditTrail("vehicle_delete", { vehicleId: id });
  deleteVehicleFromApi(id);
}

function getVehicleById(id) {
  var vehicles = getVehicles();
  for (var i = 0; i < vehicles.length; i++) {
    if (vehicles[i].id === id) return vehicles[i];
  }
  return null;
}

function getAvailableVehicles(date, time) {
  var allVehicles = getVehicles().filter(function (v) {
    return v.status !== "maintenance";
  });
  if (!date)
    return allVehicles.filter(function (v) {
      return v.status === "available";
    });
  // Check which vehicles are already booked for this date/time slot
  var bookings = getBookings();
  var bookedVehicleIds = {};
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (b.status === "cancelled" || b.status === "completed") continue;
    if (
      b.bookingId &&
      _confirmBookingData &&
      b.bookingId === _confirmBookingData.bookingId
    )
      continue;
    var bDate = b.pickup_date || b.date;
    var bTime = b.pickup_time || b.time;
    if (bDate === date) {
      if (b.vehicleId) bookedVehicleIds[b.vehicleId] = true;
    }
  }
  return allVehicles.filter(function (v) {
    return !bookedVehicleIds[v.id];
  });
}

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
async function fetchVehiclesFromApi() {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) {
    console.warn("[Vehicles] No DATA_API_URL configured in config.js");
    return null;
  }

  try {
    var separator = apiUrl.indexOf("?") !== -1 ? "&" : "?";
    var fetchUrl = apiUrl + separator + "type=vehicle";
    console.log("[Vehicles] Fetching:", fetchUrl);
    var resp = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!resp.ok) {
      var errBody = "";
      try {
        errBody = await resp.text();
      } catch (_) {}
      console.error("[Vehicles] HTTP " + resp.status + " —", errBody);
      throw new Error("HTTP " + resp.status);
    }
    var result = await resp.json();
    console.log("[Vehicles] Response:", result);
    var vehicles = Array.isArray(result) ? result : result.vehicles || [];

    _vehiclesCache = vehicles;
    return vehicles;
  } catch (e) {
    console.warn("[Vehicles] API GET failed:", e.message);
  }
  return null;
}

// ---------- Save Vehicle to PratapTravels-Data API ----------
function saveVehicleToApi(vehicle) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "vehicle_data", data: vehicle }),
    }).catch(function () {
      /* fire-and-forget */
    });
  } catch (e) {
    /* ignore */
  }
}

// ---------- Update Vehicle on PratapTravels-Data API ----------
function updateVehicleOnApi(id, data) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "vehicle_update", id: id, data: data }),
    }).catch(function () {
      /* fire-and-forget */
    });
  } catch (e) {
    /* ignore */
  }
}

// ---------- Delete Vehicle from PratapTravels-Data API ----------
function deleteVehicleFromApi(id) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ type: "vehicle_delete", id: id }),
    }).catch(function () {
      /* fire-and-forget */
    });
  } catch (e) {
    /* ignore */
  }
}

// ---------- Persist booking update to server ----------
function persistBookingToApi(bookingId, updates) {
  var apiUrl = getDataApiUrl();
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({
        type: "booking_update",
        id: bookingId,
        data: updates,
      }),
    }).catch(function () {
      /* fire-and-forget */
    });
  } catch (e) {
    /* ignore */
  }
}

// ---------- Assign vehicle to booking ----------
function assignVehicleToBooking(bookingId, vehicleId) {
  if (!bookingId || !vehicleId) return;
  var bookings = getBookings();
  var needsNotification = false;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      bookings[i].vehicleId = vehicleId;
      bookings[i].status = "confirmed";
      // Set needs_notification flag so admin sees "Needs Action" in notification column
      if (!bookings[i].email_sent && !bookings[i].notification_sent) {
        bookings[i].needs_notification = true;
        needsNotification = true;
      }
      break;
    }
  }
  _bookingsCache = bookings;

  // Persist status change and notification flag to server
  persistBookingToApi(bookingId, {
    status: "confirmed",
    vehicleId: vehicleId,
    needs_notification: needsNotification
  });

  // Update vehicle status to booked
  updateVehicle(vehicleId, { status: "booked" });

  // Audit
  recordAuditTrail("vehicle_assigned", {
    bookingId: bookingId,
    vehicleId: vehicleId,
  });
}

function releaseVehicleFromBooking(bookingId) {
  var bookings = getBookings();
  var vehicleId = null;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      vehicleId = bookings[i].vehicleId;
      bookings[i].vehicleId = null;
      break;
    }
  }
  _bookingsCache = bookings;
  if (vehicleId) {
    updateVehicle(vehicleId, { status: "available" });
    recordAuditTrail("vehicle_released", {
      bookingId: bookingId,
      vehicleId: vehicleId,
    });
  }
}

function changeBookingStatus(bookingId, newStatus) {
  var bookings = getBookings();
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      var vehicleId = bookings[i].vehicleId;
      bookings[i].status = newStatus;
      var apiUpdates = { status: newStatus };
      if ((newStatus === "cancelled" || newStatus === "completed") && vehicleId) {
        bookings[i].vehicleId = null;
        apiUpdates.vehicleId = null;
        // Clear driver/vehicle info on the booking record
        bookings[i].vehicleNumber = '';
        bookings[i].vehicleType = '';
        bookings[i].driverName = '';
        bookings[i].driverPhone = '';
        apiUpdates.vehicleNumber = '';
        apiUpdates.vehicleType = '';
        apiUpdates.driverName = '';
        apiUpdates.driverPhone = '';
        updateVehicle(vehicleId, { status: "available" });
        recordAuditTrail("vehicle_released", {
          bookingId: bookingId,
          vehicleId: vehicleId,
        });
      }
      _bookingsCache = bookings;
      // Persist all status and vehicle changes to server
      persistBookingToApi(bookingId, apiUpdates);
      recordAuditTrail("booking_status_change", {
        bookingId: bookingId,
        newStatus: newStatus,
      });
      break;
    }
  }
}

// ---------- Vehicle Schedule View ----------
function getVehicleSchedule(vehicleId) {
  var bookings = getBookings();
  var schedule = [];
  for (var i = 0; i < bookings.length; i++) {
    if (
      bookings[i].vehicleId === vehicleId &&
      bookings[i].status !== "cancelled"
    ) {
      schedule.push(bookings[i]);
    }
  }
  // Sort by date
  schedule.sort(function (a, b) {
    return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0);
  });
  return schedule;
}

async function renderVehicleSchedule(vehicleId) {
  // Ensure bookings are loaded from API before rendering schedule
  if (getBookings().length === 0) {
    await fetchBookingsFromApi();
  }
  var tbody = document.getElementById("vehicleScheduleBody");
  var emptyState = document.getElementById("emptyScheduleState");
  var panel = document.getElementById("vehicleSchedulePanel");
  if (!tbody || !panel) return;

  var vehicle = getVehicleById(vehicleId);
  var titleEl = document.getElementById("vehicleScheduleTitle");
  if (titleEl && vehicle) {
    titleEl.textContent =
      "📅 Schedule: " + vehicle.vehicleNumber + " (" + vehicle.driverName + ")";
  }

  var schedule = getVehicleSchedule(vehicleId);
  tbody.innerHTML = "";

  if (schedule.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    panel.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  schedule.forEach(function (b) {
    var tr = document.createElement("tr");
    var statusClass =
      b.status === "confirmed"
        ? "status-confirmed"
        : b.status === "cancelled"
          ? "status-cancelled"
          : "status-pending";
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
      escapeHtml(b.passengers || "-") +
      "</td>" +
      '<td><span class="booking-status-badge ' +
      statusClass +
      '">' +
      (b.status || "pending") +
      "</span></td>";
    tbody.appendChild(tr);
  });

  panel.classList.remove("hidden");
}

function closeVehicleSchedule() {
  var panel = document.getElementById("vehicleSchedulePanel");
  if (panel) panel.classList.add("hidden");
}

// ---------- Confirm Booking & Assign Vehicle ----------
var _confirmBookingData = null;

function openConfirmBooking(bookingId) {
  var bookings = getBookings();
  var booking = null;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      booking = bookings[i];
      break;
    }
  }
  if (!booking) return;
  _confirmBookingData = booking;

  var modal = document.getElementById("confirmBookingModal");
  var infoDiv = document.getElementById("confirmBookingInfo");
  if (!modal || !infoDiv) return;

  document.getElementById("confirmBookingId").value = bookingId;

  // Show booking summary
  var vName = "-",
    dName = "-";
  if (booking.vehicleId) {
    var v = getVehicleById(booking.vehicleId);
    if (v) {
      vName = v.vehicleNumber;
      dName = v.driverName;
    }
  }
  infoDiv.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.9rem;">' +
    "<div><strong>Name:</strong> " +
    escapeHtml(booking.name || "-") +
    "</div>" +
    "<div><strong>Phone:</strong> " +
    escapeHtml(booking.phone || "-") +
    "</div>" +
    "<div><strong>Route:</strong> " +
    escapeHtml(booking.route || "-") +
    "</div>" +
    "<div><strong>Date:</strong> " +
    escapeHtml(booking.date || "-") +
    "</div>" +
    "<div><strong>Time:</strong> " +
    escapeHtml(booking.time || "-") +
    "</div>" +
    "<div><strong>Passengers:</strong> " +
    escapeHtml(booking.passengers || "-") +
    "</div>" +
    "<div><strong>Trip Type:</strong> " +
    escapeHtml(booking.trip_type || "-") +
    "</div>" +
    "<div><strong>Current Vehicle:</strong> " +
    vName +
    "</div>" +
    "</div>";

  // Pre-fill pickup date/time from booking
  document.getElementById("confirmPickupDate").value = booking.date || "";
  document.getElementById("confirmPickupTime").value =
    booking.time && booking.time !== "Not specified" ? booking.time : "";
  document.getElementById("confirmPickupAddress").value =
    booking.pickup_address || "";
  document.getElementById("confirmAdminNotes").value =
    booking.admin_notes || "";

  // Populate vehicle dropdown with date/time filtering
  var selPickupDate = document.getElementById("confirmPickupDate");
  var selPickupTime = document.getElementById("confirmPickupTime");
  var filterDate = selPickupDate ? selPickupDate.value : booking.date;
  var filterTime = selPickupTime ? selPickupTime.value : booking.time;
  updateVehicleDropdowns(filterDate, filterTime);
  if (booking.vehicleId) {
    var sel = document.getElementById("vehicleSelect");
    if (sel) sel.value = booking.vehicleId;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Refresh vehicle dropdown when pickup date/time changes
  var pickupDateEl = document.getElementById("confirmPickupDate");
  var pickupTimeEl = document.getElementById("confirmPickupTime");
  function refreshVehicleList() {
    var d = pickupDateEl ? pickupDateEl.value : null;
    var t = pickupTimeEl ? pickupTimeEl.value : null;
    var curBookingId = document.getElementById("confirmBookingId")
      ? document.getElementById("confirmBookingId").value
      : null;
    updateVehicleDropdowns(d, t);
    // Re-select current vehicle if still available
    var currentVehicleId = null;
    if (curBookingId) {
      var bk = getBookings();
      for (var i = 0; i < bk.length; i++) {
        if (bk[i].bookingId === curBookingId && bk[i].vehicleId) {
          currentVehicleId = bk[i].vehicleId;
          break;
        }
      }
    }
    if (currentVehicleId) {
      var sel = document.getElementById("vehicleSelect");
      if (sel) sel.value = currentVehicleId;
    }
  }
  if (pickupDateEl)
    pickupDateEl.removeEventListener("change", refreshVehicleList);
  if (pickupDateEl) pickupDateEl.addEventListener("change", refreshVehicleList);
  if (pickupTimeEl)
    pickupTimeEl.removeEventListener("change", refreshVehicleList);
  if (pickupTimeEl) pickupTimeEl.addEventListener("change", refreshVehicleList);

  refreshLucideIcons();
}

function closeConfirmBookingModal() {
  var modal = document.getElementById("confirmBookingModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
  _confirmBookingData = null;
}

/* ============================================
   BOOKING NOTIFICATION SYSTEM
   Send email / WhatsApp notification on booking confirm
   ============================================ */

function buildConfirmationEmailBody(booking) {
  var name = booking.name || "Guest";
  var route = booking.route || "-";
  var vehicleInfo = "-";
  var driverInfo = "-";
  if (booking.vehicleId) {
    var v = getVehicleById(booking.vehicleId);
    if (v) {
      vehicleInfo = v.vehicleNumber + " (" + v.vehicleType + ")";
      driverInfo = v.driverName;
    }
  }
  var pickupDate = booking.pickup_date || booking.date || "-";
  var pickupTime = booking.pickup_time || booking.time || "Not specified";
  var pickupAddr = booking.pickup_address || "";
  var lang = typeof I18N !== "undefined" ? I18N.getLanguage() : "hi";
  var subject, body;
  if (lang === "hi") {
    subject =
      "Pratap Travels \u2014 \u0906\u092a\u0915\u0940 \u092c\u0941\u0915\u093f\u0902\u0917 \u092a\u0941\u0937\u094d\u091f\u093f \u0939\u094b \u0917\u092f\u093e";
    body = "\u0928\u092e\u0938\u094d\u0924\u094e " + name + ",\n\n";
    body +=
      "\u0906\u092a\u0915\u0940 \u092c\u0941\u0915\u093f\u0902\u0917 \u092a\u0941\u0937\u094d\u091f\u093f \u0939\u094b \u0917\u092f\u093e \u0939\u0948!\n\n";
    body +=
      "\u092c\u0941\u0915\u093f\u0902\u0917 ID: " +
      (booking.bookingId || "-") +
      "\n";
    body += "\u092e\u093e\u0930\u094d\u0917: " + route + "\n";
    body += "\u0924\u093f\u0925: " + pickupDate + "\n";
    body += "\u0938\u092e\u092f: " + pickupTime + "\n";
    body += "\u0935\u093e\u0939\u0928: " + vehicleInfo + "\n";
    body += "\u0921\u094d\u0930\u093e\u0907\u0935\u0930: " + driverInfo + "\n";
    if (pickupAddr)
      body += "\u092a\u093f\u0915\u0905\u092a: " + pickupAddr + "\n";
    body +=
      "\n\u0915\u0943\u092a\u092f\u093e \u091f\u094d\u0930\u0948\u0935\u0932\u094d\u0938 +91 76313 82174";
  } else {
    subject = "Pratap Travels \u2014 Your Booking is Confirmed!";
    body = "Hi " + name + ",\n\n";
    body += "Your booking has been confirmed!\n\n";
    body += "Booking ID: " + (booking.bookingId || "-") + "\n";
    body += "Route: " + route + "\n";
    body += "Travel Date: " + pickupDate + "\n";
    body += "Time: " + pickupTime + "\n";
    body += "Vehicle: " + vehicleInfo + "\n";
    body += "Driver: " + driverInfo + "\n";
    if (pickupAddr) body += "Pickup: " + pickupAddr + "\n";
    body +=
      "\nThank you for choosing Pratap Travels! Call +91 76313 82174 for queries.";
  }
  return { subject: subject, body: body };
}

function buildConfirmationWhatsAppMsg(booking) {
  var name = booking.name || "Guest";
  var route = booking.route || "-";
  var vehicleInfo = "-";
  var driverInfo = "-";
  if (booking.vehicleId) {
    var v = getVehicleById(booking.vehicleId);
    if (v) {
      vehicleInfo = v.vehicleNumber + " (" + v.vehicleType + ")";
      driverInfo = v.driverName;
    }
  }
  var pickupDate = booking.pickup_date || booking.date || "-";
  var pickupTime = booking.pickup_time || booking.time || "Not specified";
  var pickupAddr = booking.pickup_address || "";
  var lang = typeof I18N !== "undefined" ? I18N.getLanguage() : "hi";
  var msg;
  if (lang === "hi") {
    msg =
      "*PRATAP TRAVELS \u2014 \u092c\u0941\u0915\u093f\u0902\u0917 \u092a\u0941\u0937\u094d\u091f\u093f!*\n\n";
    msg += "\u0928\u092e\u0938\u094d\u0924\u094e " + name + ",\n\n";
    msg +=
      "\u0906\u092a\u0915\u0940 \u092c\u0941\u0915\u093f\u0902\u0917 \u092a\u0941\u0937\u094d\u091f\u093f \u0939\u094b \u0917\u092f\u093e \u0939\u0948!\n\n";
    msg +=
      "*\u092c\u0941\u0915\u093f\u0902\u0917 ID:* " +
      (booking.bookingId || "-") +
      "\n";
    msg += "*\u092e\u093e\u0930\u094d\u0917:* " + route + "\n";
    msg += "*\u0924\u093f\u0925:* " + pickupDate + "\n";
    msg += "*\u0938\u092e\u092f:* " + pickupTime + "\n";
    msg += "*\u0935\u093e\u0939\u0928:* " + vehicleInfo + "\n";
    msg += "*\u0921\u094d\u0930\u093e\u0907\u0935\u0930:* " + driverInfo + "\n";
    if (pickupAddr)
      msg += "*\u092a\u093f\u0915\u0905\u092a:* " + pickupAddr + "\n";
    msg +=
      "\n\u0915\u0943\u092a\u092f\u093e \u0939\u092e\u0947\u0902 \u091a\u0941\u0928\u0947 \u0935\u093e\u0932\u0947 \u091f\u094d\u0930\u0948\u0935\u0932\u094d\u0938!";
  } else {
    msg = "*PRATAP TRAVELS \u2014 Booking Confirmed!*\n\n";
    msg += "Hi " + name + ",\n\n";
    msg += "Your booking has been confirmed!\n\n";
    msg += "*Booking ID:* " + (booking.bookingId || "-") + "\n";
    msg += "*Route:* " + route + "\n";
    msg += "*Date:* " + pickupDate + "\n";
    msg += "*Time:* " + pickupTime + "\n";
    msg += "*Vehicle:* " + vehicleInfo + "\n";
    msg += "*Driver:* " + driverInfo + "\n";
    if (pickupAddr) msg += "*Pickup:* " + pickupAddr + "\n";
    msg += "\nThank you for choosing Pratap Travels!";
  }
  return msg;
}

function sendBookingNotification(bookingId) {
  var bookings = getBookings();
  var booking = null;
  for (var i = 0; i < bookings.length; i++) {
    if (bookings[i].bookingId === bookingId) {
      booking = bookings[i];
      break;
    }
  }
  if (!booking) return;
  if (booking.email_sent) {
    showToast("Confirmation email already sent for this booking.", "info");
    return;
  }
  // Open email confirmation modal with pre-filled data
  openEmailConfirmationModal(booking);
}

// ---------- Email Confirmation Modal ----------
function openEmailConfirmationModal(booking) {
  var modal = document.getElementById("emailConfirmModal");
  if (!modal) return;
  var lang = typeof I18N !== "undefined" ? I18N.getLanguage() : "hi";
  var vehicleInfo = "-";
  var driverInfo = "-";
  if (booking.vehicleId) {
    var v = getVehicleById(booking.vehicleId);
    if (v) {
      vehicleInfo = v.vehicleNumber + " (" + v.vehicleType + ")";
      driverInfo = v.driverName;
    }
  }
  var emailBody = buildConfirmationEmailBody(booking);
  // Pre-fill modal fields
  document.getElementById("emailConfirmBookingId").value = booking.bookingId;
  document.getElementById("emailConfirmTo").value = booking.email || "";
  document.getElementById("emailConfirmCc1").value = "gautam958@gmail.com";
  document.getElementById("emailConfirmCc2").value =
    "krishnakumar958@gmail.com";
  document.getElementById("emailConfirmSubject").value = emailBody.subject;
  document.getElementById("emailConfirmBody").value = emailBody.body;
  // Store booking data for sending
  modal.setAttribute("data-booking-id", booking.bookingId);
  // Always show To field (admin can manually enter email if not available)
  var toRow = document.getElementById("emailConfirmToRow");
  if (toRow) toRow.style.display = "";
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  refreshLucideIcons();
}

function closeEmailConfirmModal() {
  var modal = document.getElementById("emailConfirmModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

function sendEmailConfirmation() {
  var modal = document.getElementById("emailConfirmModal");
  if (!modal) return;
  var bookingId = modal.getAttribute("data-booking-id");
  var to = document.getElementById("emailConfirmTo").value.trim();
  var cc1 = document.getElementById("emailConfirmCc1").value.trim();
  var cc2 = document.getElementById("emailConfirmCc2").value.trim();
  var subject = document.getElementById("emailConfirmSubject").value.trim();
  var body = document.getElementById("emailConfirmBody").value.trim();
  if (!to && !cc1 && !cc2) {
    showToast("Please enter at least one email address.", "error");
    return;
  }
  var dataApiUrl = getDataApiUrl();
  if (!dataApiUrl) {
    showToast("No API configured. Please send email manually.", "error");
    return;
  }
  var sendBtn = document.getElementById("emailConfirmSendBtn");
  if (sendBtn) {
    sendBtn.textContent = "Sending...";
    sendBtn.disabled = true;
  }
  fetch(dataApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    mode: "cors",
    body: JSON.stringify({
      type: "booking_confirmation",
      to: to,
      email: to,
      cc: [cc1, cc2].filter(function (e) {
        return e !== "";
      }),
      subject: subject,
      body: body,
      bookingId: bookingId,
      bookingData: (function() {
        var bookings = getBookings();
        for (var i = 0; i < bookings.length; i++) {
          if (bookings[i].bookingId === bookingId) return bookings[i];
        }
        return null;
      })(),
    }),
  })
    .then(function (resp) {
      if (resp.ok) {
        // Mark email as sent on the booking
        var bookings = getBookings();
        for (var i = 0; i < bookings.length; i++) {
          if (bookings[i].bookingId === bookingId) {
            bookings[i].email_sent = true;
            bookings[i].notification_sent = true;
            bookings[i].notification_type = "email";
            bookings[i].notified_at = new Date().toISOString();
            bookings[i].email_sent_to = to;
            bookings[i].email_sent_cc = [cc1, cc2].filter(function (e) {
              return e !== "";
            });
            bookings[i].needs_notification = false;
            break;
          }
        }
        _bookingsCache = bookings;
        renderBookingTable();
        persistBookingToApi(bookingId, {
          email_sent: true,
          notification_sent: true,
          notification_type: "email",
          notified_at: new Date().toISOString(),
          needs_notification: false,
          email_sent_to: to,
          email_sent_cc: [cc1, cc2].filter(function (e) {
            return e !== "";
          }),
        });
        recordAuditTrail("notification_email", {
          bookingId: bookingId,
          to: to,
          cc: [cc1, cc2],
        });
        showToast("Confirmation email sent to " + to, "success");
        closeEmailConfirmModal();
      } else {
        throw new Error("HTTP " + resp.status);
      }
    })
    .catch(function (err) {
      console.error("[Notification] Email API failed:", err.message);
      showToast("Email sending failed: " + err.message, "error");
      recordAuditTrail("notification_email_failed", {
        bookingId: bookingId,
        error: err.message,
      });
    })
    .finally(function () {
      if (sendBtn) {
        sendBtn.innerHTML = lucideIcon("mail",16) + " Send Confirmation";
        sendBtn.disabled = false;
      }
    });
}

// ---------- Init vehicle modal listeners ----------
document.addEventListener("DOMContentLoaded", function () {
  var vhForm = document.getElementById("vehicleForm");
  if (vhForm) vhForm.addEventListener("submit", saveVehicleForm);

  // Init confirm booking form
  var confirmForm = document.getElementById('confirmBookingForm');
  if (confirmForm) {
    confirmForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var bookingId = document.getElementById('confirmBookingId').value;
      var vehicleId = document.getElementById('vehicleSelect').value;
      var pickupDate = document.getElementById('confirmPickupDate').value;
      var pickupTime = document.getElementById('confirmPickupTime').value;
      var pickupAddr = document.getElementById('confirmPickupAddress').value;
      var adminNotes = document.getElementById('confirmAdminNotes').value;
      if (!vehicleId || vehicleId === '__new__') {
        showToast('Please select a vehicle', 'error');
        return;
      }
      if (!pickupDate) {
        showToast('Please select pickup date', 'error');
        return;
      }
      var vehicle = getVehicleById(vehicleId);
      // Update local booking cache with pickup/vehicle details BEFORE assignVehicleToBooking
      // (assignVehicleToBooking sets status=confirmed, vehicleId, and persists to API + updates vehicle)
      var bookings = getBookings();
      for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].bookingId === bookingId) {
          bookings[i].pickup_date = pickupDate;
          bookings[i].pickup_time = pickupTime;
          bookings[i].pickup_address = pickupAddr;
          bookings[i].admin_notes = adminNotes;
          bookings[i].vehicleNumber = vehicle ? vehicle.vehicleNumber : '';
          bookings[i].vehicleType = vehicle ? vehicle.vehicleType : '';
          bookings[i].driverName = vehicle ? vehicle.driverName : '';
          bookings[i].driverPhone = vehicle ? vehicle.driverPhone : '';
          break;
        }
      }
      _bookingsCache = bookings;
      // Now assign vehicle (sets status=confirmed, vehicleId, persists to API, updates vehicle status)
      assignVehicleToBooking(bookingId, vehicleId);
      // Persist the additional pickup/vehicle details to API (status+vehicleId already persisted by assignVehicleToBooking)
      persistBookingToApi(bookingId, {
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        pickup_address: pickupAddr,
        admin_notes: adminNotes,
        vehicleNumber: vehicle ? vehicle.vehicleNumber : '',
        vehicleType: vehicle ? vehicle.vehicleType : '',
        driverName: vehicle ? vehicle.driverName : '',
        driverPhone: vehicle ? vehicle.driverPhone : ''
      });
      recordAuditTrail('booking_confirm', { bookingId: bookingId, vehicleId: vehicleId });
      closeConfirmBookingModal();
      renderBookingTable();
      updateBookingKPIs();
      renderVehicleTable();
      updateVehicleKPIs();
      showToast('Booking confirmed and vehicle assigned!', 'success');
    });
  }

  var cbCloseBtn = document.getElementById("confirmBookingModalClose");
  var cbOverlay = document.getElementById("confirmBookingModal");
  if (cbCloseBtn)
    cbCloseBtn.addEventListener("click", closeConfirmBookingModal);
  if (cbOverlay)
    cbOverlay.addEventListener("click", function (e) {
      if (e.target === cbOverlay) closeConfirmBookingModal();
    });
  // Email confirm modal handlers
  var emailOverlay = document.getElementById("emailConfirmModal");
  if (emailOverlay)
    emailOverlay.addEventListener("click", function (e) {
      if (e.target === emailOverlay) closeEmailConfirmModal();
    });
  var emailCloseBtn = document.getElementById("emailConfirmModalClose");
  if (emailCloseBtn)
    emailCloseBtn.addEventListener("click", closeEmailConfirmModal);

  var vhCloseBtn = document.getElementById("vehicleModalClose");
  var vhOverlay = document.getElementById("vehicleModal");
  if (vhCloseBtn) vhCloseBtn.addEventListener("click", closeVehicleModal);
  if (vhOverlay)
    vhOverlay.addEventListener("click", function (e) {
      if (e.target === vhOverlay) closeVehicleModal();
    });

  var qvForm = document.getElementById("quickVehicleForm");
  if (qvForm) qvForm.addEventListener("submit", saveQuickVehicle);

  var qvCloseBtn = document.getElementById("quickVehicleModalClose");
  var qvOverlay = document.getElementById("quickVehicleModal");
  if (qvCloseBtn) qvCloseBtn.addEventListener("click", closeQuickVehicleModal);
  if (qvOverlay)
    qvOverlay.addEventListener("click", function (e) {
      if (e.target === qvOverlay) closeQuickVehicleModal();
    });

  // Init vehicle dashboard (vehicle.html)
  if (document.getElementById("vehicleTableBody")) {
    renderVehicleTable();
    updateVehicleKPIs();
  }

  // Update vehicle dropdowns on booking.html
  if (document.getElementById("vehicleSelect")) {
    updateVehicleDropdowns();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeVehicleModal();
      closeQuickVehicleModal();
      closeVehicleSchedule();
      closeConfirmBookingModal();
      if (typeof closeEmailConfirmModal === "function")
        closeEmailConfirmModal();
    }
  });
});

/* ============================================
   TRACK USER INTERACTIONS ON INDEX.HTML
   ============================================ */

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

  // Auto-track this page visit (fires on every page that loads main.js)
  // Skip tracking on admin-only pages (admin.html, visitors.html, referral.html)
  if (typeof trackVisit === "function") {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    var adminPages = [
      "admin.html",
      "visitors.html",
      "referral.html",
      "booking.html",
      "audit-trail.html",
      "vehicle.html",
      "revenue.html",
    ];
    if (adminPages.indexOf(currentPage) === -1) {
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
  if (!route) {
    resultDiv.innerHTML = '<p class="calc-placeholder">\ud83d\udccd Select a route to see estimated fare</p>';
    return;
  }
  var routeData = ROUTE_PRICES[route];
  var vehicleMult = VEHICLE_MULTIPLIERS[vehicle] || 1.0;
  var tripMult = TRIP_MULTIPLIERS[trip] || 1.0;
  var minPrice = Math.round(routeData.base * vehicleMult * tripMult);
  var maxPrice = Math.round(routeData.max * vehicleMult * tripMult);
  resultDiv.innerHTML =
    '<div class="calc-result-content">' +
    '<div class="calc-price-range">\u20b9' + minPrice.toLocaleString() + ' \u2013 \u20b9' + maxPrice.toLocaleString() + '</div>' +
    '<div class="calc-details">' +
    '<span>\ud83d\udccd ' + routeData.distance + ' km</span>' +
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

async function lookupBookingStatus() {
  var input = document.getElementById('statusInput');
  var resultDiv = document.getElementById('statusResult');
  if (!input || !resultDiv) return;
  var query = input.value.trim();
  if (!query) {
    showToast('Please enter a Booking ID or Phone Number', 'error');
    return;
  }
  resultDiv.innerHTML = '<div class="status-loading"><i data-lucide="loader" style="width:24px;height:24px;vertical-align:middle"></i> Looking up your booking...</div>';
  // Use existing PratapTravels-Data Azure Function with type=status
  var dataApiUrl = getDataApiUrl();
  if (!dataApiUrl) {
    resultDiv.innerHTML = '<div class="status-error">Service temporarily unavailable. Please try again later.</div>';
    return;
  }
  try {
    var separator = dataApiUrl.indexOf('?') !== -1 ? '&' : '?';
    var fetchUrl = dataApiUrl + separator + 'type=status&query=' + encodeURIComponent(query);
    var resp = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var data = await resp.json();
    if (!data || !data.bookingId) {
      resultDiv.innerHTML = '<div class="status-not-found"><i data-lucide="search-x" style="width:20px;height:20px;vertical-align:middle"></i> No booking found for \"' + escapeHtml(query) + '\". Please check your Booking ID or Phone Number and try again.</div>';
      return;
    }
    var statusClass = data.status === 'confirmed' ? 'status-confirmed' : data.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
    var statusIcon = lucideIcon(data.status === "confirmed" ? "circle-check" : data.status === "cancelled" ? "circle-x" : "clock", 32);
    var vehicleInfo = data.vehicleNumber ? '<p><strong><i data-lucide="car" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.vehicleNumber) + ' (' + escapeHtml(data.vehicleType || '') + ')</p>' : '';
    var driverInfo = data.driverName ? '<p><strong><i data-lucide="user" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.driverName) + (data.driverPhone ? ' (' + escapeHtml(data.driverPhone) + ')' : '') + '</p>' : '';
    var pickupInfo = data.pickup_address ? '<p><strong>\ud83d\udccd Pickup:</strong> ' + escapeHtml(data.pickup_address) + '</p>' : '';
    resultDiv.innerHTML =
      '<div class="status-card">' +
      '<div class="status-header">' +
      '<span class="status-icon">' + statusIcon + '</span>' +
      '<span class="booking-status-badge ' + statusClass + '">' + data.status + '</span>' +
      '</div>' +
      '<div class="status-details">' +
      '<p><strong><i data-lucide="clipboard-list" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.bookingId) + '</p>' +
      '<p><strong><i data-lucide="user" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.name || '-') + '</p>' +
      '<p><strong><i data-lucide="map" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.route || '-') + '</p>' +
      '<p><strong><i data-lucide="calendar" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.date || '-') + '</p>' +
      '<p><strong><i data-lucide="clock" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.time || '-') + '</p>' +
      '<p><strong><i data-lucide="users" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.passengers || '-') + '</p>' +
      '<p><strong><i data-lucide="repeat" style="width:16px;height:16px;vertical-align:middle"></i></strong> ' + escapeHtml(data.trip_type || '-') + '</p>' +
      vehicleInfo + driverInfo + pickupInfo +
      '</div>' +
      '</div>';
  } catch (e) {
    console.error('Status lookup failed:', e);
    resultDiv.innerHTML = '<div class="status-error"><i data-lucide="alert-triangle" style="width:20px;height:20px;vertical-align:middle"></i> Unable to look up booking status. Please try again later or contact us at +91 76313 82174.</div>';
  }
}

/* ============================================
   FEATURE: Revenue Dashboard
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
  }
  if (document.getElementById('revTotalBookings')) {
    fetchRevenueData().then(function(data) {
      if (!data) data = calculateLocalRevenue();
      renderRevenueDashboard(data);
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
function getDriverDiaryEntries() {
  return _driverDiaryCache;
}

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
function closeDriverDiaryModal() {
  var modal = document.getElementById("driverDiaryModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

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
      showToast("एंट्री अपडेट हो गई।", "success");
    } else {
      showToast("अपडेट विफल (API offline)।", "info");
    }
  } else {
    var result = await saveDriverDiaryToApi(entry);
    if (result) {
      showToast("एंट्री सेव हो गई।", "success");
    } else {
      showToast("सेव विफल (API offline)।", "info");
    }
  }
  closeDriverDiaryModal();
  await refreshDriverDiary();
}

// ---------- Delete Driver Diary Entry ----------
async function deleteDriverDiaryEntry(id) {
  if (!confirm("क्या आप इस एंट्री को हटाना चाहते हैं?")) return;
  var result = await deleteDriverDiaryFromApi(id);
  if (result) {
    showToast("एंट्री हटा दी गई।", "success");
  } else {
    showToast("हटाना विफल (API offline)।", "info");
  }
  await refreshDriverDiary();
}

// ---------- Refresh Driver Diary ----------
async function refreshDriverDiary() {
  var apiEntries = await fetchDriverDiaryFromApi();
  if (apiEntries) {
    showToast("डायरी रिफ़्रेश हो गई।", "success");
  } else {
    showToast("API उपलब्ध नहीं है।", "info");
  }
  renderDriverDiaryTable();
  updateDriverDiaryKPIs();
}

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
function editDriverDiaryEntry(id) {
  var entries = getDriverDiaryEntries();
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].id === id) {
      openDriverDiaryModal(entries[i]);
      return;
    }
  }
  showToast("एंट्री नहीं मिली।", "error");
}

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
function exportDriverDiaryCSV() {
  var entries = getDriverDiaryEntries();
  if (entries.length === 0) {
    showToast("No data to export.", "error");
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
