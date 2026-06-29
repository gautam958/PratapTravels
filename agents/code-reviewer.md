# Code Reviewer

Standards and procedures for conducting code reviews in the PratapTravels project.

---

## Purpose

This document defines coding standards, error handling practices, performance optimization tips, and security checks that must be applied during code reviews. It includes examples of good vs. bad practices to ensure consistent code quality.

---

## 1. Coding Style Guidelines

### JavaScript Standards

- **Variables:** Use `var` for function-scoped variables (consistent with existing codebase), `let`/`const` only when block scoping is required
- **Strings:** Use double quotes (`"string"`) for consistency with existing code
- **Semicolons:** Always use semicolons
- **Indentation:** 2 spaces (no tabs)
- **Naming:** camelCase for variables and functions, PascalCase for constructors
- **Functions:** Prefer named functions over anonymous arrows for debugging
- **DOM Access:** Cache DOM references in variables, avoid repeated `getElementById` calls

#### ✅ Good Practice

```javascript
// Named function, proper variable naming, cached DOM reference
function renderBookingTable() {
  var tbody = document.getElementById("bookingTableBody");
  if (!tbody) return;
  var bookings = getBookings();
  tbody.innerHTML = "";
  bookings.forEach(function (b) {
    var tr = document.createElement("tr");
    // ... build row
    tbody.appendChild(tr);
  });
}
```

#### ❌ Bad Practice

```javascript
// Arrow function, no null check, repeated DOM access
const renderTable = () => {
  document.getElementById("bookingTableBody").innerHTML = "";
  getBookings().forEach(b => {
    document.getElementById("bookingTableBody").innerHTML += `<tr>...</tr>`;
  });
};
```

### HTML Standards

- Use semantic HTML5 elements (`<section>`, `<nav>`, `<table>`)
- All interactive elements must have `aria-label` attributes
- Use `data-i18n` attributes for all user-visible text (i18n support)
- Use `data-i18n-placeholder` for input placeholders
- Images must have `alt` attributes and `loading="lazy"`

### CSS Standards

- Use CSS custom properties (variables) for colors, spacing, and typography
- Follow the existing naming convention: `.section-name-element` (e.g., `.chatbot-clear-btn`)
- Use `var(--transition)` for consistent animations
- Mobile-first responsive design with `@media` queries
- Avoid `!important` except for third-party overrides (e.g., Google Maps)

---

## 2. Error Handling Practices

### Required Error Handling Patterns

#### API Calls

```javascript
// ✅ Good: Try-catch with user feedback
try {
  var resp = await fetch(apiUrl, { method: "GET", mode: "cors" });
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  var data = await resp.json();
  // process data
} catch (e) {
  console.warn("API failed:", e.message);
  showToast("Using cached data (API unavailable).", "info");
}
```

```javascript
// ❌ Bad: No error handling
var resp = await fetch(apiUrl);
var data = await resp.json();
```

#### DOM Access

```javascript
// ✅ Good: Null check before access
var modal = document.getElementById("bookingModal");
if (modal) {
  modal.classList.remove("hidden");
}
```

```javascript
// ❌ Bad: No null check
document.getElementById("bookingModal").classList.remove("hidden");
```

#### Form Validation

```javascript
// ✅ Good: Validate with specific error messages
if (!phoneRegex.test(phone.value.replace(/\s/g, ""))) {
  document.getElementById("phoneError").textContent =
    "Enter a valid 10-digit phone number";
  phone.classList.add("error");
  valid = false;
}
```

### User Feedback

- Use `showToast(message, type)` for non-blocking notifications
- Use `showToast(message, "error")` for errors
- Use `showToast(message, "success")` for confirmations
- Use `showToast(message, "info")` for informational messages
- Never leave the user without feedback after an action

---

## 3. Performance Optimization

### Required Practices

#### DOM Manipulation

```javascript
// ✅ Good: Batch DOM updates
var fragment = document.createDocumentFragment();
bookings.forEach(function (b) {
  var tr = document.createElement("tr");
  // ... build row
  fragment.appendChild(tr);
});
tbody.appendChild(fragment);
```

