using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/timeline")]
public class TimelineController : ControllerBase
{
    private readonly AppDbContext _db;

    public TimelineController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/timeline?cursor={timestamp}&direction=before|after&limit=10
    // Cursor-based pagination (RISK-05 recommendation — not median-timestamp).
    [HttpGet]
    public async Task<ActionResult<object>> GetPage(
        [FromQuery] DateTime? cursor,
        [FromQuery] string direction = "before",
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        if (limit < 1 || limit > 100) limit = 10;

        IQueryable<TimelineEntry> query = _db.TimelineEntries.AsNoTracking();

        if (cursor.HasValue)
        {
            var cursorUtc = DateTime.SpecifyKind(cursor.Value, DateTimeKind.Utc);
            query = direction == "after"
                ? query.Where(t => t.Timestamp > cursorUtc)
                : query.Where(t => t.Timestamp < cursorUtc);
        }

        var entries = direction == "after"
            ? await query.OrderBy(t => t.Timestamp).Take(limit)
                .Select(t => new TimelineEntryResponse(t.EntryID, t.UserID, t.Title, t.Content, t.Timestamp))
                .ToListAsync(ct)
            : await query.OrderByDescending(t => t.Timestamp).Take(limit)
                .Select(t => new TimelineEntryResponse(t.EntryID, t.UserID, t.Title, t.Content, t.Timestamp))
                .ToListAsync(ct);

        // Always return in ascending order so frontend can render chronologically.
        entries = entries.OrderBy(e => e.Timestamp).ToList();

        var hasMore = entries.Count == limit;

        return Ok(new
        {
            Items = entries,
            HasMore = hasMore,
            NextCursor = entries.Count > 0 ? entries[^1].Timestamp.ToString("O") : null
        });
    }

    // GET /api/timeline/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TimelineEntryResponse>> GetById(int id, CancellationToken ct)
    {
        var entry = await _db.TimelineEntries
            .AsNoTracking()
            .Where(t => t.EntryID == id)
            .Select(t => new TimelineEntryResponse(t.EntryID, t.UserID, t.Title, t.Content, t.Timestamp))
            .FirstOrDefaultAsync(ct);

        return entry is null ? NotFound() : Ok(entry);
    }

    // POST /api/timeline
    [HttpPost]
    public async Task<ActionResult<TimelineEntryResponse>> Create(
        [FromBody] TimelineEntryRequest request,
        CancellationToken ct)
    {
        var entry = new TimelineEntry
        {
            UserID = request.UserID,
            Title = request.Title,
            Content = request.Content ?? string.Empty,
            Timestamp = request.Timestamp == default ? DateTime.UtcNow : DateTime.SpecifyKind(request.Timestamp, DateTimeKind.Utc)
        };

        _db.TimelineEntries.Add(entry);
        await _db.SaveChangesAsync(ct);

        var response = new TimelineEntryResponse(
            entry.EntryID,
            entry.UserID,
            entry.Title,
            entry.Content,
            entry.Timestamp);

        return CreatedAtAction(nameof(GetById), new { id = entry.EntryID }, response);
    }

    // PUT /api/timeline/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TimelineEntryResponse>> Update(
        int id,
        [FromBody] TimelineEntryRequest request,
        CancellationToken ct)
    {
        var entry = await _db.TimelineEntries.FindAsync([id], ct);
        if (entry is null)
            return NotFound();

        entry.Title = request.Title;
        entry.Content = request.Content ?? string.Empty;

        if (request.Timestamp != default)
            entry.Timestamp = DateTime.SpecifyKind(request.Timestamp, DateTimeKind.Utc);

        await _db.SaveChangesAsync(ct);

        return Ok(new TimelineEntryResponse(
            entry.EntryID,
            entry.UserID,
            entry.Title,
            entry.Content,
            entry.Timestamp));
    }

    // DELETE /api/timeline/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entry = await _db.TimelineEntries.FindAsync([id], ct);
        if (entry is null)
            return NotFound();

        _db.TimelineEntries.Remove(entry);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
