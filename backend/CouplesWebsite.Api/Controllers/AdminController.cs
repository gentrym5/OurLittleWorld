using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Filters;
using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private const string CookieName = "admin_token";
    private const int CookieExpiryHours = 4;
    private const int DefaultPageSize = 50;

    private readonly IPasswordService _passwordService;
    private readonly IWebHostEnvironment _environment;
    private readonly AppDbContext _db;

    public AdminController(
        IPasswordService passwordService,
        IWebHostEnvironment environment,
        AppDbContext db)
    {
        _passwordService = passwordService;
        _environment = environment;
        _db = db;
    }

    // POST /api/admin/verify
    [HttpPost("verify")]
    public IActionResult Verify([FromBody] SecurePasswordRequest request)
    {
        if (!_passwordService.VerifyAdminPassword(request.Password))
            return Unauthorized(new { message = "Invalid password." });

        var expiresAt = DateTime.UtcNow.AddHours(CookieExpiryHours);
        var token = _passwordService.GenerateJwt("admin-user", "admin");

        Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = !_environment.IsDevelopment(),
            Expires = expiresAt
        });

        return Ok(new SecureTokenResponse(token, expiresAt));
    }

    // POST /api/admin/logout
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = !_environment.IsDevelopment()
        });

        return Ok(new { message = "Logged out." });
    }

    // GET /api/admin/status
    [HttpGet("status")]
    public IActionResult Status()
    {
        var token = Request.Cookies[CookieName];
        var authenticated = !string.IsNullOrEmpty(token)
                            && _passwordService.ValidateJwt(token, "admin");

        return Ok(new { authenticated });
    }

    // GET /api/admin/activity-logs?page=1&pageSize=50
    [HttpGet("activity-logs")]
    [RequireAdminSession]
    public async Task<IActionResult> GetActivityLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 200) pageSize = DefaultPageSize;

        var total = await _db.ActivityLogs.CountAsync(ct);

        var logs = await _db.ActivityLogs
            .AsNoTracking()
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.LogID,
                l.IPAddress,
                l.PageVisited,
                l.Action,
                l.Timestamp
            })
            .ToListAsync(ct);

        return Ok(new
        {
            page,
            pageSize,
            total,
            totalPages = (int)Math.Ceiling((double)total / pageSize),
            data = logs
        });
    }

    // GET /api/admin/stats
    [HttpGet("stats")]
    [RequireAdminSession]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var questionCount = await _db.Questions.CountAsync(ct);
        var answerCount = await _db.Answers.CountAsync(ct);
        var feelingCount = await _db.Feelings.CountAsync(ct);
        var photoCount = await _db.Photos.CountAsync(ct);
        var timelineCount = await _db.TimelineEntries.CountAsync(ct);

        return Ok(new
        {
            questionCount,
            answerCount,
            feelingCount,
            photoCount,
            timelineCount
        });
    }
}
