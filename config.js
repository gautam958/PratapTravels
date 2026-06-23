/* ============================================
   PRATAP TRAVELS - Configuration
   ============================================ */

var PT_CONFIG = {
  // Azure Function API for visitor tracking
  // The function automatically identifies the website from Origin header
  AZURE_FUNCTION_URL: "https://communication-fn.azurewebsites.net/api/visitors",
  AZURE_FUNCTION_KEY:
    "SFX8VCrbCZSKzGtBLYsM4KIPWEeyqyDkqF0xItiWF63-AzFumJqcJw==", // Replace with your Azure Function key

  // Google OAuth Client ID for admin access
  GOOGLE_CLIENT_ID:
    "529204997074-5upkbf81uq05ueef0ai1ik606vpmeg6p.apps.googleusercontent.com",

  // Allowed Google emails for admin dashboard access
  ALLOWED_EMAILS: [
    "prempratap7455@gmail.com",
    "gautam958@gmail.com",
    "krishnakumar958@gmail.com",
  ],

  // Website info
  SITE_NAME: "Pratap Travels",
  SITE_URL: "https://agreeable-meadow-041d69800.7.azurestaticapps.net",
};
