using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CouplesWebsite.Api.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequireAdminSessionAttribute : Attribute, IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var passwordService = context.HttpContext.RequestServices
            .GetRequiredService<IPasswordService>();

        var token = context.HttpContext.Request.Cookies["admin_token"];

        if (string.IsNullOrEmpty(token) || !passwordService.ValidateJwt(token, "admin"))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Admin session required" });
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No post-execution work needed.
    }
}
