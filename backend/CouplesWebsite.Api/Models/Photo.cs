namespace CouplesWebsite.Api.Models;

public class Photo
{
    public int PhotoID { get; set; }
    public int UserID { get; set; }
    public string ImageURL { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public bool IsSecure { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
