# Couple's Website

A private, two-person web application. It provides a shared digital space for logging feelings, answering personal questions together, uploading and browsing photos, preserving memories on a timeliyne, and accessing a password-protected private section.

---

## Tech Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS | Netlify |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core, C# | Railway |
| Database | PostgreSQL | Railway (PostgreSQL plugin) |
| Photo Storage | Cloudinary | Cloudinary (free tier) |
| CI/CD | GitHub Actions | GitHub |

---

## Monorepo Structure

```
Couple-s-Website/
├── frontend/               Next.js 14 App Router (TypeScript, Tailwind CSS)
├── backend/                ASP.NET Core 8 Web API (C#, EF Core, PostgreSQL)
├── .github/
│   └── workflows/          GitHub Actions CI/CD pipelines
├── analysis.md
├── decisions_log.md
├── PRD.md
├── WIREFRAMES.md
├── DatabaseSchema.md
└── README.md
```

---

## Prerequisites

- **Node.js** 20+ and **npm** 10+
- **.NET SDK** 8.0+
- **PostgreSQL** 15+ (local instance for development)
- **Cloudinary account** (free tier is sufficient)

---

## Local Setup — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy the example env file and fill in values
cp .env.local.example .env.local

# Start the development server
npm run dev
```

The Next.js dev server starts at `http://localhost:3000`.

### Frontend Environment Variables

Edit `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## Local Setup — Backend

```bash
cd backend

# Restore NuGet packages
dotnet restore

# Set up user secrets (development only — never commit secrets)
cd CouplesWebsite.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=couples_db;Username=postgres;Password=yourpassword"
dotnet user-secrets set "SecureSectionPasswordHash" "<bcrypt-hash>"
dotnet user-secrets set "AdminPasswordHash" "<bcrypt-hash>"
dotnet user-secrets set "Jwt:SecretKey" "<your-256-bit-secret>"
dotnet user-secrets set "Cloudinary:CloudName" "<your-cloud-name>"
dotnet user-secrets set "Cloudinary:ApiKey" "<your-api-key>"
dotnet user-secrets set "Cloudinary:ApiSecret" "<your-api-secret>"

# Apply EF Core migrations
dotnet ef database update --project CouplesWebsite.Api

# Run the API
dotnet run --project CouplesWebsite.Api
```

The API starts at `http://localhost:5000`.

### Backend Environment Variables (Railway)

Set these in Railway project settings — never in source code:

| Variable | Description |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `DATABASE_URL` | Full PostgreSQL connection string (provided by Railway plugin) |
| `CORS_ALLOWED_ORIGIN` | Netlify frontend URL (e.g., `https://couples-website.netlify.app`) |
| `SECURE_SECTION_PASSWORD_HASH` | BCrypt hash of the Secure Section password |
| `ADMIN_PASSWORD_HASH` | BCrypt hash of the Admin password |
| `JWT_SECRET_KEY` | 256-bit random string for JWT signing |
| `JWT_EXPIRY_HOURS` | Token lifetime in hours (default: `8`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `SENTRY_DSN` | Sentry DSN for backend error monitoring |

---

## Running Tests

### Frontend

```bash
cd frontend
npm run test
```

### Backend

```bash
cd backend
dotnet test
```

---

## CI/CD

GitHub Actions workflows run on every push to `main`:

- **`.github/workflows/frontend-ci.yml`** — installs dependencies, builds Next.js, runs tests
- **`.github/workflows/backend-ci.yml`** — restores NuGet packages, builds the solution, runs xUnit tests

Deployments are triggered automatically after a successful CI run:
- Frontend deploys to **Netlify** via the Netlify CLI
- Backend deploys to **Railway** via Docker image push

---

## Deployment

### Frontend (Netlify)

1. Connect the repo to a Netlify site.
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Install the `@netlify/plugin-nextjs` plugin.
5. Add all `NEXT_PUBLIC_*` environment variables in Netlify site settings.

### Backend (Railway)

1. Create a Railway project and link this repo.
2. Add a PostgreSQL plugin to the project.
3. Set all backend environment variables in Railway settings.
4. Railway uses `backend/Dockerfile` to build and deploy the API.
5. The health check endpoint is `/health`.

---

## Generating Password Hashes

To generate a BCrypt hash for the Secure Section or Admin password, run a small .NET script:

```csharp
using BCrypt.Net;
Console.WriteLine(BCrypt.HashPassword("your-password-here"));
```

Store the resulting hash string in the Railway environment variable — never the plain-text password.

---

## Security Notes

- No public user registration. Access is restricted at the Netlify/CDN layer (IP allowlist or Basic Auth).
- Two separate password gates: Secure Section and Admin interface.
- JWT tokens are issued as HTTP-only cookies and expire after 8 hours.
- All API calls use HTTPS in production. HSTS is enforced on the backend.
- Private photos are stored in a restricted Cloudinary folder; access is proxied through the authenticated backend.
