namespace CouplesWebsite.Api.Models;

public class Answer
{
    public int AnswerID { get; set; }
    public int QuestionID { get; set; }
    public int UserID { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Question Question { get; set; } = null!;
    public User User { get; set; } = null!;
}
