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
using System.Net.Mail;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation("PratapTravels-Data function triggered. Method: " + req.Method);

    string origin = req.Headers["Origin"].FirstOrDefault();

    // Allowed origins
    var allowedOrigins = new[] {
        "https://localhost:3000",
        "https://localhost:8000",
        "https://localhost:8001",
        "https://localhost:8080",
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
    };

    if (string.IsNullOrEmpty(origin) || !allowedOrigins.Contains(origin))
    {
        log.LogWarning("Blocked request from unauthorized origin: " + origin);
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    // --- JSON file storage ---
    string rootPath = Environment.GetEnvironmentVariable("HOME") ?? @"D:\home";
    string dataDir = Path.Combine(rootPath, "data");
    Directory.CreateDirectory(dataDir);

    string bookingsFilePath = Path.Combine(dataDir, "bookings.json");
    string auditFilePath = Path.Combine(dataDir, "audit_trail.json");
    string vehiclesFilePath = Path.Combine(dataDir, "vehicles.json");

    if (!File.Exists(bookingsFilePath)) File.WriteAllText(bookingsFilePath, "[]");
    if (!File.Exists(auditFilePath)) File.WriteAllText(auditFilePath, "[]");
    if (!File.Exists(vehiclesFilePath)) File.WriteAllText(vehiclesFilePath, "[]");

    var bookingsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(bookingsFilePath));
    var auditList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(auditFilePath));
    var vehiclesList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(vehiclesFilePath));

    // ================================================================
    // --- GET: Fetch records ---
    // ================================================================
    if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        string dataType = req.Query["type"];

        // ----------------------------------------------------------
        // CHANGED: type=status is PUBLIC (no auth required)
        // Must be checked BEFORE the admin auth check below
        // ----------------------------------------------------------
        if (dataType == "status")
        {
            string query = req.Query["query"].ToString().Trim();
            if (string.IsNullOrEmpty(query))
            {
                return new BadRequestObjectResult(new { error = "query parameter is required" });
            }

            // Search bookings by phone number or booking ID
            var matched = bookingsList.Where(b =>
                (b.phone?.ToString()?.Contains(query) == true) ||
                (b.bookingId?.ToString()?.Contains(query) == true)
            ).OrderByDescending(b => b.createdAt).ToList();

            if (matched.Count == 0)
            {
                return new OkObjectResult(new { found = false, message = "No booking found with this phone number or booking ID" });
            }

            // Return the most recent matching booking
            var latest = matched[0];
            string status = latest.status?.ToString() ?? "pending";
            string vehicleNumber = "-";
            string driverName = "-";
            string driverPhone = "-";

            // Look up vehicle info if assigned
            if (latest.vehicleId != null)
            {
                var vehicle = vehiclesList.FirstOrDefault(v => v.id?.ToString() == latest.vehicleId.ToString());
                if (vehicle != null)
                {
                    vehicleNumber = vehicle.vehicleNumber?.ToString() ?? "-";
                    driverName = vehicle.driverName?.ToString() ?? "-";
                    driverPhone = vehicle.driverPhone?.ToString() ?? "-";
                }
            }

            return new OkObjectResult(new
            {
                found = true,
                bookingId = latest.bookingId?.ToString(),
                name = latest.name?.ToString(),
                route = latest.route?.ToString(),
                date = latest.date?.ToString(),
                time = latest.time?.ToString(),
                trip_type = latest.trip_type?.ToString(),
                passengers = latest.passengers?.ToString(),
                status = status,
                vehicleNumber = vehicleNumber,
                driverName = driverName,
                driverPhone = driverPhone,
                pickup_address = latest.pickup_address?.ToString() ?? "",
                createdAt = latest.createdAt?.ToString()
            });
        }

        // ----------------------------------------------------------
        // Admin endpoints: require function key
        // ----------------------------------------------------------
        string functionKey = req.Headers["x-functions-key"].FirstOrDefault() ?? req.Query["code"];
        string expectedKey = Environment.GetEnvironmentVariable("DATA_FUNCTION_KEY") ?? "";
        if (string.IsNullOrEmpty(expectedKey) || functionKey != expectedKey)
            return new ForbidResult();

        if (dataType == "booking")
        {
            var sortedBookings = bookingsList.OrderByDescending(b => b.createdAt).ToList();
            return new OkObjectResult(new { total = sortedBookings.Count, bookings = sortedBookings });
        }

        if (dataType == "audit_trail")
        {
            var sortedAudit = auditList.OrderByDescending(a => a.timestamp).ToList();
            return new OkObjectResult(new { total = sortedAudit.Count, events = sortedAudit });
        }

        if (dataType == "vehicle")
        {
            return new OkObjectResult(new { total = vehiclesList.Count, vehicles = vehiclesList });
        }

        // ----------------------------------------------------------
        // CHANGED: type=revenue — Revenue analytics
        // FIX: Revenue calculated from COMPLETED bookings only
        //      (previously counted confirmed + completed)
        // FIX: Added confirmedBookings to response
        // ----------------------------------------------------------
        if (dataType == "revenue")
        {
            // CHANGED: Only completed bookings contribute to revenue
            var revenueBookings = bookingsList.Where(b => b.status?.ToString() == "completed").ToList();
            var confirmedCount = bookingsList.Count(b => b.status?.ToString() == "confirmed");
            var completedCount = bookingsList.Count(b => b.status?.ToString() == "completed");
            var pendingCount = bookingsList.Count(b => b.status?.ToString() == "pending");
            var cancelledCount = bookingsList.Count(b => b.status?.ToString() == "cancelled");

            var routePrices = new Dictionary<string, decimal>
            {
                { "Basukinath", 1750 }, { "Tarapith", 2200 }, { "Sultanganj", 3200 },
                { "Ranchi", 3500 }, { "Patna", 3800 }, { "Kolkata", 4500 },
                { "Dumka", 1500 }, { "Dhanbad", 3200 }, { "Munger", 2800 },
                { "Muzaffarpur", 4000 }, { "AIIMS Deoghar", 800 }, { "Waterpark", 600 },
                { "Sarath", 1800 }, { "Madhupur", 1200 }, { "Jamtara", 1400 },
                { "Budhai", 500 }
            };

            decimal totalRevenue = 0;
            var revenueByRoute = new Dictionary<string, object>();
            var revenueByMonth = new Dictionary<string, object>();

            foreach (var b in revenueBookings)
            {
                string route = b.route?.ToString() ?? "";
                decimal basePrice = routePrices.ContainsKey(route) ? routePrices[route] : 1500;

                string tripType = b.trip_type?.ToString() ?? "";
                decimal multiplier = 1.0m;
                if (tripType.Contains("Round")) multiplier = 1.8m;
                else if (tripType.Contains("Full Day")) multiplier = 2.5m;

                decimal bookingRevenue = basePrice * multiplier;
                totalRevenue += bookingRevenue;

                if (!revenueByRoute.ContainsKey(route))
                    revenueByRoute[route] = new { route = route, count = 0, revenue = 0 };
                var routeData = (Newtonsoft.Json.Linq.JObject)revenueByRoute[route];
                routeData["count"] = (int)routeData["count"] + 1;
                routeData["revenue"] = (decimal)routeData["revenue"] + bookingRevenue;

                string createdAt = b.createdAt?.ToString() ?? "";
                string month = "-";
                DateTime parsedDate;
                if (DateTime.TryParse(createdAt, null, System.Globalization.DateTimeStyles.RoundtripKind, out parsedDate))
                    month = parsedDate.ToString("yyyy-MM");

                if (!revenueByMonth.ContainsKey(month))
                    revenueByMonth[month] = new { month = month, count = 0, revenue = 0 };
                var monthData = (Newtonsoft.Json.Linq.JObject)revenueByMonth[month];
                monthData["count"] = (int)monthData["count"] + 1;
                monthData["revenue"] = (decimal)monthData["revenue"] + bookingRevenue;
            }

            decimal avgBookingValue = revenueBookings.Count > 0 ? totalRevenue / revenueBookings.Count : 0;

            return new OkObjectResult(new
            {
                totalBookings = bookingsList.Count,
                totalRevenue = totalRevenue,
                confirmedBookings = confirmedCount,     // CHANGED: Added to response
                completedBookings = completedCount,
                pendingBookings = pendingCount,
                cancelledBookings = cancelledCount,
                averageOrderValue = Math.Round(avgBookingValue, 0),
                revenueByRoute = revenueByRoute.Values.ToList(),
                revenueByMonth = revenueByMonth.Values.OrderByDescending(m => m["month"]?.ToString()).ToList()
            });
        }

        // Default: return summary counts
        return new OkObjectResult(new {
            totalBookings = bookingsList.Count,
            totalAuditEvents = auditList.Count,
            totalVehicles = vehiclesList.Count
        });
    }

    // ================================================================
    // --- POST: Save / Update records ---
    // ================================================================
    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);
        string dataType = data?.type?.ToString() ?? "";

        // ----------------------------------------------------------
        // Handle booking_data (save new booking)
        // ----------------------------------------------------------
        if (dataType == "booking_data")
        {
            dynamic bookingData = data.data;
            bookingData.savedAt = DateTime.UtcNow.ToString("o");
            bookingsList.Add(bookingData);
            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));

            string logBookingId = bookingData.bookingId?.ToString() ?? "Unknown";
            log.LogInformation("Booking saved: " + logBookingId);

            return new OkObjectResult(new { success = true, message = "Booking data saved" });
        }

        // ----------------------------------------------------------
        // Handle audit_trail
        // ----------------------------------------------------------
        if (dataType == "audit_trail")
        {
            dynamic auditRecord = data.data;
            auditRecord.serverTimestamp = DateTime.UtcNow.ToString("o");
            auditList.Add(auditRecord);
            File.WriteAllText(auditFilePath, JsonConvert.SerializeObject(auditList, Formatting.Indented));

            string logAuditType = auditRecord.type?.ToString() ?? "Unknown";
            log.LogInformation("Audit event saved: " + logAuditType);

            return new OkObjectResult(new { success = true, message = "Audit event saved" });
        }

        // ----------------------------------------------------------
        // Handle vehicle_data (add new vehicle)
        // ----------------------------------------------------------
        if (dataType == "vehicle_data")
        {
            dynamic vehicleData = data.data;
            vehicleData.savedAt = DateTime.UtcNow.ToString("o");
            vehiclesList.Add(vehicleData);
            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));

            string logVehicleNum = vehicleData.vehicleNumber?.ToString() ?? "Unknown";
            log.LogInformation("Vehicle saved: " + logVehicleNum);

            return new OkObjectResult(new { success = true, message = "Vehicle saved" });
        }

        // ----------------------------------------------------------
        // Handle booking_confirmation (send confirmation email via SMTP, with CC support)
        // CHANGED: Now reads booking details from bookingData when top-level fields are missing
        //          (frontend sends full booking object in bookingData field)
        // ----------------------------------------------------------
        if (dataType == "booking_confirmation")
        {
            try
            {
                string smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER_PRATAP");
                string smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS_PRATAP");
                string recipientAddress = data?.to?.ToString() ?? data?.email?.ToString();
                if (string.IsNullOrEmpty(recipientAddress))
                    return new BadRequestObjectResult(new { error = "Customer email is required" });

                // CHANGED: Read booking details from bookingData if top-level fields missing
                // The frontend sendEmailConfirmation() sends the full booking in bookingData
                dynamic bd = data?.bookingData;
                string name = data?.name?.ToString() ?? bd?.name?.ToString() ?? "Guest";
                string route = data?.route?.ToString() ?? bd?.route?.ToString() ?? "-";
                string date = data?.date?.ToString() ?? bd?.date?.ToString() ?? "-";
                string time = data?.time?.ToString() ?? bd?.time?.ToString() ?? "Not specified";
                string vehicle = data?.vehicle?.ToString() ?? bd?.vehicleNumber?.ToString() ?? "-";
                string vehicleType = bd?.vehicleType?.ToString() ?? "";
                string driver = data?.driver?.ToString() ?? bd?.driverName?.ToString() ?? "-";
                string pickupAddr = data?.pickup_address?.ToString() ?? bd?.pickup_address?.ToString() ?? "";
                string bookingIdVal = data?.bookingId?.ToString() ?? bd?.bookingId?.ToString() ?? "-";

                // Include vehicle type in display if available
                string vehicleDisplay = !string.IsNullOrEmpty(vehicleType) && vehicle != "-"
                    ? vehicle + " (" + vehicleType + ")"
                    : vehicle;

                var smtpClient = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                var message = new MailMessage();
                message.From = new MailAddress(smtpUser, "Pratap Travels Booking Confirmation");
                message.To.Add(recipientAddress);

                // Add CC recipients if provided
                if (data?.cc != null)
                {
                    try
                    {
                        var ccArray = data.cc as Newtonsoft.Json.Linq.JArray;
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

                message.Subject = "Pratap Travels — Your Booking is Confirmed!";
                message.IsBodyHtml = true;
                message.Priority = MailPriority.High;

                string addrSection = !string.IsNullOrEmpty(pickupAddr)
                    ? $"<p><b>Pickup Address:</b> {pickupAddr}</p>" : "";

                // CHANGED: Use vehicleDisplay (includes vehicle type) and improved formatting
                message.Body = $@"
                    <h2>🚗 Pratap Travels — Booking Confirmed</h2>
                    <hr/>
                    <p><b>Hi {name},</b></p>
                    <p>Your booking has been confirmed!</p>
                    <p><b>Booking ID:</b> {bookingIdVal}</p>
                    <p><b>Route:</b> {route}</p>
                    <p><b>Travel Date:</b> {date}</p>
                    <p><b>Time:</b> {time}</p>
                    <p><b>Vehicle:</b> {vehicleDisplay}</p>
                    <p><b>Driver:</b> {driver}</p>
                    {addrSection}
                    <br/>
                    <p>Thank you for choosing Pratap Travels! Call +91 76313 82174 for queries.</p>
                ";

                smtpClient.Send(message);
                log.LogInformation($"Confirmation email sent to {recipientAddress} for booking {bookingIdVal}");
                return new OkObjectResult(new { success = true, message = "Confirmation email sent" });
            }
            catch (Exception ex)
            {
                log.LogError($"Confirmation email failed: {ex.Message}");
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        // ----------------------------------------------------------
        // Handle booking_update (update existing booking fields)
        // CHANGED: Now handles vehicleId:null, driver info clearing,
        //          needs_notification flag, and notification status updates
        // ----------------------------------------------------------
        if (dataType == "booking_update")
        {
            string bookingId = data.id?.ToString();
            dynamic updateData = data.data;
            if (updateData == null)
                return new BadRequestObjectResult(new { error = "Booking update data is required" });

            if (string.IsNullOrEmpty(bookingId))
                return new BadRequestObjectResult(new { error = "Booking id is required for update" });

            int index = -1;
            for (int i = 0; i < bookingsList.Count; i++)
            {
                if (bookingsList[i].bookingId?.ToString() == bookingId)
                {
                    index = i;
                    break;
                }
            }

            if (index == -1)
                return new NotFoundObjectResult(new { error = "Booking " + bookingId + " not found" });

            // Merge update fields into existing booking
            // This handles all updates including:
            //   - status changes (confirmed, completed, cancelled)
            //   - vehicleId assignment (vehicleId: "V123") or release (vehicleId: null)
            //   - driver/vehicle info (vehicleNumber, vehicleType, driverName, driverPhone)
            //   - pickup details (pickup_date, pickup_time, pickup_address, admin_notes)
            //   - notification flags (needs_notification, notification_sent, notification_type, notified_at, email_sent, email_sent_to, email_sent_cc)
            var updateObj = (Newtonsoft.Json.Linq.JObject)updateData;
            foreach (var prop in updateObj.Properties())
            {
                // Handle null values (e.g., vehicleId: null when releasing vehicle)
                if (prop.Value.Type == Newtonsoft.Json.Linq.JTokenType.Null)
                {
                    bookingsList[index][prop.Name] = null;
                }
                else
                {
                    bookingsList[index][prop.Name] = prop.Value;
                }
            }
            bookingsList[index].updatedAt = DateTime.UtcNow.ToString("o");

            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));
            log.LogInformation("Booking updated: " + bookingId);
            return new OkObjectResult(new { success = true, message = "Booking updated" });
        }

        // ----------------------------------------------------------
        // Handle vehicle_update (update existing vehicle)
        // ----------------------------------------------------------
        if (dataType == "vehicle_update")
        {
            string vehicleId = data.id?.ToString();
            dynamic updateData = data.data;
            if (updateData == null)
                return new BadRequestObjectResult(new { error = "Vehicle update data is required" });

            if (string.IsNullOrEmpty(vehicleId))
                return new BadRequestObjectResult(new { error = "Vehicle id is required for update" });

            int index = -1;
            for (int i = 0; i < vehiclesList.Count; i++)
            {
                if (vehiclesList[i].id?.ToString() == vehicleId)
                {
                    index = i;
                    break;
                }
            }

            if (index == -1)
                return new NotFoundObjectResult(new { error = "Vehicle " + vehicleId + " not found" });

            // Merge update fields into existing vehicle
            var updateObj = (Newtonsoft.Json.Linq.JObject)updateData;
            foreach (var prop in updateObj.Properties())
            {
                if (prop.Value.Type == Newtonsoft.Json.Linq.JTokenType.Null)
                {
                    vehiclesList[index][prop.Name] = null;
                }
                else
                {
                    vehiclesList[index][prop.Name] = prop.Value;
                }
            }
            vehiclesList[index].updatedAt = DateTime.UtcNow.ToString("o");

            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            log.LogInformation("Vehicle updated: " + vehicleId);
            return new OkObjectResult(new { success = true, message = "Vehicle updated" });
        }

        // ----------------------------------------------------------
        // Handle vehicle_delete (delete a vehicle)
        // ----------------------------------------------------------
        if (dataType == "vehicle_delete")
        {
            string vehicleId = data.id?.ToString();

            if (string.IsNullOrEmpty(vehicleId))
                return new BadRequestObjectResult(new { error = "Vehicle id is required for delete" });

            int removedCount = vehiclesList.RemoveAll(v => v.id?.ToString() == vehicleId);

            if (removedCount == 0)
                return new NotFoundObjectResult(new { error = "Vehicle " + vehicleId + " not found" });

            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            log.LogInformation("Vehicle deleted: " + vehicleId);
            return new OkObjectResult(new { success = true, message = "Vehicle deleted" });
        }

        return new BadRequestObjectResult(new { error = "Unknown data type. Expected 'booking_data', 'booking_update', 'booking_confirmation', 'audit_trail', 'vehicle_data', 'vehicle_update', or 'vehicle_delete'." });
    }

    // ================================================================
    // --- PUT: Update existing record (legacy) ---
    // ================================================================
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
                return new BadRequestObjectResult(new { error = "bookingId is required for update" });

            int index = -1;
            for (int i = 0; i < bookingsList.Count; i++)
            {
                if (bookingsList[i].bookingId?.ToString() == bookingId)
                {
                    index = i;
                    break;
                }
            }

            if (index == -1)
                return new NotFoundObjectResult(new { error = "Booking " + bookingId + " not found" });

            var existing = bookingsList[index];
            if (update.status != null) existing.status = update.status;
            if (update.remarks != null) existing.remarks = update.remarks;
            existing.updatedAt = DateTime.UtcNow.ToString("o");
            bookingsList[index] = existing;

            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));
            log.LogInformation("Booking updated: " + bookingId);
            return new OkObjectResult(new { success = true, message = "Booking updated" });
        }

        return new BadRequestObjectResult(new { error = "Unknown data type for PUT" });
    }

    return new BadRequestObjectResult("Requested HTTP method verb is unsupported.");
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
