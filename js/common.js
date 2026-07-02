/* ============================================
   PRATAP TRAVELS - Common JavaScript
   Shared utilities, auth, API helpers, caches,
   visitor tracking, Google Sign-In, navbar
   ============================================ */



// ---------- Lucide Icon Helper ----------
function lucideIcon(name, size) {
  size = size || 18;
  return '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px;vertical-align:middle"></i>';
}

function refreshLucideIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// ---------- Admin Page Loading Indicator ----------
var _adminPageLoaderCount = 0;
var _indexVisitTracked = false;

function isAdminPage() {
  return !!(
    document.getElementById("authSection") &&
    document.getElementById("dashboardSection")
  );
}

function ensureAdminPageLoader() {
  if (!isAdminPage()) return null;
  var loader = document.getElementById("adminPageLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "adminPageLoader";
    loader.className = "admin-page-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-label", "Loading admin data");
    loader.innerHTML = '<div class="admin-page-loader-spinner"></div>';
    document.body.appendChild(loader);
  }
  return loader;
}

function showAdminPageLoader() {
  var loader = ensureAdminPageLoader();
  if (!loader) return;
  _adminPageLoaderCount++;
  loader.classList.add("visible");
}

function hideAdminPageLoader() {
  var loader = document.getElementById("adminPageLoader");
  if (!loader) return;
  _adminPageLoaderCount = Math.max(0, _adminPageLoaderCount - 1);
  if (_adminPageLoaderCount === 0) loader.classList.remove("visible");
}

function withAdminPageLoader(task) {
  showAdminPageLoader();
  return Promise.resolve()
    .then(task)
    .finally(function () {
      hideAdminPageLoader();
    });
}

(function initAdminPageLoader() {
  if (!isAdminPage()) return;
  showAdminPageLoader();
  window.addEventListener("load", function () {
    setTimeout(hideAdminPageLoader, 150);
  });
})();

function trackIndexPageVisitOnce() {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (currentPage !== "index.html" || _indexVisitTracked) return;
  _indexVisitTracked = true;
  if (typeof trackVisit === "function") {
    trackVisit().catch(function () {
      /* fire-and-forget tracking */
    });
    recordAuditTrail("page_visit", { page: currentPage });
  }
}

document.addEventListener("DOMContentLoaded", trackIndexPageVisitOnce);

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
      var fromLocationVal = document.getElementById("bookFromLocation") ? document.getElementById("bookFromLocation").value.trim() : "";
      var toLocationVal = document.getElementById("bookToLocation") ? document.getElementById("bookToLocation").value.trim() : "";

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
        from_location: fromLocationVal,
        to_location: toLocationVal,
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
var _gsiInitialized = false;

// Show loading spinner on the Google sign-in button while GIS script loads
// Runs immediately (not in DOMContentLoaded) so the spinner is visible during
// the GIS defer-script network download.
(function _initGsiLoadingState() {
  var btn = document.getElementById("googleSignIn");
  if (!btn) return;
  // If GIS already loaded, nothing to do
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) return;

  // Save original button content
  btn.setAttribute("data-original-html", btn.innerHTML);
  btn.disabled = true;
  btn.innerHTML =
    '<span class="google-btn-loading-spinner"></span>' +
    '<span style="color:var(--text-secondary);font-size:0.9rem;">Loading Google Sign-In…</span>';
  btn.style.pointerEvents = "none";

  // Poll for GIS readiness, then restore the button
  var attempts = 0;
  var check = setInterval(function () {
    attempts++;
    if (
      typeof google !== "undefined" &&
      google.accounts &&
      google.accounts.id
    ) {
      clearInterval(check);
      _restoreGsiButton(btn);
    } else if (attempts > 100) {
      // 10 seconds max (100 × 100ms)
      clearInterval(check);
      _restoreGsiButton(btn, true);
    }
  }, 100);
})();



function _restoreGsiButton(btn, timedOut) {
  if (!btn) return;
  var orig = btn.getAttribute("data-original-html");
  if (orig) btn.innerHTML = orig;
  btn.disabled = false;
  btn.style.pointerEvents = "";
  if (timedOut) {
    console.warn(
      "Google Identity Services script did not load in time. Sign-in may not work.",
    );
  }
}



