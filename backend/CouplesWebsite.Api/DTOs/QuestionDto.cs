namespace CouplesWebsite.Api.DTOs;

public record QuestionRequest(string Text, bool IsPredefined);

public record QuestionResponse(int QuestionID, string Text, bool IsPredefined);
