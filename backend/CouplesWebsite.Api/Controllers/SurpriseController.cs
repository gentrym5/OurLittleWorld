using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/surprise")]
public class SurpriseController : ControllerBase
{
    // Hardcoded feeling words — same source as SampleFeelingsList.md.
    // This list is used for the random feeling word in Surprise, not the DB.
    private static readonly string[] FeelingWords =
    [
        "Affectionate", "Agitated", "Alive", "Amused", "Angry", "Anxious", "Apathetic", "Awe",
        "Blissful", "Bored", "Brave", "Broken",
        "Calm", "Confident", "Confused", "Content", "Cranky", "Creative", "Curious",
        "Delighted", "Depressed", "Determined", "Disappointed", "Distracted", "Dread",
        "Eager", "Ecstatic", "Embarrassed", "Empty", "Energetic", "Enthusiastic", "Envious",
        "Euphoric", "Exhausted", "Excited",
        "Frustrated", "Fulfilled", "Furious",
        "Grateful", "Grief", "Guilty",
        "Happy", "Hopeful", "Humble", "Hurt",
        "Ignored", "Impatient", "Inspired", "Irritable", "Isolated",
        "Jealous", "Jubilant", "Joyful",
        "Lonely", "Loved", "Loyal",
        "Melancholy", "Miserable", "Motivated",
        "Nervous", "Nostalgic", "Numb",
        "Optimistic", "Overwhelmed",
        "Peaceful", "Pensive", "Playful", "Proud",
        "Rejected", "Relaxed", "Relieved", "Remorseful", "Restless",
        "Sad", "Safe", "Satisfied", "Scared", "Serene", "Shocked", "Shy", "Sleepy", "Sympathetic",
        "Tender", "Tense", "Thankful", "Thoughtful", "Tired", "Touched", "Troubled",
        "Uncomfortable", "Uncertain", "Understood", "Uneasy",
        "Validated", "Vulnerable",
        "Warm", "Wistful", "Worried", "Worthless", "Wounded"
    ];

    private readonly AppDbContext _db;

    public SurpriseController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/surprise  — randomly pick from: question, feeling word, or timeline entry
    [HttpGet]
    public async Task<ActionResult<SurpriseDto>> GetSurprise(CancellationToken ct)
    {
        // Determine which types have data available.
        var questionCount = await _db.Questions.CountAsync(ct);
        var timelineCount = await _db.TimelineEntries.CountAsync(ct);

        // Always include feelings (hardcoded list always available).
        var availableTypes = new List<string> { "feeling" };
        if (questionCount > 0) availableTypes.Add("question");
        if (timelineCount > 0) availableTypes.Add("memory");

        var chosenType = availableTypes[Random.Shared.Next(availableTypes.Count)];

        return chosenType switch
        {
            "question" => await GetRandomQuestion(questionCount, ct),
            "memory" => await GetRandomMemory(timelineCount, ct),
            _ => GetRandomFeeling()
        };
    }

    private async Task<ActionResult<SurpriseDto>> GetRandomQuestion(int count, CancellationToken ct)
    {
        var skip = Random.Shared.Next(0, count);
        var question = await _db.Questions
            .AsNoTracking()
            .OrderBy(q => q.QuestionID)
            .Skip(skip)
            .Select(q => new { q.QuestionID, q.Text })
            .FirstOrDefaultAsync(ct);

        if (question is null)
            return GetRandomFeeling();

        return Ok(new SurpriseDto("question", new { question.QuestionID, question.Text }));
    }

    private async Task<ActionResult<SurpriseDto>> GetRandomMemory(int count, CancellationToken ct)
    {
        var skip = Random.Shared.Next(0, count);
        var entry = await _db.TimelineEntries
            .AsNoTracking()
            .OrderBy(t => t.EntryID)
            .Skip(skip)
            .Select(t => new { t.EntryID, t.Title, t.Content, t.Timestamp })
            .FirstOrDefaultAsync(ct);

        if (entry is null)
            return GetRandomFeeling();

        return Ok(new SurpriseDto("memory", new
        {
            entry.EntryID,
            entry.Title,
            entry.Content,
            entry.Timestamp
        }));
    }

    private ActionResult<SurpriseDto> GetRandomFeeling()
    {
        var word = FeelingWords[Random.Shared.Next(FeelingWords.Length)];
        return Ok(new SurpriseDto("feeling", new { Word = word }));
    }
}
