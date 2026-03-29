using CouplesWebsite.Api.Models;

namespace CouplesWebsite.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        // Only seed if the database is empty — idempotent on every startup.
        if (context.Users.Any())
            return;

        // ── Users ──────────────────────────────────────────────────────────────
        // No login system — PasswordHash is empty. UserIDs are fixed by insertion order.
        var partner1 = new User { Username = "Partner 1", PasswordHash = string.Empty };
        var partner2 = new User { Username = "Partner 2", PasswordHash = string.Empty };

        context.Users.AddRange(partner1, partner2);
        context.SaveChanges();
        // After SaveChanges, EF populates partner1.UserID = 1 and partner2.UserID = 2
        // (assuming a fresh database with no prior rows).

        // ── Predefined Questions ──────────────────────────────────────────────
        if (!context.Questions.Any())
        {
            var predefinedQuestions = new List<Question>
            {
                new() { Text = "What is your favourite memory of us together?",                         IsPredefined = true },
                new() { Text = "What do you love most about our relationship?",                         IsPredefined = true },
                new() { Text = "What is something you want us to experience together?",                 IsPredefined = true },
                new() { Text = "How have I helped you grow as a person?",                               IsPredefined = true },
                new() { Text = "What song reminds you of us and why?",                                  IsPredefined = true },
                new() { Text = "What was the moment you knew you were falling for me?",                 IsPredefined = true },
                new() { Text = "What is something I do that always makes you smile?",                   IsPredefined = true },
                new() { Text = "What is a place you would love for us to visit together?",              IsPredefined = true },
                new() { Text = "What is something you have learned about yourself through our relationship?", IsPredefined = true },
                new() { Text = "What is your favourite thing we do together as a routine?",             IsPredefined = true },
                new() { Text = "How do you feel most loved by me?",                                     IsPredefined = true },
                new() { Text = "What is a dream you have that you would love for us to share?",         IsPredefined = true },
                new() { Text = "What is something you appreciate about the way we communicate?",        IsPredefined = true },
                new() { Text = "What does a perfect day with me look like to you?",                     IsPredefined = true },
                new() { Text = "What is something small I do that means a lot to you?",                 IsPredefined = true },
                new() { Text = "What is something you would like us to work on together as a couple?",  IsPredefined = true },
                new() { Text = "What has been the hardest moment in our relationship, and what did it teach you?", IsPredefined = true },
                new() { Text = "What is a movie, book, or show that reminds you of our relationship and why?", IsPredefined = true },
                new() { Text = "What is the thing you are most proud of about us?",                     IsPredefined = true },
                new() { Text = "If you could relive one moment from our relationship, what would it be?", IsPredefined = true },
                new() { Text = "What makes you feel closest to me?",                                    IsPredefined = true },
                new() { Text = "What is something you wish more people knew about our relationship?",   IsPredefined = true },
            };

            context.Questions.AddRange(predefinedQuestions);
            context.SaveChanges();
        }
    }
}
