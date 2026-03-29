namespace CouplesWebsite.Api.DTOs;

public record SecureTokenResponse(string Token, DateTime ExpiresAt);
