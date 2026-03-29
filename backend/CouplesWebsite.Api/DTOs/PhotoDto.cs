namespace CouplesWebsite.Api.DTOs;

// Upload handled via multipart form data — no PhotoRequest DTO needed.
public record PhotoResponse(int PhotoID, int UserID, string ImageURL, bool IsSecure, DateTime Timestamp);
