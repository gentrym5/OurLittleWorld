using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/answers")]
public class AnswersController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnswersController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/answers?questionId={id}
    // When questionId is omitted (or 0), all answers are returned.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnswerResponse>>> GetByQuestion(
        [FromQuery] int questionId = 0,
        CancellationToken ct = default)
    {
        var query = _db.Answers.AsNoTracking();

        if (questionId != 0)
            query = query.Where(a => a.QuestionID == questionId);

        var answers = await query
            .OrderBy(a => a.Timestamp)
            .Select(a => new AnswerResponse(a.AnswerID, a.QuestionID, a.UserID, a.Text, a.Timestamp))
            .ToListAsync(ct);

        return Ok(answers);
    }

    // GET /api/answers/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AnswerResponse>> GetById(int id, CancellationToken ct)
    {
        var answer = await _db.Answers
            .AsNoTracking()
            .Where(a => a.AnswerID == id)
            .Select(a => new AnswerResponse(a.AnswerID, a.QuestionID, a.UserID, a.Text, a.Timestamp))
            .FirstOrDefaultAsync(ct);

        return answer is null ? NotFound() : Ok(answer);
    }

    // POST /api/answers
    [HttpPost]
    public async Task<ActionResult<AnswerResponse>> Create(
        [FromBody] AnswerRequest request,
        CancellationToken ct)
    {
        var answer = new Answer
        {
            QuestionID = request.QuestionID,
            UserID = request.UserID,
            Text = request.Text,
            Timestamp = DateTime.UtcNow
        };

        _db.Answers.Add(answer);
        await _db.SaveChangesAsync(ct);

        var response = new AnswerResponse(
            answer.AnswerID,
            answer.QuestionID,
            answer.UserID,
            answer.Text,
            answer.Timestamp);

        return CreatedAtAction(nameof(GetById), new { id = answer.AnswerID }, response);
    }

    // PUT /api/answers/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<AnswerResponse>> Update(
        int id,
        [FromBody] AnswerRequest request,
        CancellationToken ct)
    {
        var answer = await _db.Answers.FindAsync([id], ct);
        if (answer is null)
            return NotFound();

        answer.Text = request.Text;

        await _db.SaveChangesAsync(ct);

        return Ok(new AnswerResponse(
            answer.AnswerID,
            answer.QuestionID,
            answer.UserID,
            answer.Text,
            answer.Timestamp));
    }

    // DELETE /api/answers/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var answer = await _db.Answers.FindAsync([id], ct);
        if (answer is null)
            return NotFound();

        _db.Answers.Remove(answer);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
