using System.Text;
using CouplesWebsite.Api.Data;
using CouplesWebsite.Api.Middleware;
using CouplesWebsite.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────────────
// Accepts either:
//   ConnectionStrings__DefaultConnection  (Npgsql key=value format, local dev / manual Railway)
//   DATABASE_URL                          (PostgreSQL URI — injected automatically by Railway plugin)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration["DATABASE_PRIVATE_URL"]
    ?? builder.Configuration["DATABASE_PUBLIC_URL"];

// Last resort: build from individual PG* variables (also provided by Railway)
if (string.IsNullOrEmpty(connectionString))
{
    var pgHost     = builder.Configuration["PGHOST"];
    var pgPort     = builder.Configuration["PGPORT"] ?? "5432";
    var pgDb       = builder.Configuration["PGDATABASE"];
    var pgUser     = builder.Configuration["PGUSER"];
    var pgPassword = builder.Configuration["PGPASSWORD"];

    if (!string.IsNullOrEmpty(pgHost) && !string.IsNullOrEmpty(pgDb))
        connectionString =
            $"Host={pgHost};Port={pgPort};Database={pgDb};" +
            $"Username={pgUser};Password={pgPassword};" +
            "SSL Mode=Require;Trust Server Certificate=true";
}

if (string.IsNullOrEmpty(connectionString))
    throw new InvalidOperationException(
        "No database connection string found. In Railway, reference the Postgres plugin's " +
        "DATABASE_URL into your backend service's variables.");

// Railway supplies DATABASE_URL as a URI (postgresql://user:pass@host:port/db).
// Npgsql expects key=value format, so convert when needed.
if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    var port = uri.Port > 0 ? uri.Port : 5432;
    connectionString =
        $"Host={uri.Host};Port={port};" +
        $"Database={uri.AbsolutePath.TrimStart('/')};" +
        $"Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])};" +
        "SSL Mode=Require;Trust Server Certificate=true";
}

// Log the host we're connecting to (never log credentials)
var logHost = "unknown";
try
{
    var hostMatch = System.Text.RegularExpressions.Regex.Match(connectionString, @"Host=([^;]+)");
    if (hostMatch.Success) logHost = hostMatch.Groups[1].Value;
}
catch { /* ignore */ }
Console.WriteLine($"[DB] Connecting to host: {logHost}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ── Controllers ─────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

// ── Memory Cache ─────────────────────────────────────────────────────────────
builder.Services.AddMemoryCache();

// ── Application Services ─────────────────────────────────────────────────────
builder.Services.AddSingleton<IPhotoStorageService, CloudinaryPhotoStorageService>();
builder.Services.AddSingleton<IPasswordService, PasswordService>();
builder.Services.AddSingleton<ICacheService, InMemoryCacheService>();

// ── Custom Middleware ─────────────────────────────────────────────────────────
// IpRestrictionMiddleware is Singleton — reads ALLOWED_IPS once at startup.
builder.Services.AddSingleton<IpRestrictionMiddleware>();
// ActivityLoggingMiddleware is Scoped — uses IServiceScopeFactory internally.
builder.Services.AddScoped<ActivityLoggingMiddleware>();

// ── CORS ──────────────────────────────────────────────────────────────────────
var corsOrigin = builder.Configuration["CORS_ORIGIN"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(corsOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Required for HTTP-only cookie JWT exchange.
    });
});

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSecretKey = builder.Configuration["Jwt__SecretKey"]
    ?? builder.Configuration["Jwt:SecretKey"]
    ?? string.Empty;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        // Allow JWT from cookie in addition to the Authorization header.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieToken = context.Request.Cookies["secure_token"]
                    ?? context.Request.Cookies["admin_token"];
                if (!string.IsNullOrEmpty(cookieToken))
                    context.Token = cookieToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ── Database migration + seed on startup ────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Use EnsureCreated for non-relational providers (e.g. InMemory in tests).
    // Use Migrate for real relational providers (PostgreSQL in production/dev).
    if (db.Database.IsRelational())
    {
        // Guard against a corrupted state where __EFMigrationsHistory was recorded by a
        // previous deploy (e.g. through a pgBouncer pooler that dropped DDL mid-flight)
        // but the actual application tables were never created.
        // If Users doesn't exist, wipe the history so Migrate() re-applies everything.
        try
        {
            db.Database.ExecuteSqlRaw("""
                DELETE FROM "__EFMigrationsHistory"
                WHERE NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'Users'
                )
                """);
        }
        catch { /* __EFMigrationsHistory doesn't exist yet — first-ever deploy, fine */ }

        db.Database.Migrate();
    }
    else
    {
        db.Database.EnsureCreated();
    }
    SeedData.Initialize(db);
}

// ── Exception handler ─────────────────────────────────────────────────────────
app.UseExceptionHandler("/api/error");

// ── HSTS (production only) ────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// ── HTTPS redirect ────────────────────────────────────────────────────────────
app.UseHttpsRedirection();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.UseCors();

// ── IP Restriction — runs before auth so blocked IPs never reach the stack ───
app.UseMiddleware<IpRestrictionMiddleware>();

// ── Auth middleware ───────────────────────────────────────────────────────────
app.UseAuthentication();
app.UseAuthorization();

// ── Activity Logging — after routing so path is resolved, before controllers ─
app.UseMiddleware<ActivityLoggingMiddleware>();

// ── Health check ──────────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// ── Controllers ───────────────────────────────────────────────────────────────
app.MapControllers();

app.Run();

// Expose Program as a public partial class so WebApplicationFactory<Program> can
// reference it from the CouplesWebsite.Tests assembly.
public partial class Program { }
