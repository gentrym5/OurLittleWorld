using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CouplesWebsite.Api.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequireSecureSessionAttribute : Attribute, IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var passwordService = context.HttpContext.RequestServices
            .GetRequiredService<IPasswordService>();

        var token = context.HttpContext.Request.Cookies["secure_token"];

        if (string.IsNullOrEmpty(token) || !passwordService.ValidateJwt(token, "secure"))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Secure session required" });
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No post-execution work needed.
    }
}
