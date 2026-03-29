using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// Integration tests for SecureController — password verification, cookie issuance,
/// and session status endpoint.
/// </summary>
public class SecureControllerTests
{
    private const string CorrectPassword = "my-test-secure-password";
    private const string WrongPassword   = "this-is-the-wrong-password";

    private WebApplicationFactory<Program> BuildFactory()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // Use the correct BCrypt hash for CorrectPassword
                var hash = BCrypt.Net.BCrypt.HashPassword(CorrectPassword);

                builder.UseSetting("Jwt:SecretKey",  "test-secret-key-that-is-at-least-32-chars!!");
                builder.UseSetting("Jwt:Issuer",     "TestIssuer");
                builder.UseSetting("Jwt:Audience",   "TestAudience");
                builder.UseSetting("Jwt:ExpiryHours","8");
                builder.UseSetting("SECURE_SECTION_PASSWORD_HASH", hash);
                builder.UseSetting("ADMIN_PASSWORD_HASH",
                    BCrypt.Net.BCrypt.HashPassword("test-admin-password"));
                builder.UseSetting("CORS_ORIGIN", "http://localhost:3000");

                builder.ConfigureServices(services =>
                {
                    // Replace PostgreSQL with InMemory
                    var dbDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (dbDescriptor is not null) services.Remove(dbDescriptor);

                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase(Guid.NewGuid().ToString()));

                    // Replace real cache with a no-op implementation
                    var cacheDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(ICacheService));
                    if (cacheDescriptor is not null) services.Remove(cacheDescriptor);

                    services.AddSingleton<ICacheService, NoOpCacheService>();
                });
            });
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Verify_WithWrongPassword_ReturnsUnauthorized()
    {
        var client   = BuildFactory().CreateClient();
        var payload  = new { password = WrongPassword };
        var response = await client.PostAsJsonAsync("/api/secure/verify", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Verify_WithCorrectPassword_ReturnsOkAndSetsCookie()
    {
        var factory = BuildFactory();
        var client  = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies     = true,
        });

        var payload  = new { password = CorrectPassword };
        var response = await client.PostAsJsonAsync("/api/secure/verify", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Response body should include token and expiresAt fields
        var json = await response.Content.ReadAsStringAsync();
        json.Should().Contain("token");
        json.Should().Contain("expiresAt");

        // Set-Cookie header should be present and contain our cookie name
        response.Headers.TryGetValues("Set-Cookie", out var cookies);
        cookies.Should().NotBeNullOrEmpty();
        var cookieString = string.Join("; ", cookies!);
        cookieString.Should().Contain("secure_token");
    }

    [Fact]
    public async Task Status_WithoutCookie_ReturnsAuthenticatedFalse()
    {
        var client   = BuildFactory().CreateClient();
        var response = await client.GetAsync("/api/secure/status");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        using var doc    = JsonDocument.Parse(json);
        var authenticated = doc.RootElement.GetProperty("authenticated").GetBoolean();
        authenticated.Should().BeFalse();
    }
}
