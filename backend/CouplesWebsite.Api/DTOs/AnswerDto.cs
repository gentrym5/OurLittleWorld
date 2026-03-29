namespace CouplesWebsite.Api.DTOs;

public record AnswerRequest(int QuestionID, int UserID, string Text);

public record AnswerResponse(int AnswerID, int QuestionID, int UserID, string Text, DateTime Timestamp);