function handleGoogleSignIn() {
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
    // Only initialize once to avoid "called multiple times" warning
    if (!_gsiInitialized) {
      google.accounts.id.initialize({
        client_id:
          "529204997074-5upkbf81uq05ueef0ai1ik606vpmeg6p.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse,
        use_fedcm_for_prompt: false,
      });
      _gsiInitialized = true;
    }

    // 1. Try to display the One Tap overlay prompt
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn(
          "One-tap prompt skipped or blocked. Rendering sign-in button as fallback.",
        );

        // 2. Fallback: render the official Google Sign-In button so user can click it
        var fallbackContainer = document.getElementById("gsiFallbackButton");
        if (fallbackContainer) {
          fallbackContainer.innerHTML = "";
          fallbackContainer.classList.remove("hidden");
          google.accounts.id.renderButton(fallbackContainer, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 300,
          });
        }
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
      // (function defined in admin.js — only available on admin pages)
      if (typeof _refreshCurrentDashboard === "function") {
        _refreshCurrentDashboard();
      }
    }
  }
});

// ---------- Refresh dashboard tables after login ----------

// ---------- Cancel Booking ----------


function escapeHtml(text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ---------- Open Booking Modal (called from onclick handlers) ----------



(function _initGsiLoadingState() {
  var btn = document.getElementById("googleSignIn");
  if (!btn) return;
  // If GIS already loaded, nothing to do
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) return;

  // Save original button content
  btn.setAttribute("data-original-html", btn.innerHTML);
  btn.disabled = true;
  btn.innerHTML =
    '<span class="google-btn-loading-spinner"></span>' +
    '<span style="color:var(--text-secondary);font-size:0.9rem;">Loading Google Sign-In…</span>';
  btn.style.pointerEvents = "none";

  // Poll for GIS readiness, then restore the button
  var attempts = 0;
  var check = setInterval(function () {
    attempts++;
    if (
      typeof google !== "undefined" &&
      google.accounts &&
      google.accounts.id
    ) {
      clearInterval(check);
      _restoreGsiButton(btn);
    } else if (attempts > 100) {
      // 10 seconds max (100 × 100ms)
      clearInterval(check);
      _restoreGsiButton(btn, true);
    }
  }, 100);
})();

// ---------- Check login state on page load ----------

/* ============================================
   IN-MEMORY CACHES & STORAGE KEYS
   ============================================ */

var _bookingsCache = [];
var _auditCache = [];
var _vehiclesCache = [];
var _visitorRecordsCache = [];
var _referralDataCache = null;
var _allReferralsCache = [];
var _redemptionsCache = {};
var _localRedemptionsCache = [];

var PT_VISITOR_ID_KEY = "pt_vid";
var VISITOR_RECORDS_KEY = "pt_visitor_records";
var MAX_VISITOR_RECORDS = 5000;


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


// ---------- Truncate Visitor ID for display ----------
function shortId(vid) {
  if (!vid) return "-";
  return vid.length > 16 ? vid.substring(0, 16) + "…" : vid;
}

// ---------- Update KPI Cards ----------


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


// ---------- Validate referral code ----------
function validateReferralCode(code) {
  if (!code || code.trim() === "") return null;
  // Basic format check: PT + 3 letters + 4 digits
  var regex = /^PT[A-Z]{3}\d{4}$/;
  if (!regex.test(code.toUpperCase())) return null;
  return code.toUpperCase();
}

// ---------- Local Redemption Storage (localStorage fallback) ----------


// ---------- Local Redemption Storage (localStorage fallback) ----------
function getLocalRedemptions() {
  return _localRedemptionsCache;
}



function storeLocalRedemption(redemption) {
  _localRedemptionsCache.push(redemption);
}

