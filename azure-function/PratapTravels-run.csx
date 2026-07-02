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
        "https://portal.azure.com",
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
    string driverDiaryFilePath = Path.Combine(dataDir, "driver-diary.json");

    if (!File.Exists(bookingsFilePath)) File.WriteAllText(bookingsFilePath, "[]");
    if (!File.Exists(auditFilePath)) File.WriteAllText(auditFilePath, "[]");
    if (!File.Exists(vehiclesFilePath)) File.WriteAllText(vehiclesFilePath, "[]");
    if (!File.Exists(driverDiaryFilePath)) File.WriteAllText(driverDiaryFilePath, "[]");

    var bookingsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(bookingsFilePath));
    var auditList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(auditFilePath));
    var vehiclesList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(vehiclesFilePath));
    var driverDiaryList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(driverDiaryFilePath));

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
        string expectedKey = Environment.GetEnvironmentVariable("PRATAP_DATA_FUNCTION_KEY") ?? "";
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

        if (dataType == "driver_diary")
        {
            var sortedDiary = driverDiaryList.OrderByDescending(d => d.date).ToList();
            return new OkObjectResult(new { total = sortedDiary.Count, entries = sortedDiary });
        }

        // ----------------------------------------------------------
        // CHANGED: type=revenue — Revenue analytics
        // FIX: Revenue calculated from COMPLETED bookings only
        // ----------------------------------------------------------
        if (dataType == "revenue")
        {
            var revenueBookings = bookingsList.Where(b => b.status?.ToString() == "completed").ToList();
            var confirmedCount = bookingsList.Count(b => b.status?.ToString() == "confirmed");
            var completedCount = bookingsList.Count(b => b.status?.ToString() == "completed");
            var pendingCount = bookingsList.Count(b => b.status?.ToString() == "pending");
            var cancelledCount = bookingsList.Count(b => b.status?.ToString() == "cancelled");

            decimal totalRevenue = 0;
            var revenueByRoute = new Dictionary<string, object>();
            var revenueByMonth = new Dictionary<string, object>();

            foreach (var b in revenueBookings)
            {
                string route = b.route?.ToString() ?? "";

                // Use the actual fare from the booking, fallback to 500 for old bookings without fare
                decimal bookingRevenue = 0;
                if (b.fare != null && decimal.TryParse(b.fare?.ToString(), out decimal parsedFare) && parsedFare > 0)
                {
                    bookingRevenue = parsedFare;
                }
                else
                {
                    bookingRevenue = 500; // fallback for old bookings without fare set
                }

                totalRevenue += bookingRevenue;

                if (!revenueByRoute.ContainsKey(route))
                    revenueByRoute[route] = Newtonsoft.Json.Linq.JObject.FromObject(new { route = route, count = 0, revenue = 0 });
                var routeData = (Newtonsoft.Json.Linq.JObject)revenueByRoute[route];
                routeData["count"] = (int)routeData["count"] + 1;
                routeData["revenue"] = (decimal)routeData["revenue"] + bookingRevenue;

                string createdAt = b.createdAt?.ToString() ?? "";
                string month = "-";
                DateTime parsedDate;
                if (DateTime.TryParse(createdAt, null, System.Globalization.DateTimeStyles.RoundtripKind, out parsedDate))
                    month = parsedDate.ToString("yyyy-MM");

                if (!revenueByMonth.ContainsKey(month))
                    revenueByMonth[month] = Newtonsoft.Json.Linq.JObject.FromObject(new { month = month, count = 0, revenue = 0 });
                var monthData = (Newtonsoft.Json.Linq.JObject)revenueByMonth[month];
                monthData["count"] = (int)monthData["count"] + 1;
                monthData["revenue"] = (decimal)monthData["revenue"] + bookingRevenue;
            }

            decimal avgBookingValue = revenueBookings.Count > 0 ? totalRevenue / revenueBookings.Count : 0;

            return new OkObjectResult(new
            {
                totalBookings = bookingsList.Count,
                totalRevenue = totalRevenue,
                confirmedBookings = confirmedCount,
                completedBookings = completedCount,
                pendingBookings = pendingCount,
                cancelledBookings = cancelledCount,
                averageOrderValue = Math.Round(avgBookingValue, 0),
                revenueByRoute = revenueByRoute.Values.ToList(),
                // FIXED: Explicitly cast m to dynamic to bypass the object indexing error
                revenueByMonth = revenueByMonth.Values.OrderByDescending(m => ((dynamic)m).month?.ToString()).ToList()
            });
        }

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

        if (dataType == "audit_trail")
        {
            try
            {
                dynamic auditRecord = data.data;
                if (auditRecord == null)
                    return new BadRequestObjectResult(new { error = "Audit record data is required" });
                auditRecord.serverTimestamp = DateTime.UtcNow.ToString("o");
                auditList.Add(auditRecord);
                File.WriteAllText(auditFilePath, JsonConvert.SerializeObject(auditList, Formatting.Indented));

                string logAuditType = auditRecord.type?.ToString() ?? "Unknown";
                log.LogInformation("Audit event saved: " + logAuditType);

                return new OkObjectResult(new { success = true, message = "Audit event saved" });
            }
            catch (Exception ex)
            {
                log.LogError("Failed to save audit trail: " + ex.Message);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

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

        if (dataType == "booking_confirmation")
        {
            try
            {
                string smtpUser = Environment.GetEnvironmentVariable("EMAIL_USER_PRATAP");
                string smtpPass = Environment.GetEnvironmentVariable("EMAIL_PASS_PRATAP");
                string recipientAddress = data?.to?.ToString() ?? data?.email?.ToString();
                if (string.IsNullOrEmpty(recipientAddress))
                    return new BadRequestObjectResult(new { error = "Customer email is required" });

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

            var updateObj = (Newtonsoft.Json.Linq.JObject)updateData;
            foreach (var prop in updateObj.Properties())
            {
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

        if (dataType == "booking_delete")
        {
            string bookingId = data.id?.ToString() ?? data.data?.bookingId?.ToString();

            if (string.IsNullOrEmpty(bookingId))
                return new BadRequestObjectResult(new { error = "Booking id is required for delete" });

            string releasedVehicleId = null;
            bool deleted = false;
            for (int i = 0; i < bookingsList.Count; i++)
            {
                if (bookingsList[i].bookingId?.ToString() == bookingId)
                {
                    releasedVehicleId = bookingsList[i].vehicleId?.ToString();
                    bookingsList.RemoveAt(i);
                    deleted = true;
                    break;
                }
            }

            if (!deleted)
                return new NotFoundObjectResult(new { error = "Booking " + bookingId + " not found" });

            if (releasedVehicleId != null)
            {
                for (int i = 0; i < vehiclesList.Count; i++)
                {
                    if (vehiclesList[i].id?.ToString() == releasedVehicleId)
                    {
                        vehiclesList[i].status = "available";
                        vehiclesList[i].updatedAt = DateTime.UtcNow.ToString("o");
                        break;
                    }
                }
            }

            File.WriteAllText(bookingsFilePath, JsonConvert.SerializeObject(bookingsList, Formatting.Indented));
            File.WriteAllText(vehiclesFilePath, JsonConvert.SerializeObject(vehiclesList, Formatting.Indented));
            log.LogInformation("Booking deleted: " + bookingId);
            return new OkObjectResult(new { success = true, message = "Booking deleted", releasedVehicleId = releasedVehicleId });
        }

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

        if (dataType == "driver_diary_data")
        {
            dynamic diaryData = data.data;
            diaryData.id = "DD" + DateTime.UtcNow.Ticks + "_" + Guid.NewGuid().ToString("N").Substring(0, 6);
            diaryData.savedAt = DateTime.UtcNow.ToString("o");
            driverDiaryList.Add(diaryData);
            File.WriteAllText(driverDiaryFilePath, JsonConvert.SerializeObject(driverDiaryList, Formatting.Indented));

            string logVehicleId = diaryData.vehicleId?.ToString() ?? "Unknown";
            log.LogInformation("Driver diary entry saved: " + logVehicleId);

            return new OkObjectResult(new { success = true, message = "Driver diary entry saved", id = diaryData.id.ToString() });
        }

        if (dataType == "driver_diary_update")
        {
            string entryId = data.id?.ToString();
            dynamic updateData = data.data;
            if (updateData == null)
                return new BadRequestObjectResult(new { error = "Driver diary update data is required" });

            if (string.IsNullOrEmpty(entryId))
                return new BadRequestObjectResult(new { error = "Entry id is required for update" });

            int index = -1;
            for (int i = 0; i < driverDiaryList.Count; i++)
            {
                if (driverDiaryList[i].id?.ToString() == entryId)
                {
                    index = i;
                    break;
                }
            }

            if (index == -1)
                return new NotFoundObjectResult(new { error = "Driver diary entry " + entryId + " not found" });

            var updateObj = (Newtonsoft.Json.Linq.JObject)updateData;
            foreach (var prop in updateObj.Properties())
            {
                if (prop.Value.Type == Newtonsoft.Json.Linq.JTokenType.Null)
                {
                    driverDiaryList[index][prop.Name] = null;
                }
                else
                {
                    driverDiaryList[index][prop.Name] = prop.Value;
                }
            }
            driverDiaryList[index].updatedAt = DateTime.UtcNow.ToString("o");

            File.WriteAllText(driverDiaryFilePath, JsonConvert.SerializeObject(driverDiaryList, Formatting.Indented));
            log.LogInformation("Driver diary entry updated: " + entryId);
            return new OkObjectResult(new { success = true, message = "Driver diary entry updated" });
        }

        if (dataType == "driver_diary_delete")
        {
            string entryId = data.id?.ToString();

            if (string.IsNullOrEmpty(entryId))
                return new BadRequestObjectResult(new { error = "Entry id is required for delete" });

            int removedCount = driverDiaryList.RemoveAll(d => d.id?.ToString() == entryId);

            if (removedCount == 0)
                return new NotFoundObjectResult(new { error = "Driver diary entry " + entryId + " not found" });

            File.WriteAllText(driverDiaryFilePath, JsonConvert.SerializeObject(driverDiaryList, Formatting.Indented));
            log.LogInformation("Driver diary entry deleted: " + entryId);
            return new OkObjectResult(new { success = true, message = "Driver diary entry deleted" });
        }

        return new BadRequestObjectResult(new { error = "Unknown data type. Expected 'booking_data', 'booking_update', 'booking_delete', 'booking_confirmation', 'audit_trail', 'vehicle_data', 'vehicle_update', 'vehicle_delete', 'driver_diary_data', 'driver_diary_update', or 'driver_diary_delete'." });
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
