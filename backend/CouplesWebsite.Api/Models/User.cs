namespace CouplesWebsite.Api.Models;

public class User
{
    public int UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Answer> Answers { get; set; } = [];
    public ICollection<Feeling> Feelings { get; set; } = [];
    public ICollection<Photo> Photos { get; set; } = [];
    public ICollection<TimelineEntry> TimelineEntries { get; set; } = [];
}
