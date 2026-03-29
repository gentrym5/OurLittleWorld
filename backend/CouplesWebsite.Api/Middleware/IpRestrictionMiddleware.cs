namespace CouplesWebsite.Api.Middleware;

public class IpRestrictionMiddleware : IMiddleware
{
    private readonly HashSet<string> _allowedIps;
    private readonly bool _restrictionEnabled;

    public IpRestrictionMiddleware(IConfiguration configuration)
    {
        var raw = configuration["ALLOWED_IPS"];

        if (string.IsNullOrWhiteSpace(raw))
        {
            // ALLOWED_IPS is unset — run in development / bypass mode.
            _restrictionEnabled = false;
            _allowedIps = [];
        }
        else
        {
            _restrictionEnabled = true;
            _allowedIps = raw
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        // Always allow the health check endpoint through.
        var path = context.Request.Path.Value ?? string.Empty;
        if (path.Equals("/health", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        if (_restrictionEnabled)
        {
            var remoteIp = context.Connection.RemoteIpAddress?.ToString();

            if (string.IsNullOrEmpty(remoteIp) || !_allowedIps.Contains(remoteIp))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"Access denied\"}");
                return;
            }
        }

        await next(context);
    }
}
