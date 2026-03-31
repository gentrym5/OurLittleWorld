using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Filters;
using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/secure")]
public class SecureController : ControllerBase
{
    private const string CookieName = "secure_token";
    private const int CookieExpiryHours = 4;

    private readonly IPasswordService _passwordService;
    private readonly IWebHostEnvironment _environment;

    public SecureController(IPasswordService passwordService, IWebHostEnvironment environment)
    {
        _passwordService = passwordService;
        _environment = environment;
    }

    // POST /api/secure/verify
    [HttpPost("verify")]
    public IActionResult Verify([FromBody] SecurePasswordRequest request)
    {
        if (!_passwordService.VerifySecurePassword(request.Password))
            return Unauthorized(new { message = "Invalid password." });

        var expiresAt = DateTime.UtcNow.AddHours(CookieExpiryHours);
        var token = _passwordService.GenerateJwt("secure-user", "secure");

        var sameSite = _environment.IsDevelopment()
            ? SameSiteMode.Strict
            : SameSiteMode.None;
        var secure = !_environment.IsDevelopment();

        Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = sameSite,
            Secure = secure,
            Expires = expiresAt
        });

        return Ok(new SecureTokenResponse(token, expiresAt));
    }

    // POST /api/secure/logout
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            SameSite = _environment.IsDevelopment() ? SameSiteMode.Strict : SameSiteMode.None,
            Secure = !_environment.IsDevelopment()
        });

        return Ok(new { message = "Logged out." });
    }

    // GET /api/secure/status
    [HttpGet("status")]
    public IActionResult Status()
    {
        var token = Request.Cookies[CookieName];
        var authenticated = !string.IsNullOrEmpty(token)
                            && _passwordService.ValidateJwt(token, "secure");

        return Ok(new { authenticated });
    }
}
