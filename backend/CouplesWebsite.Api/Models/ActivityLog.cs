namespace CouplesWebsite.Api.Models;

public class ActivityLog
{
    public int LogID { get; set; }
    public string IPAddress { get; set; } = string.Empty;
    public string PageVisited { get; set; } = string.Empty;
    public string? Action { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
