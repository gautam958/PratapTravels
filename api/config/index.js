module.exports = async function (context, req) {
  context.log("Config endpoint called");

  const config = {
    AZURE_FUNCTION_URL: process.env.AZURE_FUNCTION_URL || "",
    AZURE_FUNCTION_KEY: process.env.AZURE_FUNCTION_KEY || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ALLOWED_EMAILS: process.env.ALLOWED_EMAILS
      ? process.env.ALLOWED_EMAILS.split(",").map((e) => e.trim())
      : [],
    SITE_NAME: process.env.SITE_NAME || "Pratap Travels",
    SITE_URL: process.env.SITE_URL || "",
  };

  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
    body: config,
  };
};
