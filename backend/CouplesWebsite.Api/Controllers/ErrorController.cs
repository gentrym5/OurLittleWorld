using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CouplesWebsite.Api.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class ErrorController : ControllerBase
{
    private readonly ILogger<ErrorController> _logger;

    public ErrorController(ILogger<ErrorController> logger)
    {
        _logger = logger;
    }

    // GET /api/error  — invoked by app.UseExceptionHandler("/api/error")
    [Route("/api/error")]
    public IActionResult HandleError()
    {
        var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionFeature?.Error;

        if (exception != null)
        {
            _logger.LogError(exception, "Unhandled exception caught by error handler.");
        }

        // Return RFC 7807 ProblemDetails.
        return Problem(
            title: "An unexpected error occurred.",
            detail: exception?.Message,
            statusCode: StatusCodes.Status500InternalServerError
        );
    }
}
