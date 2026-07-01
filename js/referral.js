/* ============================================
   PRATAP TRAVELS - Referral Dashboard JavaScript
   ============================================ */

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


// ---------- Get cached referral data ----------
function getAllReferralRecords() {
  return _allReferralsCache;
}

// ---------- Update Referral KPI Cards ----------


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



