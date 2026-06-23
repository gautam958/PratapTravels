/* ============================================
   PRATAP TRAVELS - Configuration Template
   ============================================ */

/*
 * CONFIGURATION APPROACH:
 *
 * Production (Azure Static Web Apps):
 *   Config values are served via the /api/config Azure Function endpoint.
 *   Set these environment variables in Azure Portal → Static Web App → Configuration → Application settings:
 *
 *     AZURE_FUNCTION_URL  = https://communication-fn.azurewebsites.net/api/visitors
 *     AZURE_FUNCTION_KEY  = your-function-key
 *     GOOGLE_CLIENT_ID    = your-client-id.apps.googleusercontent.com
 *     ALLOWED_EMAILS      = email1@gmail.com,email2@gmail.com
 *     SITE_NAME           = Pratap Travels
 *     SITE_URL            = https://agreeable-meadow-041d69800.7.azurestaticapps.net
 *
 * Local Development:
 *   Copy this file to config.js and fill in your values.
 *   config.js is gitignored and will not be committed.
 */

var PT_CONFIG = {
  // Azure Function API for visitor tracking
  AZURE_FUNCTION_URL: 'https://communication-fn.azurewebsites.net/api/visitors',
  AZURE_FUNCTION_KEY: 'YOUR_FUNCTION_KEY_HERE',

  // Google OAuth Client ID for admin access
  // Create at: https://console.cloud.google.com/apis/credentials
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // Allowed Google emails for admin dashboard access
  ALLOWED_EMAILS: [
    'prempratap7455@gmail.com',
    'gautam958@gmail.com'
  ],

  // Website info
  SITE_NAME: 'Pratap Travels',
  SITE_URL: window.location.origin
};
