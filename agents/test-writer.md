# Test Writer

Instructions for writing and maintaining test cases in the PratapTravels project.

---

## Purpose

This document defines the testing strategies, naming conventions, and coverage expectations for the PratapTravels project. It includes sample test structures and best practices for unit, integration, and end-to-end testing.

> **🌐 Bilingual Requirement:** This website supports Hindi and English. Tests MUST verify that i18n translations exist for all user-facing features. Reference `agents/i18n-guidelines.md` for translation patterns.

---

## 1. Testing Strategy

### Testing Pyramid

```
        /  E2E  \          Few (critical paths)
       /----------\
      / Integration \      Some (API + data flow)
     /----------------\
    /    Unit Tests     \  Many (function logic)
```

### Current Test Framework

The project uses a custom lightweight test runner in `test_flows.js`:

```javascript
const fs = require('fs');
const mainJs = fs.readFileSync('js/main.js', 'utf8');

let passCount = 0;
let failCount = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    passCount++;
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}
```

### Testing Approach

1. **Static Analysis Tests** — Read source code as strings and validate structure
2. **Runtime Tests** — Execute functions and validate behavior (when DOM is available)
3. **Browser Tests** — Use browser automation for UI validation

---

## 2. Naming Conventions

### Test Names

Use descriptive, sentence-style names that explain WHAT is being tested:

```javascript
// ✅ Good
test('BUG1: Booking submission uses dataApiUrl (not visitorApiUrl)', () => { ... });
test('Chatbot: handleChatFaq has all 5 FAQ topics', () => { ... });
test('Chatbot: clearChatResult resets inputs and hides result', () => { ... });

// ❌ Bad
test('test1', () => { ... });
test('booking', () => { ... });
test('works', () => { ... });
```

### Naming Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `BUG#: Description` | `BUG1: Booking uses dataApiUrl` | Bug regression tests |
| `Feature: Description` | `Chatbot: clearChatResult resets inputs` | Feature validation |
| `Should: Description` | `Should escape HTML in user data` | Behavior verification |

---

## 3. Unit Testing

### Static Analysis Pattern (Current)

Most tests in `test_flows.js` use static analysis to validate code structure:

```javascript
// Test that a function exists in the source code
test('Chatbot: toggleChatbot function defined', () => {
  assert(mainJs.includes('function toggleChatbot'), 'Should define toggleChatbot function');
});

// Test that a function has specific behavior
test('Chatbot: clearChatResult resets inputs and hides result', () => {
  assert(mainJs.includes('function clearChatResult'), 'Should define clearChatResult function');
  assert(mainJs.includes('chatFrom'), 'clearChatResult should reference chatFrom input');
  assert(mainJs.includes('chatTo'), 'clearChatResult should reference chatTo input');
  assert(mainJs.includes('hidden'), 'Should toggle hidden class to show/hide result');
});

// Test that a feature uses the correct API
test('BUG1: Booking submission uses dataApiUrl', () => {
  const bookingFetchSection = mainJs.substring(
    mainJs.indexOf('if (dataApiUrl) {'),
    mainJs.indexOf('if (dataApiUrl) {') + 200
  );
  assert(bookingFetchSection.includes('fetch(dataApiUrl'), 'Should fetch from dataApiUrl');
  assert(!bookingFetchSection.includes('visitorApiUrl'), 'Should NOT use visitorApiUrl');
});
```

### Function Existence Tests

```javascript
test('Feature: function is defined', () => {
  assert(mainJs.includes('function featureName'), 'Should define featureName function');
});
```

### HTML Structure Tests

```javascript
test('Feature: HTML element exists', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('element-class'), 'Should have element-class in HTML');
  assert(indexHtml.includes('functionName'), 'Element should call functionName');
});
```

### CSS Style Tests

```javascript
test('Feature: CSS styles exist', () => {
  var css = require('fs').readFileSync('css/style.css', 'utf8');
  assert(css.includes('.element-class'), 'Should have .element-class CSS');
});
```

### i18n Translation Tests (CRITICAL)

**Every new feature MUST have i18n tests.**

```javascript
test('Feature: i18n translations exist in Hindi', () => {
  var i18nJs = require('fs').readFileSync('js/i18n.js', 'utf8');
  assert(i18nJs.includes('feature.key'), 'Should have feature.key i18n key');
  assert(i18nJs.includes('feature.title'), 'Should have feature.title i18n key');
});

test('Feature: i18n translations exist in English', () => {
  var i18nJs = require('fs').readFileSync('js/i18n.js', 'utf8');
  // English section comes after Hindi section
  var enSection = i18nJs.substring(i18nJs.indexOf('"en":'));
  assert(enSection.includes('feature.key'), 'Should have feature.key in English section');
  assert(enSection.includes('feature.title'), 'Should have feature.title in English section');
});

test('Feature: HTML has data-i18n attributes', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('data-i18n="feature.title"'), 'Should have data-i18n for feature title');
  assert(indexHtml.includes('data-i18n="feature.desc"'), 'Should have data-i18n for feature description');
});

test('Feature: JavaScript uses I18N for dynamic text', () => {
  assert(mainJs.includes('I18N.getLanguage') || mainJs.includes('I18N.t('), 
    'Should use I18N for bilingual dynamic text');
});
```

---

## 4. Integration Testing

### API Integration Tests

