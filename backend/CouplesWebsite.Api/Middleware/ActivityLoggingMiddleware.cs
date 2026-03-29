using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Middleware;

public class ActivityLoggingMiddleware : IMiddleware
{
    // Paths to skip — health endpoint, error handler, and static assets.
    private static readonly string[] SkippedPaths =
    [
        "/health",
        "/api/error"
    ];

    private readonly IServiceScopeFactory _scopeFactory;

    public ActivityLoggingMiddleware(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        // Proceed with the pipeline first — do not block on logging.
        await next(context);

        var path = context.Request.Path.Value ?? string.Empty;

        // Skip logging for health check, error handler, and static asset paths.
        var shouldSkip = SkippedPaths.Any(p =>
            path.Equals(p, StringComparison.OrdinalIgnoreCase))
            || path.StartsWith("/_next/", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/static/", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".ico", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".css", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".js", StringComparison.OrdinalIgnoreCase);

        if (shouldSkip)
            return;

        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var action = context.Request.Headers["X-Action"].FirstOrDefault();

        // Fire-and-forget — does NOT block the response pipeline.
        _ = Task.Run(async () =>
        {
            try
            {
                // Use a fresh DI scope for the background work so we have our
                // own DbContext lifetime that is not tied to the request scope.
                await using var scope = _scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var log = new ActivityLog
                {
                    IPAddress = ipAddress,
                    PageVisited = path,
                    Action = string.IsNullOrWhiteSpace(action) ? null : action,
                    Timestamp = DateTime.UtcNow
                };

                db.ActivityLogs.Add(log);
                await db.SaveChangesAsync();
            }
            catch
            {
                // Swallow all exceptions — activity logging must never surface
                // errors to the caller or crash the application.
            }
        });
    }
}
