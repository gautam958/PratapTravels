/* ============================================
   PRATAP TRAVELS - Configuration Template
   Copy this file to config.js and fill in values
   ============================================ */

var PT_CONFIG = {
  // Azure Function API for visitor tracking
  // The function automatically identifies the website from Origin header
  AZURE_FUNCTION_URL: 'https://communication-fn.azurewebsites.net/api/visitors',
  AZURE_FUNCTION_KEY: 'YOUR_FUNCTION_KEY_HERE', // Replace with your Azure Function key

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
