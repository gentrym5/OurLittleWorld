using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.DTOs;
using CouplesWebsite.Api.Filters;
using CouplesWebsite.Api.Models;
using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[Route("api/photos")]
public class PhotosController : ControllerBase
{
    private const int PhotoLimit = 500;

    private readonly AppDbContext _db;
    private readonly IPhotoStorageService _photoStorage;

    public PhotosController(AppDbContext db, IPhotoStorageService photoStorage)
    {
        _db = db;
        _photoStorage = photoStorage;
    }

    // GET /api/photos  — non-secure photos only
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhotoResponse>>> GetPublic(CancellationToken ct)
    {
        var photos = await _db.Photos
            .AsNoTracking()
            .Where(p => !p.IsSecure)
            .OrderByDescending(p => p.Timestamp)
            .Select(p => new PhotoResponse(p.PhotoID, p.UserID, p.ImageURL, p.IsSecure, p.Timestamp))
            .ToListAsync(ct);

        return Ok(photos);
    }

    // GET /api/photos/secure  — secure photos; requires valid "secure" JWT cookie
    [HttpGet("secure")]
    [RequireSecureSession]
    public async Task<ActionResult<IEnumerable<PhotoResponse>>> GetSecure(CancellationToken ct)
    {
        var photos = await _db.Photos
            .AsNoTracking()
            .Where(p => p.IsSecure)
            .OrderByDescending(p => p.Timestamp)
            .ToListAsync(ct);

        // Return signed Cloudinary URLs for each secure photo.
        var responses = photos.Select(p => new PhotoResponse(
            p.PhotoID,
            p.UserID,
            _photoStorage.GetSignedUrl(p.PublicId),
            p.IsSecure,
            p.Timestamp));

        return Ok(responses);
    }

    // POST /api/photos/upload  — multipart form upload
    [HttpPost("upload")]
    public async Task<ActionResult<PhotoResponse>> Upload(
        IFormFile file,
        [FromForm] int userId,
        [FromForm] bool isSecure = false,
        CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var totalCount = await _db.Photos.CountAsync(ct);
        if (totalCount >= PhotoLimit)
        {
            return UnprocessableEntity(new
            {
                message = $"The photo gallery has reached the maximum of {PhotoLimit} photos. " +
                          "Please delete some photos before uploading new ones."
            });
        }

        var (url, publicId) = await _photoStorage.UploadAsync(file, isSecure);

        var photo = new Photo
        {
            UserID = userId,
            ImageURL = url,
            PublicId = publicId,
            IsSecure = isSecure,
            Timestamp = DateTime.UtcNow
        };

        _db.Photos.Add(photo);
        await _db.SaveChangesAsync(ct);

        var response = new PhotoResponse(photo.PhotoID, photo.UserID, photo.ImageURL, photo.IsSecure, photo.Timestamp);
        return CreatedAtAction(nameof(GetPublic), new { }, response);
    }

    // DELETE /api/photos/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var photo = await _db.Photos.FindAsync([id], ct);
        if (photo is null)
            return NotFound();

        // Delete from Cloudinary first, then remove from DB.
        await _photoStorage.DeleteAsync(photo.PublicId);

        _db.Photos.Remove(photo);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    // PATCH /api/photos/{id}/toggle-secure
    [HttpPatch("{id:int}/toggle-secure")]
    public async Task<ActionResult<PhotoResponse>> ToggleSecure(int id, CancellationToken ct)
    {
        var photo = await _db.Photos.FindAsync([id], ct);
        if (photo is null)
            return NotFound();

        photo.IsSecure = !photo.IsSecure;
        await _db.SaveChangesAsync(ct);

        return Ok(new PhotoResponse(photo.PhotoID, photo.UserID, photo.ImageURL, photo.IsSecure, photo.Timestamp));
    }
}
