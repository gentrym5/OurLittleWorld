namespace CouplesWebsite.Api.Models;

public class Feeling
{
    public int FeelingID { get; set; }
    public int UserID { get; set; }
    public string FeelingWord { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