// ---------- Validate referral code against backend ----------


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
    (booking.fare ? "<div><strong>Fare:</strong> ₹" + escapeHtml(String(booking.fare)) + "</div>" : "") +
    (booking.from_location ? "<div><strong>From:</strong> " + escapeHtml(booking.from_location) + "</div>" : "") +
    (booking.to_location ? "<div><strong>To:</strong> " + escapeHtml(booking.to_location) + "</div>" : "") +
    "</div>";

  // Pre-fill pickup date/time from booking
  document.getElementById("confirmPickupDate").value = booking.date || "";
  document.getElementById("confirmPickupTime").value =
    booking.time && booking.time !== "Not specified" ? booking.time : "";
  document.getElementById("confirmPickupAddress").value =
    booking.pickup_address || "";
  document.getElementById("confirmAdminNotes").value =
    booking.admin_notes || "";

  // Pre-fill fare amount
  var fareEl = document.getElementById("confirmFare");
  if (fareEl) fareEl.value = booking.fare || booking.amount || "";

  // Pre-fill from/to locations
  var fromEl = document.getElementById("confirmFromLocation");
  var toEl = document.getElementById("confirmToLocation");
  if (fromEl) fromEl.value = booking.from_location || "";
  if (toEl) toEl.value = booking.to_location || "";

  // Populate vehicle dropdown with date/time filtering
  var selPickupDate = document.getElementById("confirmPickupDate");
  var selPickupTime = document.getElementById("confirmPickupTime");
  var filterDate = selPickupDate ? selPickupDate.value : booking.date;
  var filterTime = selPickupTime ? selPickupTime.value : booking.time;
  if (typeof updateVehicleDropdowns === 'function') updateVehicleDropdowns(filterDate, filterTime);
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
    if (typeof updateVehicleDropdowns === 'function') updateVehicleDropdowns(d, t);
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

  // Initialize Google Places autocomplete on from/to fields
  _initConfirmBookingPlaces();

  refreshLucideIcons();
}



var _confirmFromAutocomplete = null;
var _confirmToAutocomplete = null;

function _initConfirmBookingPlaces() {
  var fromEl = document.getElementById("confirmFromLocation");
  var toEl = document.getElementById("confirmToLocation");
  if (!fromEl || !toEl) return;
  // Skip if Google Maps API not loaded yet
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    // Lazy-load Google Maps for confirm booking modal
    if (typeof google === 'undefined' && !document.getElementById('google-maps-script-confirm') && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      var cbName = '_confirmPlacesCallback';
      window[cbName] = function() { _initConfirmBookingPlaces(); };
      var s = document.createElement('script');
      s.id = 'google-maps-script-confirm';
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + (typeof PT_CONFIG !== 'undefined' && PT_CONFIG.GOOGLE_MAPS_API_KEY ? PT_CONFIG.GOOGLE_MAPS_API_KEY : '') + '&libraries=places&callback=' + cbName;
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
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
  // Only create if not already attached
  if (fromEl && !_confirmFromAutocomplete) {
    _confirmFromAutocomplete = new google.maps.places.Autocomplete(fromEl, options);
  }
  if (toEl && !_confirmToAutocomplete) {
    _confirmToAutocomplete = new google.maps.places.Autocomplete(toEl, options);
  }
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
      var fareVal = document.getElementById('confirmFare') ? document.getElementById('confirmFare').value : '';
      var fromLocVal = document.getElementById('confirmFromLocation') ? document.getElementById('confirmFromLocation').value : '';
      var toLocVal = document.getElementById('confirmToLocation') ? document.getElementById('confirmToLocation').value : '';
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
          bookings[i].fare = fareVal ? Number(fareVal) : '';
          bookings[i].from_location = fromLocVal;
          bookings[i].to_location = toLocVal;
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
        driverPhone: vehicle ? vehicle.driverPhone : '',
        fare: fareVal ? Number(fareVal) : '',
        from_location: fromLocVal,
        to_location: toLocVal
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

  // Update vehicle dropdowns on booking.html (function defined in vehicle.js)
  if (document.getElementById("vehicleSelect") && typeof updateVehicleDropdowns === "function") {
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



// ---------- Merge local redemptions into referral records ----------
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

// ---------- Booking Status Tracker ----------
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
