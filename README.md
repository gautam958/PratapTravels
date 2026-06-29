# 🚔 Pratap Travels Website

A modern, responsive static website for **Pratap Travels** — a private car rental and travel service based in Deoghar, Jharkhand, India.

![Website](https://img.shields.io/badge/Website-agreeable--meadow--041d69800-blue?style=for-the-badge&logo=azure&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Azure%20Static%20Web%20Apps-green?style=for-the-badge)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Visitor Tracking](#visitor-tracking)
- [Referral Tracking](#referral-tracking)
- [Booking Dashboard](#booking-dashboard)
- [Audit Trail](#audit-trail)
- [Vehicle Master](#vehicle-master)
- [Booking Status Tracker](#booking-status-tracker)
- [Revenue Dashboard](#revenue-dashboard)
- [Agents Folder](#agents-folder)
- [PratapTravels-Data Azure Function](#prataptravels-data-azure-function)
- [Azure Function Changes Required](#azure-function-changes-required)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Usage](#setup--usage)
- [Booking Email (Azure Function)](#booking-email-azure-function)
- [Google OAuth (Admin Dashboard)](#google-oauth-admin-dashboard)
- [Deployment](#deployment)
- [Responsive Design](#responsive-design)
- [Contact Information](#contact-information)

---

## Overview

**Pratap Travels** offers private driver services, car rentals, tourism packages, airport transfers, and business travel from Deoghar. The website is a fully static HTML/CSS/JS site — no build tools or frameworks required. Deployed to **Azure Static Web Apps** with automatic CI/CD via GitHub Actions.

---

## Features

### 🏠 Main Website (`index.html`)

- **Sticky Navbar** with smooth scroll links and mobile hamburger menu
- **Hero Section** with background image, gradient overlay, and call-to-action buttons
- **Services Section** — Airport Transfers, Tourism & Pilgrimage, Business Travel cards
- **Route Image Slider** — Auto-scrolling right-to-left image carousel (pauses on hover, touch swipe support)
- **Routes & Pricing Table** — 16 routes with thumbnails, distances, durations, prices, and filter buttons (All / Pilgrimage / City / Local)
- **Google Maps Route Integration** — 🗺️ Map icons on each route linking to Google Maps directions from Deoghar
- **Price Calculator** — Interactive fare estimator with route, vehicle type, and trip type selectors
- **Offers Section** — 5 promotional offer cards
- **Vehicle Rentals Section** — 3 rental packages with a special discount banner
- **Contact Section** — Phone numbers, address, WhatsApp quick-link
- **Social Media Links** — Facebook, Instagram, WhatsApp icons (SVG) in contact section and footer
- **Floating "Book Now" Button** — Fixed bottom-left with pulse animation, opens booking modal
- **Booking Modal** — Full booking form with validation (name, phone, email, route, date, time, passengers, trip type, remarks)
- **Booking Email** — Sends booking form data via Azure Function API (with WhatsApp fallback)
- **Back-to-Top Button** — Appears on scroll, smooth scrolls to top
- **Favicon** — Custom logo (`prataplog.jpeg`)
- **Visitor Tracking** — Automatically tracks page views and sends data to Azure Function API
- **Self-Referral Prevention** — Users cannot use their own referral code in a booking
- **Audit Trail** — All user interactions on the website are logged for admin review
- **Hindi/English Language Toggle** — Full i18n support; data always saves in English regardless of UI language
- **API-First Architecture** — All data stored via Azure Function APIs (no localStorage for data storage)

### 👥 Visitors Dashboard (`visitors.html`)

- **Google Sign-In** — Real Google OAuth 2.0 via Google Identity Services library
- **KPI Cards** — Total Visitors, New Today, Returning, Active (30 min), Countries, Pages Visited
- **Per-visitor deduplication** by anonymous ID
- **Filterable/sortable table** with search, column headers
- **Export options:** CSV and JSON file download
- **Clear data** button to reset frontend records
- **Data source:** Azure Function API with localStorage fallback
- Protected by **Google Sign-In** — only authorized Google accounts can access (via `ALLOWED_EMAILS` env var)

### 📋 Bookings Dashboard (`booking.html`)

- **Google Sign-In** — Same admin auth as visitors dashboard
- **KPI Cards** — Total Bookings, Confirmed, Completed, Pending, With Referral
- **Search** by name, phone, route, referral code
- **Filters** — Status (All/Confirmed/Pending/Completed/Cancelled), Date (All/Today/7 Days/30 Days)
- **Table** — Booking ID, Name, Phone, Route, Date, Time, Trip Type, Passengers, Vehicle, Driver, Referral, Status, Notification, Actions
- **Booking Confirmation** — Assign vehicles, set pickup details, send confirmation emails
- **Trip Completion** — Mark confirmed trips as completed; vehicle is auto-released and revenue is reflected in the Revenue dashboard
- **Driver Location Sharing** — Send booking details + driver info to customer via WhatsApp
- **Email Notifications** — Send confirmation emails (only for confirmed bookings)
- **Export CSV** — Download all bookings as CSV
- **Data source:** PratapTravels-Data Azure Function API (in-memory cache)
- Protected by **Google Sign-In**

### 📜 Audit Trail (`audit-trail.html`)

- **Google Sign-In** — Same admin auth as visitors dashboard
- **KPI Cards** — Total Events, Bookings, Referral Events, Today's Events
- **Search** across event type, details, page, visitor ID
- **Filters** — Type (All/Page Visits/Bookings/Referral Generated/Referral Redeemed/Clicks), Date (All/Today/7 Days/30 Days)
- **Table** — Event ID, Type (color-coded badges), Details, Page, Timestamp, Visitor
- **Export CSV** — Download all audit events as CSV
- **Auto-tracked events:** page visits, booking submissions, referral code generation
- **Data source:** PratapTravels-Data Azure Function API (in-memory cache)
- Protected by **Google Sign-In**

### 🎨 Design

- Fully responsive (mobile, tablet, desktop)
- CSS custom properties (variables) for consistent theming
- Smooth transitions and hover effects throughout
- Gold (`#f39c12`) accent color on navy (`#1a5276`) primary
- AES-GCM encryption module (`crypto.js`) for secure data handling
- 4-column admin cards grid on desktop, 2-column on tablet, 1-column on mobile

---

## Visitor Tracking

The site includes a visitor tracking system powered by an **Azure Function API** that records page views and provides an admin dashboard. This uses the same architecture and data structure as [gautam958web.in](https://gautam958web.in).

### How It Works

- Every page load sends a visitor record to the Azure Function API
- Each visitor gets a unique anonymous ID (`pt_vid`) stored in localStorage
- Records include browser, OS, device type, screen size, language, referrer, and page visited
- The Azure Function enriches records with geolocation (ipinfo.io), country, city, region, timezone, and IP hash
- New visitors use POST, returning visitors use PUT (with POST fallback if server data was lost)

### Data Structure

```json
{
  "visitorId": "vid_xxxxx",
  "sello_vid": "vid_xxxxx",
  "browser": "Chrome",
  "os": "Windows",
  "device": "Desktop",
  "screen": "1920x1080",
  "language": "en-US",
  "referrer": "",
  "page": "/index.html",
  "user": "",
  "country": "India",
  "city": "Deoghar",
  "region": "Jharkhand",
  "timezone": "Asia/Kolkata",
  "ipHash": "...",
  "firstSeen": "2026-06-23T...",
  "lastSeen": "2026-06-23T...",
  "visitCount": 1
}
```

### Admin Dashboard (`visitors.html`)

- **KPI Cards:** Total Visitors, New Today, Returning, Active (30 min), Countries, Pages Visited
- **Per-visitor deduplication** by anonymous ID
- **Filterable/sortable table** with search
- **Export options:** CSV and JSON file download
- **Clear data** button to reset frontend records
- **Data refresh:** Fetches fresh records from Azure Function API on load and manual refresh

### Access (Google Sign-In)

1. Navigate to `visitors.html`
2. Click **"Sign in with Google"** and authenticate with your Google account
3. Only emails listed in `config.js` `ALLOWED_EMAILS` are authorized
4. View visitor analytics and export data

### Azure Function API (`visitors`)

The backend is an **Azure Function** (C# / .NET) that handles visitor data storage. The function URL is:

```
https://communication-fn.azurewebsites.net/api/visitors?code=<FUNCTION_KEY>
```

#### Supported HTTP Methods

| Method   | Description                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| **POST** | Adds a new visitor record. Enriches with geolocation (ipinfo.io), country, city, region, timezone, and IP hash. |
| **PUT**  | Updates an existing visitor by `sello_vid` or `visitorId`.                                                      |
| **GET**  | Returns all stored visitor records as a JSON array.                                                             |

#### CORS

Requests from the following origins are allowed:

- `https://gautam958web.in`
- `https://agreeable-meadow-041d69800.7.azurestaticapps.net`

#### Data Storage

Visitor records are stored in `visitors.json` on the Azure Function's temp filesystem (`Path.GetTempPath()`). This means data may be lost if the function app restarts or scales down.

#### Function Source Code

The full source code for this Azure Function is available at [`azure-function/visitors-run.csx`](azure-function/visitors-run.csx). It includes:

- Visitor CRUD operations (POST, PUT, GET)
- Geolocation enrichment via ipinfo.io
- Multi-website routing (gautam958web.in vs Pratap Travels)
- Email notifications for new visitors
- **Booking email handler** — detects `type: "booking"` in the request body and sends a formatted booking email via SMTP

> **⚠️ Note:** This function uses the Azure Function temp filesystem for storage. Data is ephemeral and will be lost on function restart.

---

## Referral Tracking

The site includes a **Refer & Win** program that rewards referrers and gives discounts to new customers. This is powered by a separate Azure Function API (`PratapTravels-Referral`).

### How It Works

- Users generate a unique referral code by entering **name** and **phone number** (format: `PT` + 3 letters + 4 digits)
- Phone number is required to prevent **self-referral** — a user cannot use their own code in a booking
- Share the code via WhatsApp or clipboard
- When a new customer uses the code in the booking form, both parties benefit:
  - **Referrer:** ₹50 reward balance (updated locally via `updateReferrerStatsOnRedemption()`)
  - **New Customer:** ₹50 discount on first booking
- Code is pre-filled via `?ref=CODE` URL parameter
- Stats (total referrals, rewards, balance) are fetched from the backend and updated in localStorage
- **Self-referral prevention:** During booking, if the customer's phone matches the code owner's phone, the referral code is rejected with a toast message

### Referral Data Structure

```json
{
  "name": "User Name",
  "code": "PTABC1234",
  "totalReferrals": 3,
  "totalRedemptions": 3,
  "totalRewards": 150,
  "rewardBalance": 150,
  "createdAt": "2026-06-25T...",
  "updatedAt": "2026-06-25T...",
  "lastReferralAt": "2026-06-25T...",
  "status": "active"
}
```

### Redemption Data Structure

```json
{
  "referralCode": "PTABC1234",
  "bookingId": "booking_123",
  "newCustomerPhone": "7991182086",
  "rewardAmount": 50,
  "discountAmount": 50,
  "createdAt": "2026-06-25T...",
  "status": "completed"
}
```

### Azure Function API (`PratapTravels-Referral`)

The backend is an **Azure Function** (C# / .NET 10) that handles referral tracking. The function URL is:

```
https://PratapTravels-Referral.azurewebsites.net/api/referrals?code=<FUNCTION_KEY>
```

#### Supported HTTP Methods

| Method   | Action                | Description                                                |
| -------- | --------------------- | ---------------------------------------------------------- |
| **POST** | (no action)           | Register a new referral code                               |
| **POST** | `_action: "validate"` | Validate if a referral code exists and is active           |
| **POST** | `_action: "redeem"`   | Record a redemption, update referrer stats, store record   |
| **GET**  | `referral_code` param | Get stats for a specific referral code                     |
| **GET**  | (admin, with key)     | Get all referrals (requires function key via header/param) |

#### CORS

Requests from the following origins are allowed:

- `https://agreeable-meadow-041d69800.7.azurestaticapps.net`

#### Data Storage

Referral and redemption records are stored in JSON files on the Azure Function's temp filesystem:

- `referrals.json` — All referral codes and their stats
- `redemptions.json` — All redemption records

> **⚠️ Note:** Data is ephemeral and will be lost on function restart.

#### Function Source Code

The full source code for this Azure Function is available at [`azure-function/referral-run.csx`](azure-function/referral-run.csx). It includes:

- Referral code registration (POST)
- Code validation (`_action: "validate"`)
- Redemption processing (`_action: "redeem"`)
- Self-referral prevention
- Referrer stats tracking (total referrals, rewards, balance)

---

## Booking Dashboard

The admin can view all customer bookings in a dedicated dashboard at `booking.html`.

### How It Works

- When a user submits the booking form, the data is saved to localStorage (`pt_bookings`) and sent to the **PratapTravels-Data** Azure Function
- The admin dashboard loads bookings from localStorage, with search and filter support
- Each booking includes: ID, name, phone, email, route, date, time, passengers, trip type, referral code, status, and timestamp

### Booking Data Structure

```json
{
  "bookingId": "BK17197200000002086",
  "name": "Customer Name",
  "phone": "7991182086",
  "email": "customer@example.com",
  "route": "Basukinath", // Always saved in English
  "date": "2026-07-01",
  "time": "08:00",
  "passengers": "4",
  "trip_type": "One Way", // Always saved in English
  "remarks": "Airport pickup needed",
  "referral_code": "PTABC1234",
  "createdAt": "2026-06-26T...",
  "status": "confirmed"
}
```

### Admin Dashboard (`booking.html`)

- **KPI Cards:** Total Bookings, Confirmed, Completed, Pending, With Referral
- **Search** by name, phone, route, referral code
- **Filters** — Status (All / Confirmed / Pending / Completed / Cancelled), Date (All / Today / Last 7 Days / Last 30 Days)
- **Actions** — Confirm (✅) for pending, Edit (✏️) + Complete (✅) + Cancel (❌) for confirmed
- **Export CSV** — Download filtered bookings as CSV
- Protected by **Google Sign-In**

---

## Audit Trail

The admin can view all user activities on the website in a dedicated dashboard at `audit-trail.html`.

### How It Works

- Every page visit, booking submission, and referral code generation is recorded via `recordAuditTrail()`
- Records are saved to localStorage (`pt_audit_trail`) and sent to the **PratapTravels-Data** Azure Function
- Each event includes: event ID, activity type, details (JSON), page, timestamp, and visitor ID

### Tracked Activity Types

| Type                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `page_visit`        | Fires on every page load (index.html only, not admin pages) |
| `booking_submit`    | Fires when a booking form is submitted                      |
| `referral_generate` | Fires when a user generates a new referral code             |
| `click`             | Fires on tracked button clicks (extensible)                 |

### Audit Data Structure

```json
{
  "id": "AUD1719720000000_abc1",
  "type": "booking_submit",
  "details": {
    "bookingId": "BK...",
    "name": "Customer",
    "phone": "7991182086",
    "route": "Deoghar → Basukinath",
    "referral_code": "PTABC1234"
  },
  "page": "index.html",
  "timestamp": "2026-06-26T...",
  "visitorId": "vid_xxxxx"
}
```

### Admin Dashboard (`audit-trail.html`)

- **KPI Cards:** Total Events, Bookings, Referral Events, Today's Events
- **Search** across event type, details, page, visitor ID
- **Filters** — Type (All / Page Visits / Bookings / Referral Generated / Referral Redeemed / Clicks), Date (All / Today / Last 7 Days / Last 30 Days)
- **Export CSV** — Download filtered events as CSV
- Protected by **Google Sign-In**

---

## Vehicle Master

The admin can manage vehicles and drivers in a dedicated dashboard at `vehicle.html`. Vehicles are assigned to bookings during the confirmation workflow.

### How It Works

- Admin adds vehicles with number, type, seats, driver name, and driver phone
- Vehicles have status: Available, Booked, or Maintenance
- When a booking is confirmed, the admin assigns a vehicle from the dropdown (or adds a new one inline)
- Vehicle status auto-updates to "Booked" on assignment and "Available" on release/cancellation
- Vehicle schedule view shows all upcoming bookings for a specific vehicle

### Vehicle Data Structure

```json
{
  "id": "VH1719720000000_abc1",
  "vehicleNumber": "JH 01 AB 1234",
  "vehicleType": "Sedan",
  "seats": "4",
  "driverName": "Ramesh Kumar",
  "driverPhone": "7991182086",
  "notes": "Well-maintained Swift Dzire",
  "status": "available",
  "createdAt": "2026-06-26T..."
}
```

### Admin Dashboard (`vehicle.html`)

- **KPI Cards:** Total Vehicles, Available, Booked, Maintenance
- **Search** by vehicle number, driver name, type
- **Filters** — Status (All / Available / Booked / Maintenance)
- **Actions** — Edit, View Schedule, Delete
- **Quick Add** — Add a new vehicle directly from the booking confirmation modal
- **Export CSV** — Download all vehicles as CSV
- Protected by **Google Sign-In**

### Booking Confirmation Workflow

1. New bookings appear with status "pending" on the bookings dashboard
2. Admin clicks the ✅ button to open the confirm modal
3. Selects a vehicle from the dropdown (or adds a new one)
4. Sets pickup date, time, address, and admin notes
5. On confirm: vehicle status → Booked, booking status → Confirmed
6. Admin can click the ✅ button on a confirmed booking to mark the trip as **Completed** (terminal status)
7. On cancellation: vehicle status → Available (auto-released)
8. On completion: vehicle status → Available (auto-released), revenue is reflected in Revenue dashboard

**Status lifecycle:** `pending` → `confirmed` → `completed` (or `cancelled` at any point)

### Data Source

- **API:** PratapTravels-Data Azure Function (`type=vehicle`)
- **Cache:** In-memory cache (`_vehiclesCache`) for fast reads
- **Note:** Vehicle API support (`type=vehicle_data`, `type=vehicle_update`, `type=vehicle_delete`) must be implemented in the PratapTravels-Data Azure Function backend. Until then, vehicle data exists only in the browser's in-memory cache and is lost on page refresh.

---

## PratapTravels-Data Azure Function

A dedicated Azure Function that handles **bookings data** and **audit trail** storage. This runs alongside the existing `visitors` and `PratapTravels-Referral` functions in the same `communication-fn` Function App.

### Function URL

```
https://communication-fn.azurewebsites.net/api/PratapTravels-Data?code=<FUNCTION_KEY>
```

### Supported HTTP Methods

| Method   | Type                        | Description                                    |
| -------- | --------------------------- | ---------------------------------------------- |
| **POST** | `booking_data`              | Save a new booking record                      |
| **POST** | `audit_trail`               | Save a new audit trail event                   |
| **POST** | `vehicle_data`              | Save a new vehicle record                      |
| **POST** | `vehicle_update`            | Update an existing vehicle                     |
| **POST** | `vehicle_delete`            | Delete a vehicle                               |
| **PUT**  | `booking_data`              | Update an existing booking (by bookingId)      |
| **GET**  | `type=booking`              | Get all bookings (requires function key)       |
| **GET**  | `type=audit_trail`          | Get all audit events (requires function key)   |
| **GET**  | `type=vehicle`              | Get all vehicles (requires function key)       |
| **GET**  | `type=status&query=<value>` | **NEW:** Lookup booking by phone or booking ID |
| **GET**  | `type=revenue`              | **NEW:** Get revenue analytics summary         |
| **GET**  | (default)                   | Get summary counts (requires function key)     |

### CORS

Requests from the following origins are allowed:

- `https://agreeable-meadow-041d69800.7.azurestaticapps.net`

### Data Storage

Booking, audit trail, and vehicle records are stored in JSON files on the Azure Function's temp filesystem:

- `bookings.json` — All customer booking records
- `audit_trail.json` — All user activity events
- `vehicles.json` — All vehicle and driver records

> **⚠️ Note:** Data is ephemeral and will be lost on function restart.

### Environment Variables

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `DATA_FUNCTION_KEY` | Function key for admin GET endpoints |

### Function Source Code

The full source code for this Azure Function is available at [`azure-function/PratapTravels-run.csx`](azure-function/PratapTravels-run.csx). It includes:

- Booking CRUD operations (save, update, delete)
- Audit trail event storage
- Vehicle management (add, update, delete)
- Booking confirmation emails with CC support
- Booking status lookup (`type=status`) — public endpoint, no auth required
- Revenue analytics (`type=revenue`) — aggregated from completed bookings
- Admin GET endpoints with function key authentication

> **⚠️ Note:** This function uses the Azure Function temp filesystem for storage. Data is ephemeral and will be lost on function restart.

---

## Booking Status Tracker

Customers can check their booking status at `status.html` without logging in.

### How It Works

- Customer enters their **Phone Number** or **Booking ID**
- Frontend calls `PratapTravels-Data` Azure Function with `type=status&query=<value>`
- Displays booking status, route, date, time, vehicle, driver, and pickup details
- Shows loading spinner during lookup and error messages for invalid/missing bookings

### Page URL

```
https://agreeable-meadow-041d69800.7.azurestaticapps.net/status.html
```

### API Call

```
GET https://communication-fn.azurewebsites.net/api/PratapTravels-Data?type=status&query=7991182086&code=<FUNCTION_KEY>
```

### Expected Response

```json
{
  "found": true,
  "bookingId": "BK17197200000002086",
  "name": "Customer Name",
  "route": "Basukinath",
  "date": "2026-07-01",
  "time": "08:00",
  "status": "confirmed",
  "vehicleNumber": "JH 01 AB 1234",
  "driverName": "Ramesh Kumar",
  "driverPhone": "7991182086",
  "pickup_address": "Deoghar Station"
}
```

---

## Revenue Dashboard

Admin-only dashboard at `revenue.html` showing revenue analytics and business insights.

### How It Works

- Fetches booking data from `PratapTravels-Data` Azure Function with `type=revenue`
- Revenue is calculated from **completed bookings only** (completed trips represent actual revenue earned; confirmed bookings are not counted until the trip is completed)
- Displays KPI cards: Total Bookings, Confirmed, Completed, Pending, Cancelled, Total Revenue, Average Order Value
- Shows **Revenue by Route** table (route, booking count, total revenue)
- Shows **Revenue by Month** table (month, booking count, total revenue)
- Auto-fetches on page load if the dashboard section is visible (after Google Sign-In)

### Page URL

```
https://agreeable-meadow-041d69800.7.azurestaticapps.net/revenue.html
```

### API Call

```
GET https://communication-fn.azurewebsites.net/api/PratapTravels-Data?type=revenue&code=<FUNCTION_KEY>
```

### Expected Response

```json
{
  "totalBookings": 42,
  "totalRevenue": 125000,
  "confirmedBookings": 20,
  "completedBookings": 15,
  "pendingBookings": 5,
  "cancelledBookings": 2,
  "averageOrderValue": 3571,
  "revenueByRoute": [
    { "route": "Basukinath", "count": 12, "revenue": 24000 },
    { "route": "Tarapith", "count": 8, "revenue": 16000 }
  ],
  "revenueByMonth": [
    { "month": "2026-06", "count": 15, "revenue": 45000 },
    { "month": "2026-05", "count": 12, "revenue": 36000 }
  ]
}
```

---

## Azure Function Changes Required

Both the `type=status` and `type=revenue` handlers are already included in [`azure-function/PratapTravels-run.csx`](azure-function/PratapTravels-run.csx). See the source file for implementation details.

### Summary of Changes

| Data Type              | HTTP Method | Description                           | Status             |
| ---------------------- | ----------- | ------------------------------------- | ------------------ |
| `type=status`          | **GET**     | Lookup booking by phone or booking ID | **NEW — Add this** |
| `type=revenue`         | **GET**     | Revenue analytics summary             | **NEW — Add this** |
| `type=booking`         | **GET**     | Get all bookings                      | ✅ Already exists  |
| `type=audit_trail`     | **GET**     | Get all audit events                  | ✅ Already exists  |
| `type=vehicle`         | **GET**     | Get all vehicles                      | ✅ Already exists  |
| `booking_data`         | **POST**    | Save a new booking                    | ✅ Already exists  |
| `audit_trail`          | **POST**    | Save audit event                      | ✅ Already exists  |
| `vehicle_data`         | **POST**    | Save a new vehicle                    | ✅ Already exists  |
| `vehicle_update`       | **POST**    | Update a vehicle                      | ✅ Already exists  |
| `vehicle_delete`       | **POST**    | Delete a vehicle                      | ✅ Already exists  |
| `booking_update`       | **POST**    | Update a booking                      | ✅ Already exists  |
| `booking_confirmation` | **POST**    | Send confirmation email               | ✅ Already exists  |

---

## Agents Folder

This repository includes an `agents` folder containing four specialized files:

- **i18n-guidelines.md** – Defines bilingual (Hindi/English) translation requirements for all features.  
- **architecture-reviewer.md** – Used for reviewing and validating system architecture.  
- **code-reviewer.md** – Used for conducting code reviews and ensuring coding standards.  
- **document-creator.md** – Used for creating and maintaining project documentation.  
- **test-writer.md** – Used for writing and managing test cases.  

### Usage

Whenever new features are added or existing components are changed in this repository, these four files must be referenced and updated accordingly. They serve as living guidelines to ensure quality, consistency, and maintainability across architecture, code, documentation, and testing.

---

## Tech Stack

| Category            | Technology                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **Frontend**        | HTML5, CSS3, JavaScript (ES5+/ES6+)                                                             |
| **JS Files**        | `main.js` (all logic + dashboards), `crypto.js` (AES-GCM encryption), `i18n.js` (Hindi/English) |
| **Styling**         | CSS Custom Properties, Flexbox, CSS Grid                                                        |
| **Fonts**           | System (`Segoe UI`)                                                                             |
| **Icons**           | Emoji + Inline SVGs                                                                             |
| **Backend API**     | Azure Functions (Visitors, Referrals, Bookings & Audit Trail)                                   |
| **Auth**            | Google Identity Services (OAuth 2.0)                                                            |
| **Email**           | Azure Function (SMTP via Gmail)                                                                 |
| **Hosting**         | Azure Static Web Apps                                                                           |
| **CI/CD**           | GitHub Actions                                                                                  |
| **Version Control** | Git & GitHub                                                                                    |

---

## Project Structure

```
PratapTravels/
├── index.html                         # Main landing page (booking modal + refer & win)
├── admin.html                         # Admin dashboard entry (links to all dashboards)
├── status.html                        # 🆕 Public booking status tracker
├── revenue.html                       # 🆕 Admin revenue analytics dashboard
├── visitors.html                      # Admin visitor analytics dashboard
├── referral.html                      # Admin referral codes & redemptions dashboard
├── booking.html                       # Admin bookings dashboard (search, filters, export)
├── vehicle.html                       # Admin vehicle master dashboard (CRUD + schedule)
├── audit-trail.html                   # Admin audit trail dashboard (activity log)
├── Booking.json                       # Booking data seed file
├── AuditTrail.json                    # Audit trail data seed file
├── config.js                          # Azure Function + Google OAuth config
├── config.example.js                  # Config template (reference)
├── css/
│   └── style.css                      # All styles (responsive, animations, components)
├── js/
│   ├── main.js                        # All JS: referral, booking, audit, dashboards, tracking
│   ├── crypto.js                      # AES-GCM encryption module (Web Crypto API)
│   └── i18n.js                        # Hindi/English language support
├── azure-function/
│   ├── PratapTravels-run.csx                        # PratapTravels-Data Azure Function (bookings, audit, vehicles)
│   ├── visitors-run.csx               # Visitors Azure Function (tracking, booking email)
│   └── referral-run.csx               # Referral Azure Function (codes, redemptions)
├── images/
│   ├── hero/                          # Hero banner + logo
│   │   ├── pratapHeroImage.jpeg
│   │   └── prataplog.jpeg
│   └── routes/                        # Route destination photos
│       ├── babadham.jpeg
│       ├── basukinath.jpeg
│       └── ... (14 route images)
├── partials/
│   └── booking-modal.html             # Booking modal HTML partial (reference)
├── .github/workflows/
│   └── azure-static-web-apps-agreeable-meadow-041d69800.yml
├── .gitignore
└── README.md
```

---

## Setup & Usage

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/gautam958/PratapTravels.git
   cd PratapTravels
   ```
2. Copy config example and fill in your values (required for local dev):
   ```bash
   cp config.example.js config.js
   # Edit config.js with your values
   ```
3. **Use a local server** (required for visitor tracking and Google Sign-In):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
4. Access admin dashboard at `http://localhost:8000/visitors.html`

### Configuration (`config.js`)

Copy `config.example.js` to `config.js` and fill in your values. `config.js` is gitignored and will not be committed.

```bash
cp config.example.js config.js
# Edit config.js with your values
```

```javascript
var PT_CONFIG = {
  // Azure Function API — Visitor Tracking
  AZURE_FUNCTION_URL: "https://communication-fn.azurewebsites.net/api/visitors",
  AZURE_FUNCTION_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Azure Function API — Referral Tracking (PratapTravels-Referral)
  REFERRAL_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Referral",
  REFERRAL_API_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Azure Function API — Bookings & Audit Trail (PratapTravels-Data)
  DATA_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Data",
  DATA_API_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Google OAuth
  GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID.apps.googleusercontent.com",

  // Allowed admin emails
  ALLOWED_EMAILS: ["your@email.com"],

  // Website info
  SITE_NAME: "Pratap Travels",
  SITE_URL: "https://agreeable-meadow-041d69800.7.azurestaticapps.net",
};
```

> **Note:** `config.js` is gitignored. Keep your actual values local only. The visitor tracking API (`communication-fn`) is a separate Azure Function App, so environment variables set in the Azure Static Web Apps portal are **not** accessible from browser JavaScript.

### Adding New Routes

1. Add a photo to `images/routes/`
2. In `index.html`, add a new `<tr>` in the routes table with appropriate `data-category`
3. Add a new `<div class="slide">` in the slider section
4. Add the route option in the booking form `<select>`

---

## Booking Email (via Visitors Azure Function)

The booking form sends data to the **same visitors Azure Function** that already handles visitor tracking and email notifications. The function detects booking requests via a `type: "booking"` field and sends a formatted booking email instead of a visitor notification.

### How It Works

1. User fills booking form and submits
2. Frontend POSTs booking data to the `visitors` Azure Function with `type: "booking"` in the payload
3. Azure Function detects the `type` field, sends a formatted HTML booking email to `prempratap7455@gmail.com`
4. Booking data is also saved to the **PratapTravels-Data** Azure Function (via `saveBookingLocally()`) for the admin bookings dashboard
5. If the API fails, opens WhatsApp with the booking details as fallback

### Request Body

```json
{
  "type": "booking",
  "name": "Customer Name",
  "phone": "7991182086",
  "email": "customer@example.com",
  "route": "Deoghar → Basukinath",
  "date": "2026-07-01",
  "time": "08:00",
  "passengers": "4",
  "trip_type": "One-Way",
  "remarks": "Airport pickup needed",
  "referral_code": "PTABC1234"
}
```

### Azure Function Source Code

The booking email handler is fully implemented in [`azure-function/visitors-run.csx`](azure-function/visitors-run.csx). It includes:

- `HandleBookingEmail()` function that detects `type: "booking"` in the request body
- SMTP email sending with formatted HTML booking details
- Fallback to WhatsApp if the API fails

---

## Google OAuth (Admin Dashboard)

The visitor dashboard uses **Google Identity Services** (GIS) library for OAuth 2.0 authentication.

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized JavaScript origins:**
   - `https://agreeable-meadow-041d69800.7.azurestaticapps.net`
   - `http://localhost:8000` (for local development)
4. Copy the Client ID into:
   - `config.js` → `GOOGLE_CLIENT_ID`
   - `visitors.html` → `g_id_onload` div `data-client_id` attribute

### How It Works

1. User clicks "Sign in with Google" on `visitors.html`
2. Google Identity Services shows the One Tap prompt
3. On successful auth, the `handleGoogleCredentialResponse` callback fires
4. The JWT token is decoded and the email is checked against `ALLOWED_EMAILS`
5. If authorized, the dashboard loads visitor data from the Azure Function API

---

## Deployment

This site is deployed to **Azure Static Web Apps** with automatic CI/CD via GitHub Actions.

### Setup

1. Create an Azure Static Web App in the [Azure Portal](https://portal.azure.com)
2. Connect it to this GitHub repository
3. Add the secret `AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_MEADOW_041D69800` to your GitHub repository
4. Push to `main` to trigger deployment

### Azure Function CORS

Make sure the Azure Function allows your domain in the `allowedOrigins` array:

```csharp
var allowedOrigins = new[] {
    "https://gautam958web.in",
    "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
};
```

---

## Responsive Design

| Breakpoint | Behavior                                                                         |
| ---------- | -------------------------------------------------------------------------------- |
| > 992px    | Full desktop layout, 3-column grids                                              |
| ≤ 992px    | 2-column grids, smaller typography                                               |
| ≤ 768px    | Single column, mobile nav menu, route thumbnail column hidden                    |
| ≤ 480px    | Full-width buttons, circular floating book button (icon only), modal full-height |

---

## Contact Information

- **Phone:** +91 79911 82806, +91 87978 71251
- **Email:** prempratap7455@gmail.com
- **Address:** Belabagan, Deoghar, Jharkhand, India
- **WhatsApp:** [Chat on WhatsApp](https://wa.me/917991182806)
- **Website:** [agreeable-meadow-041d69800.7.azurestaticapps.net](https://agreeable-meadow-041d69800.7.azurestaticapps.net)
- **Social:** [Facebook](https://www.facebook.com/share/1BidrZ1sDY/), [Instagram](https://www.instagram.com/prem_958_)

---

**Made with ❤️ by [Gautam Kumar](https://www.linkedin.com/in/gautam958)**
