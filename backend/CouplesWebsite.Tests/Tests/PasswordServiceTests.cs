using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CouplesWebsite.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// Pure unit tests for PasswordService.
/// No HTTP stack, no database — only BCrypt and JWT logic.
/// </summary>
public class PasswordServiceTests
{
    // ── Shared test constants ──────────────────────────────────────────────────
    private const string PlainSecurePassword = "correct-horse-battery-staple";
    private const string PlainAdminPassword  = "admin-super-secret";
    private const string JwtSecretKey        = "test-secret-key-that-is-at-least-32-chars!!";

    private static PasswordService CreateService(
        string? securePwHash = null,
        string? adminPwHash  = null,
        int     expiryHours  = 8)
    {
        securePwHash ??= BCrypt.Net.BCrypt.HashPassword(PlainSecurePassword);
        adminPwHash  ??= BCrypt.Net.BCrypt.HashPassword(PlainAdminPassword);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SecretKey"]  = JwtSecretKey,
                ["Jwt:Issuer"]     = "TestIssuer",
                ["Jwt:Audience"]   = "TestAudience",
                ["Jwt:ExpiryHours"] = expiryHours.ToString(),
                ["SECURE_SECTION_PASSWORD_HASH"] = securePwHash,
                ["ADMIN_PASSWORD_HASH"]          = adminPwHash,
            })
            .Build();

        return new PasswordService(config);
    }

    // ── VerifySecurePassword ───────────────────────────────────────────────────

    [Fact]
    public void VerifySecurePassword_CorrectPassword_ReturnsTrue()
    {
        var service = CreateService();
        var result  = service.VerifySecurePassword(PlainSecurePassword);
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifySecurePassword_WrongPassword_ReturnsFalse()
    {
        var service = CreateService();
        var result  = service.VerifySecurePassword("totally-wrong-password");
        result.Should().BeFalse();
    }

    // ── GenerateJwt ───────────────────────────────────────────────────────────

    [Fact]
    public void GenerateJwt_ReturnsNonEmptyString()
    {
        var service = CreateService();
        var token   = service.GenerateJwt("secure-user", "secure");
        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateJwt_ProducesAWellFormedJwtToken()
    {
        var service = CreateService();
        var token   = service.GenerateJwt("test-subject", "secure");

        var handler = new JwtSecurityTokenHandler();
        handler.CanReadToken(token).Should().BeTrue();

        var parsed = handler.ReadJwtToken(token);
        parsed.Subject.Should().Be("test-subject");
    }

    // ── ValidateJwt ───────────────────────────────────────────────────────────

    [Fact]
    public void ValidateJwt_ValidTokenWithCorrectRole_ReturnsTrue()
    {
        var service = CreateService();
        var token   = service.GenerateJwt("secure-user", "secure");

        var result = service.ValidateJwt(token, "secure");
        result.Should().BeTrue();
    }

    [Fact]
    public void ValidateJwt_ValidTokenWithWrongRole_ReturnsFalse()
    {
        var service = CreateService();
        var token   = service.GenerateJwt("secure-user", "secure");

        var result = service.ValidateJwt(token, "admin");
        result.Should().BeFalse();
    }

    [Fact]
    public void ValidateJwt_ExpiredToken_ReturnsFalse()
    {
        // Create service with –1 hour expiry to immediately expire the token
        var service = CreateService(expiryHours: -1);

        // Build an already-expired token manually using the same key
        var key         = Encoding.UTF8.GetBytes(JwtSecretKey);
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256);

        var expiredToken = new JwtSecurityToken(
            issuer:   "TestIssuer",
            audience: "TestAudience",
            claims: [
                new Claim(JwtRegisteredClaimNames.Sub, "old-user"),
                new Claim(ClaimTypes.Role, "secure"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            ],
            notBefore: DateTime.UtcNow.AddHours(-2),
            expires:   DateTime.UtcNow.AddHours(-1),
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(expiredToken);
        var result      = service.ValidateJwt(tokenString, "secure");

        result.Should().BeFalse();
    }

    [Fact]
    public void ValidateJwt_MalformedToken_ReturnsFalse()
    {
        var service = CreateService();
        var result  = service.ValidateJwt("not.a.valid.jwt.string", "secure");
        result.Should().BeFalse();
    }
}
