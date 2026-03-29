using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/feelings")]
public class FeelingsController : ControllerBase
{
    private const int EntryLimit = 500;

    private readonly AppDbContext _db;

    public FeelingsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/feelings?limit=5  — most recent N feelings (default 5)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeelingResponse>>> GetRecent(
        [FromQuery] int limit = 5,
        CancellationToken ct = default)
    {
        if (limit < 1) limit = 5;
        if (limit > 100) limit = 100;

        var feelings = await _db.Feelings
            .AsNoTracking()
            .OrderByDescending(f => f.Timestamp)
            .Take(limit)
            .Select(f => new FeelingResponse(
                f.FeelingID,
                f.UserID,
                f.FeelingWord,
                f.Subject,
                f.Context,
                f.Timestamp))
            .ToListAsync(ct);

        return Ok(feelings);
    }

    // GET /api/feelings/all?page=1&pageSize=20
    [HttpGet("all")]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var totalCount = await _db.Feelings.CountAsync(ct);
        var feelings = await _db.Feelings
            .AsNoTracking()
            .OrderByDescending(f => f.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FeelingResponse(
                f.FeelingID,
                f.UserID,
                f.FeelingWord,
                f.Subject,
                f.Context,
                f.Timestamp))
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            totalPages,
            hasMore = page < totalPages,
            items = feelings
        });
    }

    // GET /api/feelings/count
    [HttpGet("count")]
    public async Task<ActionResult<object>> GetCount(CancellationToken ct)
    {
        var count = await _db.Feelings.CountAsync(ct);
        return Ok(new { Count = count, Limit = EntryLimit, LimitReached = count >= EntryLimit });
    }

    // GET /api/feelings/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<FeelingResponse>> GetById(int id, CancellationToken ct)
    {
        var feeling = await _db.Feelings
            .AsNoTracking()
            .Where(f => f.FeelingID == id)
            .Select(f => new FeelingResponse(
                f.FeelingID,
                f.UserID,
                f.FeelingWord,
                f.Subject,
                f.Context,
                f.Timestamp))
            .FirstOrDefaultAsync(ct);

        return feeling is null ? NotFound() : Ok(feeling);
    }

    // POST /api/feelings  — enforces 500-entry limit
    [HttpPost]
    public async Task<ActionResult<FeelingResponse>> Create(
        [FromBody] FeelingRequest request,
        CancellationToken ct)
    {
        var currentCount = await _db.Feelings.CountAsync(ct);
        if (currentCount >= EntryLimit)
        {
            return UnprocessableEntity(new
            {
                message = $"The feelings journal has reached the maximum of {EntryLimit} entries. " +
                          "Please ask the admin to remove old entries before adding new ones."
            });
        }

        var feeling = new Feeling
        {
            UserID = request.UserID,
            FeelingWord = request.Feeling,
            Subject = request.Subject ?? string.Empty,
            Context = request.Context ?? string.Empty,
            Timestamp = DateTime.UtcNow
        };

        _db.Feelings.Add(feeling);
        await _db.SaveChangesAsync(ct);

        var response = new FeelingResponse(
            feeling.FeelingID,
            feeling.UserID,
            feeling.FeelingWord,
            feeling.Subject,
            feeling.Context,
            feeling.Timestamp);

        return CreatedAtAction(nameof(GetById), new { id = feeling.FeelingID }, response);
    }

    // DELETE /api/feelings/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var feeling = await _db.Feelings.FindAsync([id], ct);
        if (feeling is null)
            return NotFound();

        _db.Feelings.Remove(feeling);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
