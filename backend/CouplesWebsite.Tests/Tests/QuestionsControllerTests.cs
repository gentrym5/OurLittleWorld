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
using Moq;
using Xunit;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// Integration tests for QuestionsController using an in-memory database
/// and a mocked ICacheService to eliminate MemoryCache side-effects.
/// </summary>
public class QuestionsControllerTests
{
    // ── Factory helper ────────────────────────────────────────────────────────

    private static WebApplicationFactory<Program> BuildFactory()
    {
        var dbName = Guid.NewGuid().ToString();

        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // Inject known values for JWT and password hashes so the app can start
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

                    // Replace real cache with a no-op mock so cache state does not leak between tests
                    var cacheDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(ICacheService));
                    if (cacheDescriptor is not null) services.Remove(cacheDescriptor);

                    // Use a simple no-op implementation rather than Moq for generic interface methods
                    services.AddSingleton<ICacheService, NoOpCacheService>();
                });
            });
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_ReturnsOkWithQuestionList()
    {
        var factory = BuildFactory();
        var client  = factory.CreateClient();

        // Create a question first so the list is non-empty
        var payload = new { text = "What is your favourite memory?", isPredefined = false };
        await client.PostAsJsonAsync("/api/questions", payload);

        var response = await client.GetAsync("/api/questions");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<List<QuestionResponse>>();
        body.Should().NotBeNull();
        body!.Count.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Create_ReturnsCreatedWithNewQuestion()
    {
        var factory = BuildFactory();
        var client  = factory.CreateClient();

        var payload  = new { text = "What song reminds you of us?", isPredefined = false };
        var response = await client.PostAsJsonAsync("/api/questions", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>();
        body.Should().NotBeNull();
        body!.Text.Should().Be("What song reminds you of us?");
        body.QuestionID.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Delete_WithoutAdminCookie_ReturnsUnauthorized()
    {
        var factory = BuildFactory();
        var client  = factory.CreateClient();

        // Attempt to delete question 1 without providing an admin session cookie
        var response = await client.DeleteAsync("/api/questions/1");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetById_NonExistentId_ReturnsNotFound()
    {
        var factory = BuildFactory();
        var client  = factory.CreateClient();

        var response = await client.GetAsync("/api/questions/99999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
