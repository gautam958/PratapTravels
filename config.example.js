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

  // Google Maps API Key (for fare calculator chatbot)
  // Create at: https://console.cloud.google.com/apis/credentials
  // Enable: Maps JavaScript API, Places API, Distance Matrix API
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE",

  // Fare calculator settings
  FARE_CONFIG: {
    baseFare: 150,          // Base fare in INR
    perKmRate: 12,          // Rate per km in INR (sedan)
    minimumFare: 300,       // Minimum fare
    vehicleMultipliers: {
      sedan: 1.0,
      hatchback: 0.85,
      suv: 1.3,
      innova: 1.5,
      tempo: 2.0
    },
    tripMultipliers: {
      'one-way': 1.0,
      'round-trip': 1.8,
      'full-day': 2.2,
      'rental': 2.5
    }
  },

  // Website info
  SITE_NAME: "Pratap Travels",
  SITE_URL: window.location.origin,
};