```javascript
// ❌ Bad: Individual DOM updates in a loop
bookings.forEach(function (b) {
  tbody.innerHTML += "<tr>...</tr>"; // Triggers reflow each iteration
});
```

#### Event Listeners

```javascript
// ✅ Good: Debounce expensive operations
var debounceTimer;
searchInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(function () {
    renderBookingTable();
  }, 300);
});
```

#### API Caching

```javascript
// ✅ Good: Cache API responses in memory
var _bookingsCache = [];

function getBookings() {
  return _bookingsCache;
}

async function fetchBookingsFromApi() {
  var data = await fetch(apiUrl);
  _bookingsCache = data;
  return data;
}
```

### Performance Checklist

- [ ] No repeated `getElementById` calls in loops
- [ ] DOM updates batched using DocumentFragment or innerHTML
- [ ] Expensive operations debounced (search, resize, scroll)
- [ ] API responses cached in memory
- [ ] Images use `loading="lazy"`
- [ ] Third-party scripts use `async` or `defer`

---

## 4. Security Checks

### Required Security Practices

#### Input Sanitization

```javascript
// ✅ Good: Escape HTML before rendering user data
function escapeHtml(text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Use when rendering user-provided data
tr.innerHTML = "<td>" + escapeHtml(booking.name) + "</td>";
```

```javascript
// ❌ Bad: Direct HTML injection
tr.innerHTML = "<td>" + booking.name + "</td>"; // XSS vulnerability
```

#### API Key Management

```javascript
// ✅ Good: Keys loaded from config, not hardcoded
function getVisitorApiUrl() {
  if (typeof PT_CONFIG !== "undefined" && PT_CONFIG.AZURE_FUNCTION_URL) {
    var url = PT_CONFIG.AZURE_FUNCTION_URL;
    if (PT_CONFIG.AZURE_FUNCTION_KEY && PT_CONFIG.AZURE_FUNCTION_KEY !== "YOUR_FUNCTION_KEY_HERE") {
      url += "?code=" + encodeURIComponent(PT_CONFIG.AZURE_FUNCTION_KEY);
    }
    return url;
  }
  return null;
}
```

```javascript
// ❌ Bad: Hardcoded API key
var apiUrl = "https://example.com/api?key=abc123secret";
```

#### Self-Referral Prevention

```javascript
// ✅ Good: Validate referral codes server-side
var refValidationResult = await validateReferralCodeServer(referralVal);
if (!refValidationResult || !refValidationResult.valid) {
  showToast("Referral code is invalid.", "error");
  referralVal = "";
}
```

### Security Checklist

- [ ] All user data rendered with `escapeHtml()`
- [ ] API keys stored in `config.js` (gitignored), never hardcoded
- [ ] Referral codes validated against backend API
- [ ] Self-referral prevention implemented
- [ ] CORS restricted to known domains
- [ ] Admin pages protected by Google Sign-In
- [ ] No sensitive data in URLs or logs

---

## 5. Code Review Checklist

### For Every Pull Request

- [ ] **Syntax:** Code passes `node -c` syntax check
- [ ] **Tests:** All existing tests pass (`node test_flows.js`)
- [ ] **i18n:** All user-visible text has `data-i18n` attributes
- [ ] **Error Handling:** API calls have try-catch blocks
- [ ] **Null Checks:** DOM access includes null guards
- [ ] **XSS:** User data is escaped before rendering
- [ ] **Performance:** No N+1 DOM queries or API calls in loops
- [ ] **Mobile:** UI works on 320px+ viewport width
- [ ] **Documentation:** Complex logic has inline comments
- [ ] **Consistency:** Code follows existing naming and style conventions

### Common Issues to Flag

1. **Magic numbers** — Extract to named constants
2. **Duplicate code** — Extract to shared helper functions
3. **Missing null checks** — Add guards for DOM elements
4. **Console.log in production** — Use `console.warn` for debugging only
5. **Unused variables** — Remove dead code
6. **Hardcoded strings** — Move to i18n or constants

---

*Last updated: June 2026*
