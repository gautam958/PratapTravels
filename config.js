/* ============================================
   PRATAP TRAVELS - Configuration
   ============================================ */

var PT_CONFIG = {
  // Azure Function API for visitor tracking
  // The function automatically identifies the website from Origin header
  AZURE_FUNCTION_URL: "https://communication-fn.azurewebsites.net/api/visitors",
  AZURE_FUNCTION_KEY:
    "SFX8VCrbCZSKzGtBLYsM4KIPWEeyqyDkqF0xItiWF63-AzFumJqcJw==", // Replace with your Azure Function key
  // Azure Function API for referral tracking (PratapTravels-Referral)
  REFERRAL_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Referral",
  REFERRAL_API_KEY: "kakdkOqqtrdfcGM6TKFRPp8muzHwh4FPgod3r_5MQ8mWAzFuqCGwgQ==",

  // Azure Function API for bookings & audit trail (PratapTravels-Data)
  DATA_API_URL:
    "https://communication-fn.azurewebsites.net/api/PratapTravels-Data",
  DATA_API_KEY: "_krvSWc_J0LIViJK7qhfsE1HA776dnziTQKrO_3_LAs-AzFuRHoZ-A==",

  // Google OAuth Client ID for admin access
  GOOGLE_CLIENT_ID:
    "529204997074-5upkbf81uq05ueef0ai1ik606vpmeg6p.apps.googleusercontent.com",

  // Allowed Google emails for admin dashboard access
  ALLOWED_EMAILS: [
    "prempratap7455@gmail.com",
    "gautam958@gmail.com",
    "krishnakumar958@gmail.com",
  ],
  // Google Maps API Key (for fare calculator chatbot)
  // Create at: https://console.cloud.google.com/apis/credentials
  // Enable: Maps JavaScript API, Places API, Distance Matrix API
  GOOGLE_MAPS_API_KEY: "AIzaSyC8-iy3vxWNUBWImYOzMKUIXQtIRdLEAH0",

  // Fare calculator settings
  FARE_CONFIG: {
    baseFare: 150, // Base fare in INR
    perKmRate: 12, // Rate per km in INR (sedan)
    minimumFare: 300, // Minimum fare
    vehicleMultipliers: {
      sedan: 1.0,
      hatchback: 0.85,
      suv: 1.3,
      innova: 1.5,
      tempo: 2.0,
    },
    tripMultipliers: {
      "one-way": 1.0,
      "round-trip": 1.8,
      "full-day": 2.2,
      rental: 2.5,
    },
  },
  // Website info
  SITE_NAME: "Pratap Travels",
  SITE_URL: "https://agreeable-meadow-041d69800.7.azurestaticapps.net",
};
