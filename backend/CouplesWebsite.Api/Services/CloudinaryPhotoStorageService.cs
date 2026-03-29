using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace CouplesWebsite.Api.Services;

public class CloudinaryPhotoStorageService : IPhotoStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryPhotoStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"]
            ?? throw new InvalidOperationException("Cloudinary:CloudName is not configured.");
        var apiKey = configuration["Cloudinary:ApiKey"]
            ?? throw new InvalidOperationException("Cloudinary:ApiKey is not configured.");
        var apiSecret = configuration["Cloudinary:ApiSecret"]
            ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured.");

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<(string Url, string PublicId)> UploadAsync(IFormFile file, bool isSecure)
    {
        await using var stream = file.OpenReadStream();

        var folder = isSecure ? "couples-website/private" : "couples-website/public";

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            Type = isSecure ? "authenticated" : "upload",
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");
        }

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteAsync(string publicId)
    {
        var deletionParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deletionParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException($"Cloudinary delete failed: {result.Error.Message}");
        }
    }

    public string GetSignedUrl(string publicId)
    {
        // Generate a signed delivery URL for authenticated (secure) photos, valid for 1 hour.
        // Uses Cloudinary's signature-based URL to restrict access.
        var expiresAt = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds();

        var authToken = new AuthToken()
            .Expiration(expiresAt);

        return _cloudinary.Api.UrlImgUp
            .Type("authenticated")
            .Signed(true)
            .AuthToken(authToken)
            .BuildUrl(publicId);
    }
}
