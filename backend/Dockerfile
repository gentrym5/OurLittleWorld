# =============================================================
# Couple's Website API — Multi-Stage Dockerfile
# Build stage: compiles the .NET 8 application
# Runtime stage: minimal ASP.NET Core 8 runtime image
# =============================================================

# -----------------------------------------------
# Stage 1 — Build
# -----------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching.
# NuGet restore only re-runs when these files change.
COPY CouplesWebsite.Api.sln ./
COPY CouplesWebsite.Api/CouplesWebsite.Api.csproj CouplesWebsite.Api/
COPY CouplesWebsite.Tests/CouplesWebsite.Tests.csproj CouplesWebsite.Tests/

# Restore NuGet packages
RUN dotnet restore CouplesWebsite.Api.sln

# Copy the rest of the source code
COPY . .

# Publish the API project in Release configuration
RUN dotnet publish CouplesWebsite.Api/CouplesWebsite.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# -----------------------------------------------
# Stage 2 — Runtime
# -----------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Set ownership to the non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port 8080 (Railway expects the app to listen on this port)
EXPOSE 8080

# Tell ASP.NET Core to listen on port 8080
ENV ASPNETCORE_URLS=http://+:8080

# Production environment — ASPNETCORE_ENVIRONMENT is overridden by Railway env vars
# but default to Production here as a safe fallback
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "CouplesWebsite.Api.dll"]
