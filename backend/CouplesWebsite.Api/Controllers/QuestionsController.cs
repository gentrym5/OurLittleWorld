using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Filters;
using CouplesWebsite.Api.Models;
using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private const string CacheKey = "questions_list";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    private readonly AppDbContext _db;
    private readonly ICacheService _cache;

    public QuestionsController(AppDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    // GET /api/questions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionResponse>>> GetAll(CancellationToken ct)
    {
        var cached = _cache.Get<List<QuestionResponse>>(CacheKey);
        if (cached != null)
            return Ok(cached);

        var questions = await _db.Questions
            .AsNoTracking()
            .OrderBy(q => q.QuestionID)
            .Select(q => new QuestionResponse(q.QuestionID, q.Text, q.IsPredefined))
            .ToListAsync(ct);

        _cache.Set(CacheKey, questions, CacheTtl);
        return Ok(questions);
    }

    // GET /api/questions/random
    [HttpGet("random")]
    public async Task<ActionResult<QuestionResponse>> GetRandom(CancellationToken ct)
    {
        var count = await _db.Questions.CountAsync(ct);
        if (count == 0)
            return NotFound(new { message = "No questions available." });

        var skip = Random.Shared.Next(0, count);
        var question = await _db.Questions
            .AsNoTracking()
            .OrderBy(q => q.QuestionID)
            .Skip(skip)
            .Select(q => new QuestionResponse(q.QuestionID, q.Text, q.IsPredefined))
            .FirstOrDefaultAsync(ct);

        return question is null ? NotFound() : Ok(question);
    }

    // GET /api/questions/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuestionResponse>> GetById(int id, CancellationToken ct)
    {
        var question = await _db.Questions
            .AsNoTracking()
            .Where(q => q.QuestionID == id)
            .Select(q => new QuestionResponse(q.QuestionID, q.Text, q.IsPredefined))
            .FirstOrDefaultAsync(ct);

        return question is null ? NotFound() : Ok(question);
    }

    // POST /api/questions
    [HttpPost]
    public async Task<ActionResult<QuestionResponse>> Create(
        [FromBody] QuestionRequest request,
        CancellationToken ct)
    {
        var question = new Question
        {
            Text = request.Text,
            IsPredefined = request.IsPredefined
        };

        _db.Questions.Add(question);
        await _db.SaveChangesAsync(ct);
        _cache.Remove(CacheKey);

        var response = new QuestionResponse(question.QuestionID, question.Text, question.IsPredefined);
        return CreatedAtAction(nameof(GetById), new { id = question.QuestionID }, response);
    }

    // PUT /api/questions/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuestionResponse>> Update(
        int id,
        [FromBody] QuestionRequest request,
        CancellationToken ct)
    {
        var question = await _db.Questions.FindAsync([id], ct);
        if (question is null)
            return NotFound();

        question.Text = request.Text;
        question.IsPredefined = request.IsPredefined;

        await _db.SaveChangesAsync(ct);
        _cache.Remove(CacheKey);

        return Ok(new QuestionResponse(question.QuestionID, question.Text, question.IsPredefined));
    }

    // DELETE /api/questions/{id}  — admin only
    [HttpDelete("{id:int}")]
    [RequireAdminSession]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var question = await _db.Questions.FindAsync([id], ct);
        if (question is null)
            return NotFound();

        _db.Questions.Remove(question);
        await _db.SaveChangesAsync(ct);
        _cache.Remove(CacheKey);

        return NoContent();
    }
}
