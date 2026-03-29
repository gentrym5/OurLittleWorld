using System.Net;
using System.Net.Http.Json;
using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Models;
using CouplesWebsite.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// Integration tests for FeelingsController using an in-memory database.
/// Each test gets its own uniquely-named in-memory database to prevent state leakage.
/// </summary>
public class FeelingsControllerTests
{
    // ── Factory helper ────────────────────────────────────────────────────────

    private static WebApplicationFactory<Program> BuildFactory(string dbName)
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseSetting("Jwt:SecretKey",  "test-secret-key-that-is-at-least-32-chars!!");
                builder.UseSetting("Jwt:Issuer",     "TestIssuer");
                builder.UseSetting("Jwt:Audience",   "TestAudience");
                builder.UseSetting("Jwt:ExpiryHours","8");
                builder.UseSetting("SECURE_SECTION_PASSWORD_HASH",
                    BCrypt.Net.BCrypt.HashPassword("test-secure-password"));
                builder.UseSetting("ADMIN_PASSWORD_HASH",
                    BCrypt.Net.BCrypt.HashPassword("test-admin-password"));
                builder.UseSetting("CORS_ORIGIN", "http://localhost:3000");

                builder.ConfigureServices(services =>
                {
                    // Replace PostgreSQL DbContext with an InMemory database
                    var dbDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (dbDescriptor is not null) services.Remove(dbDescriptor);

                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase(dbName));

                    // Replace real cache with a no-op implementation
                    var cacheDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(ICacheService));
                    if (cacheDescriptor is not null) services.Remove(cacheDescriptor);

                    services.AddSingleton<ICacheService, NoOpCacheService>();
                });
            });
    }

    /// <summary>Seeds the two required users so FK constraints are satisfied.</summary>
    private static async Task SeedUsersAsync(WebApplicationFactory<Program> factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!db.Users.Any())
        {
            db.Users.Add(new User { Username = "Partner 1", PasswordHash = string.Empty });
            db.Users.Add(new User { Username = "Partner 2", PasswordHash = string.Empty });
            await db.SaveChangesAsync();
        }
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_ReturnsCreated_WithFeelingEntry()
    {
        var factory = BuildFactory(Guid.NewGuid().ToString());
        await SeedUsersAsync(factory);
        var client = factory.CreateClient();

        var payload  = new { userID = 1, feeling = "Happy", subject = "Work", context = "Great day" };
        var response = await client.PostAsJsonAsync("/api/feelings", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<FeelingResponse>();
        body.Should().NotBeNull();
        body!.Feeling.Should().Be("Happy");
        body.FeelingID.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Create_WhenAtLimit_Returns422WithMessage()
    {
        var factory = BuildFactory(Guid.NewGuid().ToString());
        await SeedUsersAsync(factory);

        // Seed exactly 500 entries directly via DbContext to hit the limit
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entries = Enumerable.Range(1, 500).Select(_ => new Feeling
            {
                UserID      = 1,
                FeelingWord = "Happy",
                Subject     = string.Empty,
                Context     = string.Empty,
                Timestamp   = DateTime.UtcNow,
            });
            db.Feelings.AddRange(entries);
            await db.SaveChangesAsync();
        }

        var client   = factory.CreateClient();
        var payload  = new { userID = 1, feeling = "Sad", subject = "", context = "" };
        var response = await client.PostAsJsonAsync("/api/feelings", payload);

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("maximum");
    }

    [Fact]
    public async Task GetRecent_WithLimit5_ReturnsAtMostFiveResults()
    {
        var factory = BuildFactory(Guid.NewGuid().ToString());
        await SeedUsersAsync(factory);

        // Seed 10 feelings
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var entries = Enumerable.Range(1, 10).Select(i => new Feeling
            {
                UserID      = 1,
                FeelingWord = "Calm",
                Subject     = string.Empty,
                Context     = string.Empty,
                Timestamp   = DateTime.UtcNow.AddMinutes(-i),
            });
            db.Feelings.AddRange(entries);
            await db.SaveChangesAsync();
        }

        var client   = factory.CreateClient();
        var response = await client.GetAsync("/api/feelings?limit=5");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<List<FeelingResponse>>();
        body.Should().NotBeNull();
        body!.Count.Should().BeLessThanOrEqualTo(5);
    }

    [Fact]
    public async Task Delete_RemovesEntry()
    {
        var factory = BuildFactory(Guid.NewGuid().ToString());
        await SeedUsersAsync(factory);
        var client = factory.CreateClient();

        // Create a feeling
        var payload       = new { userID = 1, feeling = "Excited", subject = "Weekend", context = "" };
        var createResponse = await client.PostAsJsonAsync("/api/feelings", payload);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResponse.Content.ReadFromJsonAsync<FeelingResponse>();
        created.Should().NotBeNull();

        // Delete it
        var deleteResponse = await client.DeleteAsync($"/api/feelings/{created!.FeelingID}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Confirm it is gone
        var getResponse = await client.GetAsync($"/api/feelings/{created.FeelingID}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