```javascript
test('Feature: uses correct API endpoint', () => {
  assert(mainJs.includes('getDataApiUrl'), 'Should use getDataApiUrl for API calls');
  assert(mainJs.includes('type: "booking_data"'), 'Should send correct request type');
});
```

### Data Flow Tests

```javascript
test('Feature: data flows correctly through system', () => {
  // Verify data is saved locally
  assert(mainJs.includes('_bookingsCache.unshift'), 'Should save to local cache');
  // Verify data is sent to API
  assert(mainJs.includes('fetch(dataApiUrl'), 'Should send to API');
  // Verify data is displayed
  assert(mainJs.includes('renderBookingTable'), 'Should re-render table after save');
});
```

---

## 5. End-to-End Testing

### Browser Test Pattern

Use the `browser-use` agent for E2E tests:

```
Navigate to the local index.html file and verify:
1. Element X is visible
2. Click button Y
3. Verify result Z appears
4. Check console for errors
```

### E2E Test Checklist

- [ ] Page loads without console errors
- [ ] All interactive elements are clickable
- [ ] Form validation works (empty fields, invalid data)
- [ ] API calls succeed (or fallback works)
- [ ] Data persists correctly
- [ ] Mobile layout renders properly
- [ ] **Language toggle switches between Hindi and English**
- [ ] **All text elements update when language is switched**

---

## 6. Test Coverage Expectations

### Required Coverage

| Area | Coverage Target | Current Status |
|------|----------------|----------------|
| Booking Flow | 100% | ✅ Covered |
| Referral Flow | 100% | ✅ Covered |
| Chatbot Features | 100% | ✅ Covered |
| Vehicle Management | 90% | ⚠️ Partial |
| Revenue Dashboard | 80% | ⚠️ Partial |
| Visitor Tracking | 90% | ✅ Covered |
| Audit Trail | 90% | ✅ Covered |
| **i18n Translations** | **100%** | ⚠️ Partial |

### Test Categories in test_flows.js

1. **Booking Flow Tests** — Form submission, API calls, status lifecycle
2. **Referral Flow Tests** — Code generation, validation, redemption
3. **Bug Regression Tests** — Prevent previously fixed bugs from reoccurring
4. **Chatbot Tests** — Fare calculator, FAQ, clear result, book now
5. **Vehicle Tests** — Status lifecycle, assignment
6. **Revenue Tests** — Calculation, API integration
7. **i18n Tests** — Translation keys, data-i18n attributes, bilingual support

---

## 7. Writing New Tests

### Step-by-Step Guide

1. **Identify what to test** — Function, feature, or bug fix
2. **Choose the testing pattern** — Static analysis, runtime, or browser
3. **Write the test name** — Use descriptive, sentence-style names
4. **Write assertions** — Use `assert()` with clear error messages
5. **Add i18n tests** — Verify translation keys and data-i18n attributes
6. **Run the tests** — `node test_flows.js`
7. **Verify all tests pass** — Fix any failures before committing

### Adding to test_flows.js

```javascript
// Add new tests before the PRINT RESULTS section
test('New Test: description of what is tested', () => {
  // Static analysis test
  assert(mainJs.includes('expected_code'), 'Should have expected_code');
  
  // Or HTML structure test
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('element'), 'Should have element in HTML');
});

// i18n tests for the same feature
test('New Feature: i18n translations exist', () => {
  var i18nJs = require('fs').readFileSync('js/i18n.js', 'utf8');
  assert(i18nJs.includes('feature.key'), 'Should have feature.key i18n key');
});

test('New Feature: HTML has data-i18n attributes', () => {
  var indexHtml = require('fs').readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('data-i18n="feature.key"'), 'Should have data-i18n for feature');
});

// PRINT RESULTS section comes AFTER all tests
```

### Common Assertions

```javascript
// Existence check
assert(mainJs.includes('functionName'), 'Should define functionName');

// Negation check
assert(!mainJs.includes('deprecatedFunction'), 'Should NOT use deprecatedFunction');

// Count check
var matches = mainJs.match(/pattern/g) || [];
assert(matches.length === 2, 'Should have exactly 2 occurrences');

// Order check
var firstIdx = mainJs.indexOf('first');
var secondIdx = mainJs.indexOf('second', firstIdx);
assert(secondIdx > firstIdx, 'second should come after first');

// HTML structure check
var html = require('fs').readFileSync('index.html', 'utf8');
assert(html.includes('class="element"'), 'Should have element with class');

// CSS check
var css = require('fs').readFileSync('css/style.css', 'utf8');
assert(css.includes('.element-class'), 'Should have CSS for .element-class');

// i18n check
var i18n = require('fs').readFileSync('js/i18n.js', 'utf8');
assert(i18n.includes('feature.key'), 'Should have feature.key translation');
```

---

## 8. Test Review Checklist

- [ ] Test name is descriptive and follows naming conventions
- [ ] Assertions have clear error messages
- [ ] Test covers both positive and negative cases
- [ ] Test doesn't depend on external state (API, localStorage)
- [ ] Test is isolated (doesn't affect other tests)
- [ ] Test passes consistently
- [ ] No `console.log` in test code (use assertion messages instead)
- [ ] **i18n tests included for new features** (translation keys, data-i18n attributes)
- [ ] **Both Hindi and English translations verified**

---

*Last updated: June 2026*
