# Deployment Guide — Couple's Website

This guide covers everything you need to deploy the Couple's Website from scratch. Follow each section in order on first setup. After that, all deploys happen automatically through GitHub Actions.

---

## Architecture Overview

| Layer | Service | Trigger |
|---|---|---|
| Frontend (Next.js) | Netlify | Auto-deploy on push to `main` |
| Backend (ASP.NET Core 8) | Railway (Docker) | Auto-deploy on push to `main` |
| Database (PostgreSQL) | Neon (free tier) | Managed by Neon |
| Photo storage | Cloudinary (free tier) | Called from backend at runtime |

---

## First-Time Setup

### Step 1 — Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account.
2. From your Cloudinary dashboard, copy three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Keep these ready — you will add them to Railway in Step 2.

---

### Step 2 — Neon (Database)

Railway's internal PostgreSQL plugin requires paid private networking or a paid TCP proxy to connect from a backend service. Use Neon's free tier instead — it provides a standard public connection string with no extra configuration.

#### 2a. Create the Neon database

1. Go to [neon.tech](https://neon.tech) and sign up for a free account.
2. Click **New Project**, give it a name, and choose a region close to your Railway deployment.
3. Once created, go to the project **Dashboard** → **Connection Details**.
4. Select **Connection string** format and copy the full URL — it looks like:
   `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. Keep this string ready for Step 3.

> **Note:** Neon's free tier includes 0.5 GB storage and is always-on. No credit card required.

---

### Step 3 — Railway (Backend)

#### 3a. Create the project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository (`Couple-s-Website`).
4. When prompted for a root directory, set it to `backend/`.
5. Railway will detect the `Dockerfile` automatically.

#### 3b. Configure environment variables

In your Railway backend service, go to **Variables** and add each of the following. Do not skip any.

| Variable | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `DATABASE_URL` | The full Neon connection string from Step 2a (e.g. `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`) |
| `Jwt__SecretKey` | A random 64-character string — see "Generating secrets" below |
| `Jwt__Issuer` | `couples-website` |
| `Jwt__Audience` | `couples-website` |
| `SECURE_SECTION_PASSWORD_HASH` | BCrypt hash of your Secure Section password — see "Generating password hashes" below |
| `ADMIN_PASSWORD_HASH` | BCrypt hash of your Admin password (can be a different password from the Secure Section) |
| `Cloudinary__CloudName` | From your Cloudinary dashboard |
| `Cloudinary__ApiKey` | From your Cloudinary dashboard |
| `Cloudinary__ApiSecret` | From your Cloudinary dashboard |
| `CORS_ORIGIN` | Your Netlify site URL, e.g. `https://our-little-world.netlify.app` (no trailing slash) — fill this in after Step 4 |
| `ALLOWED_IPS` | Comma-separated list of IP addresses to allow (e.g. `1.2.3.4,5.6.7.8`). Leave empty to disable IP restriction entirely. |
| `SESSION_TOKEN_EXPIRY_HOURS` | `8` (or adjust to your preference) |

> **Do not add Railway's PostgreSQL plugin.** The `DATABASE_URL` above points directly to Neon. The backend's `Program.cs` parses PostgreSQL URIs automatically — no format conversion needed.

#### 3c. Deploy

1. Railway will build and deploy automatically once variables are saved.
2. On first startup, the API runs `db.Database.Migrate()` which applies all pending EF Core migrations and seeds the initial data. No manual migration step is required.
3. Check the **Deployments** tab — the health check pings `GET /health` and must return 200.
4. Copy your Railway public URL (e.g. `https://couples-api.up.railway.app`) — you need it for Step 4.

---

### Step 4 — Netlify (Frontend)

#### 4a. Connect the repo

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **Add new site** → **Import an existing project** → **GitHub**.
3. Select this repository.
4. Set the following build settings (the `netlify.toml` file already configures these, but confirm):
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Click **Deploy site**.

#### 4b. Configure environment variables

In the Netlify site dashboard, go to **Site configuration** → **Environment variables** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Your Railway backend URL from Step 3c (e.g. `https://couples-api.up.railway.app`) |

#### 4c. Update CORS on Railway

Now that you have your Netlify URL, go back to Railway and update `CORS_ORIGIN` to your Netlify site URL (e.g. `https://our-little-world.netlify.app`).

---

### Step 5 — GitHub Actions Secrets

The CI/CD pipelines need secrets to push the Docker image and deploy automatically.

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**, and add:

| Secret | Value |
|---|---|
| `RAILWAY_TOKEN` | Railway API token — from Railway dashboard → **Account Settings** → **Tokens** |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token — from Netlify dashboard → **User settings** → **Applications** → **Personal access tokens** |
| `NETLIFY_SITE_ID` | Netlify site ID — from Netlify site dashboard → **Site configuration** → **General** → **Site ID** |
| `NEXT_PUBLIC_API_BASE_URL` | Your Railway backend URL (used during the CI build step) |

After adding secrets, push any commit to `main` to trigger the full CI/CD pipeline.

---

## Generating Secrets

### 64-character random string (for Jwt__SecretKey)

Run this in a terminal:

```bash
openssl rand -base64 48
```

Or use any password manager's random generator — aim for at least 64 characters mixing letters, numbers, and symbols.

### Generating password hashes

The Secure Section and Admin passwords are stored only as BCrypt hashes. The plaintext password never leaves your device.

**Option A — Online tool (easiest)**

1. Go to [bcrypt-generator.com](https://bcrypt-generator.com)
2. Enter your chosen password
3. Set the cost factor (rounds) to **12**
4. Click **Hash**
5. Copy the resulting hash (starts with `$2a$12$...`) and paste it into Railway as the environment variable value

**Option B — .NET tool**

```bash
dotnet tool install -g BCrypt.Net
# Then hash your password:
bcrypt hash "YourPasswordHere" --cost 12
```

> Store ONLY the hash in Railway. Never write the plaintext password anywhere in this repository.

---

## Local Development

### Backend

```bash
cd backend

# Set secrets via dotnet user-secrets (stored outside the repo, never committed)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=couples_dev;Username=postgres;Password=yourpassword" --project CouplesWebsite.Api
dotnet user-secrets set "Jwt:SecretKey" "your-local-secret-key-minimum-32-chars-long" --project CouplesWebsite.Api
dotnet user-secrets set "Jwt:Issuer" "couples-website" --project CouplesWebsite.Api
dotnet user-secrets set "Jwt:Audience" "couples-website" --project CouplesWebsite.Api
dotnet user-secrets set "SECURE_SECTION_PASSWORD_HASH" "your-bcrypt-hash-here" --project CouplesWebsite.Api
dotnet user-secrets set "ADMIN_PASSWORD_HASH" "your-bcrypt-hash-here" --project CouplesWebsite.Api
dotnet user-secrets set "Cloudinary:CloudName" "your-cloud-name" --project CouplesWebsite.Api
dotnet user-secrets set "Cloudinary:ApiKey" "your-api-key" --project CouplesWebsite.Api
dotnet user-secrets set "Cloudinary:ApiSecret" "your-api-secret" --project CouplesWebsite.Api

# Run the API (listens on http://localhost:5000 by default in Development)
dotnet run --project CouplesWebsite.Api
```

### Frontend

```bash
cd frontend

# Copy the example env file and fill in your local backend URL
cp .env.local.example .env.local
# Edit .env.local and set:
#   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

npm install
npm run dev
# App is at http://localhost:3000
```

---

## Database Migrations

Migrations run automatically on startup in production (via `db.Database.Migrate()` in `Program.cs`).

For local development, run migrations manually:

```bash
cd backend

# Add a new migration after changing an EF Core model
dotnet ef migrations add <MigrationName> --project CouplesWebsite.Api

# Apply pending migrations to your local database
dotnet ef database update --project CouplesWebsite.Api
```

> Never create or apply migrations directly against the Railway production database. Push the migration file to `main` and let the app apply it on startup.

---

## How Continuous Deployment Works

Once everything above is set up, the workflow is:

1. Push code to `main` (or merge a PR).
2. GitHub Actions runs tests and a build check.
3. On success:
   - **Backend:** Docker image is built and pushed to GitHub Container Registry (`ghcr.io`). Railway detects the updated image and redeploys.
   - **Frontend:** Next.js is built and deployed to Netlify via the Netlify CLI.
4. The backend applies any new database migrations on first request after startup.

Pull requests trigger tests and a build check but do not deploy to production.

---

## Monitoring and Maintenance

### Dashboards

| Service | What to check |
|---|---|
| Railway dashboard | CPU and memory usage, request logs, deploy history |
| Netlify dashboard | Deploy logs, build times, function logs |
| Cloudinary dashboard | Storage used (free tier limit: 25 GB), monthly bandwidth |

### Keeping dependencies up to date

Run these quarterly:

```bash
# Frontend — check for vulnerabilities and outdated packages
cd frontend
npm audit
npm outdated

# Backend — list outdated NuGet packages
cd backend
dotnet list package --outdated
```

### Rotating secrets

If you suspect a secret has been compromised:

1. Generate a new value.
2. Update it in Railway (for backend) or Netlify (for frontend) environment variables.
3. Update the corresponding GitHub Actions secret.
4. Railway and Netlify will redeploy automatically after an environment variable change.

> Users will be logged out when `Jwt__SecretKey` is rotated because existing tokens will fail verification.

---

## Environment Variables — Full Reference

### Frontend (Netlify)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL of the Railway-hosted API |

### Backend (Railway)

| Variable | Required | Purpose |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Yes | Must be `Production` — enables HSTS and production error pages |
| `ConnectionStrings__DefaultConnection` | Yes | PostgreSQL ADO.NET connection string |
| `Jwt__SecretKey` | Yes | Secret used to sign and verify JWT session tokens |
| `Jwt__Issuer` | Yes | JWT issuer claim — set to `couples-website` |
| `Jwt__Audience` | Yes | JWT audience claim — set to `couples-website` |
| `SECURE_SECTION_PASSWORD_HASH` | Yes | BCrypt hash of the Secure Section password |
| `ADMIN_PASSWORD_HASH` | Yes | BCrypt hash of the Admin password |
| `Cloudinary__CloudName` | Yes | Cloudinary account cloud name |
| `Cloudinary__ApiKey` | Yes | Cloudinary API key |
| `Cloudinary__ApiSecret` | Yes | Cloudinary API secret |
| `CORS_ORIGIN` | Yes | Exact Netlify URL — e.g. `https://our-little-world.netlify.app` |
| `ALLOWED_IPS` | No | Comma-separated IP allowlist. Leave empty to allow all IPs. |
| `SESSION_TOKEN_EXPIRY_HOURS` | No | Token lifetime in hours. Defaults to `8` if not set. |

### GitHub Actions Secrets

| Secret | Purpose |
|---|---|
| `RAILWAY_TOKEN` | Authenticates the Railway deploy step |
| `NETLIFY_AUTH_TOKEN` | Authenticates the Netlify CLI deploy step |
| `NETLIFY_SITE_ID` | Identifies which Netlify site to deploy to |
| `NEXT_PUBLIC_API_BASE_URL` | Injected during the CI build so API URL references resolve correctly |
