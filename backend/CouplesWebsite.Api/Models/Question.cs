namespace CouplesWebsite.Api.Models;

public class Question
{
    public int QuestionID { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsPredefined { get; set; }

    // Navigation properties
    public ICollection<Answer> Answers { get; set; } = [];
}
