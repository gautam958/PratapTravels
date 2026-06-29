# Internationalization (i18n) Guidelines

**MANDATORY for all new features and updates.** This website supports **Hindi (hi)** and **English (en)**. Every user-facing element MUST include both language translations.

---

## Purpose

This document defines the rules for implementing bilingual (Hindi/English) support across the PratapTravels website. All agent files (architecture, code, documentation, testing) must reference these guidelines.

---

## 1. Core Rule

> **Every new feature, UI element, or user-facing text change MUST include both Hindi and English translations. No exceptions.**

---

## 2. HTML Translation Pattern

### User-Visible Text

Use `data-i18n` attributes on all user-visible text elements:

```html
<!-- ✅ Good: Hindi default, i18n system replaces at runtime -->
<h2 data-i18n="section.title">हमारी सेवाएँ</h2>
<p data-i18n="section.desc">यात्रा आसान</p>

<!-- ❌ Bad: Hardcoded English only -->
<h2>Our Services</h2>
```

### Input Placeholders

Use `data-i18n-placeholder` attributes:

```html
<!-- ✅ Good -->
<input type="text" placeholder="नाम दर्ज करें" data-i18n-placeholder="form.name.placeholder" />

<!-- ❌ Bad -->
<input type="text" placeholder="Enter name" />
```

---

## 3. JavaScript Translation Pattern

### Using `I18N.t()`

```javascript
// ✅ Good: Use I18N.t() for all dynamic text
var lang = typeof I18N !== 'undefined' ? I18N.getLanguage() : 'hi';
var msg = lang === 'hi' ? 'बुकिंग सफल' : 'Booking successful';
showToast(msg, 'success');

// Or use I18N.t() if available
showToast(I18N.t('booking.success'), 'success');
```

### Inline Conditionals

```javascript
// ✅ Good: Bilingual toast messages
showToast(
  lang === 'hi' ? 'किराया जानें' : 'Calculate Fare',
  'info'
);
```

---

## 4. Translation Keys Convention

### Naming Pattern

```
{section}.{element}.{sub-element}
```

### Examples

| Hindi Key | English Key | Description |
|-----------|-------------|-------------|
| `chatbot.title` | `chatbot.title` | Same key, different values |
| `chatbot.faq.q1` | `chatbot.faq.q1` | FAQ question 1 |
| `modal.name` | `modal.name` | Booking form label |
| `booking.success` | `booking.success` | Success message |

---

## 5. Adding Translations to `js/i18n.js`

### Hindi Section

```javascript
// In the Hindi translations object
"feature.newKey": "नया हिंदी टेक्स्ट"
```

### English Section

```javascript
// In the English translations object
"feature.newKey": "New English text"
```

---

## 6. Checklist for New Features

- [ ] All user-visible HTML text has `data-i18n` attributes
- [ ] All input placeholders have `data-i18n-placeholder` attributes
- [ ] All dynamic JavaScript text uses `I18N.t()` or bilingual conditionals
- [ ] Translation keys added to both Hindi and English sections in `js/i18n.js`
- [ ] Keys follow the `{section}.{element}` naming convention
- [ ] No hardcoded strings in UI without i18n support

---

## 7. Common Mistakes

### ❌ Hardcoded English in HTML

```html
<h2>Our Services</h2>
```

**Fix:**
```html
<h2 data-i18n="services.title">हमारी सेवाएँ</h2>
```

### ❌ Missing Placeholder Translation

```html
<input placeholder="Enter phone" />
```

**Fix:**
```html
<input placeholder="फ़ोन दर्ज करें" data-i18n-placeholder="modal.phone.placeholder" />
```

### ❌ Hardcoded Toast Messages

```javascript
showToast("Booking saved!", "success");
```

**Fix:**
```javascript
var lang = typeof I18N !== 'undefined' ? I18N.getLanguage() : 'hi';
showToast(lang === 'hi' ? 'बुकिंग सेव हो गई!' : 'Booking saved!', "success");
```

---

*Last updated: June 2026*
