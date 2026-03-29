namespace CouplesWebsite.Api.DTOs;

public record TimelineEntryRequest(int UserID, string Title, string Content, DateTime Timestamp);

public record TimelineEntryResponse(int EntryID, int UserID, string Title, string Content, DateTime Timestamp);
