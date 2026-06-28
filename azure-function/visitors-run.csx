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
    // 🛑 INDIVIDUAL EMAIL TOGGLE CONTROL FLAGS
    // Set to true to send emails normally. Set to false to pause emails for that site during testing.
    bool sendEmailGautamEnable = true; 
    bool sendEmailPratapEnable = true; 

    log.LogInformation($"Visitor API function triggered. Method: {req.Method}. Email Flags -> Gautam: {sendEmailGautamEnable}, Pratap: {sendEmailPratapEnable}");

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
    bool currentSiteEmailEnabled = sendEmailGautamEnable; // Default tracking flag allocation
    
    if (origin.Contains("agreeable-meadow-041d69800.7.azurestaticapps.net"))
    {
        jsonFileName = "visitors_pratap_travels.json";
        websiteIdentifier = "pratap_travels";
        currentSiteEmailEnabled = sendEmailPratapEnable; // Route flag allocation to Pratap
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

    string requestType = data?.type?.ToString() ?? "";

    if (requestType == "booking")
    {
        // For booking requests, we pass the specific flag assigned to Pratap Travels
        return HandleBookingEmail(data, origin, sendEmailPratapEnable, log);
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

            // Execute custom email dispatch passing the dynamic context switch flag evaluated above
            SendWebsiteSpecificEmail(data, websiteIdentifier, origin, currentSiteEmailEnabled, log);

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

private static void SendWebsiteSpecificEmail(dynamic visitor, string websiteIdentifier, string originUrl, bool currentSiteEmailEnabled, ILogger log)
{
    // Skip completely if the context flag evaluation resolves to false
    if (!currentSiteEmailEnabled)
    {
        log.LogInformation($"Skipping visitor tracking notification email for {websiteIdentifier} because its specific email control flag is set to false.");
        return;
    }

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
        
        // 🟢 FIXED: Changed 'data' to 'visitor' since 'data' does not exist in this scope context
        if (visitor?.cc != null)
        {
            try
            {
                var ccArray = visitor.cc as Newtonsoft.Json.Linq.JArray;
                if (ccArray != null)
                {
                    foreach (var ccItem in ccArray)
                    {
                        var ccAddr = ccItem.ToString();
                        if (!string.IsNullOrEmpty(ccAddr))
                            message.CC.Add(ccAddr);
                    }
                }
            }
            catch (Exception ccEx)
            {
                log.LogWarning("Failed to parse CC addresses: " + ccEx.Message);
            }
        }
        
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

private static IActionResult HandleBookingEmail(dynamic data, string originUrl, bool sendEmailPratapEnable, ILogger log)
{
    // Skip completely if the specific Pratap flag is disabled
    if (!sendEmailPratapEnable)
    {
        log.LogInformation("Skipping customer booking request email because sendEmailPratapEnable is set to false.");
        return new OkObjectResult(new { success = true, message = "Booking intercepted (Pratap Emails disabled for testing)" });
    }

    try
    {
        string smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER_PRATAP");
        string smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS_PRATAP");
        string recipientAddress = Environment.GetEnvironmentVariable("EMAIL_RECIPIENT_PRATAP") ?? "prempratap7455@gmail.com"; 
        
        List<string> ccRecipients = new List<string>();
        string cc1 = Environment.GetEnvironmentVariable("EMAIL_CC_PRATAP_1");
        string cc2 = Environment.GetEnvironmentVariable("EMAIL_CC_PRATAP_2");
        
        if (!string.IsNullOrWhiteSpace(cc1)) ccRecipients.Add(cc1);
        if (!string.IsNullOrWhiteSpace(cc2)) ccRecipients.Add(cc2);
 
        string name = data?.name ?? "Unknown";
        string phone = data?.phone ?? "Unknown";
        string customerEmail = data?.email?.ToString() ?? ""; 
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
        
        foreach (var ccEmail in ccRecipients)
        {
            message.CC.Add(ccEmail);
        }
 
        message.Body = $@"
            <h2>🚔 Pratap Travels - New Booking Request</h2>
            <hr/>
            <p><b>👤 Customer Name:</b> {name}</p>
            <p><b>📞 Phone:</b> {phone}</p>
            <p><b>📧 Email:</b> {(string.IsNullOrEmpty(customerEmail) ? "Not provided" : customerEmail)}</p>
            <p><b>🗺 Route:</b> {route}</p>
            <p><b>📅 Travel Date:</b> {date}</p>
            <p><b>⏰ Time:</b> {time}</p>
            <p><b>👥 Passengers:</b> {passengers}</p>
            <p><b>🏷 Trip Type:</b> {tripType}</p>
            {referralSection}
            {remarksSection}
            <br/>
            <p><i>Submitted via Pratap Travels website</i></p>";
 
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