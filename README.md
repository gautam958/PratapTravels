# 🚔 Pratap Travels Website

A modern, responsive static website for **Pratap Travels** — a private car rental and travel service based in Deoghar, Jharkhand, India.

![Website](https://img.shields.io/badge/Website-agreeable--meadow--041d69800-blue?style=for-the-badge&logo=azure&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Azure%20Static%20Web%20Apps-green?style=for-the-badge)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Visitor Tracking](#visitor-tracking)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Usage](#setup--usage)
- [Email Integration (EmailJS)](#email-integration-emailjs)
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
- **Offers Section** — 5 promotional offer cards
- **Vehicle Rentals Section** — 3 rental packages with a special discount banner
- **Contact Section** — Phone numbers, address, WhatsApp quick-link
- **Social Media Links** — Facebook, Instagram, WhatsApp icons (SVG) in contact section and footer
- **Floating "Book Now" Button** — Fixed bottom-left with pulse animation, opens booking modal
- **Booking Modal** — Full booking form with validation (name, phone, email, route, date, time, passengers, trip type, remarks)
- **EmailJS Integration** — Sends booking form data via email (with WhatsApp fallback)
- **Back-to-Top Button** — Appears on scroll, smooth scrolls to top
- **Favicon** — Custom logo (`prataplog.jpeg`)
- **Visitor Tracking** — Automatically tracks page views and sends data to Azure Function API

### 👥 Visitors Dashboard (`visitors.html`)
- **Google Sign-In** — Real Google OAuth 2.0 via Google Identity Services library
- **KPI Cards** — Total Visitors, New Today, Returning, Active (30 min), Countries, Pages Visited
- **Per-visitor deduplication** by anonymous ID
- **Filterable/sortable table** with search, column headers
- **Export options:** CSV and JSON file download
- **Clear data** button to reset frontend records
- **Data source:** Azure Function API with localStorage fallback
- Protected by **Google Sign-In** — only authorized Google accounts can access (see `config.js`)

### 🎨 Design
- Fully responsive (mobile, tablet, desktop)
- CSS custom properties (variables) for consistent theming
- Smooth transitions and hover effects throughout
- Gold (`#f39c12`) accent color on navy (`#1a5276`) primary
- AES-GCM encryption module (`crypto.js`) for secure data handling

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

| Method | Description |
|--------|-------------|
| **POST** | Adds a new visitor record. Enriches with geolocation (ipinfo.io), country, city, region, timezone, and IP hash. |
| **PUT** | Updates an existing visitor by `sello_vid` or `visitorId`. |
| **GET** | Returns all stored visitor records as a JSON array. |

#### CORS

Requests from the following origins are allowed:
- `https://gautam958web.in`
- `https://agreeable-meadow-041d69800.7.azurestaticapps.net`

#### Data Storage

Visitor records are stored in `visitors.json` on the Azure Function's temp filesystem (`Path.GetTempPath()`). This means data may be lost if the function app restarts or scales down.

#### Function Source Code (Reference)

```csharp
#r "Newtonsoft.Json"
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http;
using System.Linq;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation($"Visitor API function triggered. Method: {req.Method}");

    string origin = req.Headers["Origin"].FirstOrDefault();
    var allowedOrigins = new[] { 
        "https://gautam958web.in",
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net" 
    };

    if (!allowedOrigins.Contains(origin))
    {
        log.LogWarning($"Blocked request from origin: {origin}");
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
    dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);

    string filePath = Path.Combine(Path.GetTempPath(), "visitors.json");

    if (!File.Exists(filePath))
    {
        File.WriteAllText(filePath, "[]");
    }

    var visitors = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(filePath));

    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
    {
        string clientIpRaw = req.Headers["X-Forwarded-For"].FirstOrDefault();
        string clientIp = clientIpRaw?.Split(',')[0].Split(':')[0];
        log.LogInformation($"Visitor IP: {clientIp}");

        dynamic geoData = null;
        using (var httpClient = new HttpClient())
        {
            try
            {
                string url = $"https://ipinfo.io/{clientIp}/json";
                var response = await httpClient.GetStringAsync(url);
                geoData = JsonConvert.DeserializeObject(response);
            }
            catch (Exception ex)
            {
                log.LogWarning($"Geo lookup failed: {ex.Message}");
            }
        }

        if (geoData != null && data != null)
        {
            data.country = geoData?.country ?? "Unknown";
            data.city = geoData?.city ?? "Unknown";
            data.region = geoData?.region ?? "Unknown";
            data.timezone = geoData?.timezone ?? "Unknown";
            data.ipHash = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(clientIp ?? "unknown"));
        }

        if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
        {
            visitors.Add(data);
            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitors, Formatting.Indented));
            return new OkObjectResult(new { message = "Visitor added", id = data.visitorId ?? data.sello_vid });
        }
        else if (string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
        {
            string visitorId = data?.visitorId ?? data?.sello_vid;
            if (string.IsNullOrEmpty(visitorId))
                return new BadRequestObjectResult("visitorId or sello_vid is required for PUT.");

            var existing = visitors.FirstOrDefault(v => v.visitorId == visitorId || v.sello_vid == visitorId);
            if (existing == null)
                return new NotFoundObjectResult($"Visitor {visitorId} not found.");

            int index = visitors.IndexOf(existing);
            visitors[index] = data;

            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitors, Formatting.Indented));
            return new OkObjectResult(new { message = "Visitor updated", id = visitorId });
        }
    }
    else if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        return new OkObjectResult(visitors);
    }

    return new BadRequestObjectResult("Unsupported HTTP method.");
}
```

> **⚠️ Note:** This function uses the Azure Function temp filesystem for storage. Data is ephemeral and will be lost on function restart.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES5+/ES6+) |
| **JS Files** | `main.js` (portfolio + visitor tracking), `crypto.js` (AES-GCM encryption) |
| **Styling** | CSS Custom Properties, Flexbox, CSS Grid |
| **Fonts** | System (`Segoe UI`) |
| **Icons** | Emoji + Inline SVGs |
| **Backend API** | Azure Functions (Visitor Tracking) |
| **Auth** | Google Identity Services (OAuth 2.0) |
| **Email** | EmailJS Browser SDK |
| **Hosting** | Azure Static Web Apps |
| **CI/CD** | GitHub Actions |
| **Version Control** | Git & GitHub |

---

## Project Structure

```
PratapTravels/
├── index.html                         # Main landing page
├── visitors.html                      # Admin visitor dashboard
├── config.js                          # Azure Function + Google OAuth config
├── config.example.js                  # Config template (reference)
├── css/
│   └── style.css                      # All styles (responsive, animations, components)
├── js/
│   ├── main.js                        # Portfolio JS + visitor tracking + dashboard
│   └── crypto.js                      # AES-GCM encryption module (Web Crypto API)
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
2. Open directly in browser
   ```bash
   open index.html          # macOS
   xdg-open index.html      # Linux
   start index.html         # Windows
   ```
3. **Or use a local server** (required for visitor tracking and Google Sign-In):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
4. Access admin dashboard at `http://localhost:8000/visitors.html`

### Configuration (`config.js`)

Edit `config.js` with your values:

```javascript
var PT_CONFIG = {
  // Azure Function API
  AZURE_FUNCTION_URL: 'https://communication-fn.azurewebsites.net/api/visitors',
  AZURE_FUNCTION_KEY: 'YOUR_FUNCTION_KEY_HERE',

  // Google OAuth
  GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',

  // Allowed admin emails
  ALLOWED_EMAILS: ['your@email.com'],

  // Website info
  SITE_NAME: 'Pratap Travels',
  SITE_URL: 'https://agreeable-meadow-041d69800.7.azurestaticapps.net'
};
```

### Adding New Routes
1. Add a photo to `images/routes/`
2. In `index.html`, add a new `<tr>` in the routes table with appropriate `data-category`
3. Add a new `<div class="slide">` in the slider section
4. Add the route option in the booking form `<select>`

---

## Email Integration (EmailJS)

The booking form uses [EmailJS](https://www.emailjs.com/) to send emails directly from the browser (no backend needed).

### Current Configuration
- **Recipient:** `prempratap7455@gmail.com`
- **WhatsApp Fallback Number:** `+91 79911 82806`
- **Service ID:** `service_jhqm31f`
- **Template ID:** `template_jhcl557`
- **Public Key:** `ApfbQ_yIjOVtMlf7L`

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

| Breakpoint | Behavior |
|------------|----------|
| > 992px | Full desktop layout, 3-column grids |
| ≤ 992px | 2-column grids, smaller typography |
| ≤ 768px | Single column, mobile nav menu, route thumbnail column hidden |
| ≤ 480px | Full-width buttons, circular floating book button (icon only), modal full-height |

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
