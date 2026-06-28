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

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation($"Referral API function triggered. Method: {req.Method}");

    string origin = req.Headers["Origin"].FirstOrDefault();

    // Allowed origins configuration
    var allowedOrigins = new[] {
        "https://portal.azure.com",
        "https://agreeable-meadow-041d69800.7.azurestaticapps.net"
    };

    if (string.IsNullOrEmpty(origin) || !allowedOrigins.Contains(origin))
    {
        log.LogWarning($"Blocked request from unauthorized origin: {origin}");
        return new StatusCodeResult(StatusCodes.Status403Forbidden);
    }

    // JSON file storage path
    string referralsJsonFile = "referrals.json";
    string redemptionsJsonFile = "redemptions.json";

    string rootPath = Environment.GetEnvironmentVariable("HOME") ?? "D:\\home";
    string referralsFilePath = Path.Combine(rootPath, "data", referralsJsonFile);
    string redemptionsFilePath = Path.Combine(rootPath, "data", redemptionsJsonFile);
    Directory.CreateDirectory(Path.GetDirectoryName(referralsFilePath));

    if (!File.Exists(referralsFilePath))
    {
        File.WriteAllText(referralsFilePath, "[]");
    }
    if (!File.Exists(redemptionsFilePath))
    {
        File.WriteAllText(redemptionsFilePath, "[]");
    }

    var referralsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(referralsFilePath));
    var redemptionsList = JsonConvert.DeserializeObject<List<dynamic>>(File.ReadAllText(redemptionsFilePath));

    // Route based on HTTP method and action
    if (string.Equals(req.Method, "POST", StringComparison.OrdinalIgnoreCase))
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = string.IsNullOrWhiteSpace(requestBody) ? null : JsonConvert.DeserializeObject(requestBody);

        string action = data?._action?.ToString() ?? "";

        if (action == "validate")
        {
            return HandleValidate(data, referralsList, log);
        }
        else if (action == "redeem")
        {
            return HandleRedeem(data, referralsList, redemptionsList, referralsFilePath, redemptionsFilePath, log);
        }
        else
        {
            // Register a new referral code
            return HandleRegister(data, referralsList, referralsFilePath, log);
        }
    }
    else if (string.Equals(req.Method, "GET", StringComparison.OrdinalIgnoreCase))
    {
        string referralCode = req.Query["referral_code"];

        if (!string.IsNullOrEmpty(referralCode))
        {
            // Get stats for a specific code
            return HandleGetStats(referralCode, referralsList, log);
        }

        // Admin: Get all referrals (require function key)
        string functionKey = req.Headers["x-functions-key"].FirstOrDefault() ?? req.Query["code"];
        string expectedKey = Environment.GetEnvironmentVariable("REFERRAL_AZURE_FUNCTION_KEY") ?? "";

        if (string.IsNullOrEmpty(expectedKey) || functionKey != expectedKey)
        {
            return new ForbidResult();
        }

        return HandleGetAll(referralsList, log);
    }

    return new BadRequestObjectResult("Requested HTTP method verb is unsupported.");
}

// ---------- Register a new referral code ----------
private static IActionResult HandleRegister(dynamic data, List<dynamic> referralsList, string filePath, ILogger log)
{
    string name = data?.name;
    string code = data?.code?.ToString().ToUpper();

    if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(code))
    {
        return new BadRequestObjectResult(new { error = "Name and code are required" });
    }

    // Check if code already exists
    var existing = referralsList.FirstOrDefault(r => r.code?.ToString() == code);
    if (existing != null)
    {
        return new OkObjectResult(new
        {
            success = true,
            existing = true,
            code = existing.code?.ToString(),
            totalReferrals = (int)(existing.totalReferrals ?? 0),
            totalRewards = (int)(existing.totalRewards ?? 0),
            rewardBalance = (int)(existing.rewardBalance ?? 0)
        });
    }

    // Create new referral record
    var newReferral = new Dictionary<string, object>
    {
        { "name", name },
        { "code", code },
        { "totalReferrals", 0 },
        { "totalRedemptions", 0 },
        { "totalRewards", 0 },
        { "rewardBalance", 0 },
        { "createdAt", DateTime.UtcNow.ToString("o") },
        { "updatedAt", DateTime.UtcNow.ToString("o") },
        { "status", "active" }
    };

    referralsList.Add(newReferral);
    File.WriteAllText(filePath, JsonConvert.SerializeObject(referralsList, Formatting.Indented));

    log.LogInformation($"Referral code {code} registered for {name}.");

    return new OkObjectResult(new
    {
        success = true,
        existing = false,
        code = code,
        totalReferrals = 0,
        totalRewards = 0,
        rewardBalance = 0
    });
}

