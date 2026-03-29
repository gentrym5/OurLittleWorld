using CouplesWebsite.Api.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// Unit tests that verify SeedData produces the correct initial data set
/// without going through HTTP or any external service.
/// </summary>
public class SeedDataTests
{
    private static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void Seed_CreatesExactlyTwoUsers()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);

        var users = context.Users.ToList();
        users.Should().HaveCount(2);
    }

    [Fact]
    public void Seed_CreatesTwoPartnerUsers()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);

        var usernames = context.Users
            .Select(u => u.Username)
            .OrderBy(u => u)
            .ToList();

        usernames.Should().BeEquivalentTo(["Partner 1", "Partner 2"]);
    }

    [Fact]
    public void Seed_UsersHaveEmptyPasswordHash()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);

        var users = context.Users.ToList();
        foreach (var user in users)
        {
            user.PasswordHash.Should().BeEmpty(
                because: "there is no login system — PasswordHash is always empty");
        }
    }

    [Fact]
    public void Seed_CreatesAtLeast20PredefinedQuestions()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);

        var predefinedCount = context.Questions.Count(q => q.IsPredefined);
        predefinedCount.Should().BeGreaterThanOrEqualTo(20);
    }

    [Fact]
    public void Seed_AllSeededQuestionsArePredefined()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);

        // In a fresh DB, every seeded question has IsPredefined = true
        var questions = context.Questions.ToList();
        questions.Should().OnlyContain(q => q.IsPredefined);
    }

    [Fact]
    public void Seed_IsIdempotent_SecondCallDoesNotDuplicate()
    {
        using var context = CreateInMemoryContext();
        SeedData.Initialize(context);
        var countAfterFirst = context.Users.Count();

        // Call again — should not re-seed
        SeedData.Initialize(context);
        var countAfterSecond = context.Users.Count();

        countAfterSecond.Should().Be(countAfterFirst);
    }
}
