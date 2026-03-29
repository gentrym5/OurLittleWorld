# EF Core Migrations

## Generating a migration (first time)

From the `backend/CouplesWebsite.Api/` directory, run:

```bash
dotnet ef migrations add InitialCreate
```

This generates a new migration file in the `Migrations/` folder based on the
current state of `AppDbContext` and all model classes.

## Applying migrations locally

```bash
dotnet ef database update
```

This applies all pending migrations to the database configured in
`appsettings.Development.json` (or dotnet user-secrets).

## Applying migrations on Railway (production)

Migrations are applied automatically on every container start via the following
call in `Program.cs`:

```csharp
db.Database.Migrate();
```

No manual `dotnet ef database update` is required in the Railway environment —
the API applies any pending migrations itself before handling requests.

## Adding subsequent migrations

```bash
dotnet ef migrations add <DescriptiveName>
```

Example:

```bash
dotnet ef migrations add AddPhotoCaption
```