// ---------- Validate a referral code ----------
private static IActionResult HandleValidate(dynamic data, List<dynamic> referralsList, ILogger log)
{
    string code = data?.code?.ToString().ToUpper();

    if (string.IsNullOrEmpty(code))
    {
        return new BadRequestObjectResult(new { error = "Code is required" });
    }

    var referral = referralsList.FirstOrDefault(r => r.code?.ToString() == code);

    if (referral != null && referral.status?.ToString() == "active")
    {
        return new OkObjectResult(new
        {
            valid = true,
            code = referral.code?.ToString(),
            referrerName = referral.name?.ToString(),
            status = referral.status?.ToString()
        });
    }

    return new OkObjectResult(new { valid = false, code = code });
}

// ---------- Record a redemption ----------
private static IActionResult HandleRedeem(dynamic data, List<dynamic> referralsList, List<dynamic> redemptionsList,
    string referralsFilePath, string redemptionsFilePath, ILogger log)
{
    string code = data?.code?.ToString().ToUpper();
    string bookingId = data?.bookingId;
    string newCustomerPhone = data?.newCustomerPhone?.ToString() ?? "";

    if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(bookingId))
    {
        return new BadRequestObjectResult(new { error = "Code and bookingId are required" });
    }

    var referralIndex = referralsList.FindIndex(r => r.code?.ToString() == code);
    if (referralIndex == -1)
    {
        return new NotFoundObjectResult(new { error = "Invalid referral code" });
    }

    // Update referrer's stats
    var referral = referralsList[referralIndex];
    referral.totalReferrals = (int)(referral.totalReferrals ?? 0) + 1;
    referral.totalRedemptions = (int)(referral.totalRedemptions ?? 0) + 1;
    referral.totalRewards = (int)(referral.totalRewards ?? 0) + 50;
    referral.rewardBalance = (int)(referral.rewardBalance ?? 0) + 50;
    referral.updatedAt = DateTime.UtcNow.ToString("o");
    referral.lastReferralAt = DateTime.UtcNow.ToString("o");

    referralsList[referralIndex] = referral;
    File.WriteAllText(referralsFilePath, JsonConvert.SerializeObject(referralsList, Formatting.Indented));

    // Store redemption record
    var redemption = new Dictionary<string, object>
    {
        { "referralCode", code },
        { "bookingId", bookingId },
        { "newCustomerPhone", newCustomerPhone },
        { "rewardAmount", 50 },
        { "discountAmount", 50 },
        { "createdAt", DateTime.UtcNow.ToString("o") },
        { "status", "completed" }
    };

    redemptionsList.Add(redemption);
    File.WriteAllText(redemptionsFilePath, JsonConvert.SerializeObject(redemptionsList, Formatting.Indented));

    log.LogInformation($"Referral {code} redeemed for booking {bookingId}. New balance: {referral.rewardBalance}");

    return new OkObjectResult(new
    {
        success = true,
        rewardCredited = 50,
        discountApplied = 50,
        newBalance = (int)referral.rewardBalance
    });
}

// ---------- Get stats for a specific code ----------
private static IActionResult HandleGetStats(string referralCode, List<dynamic> referralsList, ILogger log)
{
    var referral = referralsList.FirstOrDefault(r => r.code?.ToString() == referralCode.ToUpper());

    if (referral == null)
    {
        return new NotFoundObjectResult(new { error = "Code not found" });
    }

    return new OkObjectResult(new
    {
        code = referral.code?.ToString(),
        name = referral.name?.ToString(),
        totalReferrals = (int)(referral.totalReferrals ?? 0),
        totalRedemptions = (int)(referral.totalRedemptions ?? 0),
        totalRewards = (int)(referral.totalRewards ?? 0),
        rewardBalance = (int)(referral.rewardBalance ?? 0),
        createdAt = referral.createdAt?.ToString(),
        lastReferralAt = referral.lastReferralAt?.ToString()
    });
}

// ---------- Get all referrals (admin) ----------
private static IActionResult HandleGetAll(List<dynamic> referralsList, ILogger log)
{
    var result = referralsList.Select(r => new
    {
        code = r.code?.ToString(),
        name = r.name?.ToString(),
        totalReferrals = (int)(r.totalReferrals ?? 0),
        totalRewards = (int)(r.totalRewards ?? 0),
        rewardBalance = (int)(r.rewardBalance ?? 0),
        createdAt = r.createdAt?.ToString(),
        status = r.status?.ToString()
    }).ToList();

    return new OkObjectResult(new
    {
        total = result.Count,
        referrals = result
    });
}
