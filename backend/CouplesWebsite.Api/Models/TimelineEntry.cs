namespace CouplesWebsite.Api.Models;

public class TimelineEntry
{
    public int EntryID { get; set; }
    public int UserID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
