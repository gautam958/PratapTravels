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
- [PratapTravels-Data Azure Function](#prataptravels-data-azure-function)
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
- **KPI Cards** — Total Bookings, Confirmed, Pending, With Referral
- **Search** by name, phone, route, referral code
- **Filters** — Status (All/Confirmed/Pending/Cancelled), Date (All/Today/7 Days/30 Days)
- **Table** — Booking ID, Name, Phone, Route, Date, Time, Trip Type, Passengers, Referral, Status, Created
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

#### Function Source Code (Reference)

```csharp
#r "Newtonsoft.Json"

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Collections.Generic;
using System;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation($"Visitor API function triggered. Method: {req.Method}");

    string origin = req.Headers["Origin"].FirstOrDefault();

    // Allowed origins configuration
    var allowedOrigins = new[] {
        "https://gautam958web.in",
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
    };

    if (string.IsNullOrEmpty(origin) || !allowedOrigins.Contains(origin))
    {
        log.LogWarning($"Blocked request from unauthorized origin: {origin}");
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    // Fine-tuned isolated variables based on the target website
    string jsonFileName = "visitors.json";
    string websiteIdentifier = "gautam958web_in";

    if (origin.Contains("agreeable-meadow-041d69800.7.azurestaticapps.net"))
    {
        jsonFileName = "visitors_pratap_travels.json";
        websiteIdentifier = "pratap_travels";
    }

    string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
    dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);

    // Isolated persistent file storage routing
    string rootPath = Environment.GetEnvironmentVariable("HOME") ?? "D:\\home";
    string filePath = Path.Combine(rootPath, "data", jsonFileName);
    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
    log.LogInformation($"Routing data to file path: {filePath} for website: {websiteIdentifier}");

    if (!File.Exists(filePath))
    {
        File.WriteAllText(filePath, "[]");
    }

    var visitorsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(filePath));

    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
    {
        string clientIpRaw = req.Headers["X-Forwarded-For"].FirstOrDefault();
        string clientIp = clientIpRaw?.Split(',')[0].Split(':')[0];
        log.LogInformation($"Visitor IP captured: {clientIp}");

        // Enrich visitor data with geolocation
        dynamic geoData = null;
        using (var httpClient = new HttpClient())
        {
            try
            {
                string geoUrl = $"https://ipinfo.io/{clientIp}/json";
                var response = await httpClient.GetStringAsync(geoUrl);
                geoData = JsonConvert.DeserializeObject(response);
            }
            catch (Exception ex)
            {
                log.LogWarning($"IP Geolocation lookup failed: {ex.Message}");
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
            visitorsList.Add(data);
            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitorsList, Formatting.Indented));

            // Execute custom email dispatch based on the target business logic profile
            SendWebsiteSpecificEmail(data, websiteIdentifier, origin, log);

            return new OkObjectResult(new { message = "Visitor data saved successfully", id = data.visitorId ?? data.sello_vid });
        }
        else if (string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
        {
            string visitorId = data?.visitorId ?? data?.sello_vid;
            if (string.IsNullOrEmpty(visitorId))
            {
                return new BadRequestObjectResult("visitorId or sello_vid is required for data mutations.");
            }

            var existingVisitor = visitorsList.FirstOrDefault(v => v.visitorId == visitorId || v.sello_vid == visitorId);
            if (existingVisitor == null)
            {
                return new NotFoundObjectResult($"Visitor identity sequence {visitorId} could not be located.");
            }

            int itemIndex = visitorsList.IndexOf(existingVisitor);
            visitorsList[itemIndex] = data;

            File.WriteAllText(filePath, JsonConvert.SerializeObject(visitorsList, Formatting.Indented));
            return new OkObjectResult(new { message = "Visitor state mutation successful", id = visitorId });
        }
    }
    else if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        return new OkObjectResult(visitorsList);
    }

    return new BadRequestObjectResult("Requested HTTP method verb is unsupported.");
}

private static void SendWebsiteSpecificEmail(dynamic visitor, string websiteIdentifier, string originUrl, ILogger log)
{
    try
    {
        string smtpUser = "";
        string smtpPass = "";
        string recipientAddress = "";
        string formattedSubjectLine = "";

        List<string> ccRecipients = new List<string>();

        // Evaluate separate logic profiles, destinations, and CC channels dynamically
        if (websiteIdentifier == "gautam958web_in")
        {
            smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER");
            smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS");
            recipientAddress = "gautam958@gmail.com";
            formattedSubjectLine = $"😳 New Visitor on gautam958web.in [{visitor.country}]";
        }
        else if (websiteIdentifier == "pratap_travels")
        {
            smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER_PRATAP");
            smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS_PRATAP");

            // Separate recipient routing config
            recipientAddress = Environment.GetEnvironmentVariable("EMAIL_RECIPIENT_PRATAP");
            formattedSubjectLine = $"🚗 New Inquiry/Visitor on Pratap Travels [{visitor.country}]";

            // Populate the CC array safely from settings if available
            string cc1 = Environment.GetEnvironmentVariable("EMAIL_CC_PRATAP_1");
            string cc2 = Environment.GetEnvironmentVariable("EMAIL_CC_PRATAP_2");

            if (!string.IsNullOrWhiteSpace(cc1)) ccRecipients.Add(cc1);
            if (!string.IsNullOrWhiteSpace(cc2)) ccRecipients.Add(cc2);
        }

        var smtpClient = new SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true
        };

        var message = new MailMessage();
        message.From = new MailAddress(smtpUser, formattedSubjectLine);
        message.To.Add(recipientAddress);
        message.Subject = formattedSubjectLine;

        // Apply CC addresses if any are specified for this profile
        foreach (var ccEmail in ccRecipients)
        {
            message.CC.Add(ccEmail);
        }

        string decodedIpAddress = "";
        string ipHashStr = visitor.ipHash?.ToString();
        if (!string.IsNullOrEmpty(ipHashStr) && ipHashStr != "unknown")
        {
            try
            {
                byte[] decodedBytes = Convert.FromBase64String(ipHashStr);
                decodedIpAddress = System.Text.Encoding.UTF8.GetString(decodedBytes);
            }
            catch (FormatException)
            {
                decodedIpAddress = "Unable to decode Base64 context";
            }
        }

        // Parse international timestamp arrays into targeted destination timezones safely
        string formattedTimestamp = "—";
        try
        {
            // Newtonsoft JObject safe checking via string indexer
            if (visitor != null && visitor["timestamp"] != null)
            {
                string rawTimestamp = visitor["timestamp"].ToString();
                if (!string.IsNullOrWhiteSpace(rawTimestamp))
                {
                    DateTime parsedUtcTime = DateTime.Parse(rawTimestamp, null, System.Globalization.DateTimeStyles.RoundtripKind);
                    string assignedTimezone = visitor["timezone"]?.ToString();

                    if (!string.IsNullOrEmpty(assignedTimezone))
                    {
                        var timezoneInfo = TimeZoneInfo.FindSystemTimeZoneById(assignedTimezone);
                        DateTime contextualLocalTime = TimeZoneInfo.ConvertTimeFromUtc(parsedUtcTime, timezoneInfo);
                        formattedTimestamp = contextualLocalTime.ToString("dd/MMM/yyyy hh:mm tt");
                    }
                    else
                    {
                        // Fallback if timestamp exists but timezone does not
                        formattedTimestamp = parsedUtcTime.ToLocalTime().ToString("dd/MMM/yyyy hh:mm tt");
                    }
                }
            }
            else
            {
                log.LogError($" timestamp column is not found {visitor}");
            }
        }
        catch (Exception ex)
        {
            log.LogWarning($"Failed to normalize localized event timestamp: {ex.Message}");
        }

        // Distinct HTML template building dependent on business channel origins
        string applicationLogoHeader = (websiteIdentifier == "pratap_travels") ? "<h2>Pratap Travels Logistics Dashboard</h2>" : "<h2>Gautam Portfolio Monitor</h2>";

        message.Body = $@"
            {applicationLogoHeader}
            <hr/>
            <h3>New session alert registered from {visitor.country}</h3>
            <p><b>Target Domain Segment:</b> {websiteIdentifier}</p>
            <p><b>Event Timestamp:</b> {formattedTimestamp}</p>
            <p><b>Country Location:</b> {visitor.country}</p>
            <p><b>Metropolitan Area (City):</b> {visitor.city}</p>
            <p><b>State/Region Scope:</b> {visitor.region}</p>
            <p><b>Assigned Timezone Context:</b> {visitor.timezone}</p>
            <p><b>Decoded IP Identity:</b> {decodedIpAddress}</p>
            <p><b>Unique Tracker ID:</b> {visitor.visitorId ?? visitor.sello_vid}</p>
            <br>
            <p><b>Launch Originating Platform:</b> <a target='_blank' href='{originUrl}'>Open Live Site Connection</a></p>
            <br>
            <p><b>Launch Visitors Page:</b> <a target='_blank' href='{originUrl+"/visitors.html"}'>Open Live Visitors Page</a></p>
        ";
        message.IsBodyHtml = true;
        message.Priority = MailPriority.High;

        smtpClient.Send(message);
        log.LogInformation($"High-priority notification email dispatched cleanly from configuration pipeline: {websiteIdentifier} to {recipientAddress} (with {ccRecipients.Count} CC users).");
    }
    catch (Exception ex)
    {
        log.LogError($"Critical structural breakdown when routing target outbound email notifications: {ex.Message}");
    }
}

public static string FormatDateTime(string isoString)
{
    if (string.IsNullOrWhiteSpace(isoString))
        return "—";

    try
    {
        DateTime calculatedDateTime = DateTime.Parse(isoString, null, System.Globalization.DateTimeStyles.RoundtripKind);
        return calculatedDateTime.ToLocalTime().ToString("d") + " " + calculatedDateTime.ToLocalTime().ToString("T");
    }
    catch
    {
        return isoString;
    }
}
```

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

#### Function Source Code (`run.csx`)

```csharp
#r "Newtonsoft.Json"

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation($"Referral API function triggered. Method: {req.Method}");

    string origin = req.Headers["Origin"].FirstOrDefault();

    var allowedOrigins = new[] {
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
    };

    if (string.IsNullOrEmpty(origin) || !allowedOrigins.Contains(origin))
    {
        log.LogWarning($"Blocked request from unauthorized origin: {origin}");
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    string referralsJsonFile = "referrals.json";
    string redemptionsJsonFile = "redemptions.json";

    string rootPath = Environment.GetEnvironmentVariable("HOME") ?? "D:\\home";
    string referralsFilePath = Path.Combine(rootPath, "data", referralsJsonFile);
    string redemptionsFilePath = Path.Combine(rootPath, "data", redemptionsJsonFile);
    Directory.CreateDirectory(Path.GetDirectoryName(referralsFilePath));

    if (!File.Exists(referralsFilePath)) File.WriteAllText(referralsFilePath, "[]");
    if (!File.Exists(redemptionsFilePath)) File.WriteAllText(redemptionsFilePath, "[]");

    var referralsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(referralsFilePath));
    var redemptionsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(redemptionsFilePath));

    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);
        string action = data?._action?.ToString() ?? "";

        if (action == "validate") return HandleValidate(data, referralsList, log);
        else if (action == "redeem") return HandleRedeem(data, referralsList, redemptionsList, referralsFilePath, redemptionsFilePath, log);
        else return HandleRegister(data, referralsList, referralsFilePath, log);
    }
    else if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        string referralCode = req.Query["referral_code"];
        if (!string.IsNullOrEmpty(referralCode)) return HandleGetStats(referralCode, referralsList, log);

        string functionKey = req.Headers["x-functions-key"].FirstOrDefault() ?? req.Query["code"];
        string expectedKey = Environment.GetEnvironmentVariable("AZURE_FUNCTION_KEY") ?? "";
        if (string.IsNullOrEmpty(expectedKey) || functionKey != expectedKey) return new ForbidResult();
        return HandleGetAll(referralsList, log);
    }

    return new BadRequestObjectResult("Requested HTTP method verb is unsupported.");
}

private static IActionResult HandleRegister(dynamic data, List<dynamic> referralsList, string filePath, ILogger log)
{
    string name = data?.name;
    string code = data?.code?.ToString().ToUpper();
    if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(code))
        return new BadRequestObjectResult(new { error = "Name and code are required" });

    var existing = referralsList.FirstOrDefault(r => r.code?.ToString() == code);
    if (existing != null)
        return new OkObjectResult(new { success = true, existing = true, code = existing.code?.ToString(), totalReferrals = (int)(existing.totalReferrals ?? 0), totalRewards = (int)(existing.totalRewards ?? 0), rewardBalance = (int)(existing.rewardBalance ?? 0) });

    var newReferral = new Dictionary<string, object>
    {
        { "name", name }, { "code", code }, { "totalReferrals", 0 }, { "totalRedemptions", 0 },
        { "totalRewards", 0 }, { "rewardBalance", 0 },
        { "createdAt", DateTime.UtcNow.ToString("o") }, { "updatedAt", DateTime.UtcNow.ToString("o") }, { "status", "active" }
    };
    referralsList.Add(newReferral);
    File.WriteAllText(filePath, JsonConvert.SerializeObject(referralsList, Formatting.Indented));
    return new OkObjectResult(new { success = true, existing = false, code = code, totalReferrals = 0, totalRewards = 0, rewardBalance = 0 });
}

private static IActionResult HandleValidate(dynamic data, List<dynamic> referralsList, ILogger log)
{
    string code = data?.code?.ToString().ToUpper();
    if (string.IsNullOrEmpty(code)) return new BadRequestObjectResult(new { error = "Code is required" });
    var referral = referralsList.FirstOrDefault(r => r.code?.ToString() == code);
    if (referral != null && referral.status?.ToString() == "active")
        return new OkObjectResult(new { valid = true, code = referral.code?.ToString(), referrerName = referral.name?.ToString(), status = referral.status?.ToString() });
    return new OkObjectResult(new { valid = false, code = code });
}

private static IActionResult HandleRedeem(dynamic data, List<dynamic> referralsList, List<dynamic> redemptionsList, string referralsFilePath, string redemptionsFilePath, ILogger log)
{
    string code = data?.code?.ToString().ToUpper();
    string bookingId = data?.bookingId;
    string newCustomerPhone = data?.newCustomerPhone?.ToString() ?? "";
    if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(bookingId))
        return new BadRequestObjectResult(new { error = "Code and bookingId are required" });

    var referralIndex = referralsList.FindIndex(r => r.code?.ToString() == code);
    if (referralIndex == -1) return new NotFoundObjectResult(new { error = "Invalid referral code" });

    var referral = referralsList[referralIndex];
    referral.totalReferrals = (int)(referral.totalReferrals ?? 0) + 1;
    referral.totalRedemptions = (int)(referral.totalRedemptions ?? 0) + 1;
    referral.totalRewards = (int)(referral.totalRewards ?? 0) + 50;
    referral.rewardBalance = (int)(referral.rewardBalance ?? 0) + 50;
    referral.updatedAt = DateTime.UtcNow.ToString("o");
    referral.lastReferralAt = DateTime.UtcNow.ToString("o");
    referralsList[referralIndex] = referral;
    File.WriteAllText(referralsFilePath, JsonConvert.SerializeObject(referralsList, Formatting.Indented));

    var redemption = new Dictionary<string, object>
    {
        { "referralCode", code }, { "bookingId", bookingId }, { "newCustomerPhone", newCustomerPhone },
        { "rewardAmount", 50 }, { "discountAmount", 50 },
        { "createdAt", DateTime.UtcNow.ToString("o") }, { "status", "completed" }
    };
    redemptionsList.Add(redemption);
    File.WriteAllText(redemptionsFilePath, JsonConvert.SerializeObject(redemptionsList, Formatting.Indented));
    return new OkObjectResult(new { success = true, rewardCredited = 50, discountApplied = 50, newBalance = (int)referral.rewardBalance });
}

private static IActionResult HandleGetStats(string referralCode, List<dynamic> referralsList, ILogger log)
{
    var referral = referralsList.FirstOrDefault(r => r.code?.ToString() == referralCode.ToUpper());
    if (referral == null) return new NotFoundObjectResult(new { error = "Code not found" });
    return new OkObjectResult(new { code = referral.code?.ToString(), name = referral.name?.ToString(), totalReferrals = (int)(referral.totalReferrals ?? 0), totalRedemptions = (int)(referral.totalRedemptions ?? 0), totalRewards = (int)(referral.totalRewards ?? 0), rewardBalance = (int)(referral.rewardBalance ?? 0), createdAt = referral.createdAt?.ToString(), lastReferralAt = referral.lastReferralAt?.ToString() });
}

private static IActionResult HandleGetAll(List<dynamic> referralsList, ILogger log)
{
    var result = referralsList.Select(r => new { code = r.code?.ToString(), name = r.name?.ToString(), totalReferrals = (int)(r.totalReferrals ?? 0), totalRewards = (int)(r.totalRewards ?? 0), rewardBalance = (int)(r.rewardBalance ?? 0), createdAt = r.createdAt?.ToString(), status = r.status?.ToString() }).ToList();
    return new OkObjectResult(new { total = result.Count, referrals = result });
}
```

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

- **KPI Cards:** Total Bookings, Confirmed, Pending, With Referral
- **Search** by name, phone, route, referral code
- **Filters** — Status (All / Confirmed / Pending / Cancelled), Date (All / Today / Last 7 Days / Last 30 Days)
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
6. On cancellation: vehicle status → Available (auto-released)

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

| Method   | Type               | Description                                  |
| -------- | ------------------ | -------------------------------------------- |
| **POST** | `booking_data`     | Save a new booking record                    |
| **POST** | `audit_trail`      | Save a new audit trail event                 |
| **POST** | `vehicle_data`     | Save a new vehicle record                    |
| **POST** | `vehicle_update`   | Update an existing vehicle                   |
| **POST** | `vehicle_delete`   | Delete a vehicle                             |
| **PUT**  | `booking_data`     | Update an existing booking (by bookingId)    |
| **GET**  | `type=booking`     | Get all bookings (requires function key)     |
| **GET**  | `type=audit_trail` | Get all audit events (requires function key) |
| **GET**  | `type=vehicle`     | Get all vehicles (requires function key)     |
| **GET**  | (default)          | Get summary counts (requires function key)   |

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

### Function Source Code (`run.csx`)

```csharp
#r "Microsoft.Azure.WebJobs.Extensions.Http"
#r "Microsoft.AspNetCore.Http"
#r "Microsoft.AspNetCore.Mvc"
#r "Newtonsoft.Json"

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Net.Http;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation("PratapTravels-Data function triggered. Method: " + req.Method);

    string origin = req.Headers["Origin"].FirstOrDefault();

    var allowedOrigins = new[] {
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
    };

    if (string.IsNullOrEmpty(origin) || !allowedOrigins.Contains(origin))
    {
        log.LogWarning("Blocked request from unauthorized origin: " + origin);
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    // --- JSON file storage ---
    string rootPath = Environment.GetEnvironmentVariable("HOME") ?? "D:\\home";
    string dataDir = Path.Combine(rootPath, "data");
    Directory.CreateDirectory(dataDir);

    string bookingsFilePath = Path.Combine(dataDir, "bookings.json");
    string auditFilePath    = Path.Combine(dataDir, "audit_trail.json");
    string vehiclesFilePath = Path.Combine(dataDir, "vehicles.json");

    if (!File.Exists(bookingsFilePath)) File.WriteAllText(bookingsFilePath, "[]");
    if (!File.Exists(auditFilePath))    File.WriteAllText(auditFilePath, "[]");
    if (!File.Exists(vehiclesFilePath)) File.WriteAllText(vehiclesFilePath, "[]");

    var bookingsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(bookingsFilePath));
    var auditList    = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(auditFilePath));
    var vehiclesList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(vehiclesFilePath));

    // --- GET ---
    if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        string dataType = req.Query["type"];
        string functionKey = req.Headers["x-functions-key"].FirstOrDefault() ?? req.Query["code"];
        string expectedKey = Environment.GetEnvironmentVariable("DATA_FUNCTION_KEY") ?? "";
        if (string.IsNullOrEmpty(expectedKey) || functionKey != expectedKey)
            return new ForbidResult();

        if (dataType == "booking")
        {
            var sorted = bookingsList.OrderByDescending(b => b.createdAt).ToList();
            return new OkObjectResult(new { total = sorted.Count, bookings = sorted });
        }
        if (dataType == "audit_trail")
        {
            var sorted = auditList.OrderByDescending(a => a.timestamp).ToList();
            return new OkObjectResult(new { total = sorted.Count, events = sorted });
        }
        if (dataType == "vehicle")
        {
            return new OkObjectResult(new { total = vehiclesList.Count, vehicles = vehiclesList });
        }
        return new OkObjectResult(new {
            totalBookings = bookingsList.Count,
            totalAuditEvents = auditList.Count,
            totalVehicles = vehiclesList.Count
        });
    }

    // --- POST ---
    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);
        string dataType = data?.type?.ToString() ?? "";

        if (dataType == "booking_data")
        {
            dynamic bookingData = data.data;
            bookingData.savedAt = DateTime.UtcNow.ToString("o");
            bookingsList.Add(bookingData);
            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Booking data saved" });
        }
        if (dataType == "audit_trail")
        {
            dynamic auditRecord = data.data;
            auditRecord.serverTimestamp = DateTime.UtcNow.ToString("o");
            auditList.Add(auditRecord);
            File.WriteAllText(auditFilePath, JsonConvert.SerializeObject(auditList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Audit event saved" });
        }
        if (dataType == "vehicle_data")
        {
            dynamic vehicleData = data.data;
            vehicleData.savedAt = DateTime.UtcNow.ToString("o");
            vehiclesList.Add(vehicleData);
            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Vehicle saved" });
        }
        if (dataType == "vehicle_update")
        {
            string vehicleId = data.id?.ToString();
            dynamic updateData = data.data;
            if (updateData == null)
                return new BadRequestObjectResult(new { error = "Vehicle update data is required" });
            if (string.IsNullOrEmpty(vehicleId))
                return new BadRequestObjectResult(new { error = "Vehicle id is required" });

            int index = -1;
            for (int i = 0; i < vehiclesList.Count; i++)
            {
                if (vehiclesList[i].id?.ToString() == vehicleId) { index = i; break; }
            }
            if (index == -1)
                return new NotFoundObjectResult(new { error = "Vehicle " + vehicleId + " not found" });

            var updateObj = (Newtonsoft.Json.Linq.JObject)updateData;
            foreach (var prop in updateObj.Properties())
                vehiclesList[index][prop.Name] = prop.Value;
            vehiclesList[index].updatedAt = DateTime.UtcNow.ToString("o");

            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Vehicle updated" });
        }
        if (dataType == "vehicle_delete")
        {
            string vehicleId = data.id?.ToString();
            if (string.IsNullOrEmpty(vehicleId))
                return new BadRequestObjectResult(new { error = "Vehicle id is required" });
            int removed = vehiclesList.RemoveAll(v => v.id?.ToString() == vehicleId);
            if (removed == 0)
                return new NotFoundObjectResult(new { error = "Vehicle " + vehicleId + " not found" });
            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Vehicle deleted" });
        }
        return new BadRequestObjectResult(new { error = "Unknown data type. Expected booking_data, audit_trail, vehicle_data, vehicle_update, or vehicle_delete." });
    }

    // --- PUT ---
    if (string.Equals(req.Method, "PUT", StringComparison.OrdinalIgnoreCase))
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);
        string dataType = data?.type?.ToString() ?? "";
        if (dataType == "booking_data")
        {
            dynamic update = data.data;
            string bookingId = update?.bookingId?.ToString();
            if (string.IsNullOrEmpty(bookingId))
                return new BadRequestObjectResult(new { error = "bookingId is required" });
            int index = -1;
            for (int i = 0; i < bookingsList.Count; i++)
            {
                if (bookingsList[i].bookingId?.ToString() == bookingId) { index = i; break; }
            }
            if (index == -1)
                return new NotFoundObjectResult(new { error = "Booking " + bookingId + " not found" });
            var existing = bookingsList[index];
            if (update.status != null) existing.status = update.status;
            if (update.remarks != null) existing.remarks = update.remarks;
            existing.updatedAt = DateTime.UtcNow.ToString("o");
            bookingsList[index] = existing;
            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));
            return new OkObjectResult(new { success = true, message = "Booking updated" });
        }
        return new BadRequestObjectResult(new { error = "Unknown data type for PUT" });
    }

    return new BadRequestObjectResult("Requested HTTP method verb is unsupported.");
}
```

> **⚠️ Note:** This function uses the Azure Function temp filesystem for storage. Data is ephemeral and will be lost on function restart.

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
├── visitors.html                      # Admin visitor analytics dashboard
├── referral.html                      # Admin referral codes & redemptions dashboard
├── booking.html                       # Admin bookings dashboard (search, filters, export)
├── vehicle.html                        # Admin vehicle master dashboard (CRUD + schedule)
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

### Azure Function Modification

The existing `visitors` Azure Function (`run.csx`) needs a small modification to handle booking data. Add this check after parsing the request body:

```csharp
// --- Add this block after reading requestBody, before visitor processing ---
string requestType = data?.type?.ToString() ?? "";

if (requestType == "booking")
{
    return HandleBookingEmail(data, origin, log);
}
// --- End of booking check ---
```

And add this handler function:

```csharp
private static IActionResult HandleBookingEmail(dynamic data, string originUrl, ILogger log)
{
    try
    {
        string smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER_PRATAP");
        string smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS_PRATAP");
        string recipientAddress = Environment.GetEnvironmentVariable("EMAIL_RECIPIENT_PRATAP") ?? "prempratap7455@gmail.com";

        string name = data?.name ?? "Unknown";
        string phone = data?.phone ?? "Unknown";
        string email = data?.email?.ToString() ?? "";
        string route = data?.route ?? "Unknown";
        string date = data?.date ?? "Unknown";
        string time = data?.time?.ToString() ?? "Not specified";
        string passengers = data?.passengers?.ToString() ?? "1";
        string tripType = data?.trip_type ?? data?.type ?? "Unknown";
        string remarks = data?.remarks?.ToString() ?? "";
        string referralCode = data?.referral_code?.ToString() ?? "";

        var smtpClient = new SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true
        };

        string subjectLine = $"🚗 New Booking Request from {name} [{route}]";

        string referralSection = !string.IsNullOrEmpty(referralCode)
            ? $"<p><b>🎁 Referral Code:</b> {referralCode}</p>"
            : "";

        string remarksSection = !string.IsNullOrEmpty(remarks)
            ? $"<p><b>📝 Remarks:</b> {remarks}</p>"
            : "";

        var message = new MailMessage();
        message.From = new MailAddress(smtpUser, "Pratap Travels Booking");
        message.To.Add(recipientAddress);
        message.Subject = subjectLine;
        message.IsBodyHtml = true;
        message.Priority = MailPriority.High;

        message.Body = $@"
            <h2>🚔 Pratap Travels - New Booking Request</h2>
            <hr/>
            <p><b>👤 Customer Name:</b> {name}</p>
            <p><b>📞 Phone:</b> {phone}</p>
            <p><b>📧 Email:</b> {(string.IsNullOrEmpty(email) ? "Not provided" : email)}</p>
            <p><b>🗺 Route:</b> {route}</p>
            <p><b>📅 Travel Date:</b> {date}</p>
            <p><b>⏰ Time:</b> {time}</p>
            <p><b>👥 Passengers:</b> {passengers}</p>
            <p><b>🏷 Trip Type:</b> {tripType}</p>
            {referralSection}
            {remarksSection}
            <br/>
            <p><i>Submitted via Pratap Travels website</i></p>
        ;

        smtpClient.Send(message);
        log.LogInformation($"Booking email sent for: {name} ({phone}) via {originUrl}");

        return new OkObjectResult(new { success = true, message = "Booking email sent" });
    }
    catch (Exception ex)
    {
        log.LogError($"Booking email failed: {ex.Message}");
        return new StatusCodeResult(StatusCodes.Status500InternalServerError);
    }
}
```

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
