using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CouplesWebsite.Api.Services;

public class PasswordService : IPasswordService
{
    private readonly IConfiguration _configuration;

    public PasswordService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool VerifySecurePassword(string password)
    {
        // Accept both the flat env-var key (Railway) and the camelCase appsettings key (local dev).
        var hash = _configuration["SECURE_SECTION_PASSWORD_HASH"]
            ?? _configuration["SecureSectionPasswordHash"]
            ?? throw new InvalidOperationException(
                "Secure section password hash is not configured. " +
                "Set SECURE_SECTION_PASSWORD_HASH (Railway) or SecureSectionPasswordHash (appsettings).");
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public bool VerifyAdminPassword(string password)
    {
        // Accept both the flat env-var key (Railway) and the camelCase appsettings key (local dev).
        var hash = _configuration["ADMIN_PASSWORD_HASH"]
            ?? _configuration["AdminPasswordHash"]
            ?? throw new InvalidOperationException(
                "Admin password hash is not configured. " +
                "Set ADMIN_PASSWORD_HASH (Railway) or AdminPasswordHash (appsettings).");
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public string GenerateJwt(string subject, string role)
    {
        var secretKey = _configuration["Jwt__SecretKey"]
            ?? _configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt SecretKey is not configured.");
        var issuer = _configuration["Jwt__Issuer"]
            ?? _configuration["Jwt:Issuer"]
            ?? "CouplesWebsiteApi";
        var audience = _configuration["Jwt__Audience"]
            ?? _configuration["Jwt:Audience"]
            ?? "CouplesWebsiteFrontend";

        var expiryHours = _configuration.GetValue<int>("Jwt:ExpiryHours", 8);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, subject),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool ValidateJwt(string token, string requiredRole)
    {
        var secretKey = _configuration["Jwt__SecretKey"]
            ?? _configuration["Jwt:SecretKey"];

        if (string.IsNullOrEmpty(secretKey))
            return false;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secretKey);

        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var role = jwtToken.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            return string.Equals(role, requiredRole, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}
