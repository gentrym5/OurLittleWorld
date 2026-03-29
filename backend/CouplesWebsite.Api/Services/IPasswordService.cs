namespace CouplesWebsite.Api.Services;

public interface IPasswordService
{
    bool VerifySecurePassword(string password);
    bool VerifyAdminPassword(string password);
    string GenerateJwt(string subject, string role);
    bool ValidateJwt(string token, string requiredRole);
}
