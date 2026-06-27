/* ============================================
   PRATAP TRAVELS - Configuration Template
   Copy this file to config.js and fill in values
   ============================================ */

var PT_CONFIG = {
  // Azure Function API for visitor tracking
  AZURE_FUNCTION_URL: "https://communication-fn.azurewebsites.net/api/visitors",
  AZURE_FUNCTION_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Azure Function API for referral tracking (PratapTravels-Referral)
  REFERRAL_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Referral",
  REFERRAL_API_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Azure Function API for bookings, audit trail, vehicles, revenue (PratapTravels-Data)
  DATA_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Data",
  DATA_API_KEY: "YOUR_FUNCTION_KEY_HERE",

  // Google OAuth Client ID for admin access
  // Create at: https://console.cloud.google.com/apis/credentials
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",

  // Allowed Google emails for admin dashboard access
  ALLOWED_EMAILS: ["prempratap7455@gmail.com", "gautam958@gmail.com"],

  // Website info
  SITE_NAME: "Pratap Travels",
  SITE_URL: window.location.origin,
};
