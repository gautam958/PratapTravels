# 🚔 Pratap Travels Website

A modern, responsive static website for **Pratap Travels** — a private car rental and travel service based in Deoghar, Jharkhand, India.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [File Descriptions](#file-descriptions)
- [Images Directory](#images-directory)
- [Key Functionality](#key-functionality)
- [Setup & Usage](#setup--usage)
- [Email Integration (EmailJS)](#email-integration-emailjs)
- [Responsive Design](#responsive-design)
- [Contact Information](#contact-information)
- [License](#license)

---

## Overview

**Pratap Travels** offers private driver services, car rentals, tourism packages, airport transfers, and business travel from Deoghar. The website is a fully static HTML/CSS/JS site — no build tools or frameworks required. Just open `index.html` in a browser.

---

## Features

### 🏠 Main Website (`index.html`)
- **Sticky Navbar** with smooth scroll links and mobile hamburger menu
- **Hero Section** with background image, gradient overlay, and call-to-action buttons
- **Services Section** — Airport Transfers, Tourism & Pilgrimage, Business Travel cards
- **Route Image Slider** — Auto-scrolling right-to-left image carousel (pauses on hover, touch swipe support)
- **Routes & Pricing Table** — 16 routes with thumbnails, distances, durations, prices, and filter buttons (All / Pilgrimage / City / Local)
- **Offers Section** — 5 promotional offer cards
- **Vehicle Rentals Section** — 3 rental packages with a special discount banner
- **Contact Section** — Phone numbers, address, WhatsApp quick-link
- **Social Media Links** — Facebook, Instagram, WhatsApp icons (SVG) in contact section and footer
- **Floating "Book Now" Button** — Fixed bottom-left with pulse animation, opens booking modal
- **Booking Modal** — Full booking form with validation (name, phone, email, route, date, time, passengers, trip type, remarks)
- **EmailJS Integration** — Sends booking form data via email (with WhatsApp fallback)
- **Back-to-Top Button** — Appears on scroll, smooth scrolls to top
- **Favicon** — Custom logo (`prataplog.jpeg`)

### 👥 Visitors Dashboard (`visitors.html`)
- **Google Sign-In UI** (mock — replace with actual OAuth for production)
- **Dashboard Stats** — Bookings count, confirmed trips, active offers
- **My Bookings Panel** — Upcoming and past trip cards with status badges
- **Personalized Offers Panel**
- **Document Upload** — Drag & drop area for ID proof / documents
- **Tourist Places Gallery** — Image grid with gradient fallbacks

### 🎨 Design
- Fully responsive (mobile, tablet, desktop)
- CSS custom properties (variables) for consistent theming
- Smooth transitions and hover effects throughout
- Gold (`#f39c12`) accent color on navy (`#1a5276`) primary

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Markup    | HTML5                    |
| Styling   | CSS3 (Custom Properties) |
| Logic     | Vanilla JavaScript (ES5+)|
| Email     | EmailJS Browser SDK      |
| Fonts     | System (`Segoe UI`)      |
| Icons     | Emoji + Inline SVGs      |

**No frameworks, no build tools, no dependencies.** Pure static files.

---

## Project Structure

```
PratapTravels/
├── index.html              # Main landing page
├── visitors.html           # Visitor dashboard page
├── css/
│   └── style.css           # All styles (responsive, animations, components)
├── js/
│   └── main.js             # All JavaScript (navbar, slider, form, modal, auth)
├── images/
│   ├── hero/               # Hero banner + logo
│   │   ├── pratapHeroImage.jpeg
│   │   └── prataplog.jpeg
│   ├── routes/             # Route destination photos
│   │   ├── babadham.jpeg
│   │   ├── basukinath.jpeg
│   │   ├── tarapith-temple.jpg
│   │   ├── sultanganj1.jpg
│   │   ├── sultanganj2.jpg
│   │   ├── ranchi_1577382578748.jpg
│   │   ├── Patna_Golghar_2.jpg
│   │   ├── masanjor-dumka.jpeg
│   │   ├── dhanbad.jpeg
│   │   ├── trikutparvat.jpg
│   │   ├── naulakha.jpg
│   │   ├── aims-deoghar.jpg
│   │   ├── sarath.jpeg
│   │   └── budhayi.jpeg
│   ├── gallery/            # Gallery images (currently empty — uses routes/ as fallback)
│   └── services/           # Service icons (currently empty — uses emoji fallbacks)
├── partials/
│   └── booking-modal.html  # Booking modal HTML partial (reference)
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## File Descriptions

### `index.html`
The main landing page containing:
- **Navbar** — Fixed top nav with brand logo, links to all sections, mobile toggle
- **Hero** — Full-viewport hero with background image and CTA buttons
- **Services** — 3-column service cards
- **Slider** — Auto-scrolling route image carousel (13 unique images × 2 for seamless loop)
- **Routes & Pricing** — Filterable table with 16 routes, thumbnails, and pricing
- **Offers** — 5 promotional cards
- **Rentals** — Vehicle rental packages
- **Contact** — Contact info, WhatsApp, social media links
- **Footer** — Brand, address, social icons
- **Floating Book Button** — Fixed-position CTA
- **Booking Modal** — Full booking form with EmailJS integration
- **EmailJS SDK** — Loaded from CDN

### `visitors.html`
The visitor dashboard page containing:
- **Auth Section** — Google Sign-In mock UI
- **Dashboard** — Stats cards, booking list, offers, document upload, gallery
- **Session management** via `sessionStorage`

### `css/style.css`
Single stylesheet (~900 lines) covering:
- **CSS Custom Properties** — Color palette, shadows, radii, transitions
- **Reset & Base** — Box-sizing, typography, container
- **Navbar** — Fixed, glassmorphism, mobile slide-down menu
- **Hero** — Full-height, background image with gradient overlay, float animation
- **Buttons** — Primary, outline, secondary, WhatsApp variants
- **Services** — Card grid with hover lift
- **Slider** — CSS keyframe `slideLeft` animation, edge fade gradients
- **Routes Table** — Styled table with popular badges, thumbnail column
- **Booking Form** — Modal overlay, form groups, error states, success message
- **Offers** — Gradient cards with decorative circles
- **Rentals** — Bordered cards with featured badge
- **Contact** — Dark section, social link circles
- **Footer** — Dark theme, social icons
- **Floating Button** — Pulse animation
- **Back-to-Top** — Scroll-triggered visibility
- **Visitors Page** — Auth card, dashboard grid, panels, gallery, upload area
- **Responsive** — 3 breakpoints (992px, 768px, 480px)

### `js/main.js`
Single JavaScript file (~400 lines) with:
- **DOMContentLoaded wrapper** — All initialization
- **Navbar** — Toggle open/close, close on link click, scroll background effect
- **Back-to-Top** — Toggle visibility at 400px scroll, smooth scroll to top
- **Route Filtering** — Filter buttons toggle row visibility by `data-category`
- **Slider** — Pause on hover, touch start/end handlers
- **EmailJS Init** — `emailjs.init('YOUR_PUBLIC_KEY')`
- **Modal** — Open (button click), close (X, overlay click, Escape key), body scroll lock
- **Booking Form Validation** — Name required, phone (Indian 10-digit regex `/^[6-9]\d{9}$/`), email optional validation, route/date/type required
- **Email Sending** — `emailjs.send()` with formatted template params, WhatsApp fallback on failure
- **Reset Booking Form** — Clears form, errors, closes modal
- **File Upload** — Drag & drop handlers, file list display with XSS-safe `escapeHtml()`
- **Google Sign-In Mock** — Sets mock user in `sessionStorage`, toggles auth/dashboard views
- **Session Check** — Restores login state on page load

---

## Images Directory

| Folder      | Purpose                        | Current Files                                  |
|-------------|--------------------------------|------------------------------------------------|
| `hero/`     | Hero banner background + logo  | `pratapHeroImage.jpeg`, `prataplog.jpeg`       |
| `routes/`   | Destination photos for slider & table | 14 `.jpeg`/`.jpg` files              |
| `gallery/`  | Visitor gallery (empty)        | Uses `routes/` images as fallback              |
| `services/` | Service card icons (empty)     | Uses emoji fallbacks (✈️, 🏞️, 💼)              |

**Image naming:** Files should be placed directly in the correct folder. The HTML references specific filenames (e.g., `images/routes/babadham.jpeg`). If an image is missing, the `onerror` handler replaces it with an emoji fallback.

---

## Key Functionality

### Route Image Slider
- CSS `@keyframes slideLeft` animation (40s cycle, infinite loop)
- Slides duplicated for seamless infinite scroll
- **Hover** pauses animation
- **Touch swipe** pauses on touchstart, resumes after 2s on touchend
- Edge fade gradients on left/right

### Route Filtering
- Filter buttons: All, Pilgrimage, City, Local
- Routes have `data-category` attribute: `pilgrimage`, `city`, `local`
- JavaScript toggles `display: none` on non-matching rows

### Booking Form & Email
- **Validation:** Name (required), Phone (Indian 10-digit regex), Email (optional, validated if provided), Route (required), Date (required, min=today), Trip Type (required)
- **EmailJS:** Sends form data to configured Gmail via EmailJS service
- **WhatsApp Fallback:** If EmailJS fails or isn't configured, opens WhatsApp with pre-filled booking message
- **Loading State:** Submit button shows "Sending..." during email send
- **Success State:** Hides form, shows success message with "Book Another Ride" button

### Modal System
- Floating button triggers modal open
- Close via: X button, overlay click, Escape key
- Body scroll locked when modal is open
- CSS animations: `fadeIn` (overlay), `slideUp` (modal content)

### Visitor Dashboard
- Mock Google Sign-In (replace with real OAuth for production)
- `sessionStorage` for login state persistence
- Drag & drop file upload with visual feedback
- Booking cards with status badges (Confirmed, Pending, Completed)

---

## Setup & Usage

### Quick Start
1. Clone or download the project
2. Open `index.html` in any modern browser
3. That's it — no server required for basic viewing

### Local Development
```bash
# Serve with any static file server
npx serve .
# or
python3 -m http.server 8000
# or
php -S localhost:8000
```

### Adding New Routes
1. Add a photo to `images/routes/`
2. In `index.html`, add a new `<tr>` in the routes table with appropriate `data-category`
3. Add a new `<div class="slide">` in the slider section
4. Add the route option in the booking form `<select>`

---

## Email Integration (EmailJS)

The booking form uses [EmailJS](https://www.emailjs.com/) to send emails directly from the browser (no backend needed).

### Setup Steps
1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. **Email Services** → Add New Service → Connect your Gmail (`prempratap7455@gmail.com`)
3. **Email Templates** → Create a template with these variables:
   - `{{from_name}}`, `{{from_phone}}`, `{{from_email}}`
   - `{{route}}`, `{{travel_date}}`, `{{travel_time}}`
   - `{{passengers}}`, `{{trip_type}}`, `{{remarks}}`
4. **Account** → Copy your **Public Key**
5. In `js/main.js`, replace:
   - `'YOUR_PUBLIC_KEY'` with your actual public key
   - `'service_prataptravels'` with your actual service ID
   - `'template_booking'` with your actual template ID

### Current Configuration
- **Recipient:** `prempratap7455@gmail.com`
- **WhatsApp Fallback Number:** `+91 79911 82806`
- **Service ID:** `service_jhqm31f` (configured)
- **Template ID:** `template_jhcl557` (configured)
- **Public Key:** `ApfbQ_yIjOVtMlf7L` (configured)

---

## Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| > 992px    | Full desktop layout, 3-column grids |
| ≤ 992px    | 2-column grids, smaller typography |
| ≤ 768px    | Single column, mobile nav menu, route thumbnail column hidden |
| ≤ 480px    | Full-width buttons, circular floating book button (icon only), modal full-height |

---

## Contact Information

- **Phone:** +91 79911 82806, +91 87978 71251
- **Email:** prempratap7455@gmail.com
- **Address:** Belabagan, Deoghar, Jharkhand, India
- **WhatsApp:** [Chat on WhatsApp](https://wa.me/917991182806)
- **Social:** Facebook, Instagram (links placeholder — update with actual URLs)

---

## License

© 2026 Pratap Travels. All rights reserved.
