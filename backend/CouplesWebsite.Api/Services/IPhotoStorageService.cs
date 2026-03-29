namespace CouplesWebsite.Api.Services;

public interface IPhotoStorageService
{
    Task<(string Url, string PublicId)> UploadAsync(IFormFile file, bool isSecure);
    Task DeleteAsync(string publicId);
    string GetSignedUrl(string publicId);
}
