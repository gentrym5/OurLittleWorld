namespace CouplesWebsite.Api.DTOs;

public record FeelingRequest(int UserID, string Feeling, string? Subject, string? Context);

public record FeelingResponse(int FeelingID, int UserID, string Feeling, string Subject, string Context, DateTime Timestamp);
