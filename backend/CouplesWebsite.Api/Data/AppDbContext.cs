using CouplesWebsite.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CouplesWebsite.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Feeling> Feelings => Set<Feeling>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.UserID);
            entity.Property(u => u.Username)
                  .IsRequired()
                  .HasMaxLength(50);
            entity.Property(u => u.PasswordHash)
                  .IsRequired()
                  .HasMaxLength(255);
        });

        // ── Questions ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Question>(entity =>
        {
            entity.ToTable("Questions");
            entity.HasKey(q => q.QuestionID);
            entity.Property(q => q.Text)
                  .IsRequired()
                  .HasMaxLength(500);
            entity.Property(q => q.IsPredefined)
                  .IsRequired();
        });

        // ── Answers ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.ToTable("Answers");
            entity.HasKey(a => a.AnswerID);
            entity.Property(a => a.Text)
                  .IsRequired()
                  .HasMaxLength(1000);
            entity.Property(a => a.Timestamp)
                  .IsRequired()
                  .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

            entity.HasOne(a => a.Question)
                  .WithMany(q => q.Answers)
                  .HasForeignKey(a => a.QuestionID)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.User)
                  .WithMany(u => u.Answers)
                  .HasForeignKey(a => a.UserID)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Feelings ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Feeling>(entity =>
        {
            entity.ToTable("Feelings");
            entity.HasKey(f => f.FeelingID);

            // The column in the DB is named "Feeling" to match the schema,
            // but the C# property is FeelingWord to avoid collision with class name.
            entity.Property(f => f.FeelingWord)
                  .HasColumnName("Feeling")
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(f => f.Subject)
                  .IsRequired()
                  .HasMaxLength(100);
            entity.Property(f => f.Context)
                  .IsRequired()
                  .HasMaxLength(1000);
            entity.Property(f => f.Timestamp)
                  .IsRequired()
                  .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

            entity.HasOne(f => f.User)
                  .WithMany(u => u.Feelings)
                  .HasForeignKey(f => f.UserID)
                  .OnDelete(DeleteBehavior.Cascade);

            // Index for pagination performance
            entity.HasIndex(f => f.Timestamp)
                  .HasDatabaseName("IX_Feelings_Timestamp");
        });

        // ── Photos ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Photo>(entity =>
        {
            entity.ToTable("Photos");
            entity.HasKey(p => p.PhotoID);
            entity.Property(p => p.ImageURL)
                  .IsRequired()
                  .HasMaxLength(500);
            entity.Property(p => p.PublicId)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(p => p.IsSecure)
                  .IsRequired();
            entity.Property(p => p.Timestamp)
                  .IsRequired()
                  .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

            entity.HasOne(p => p.User)
                  .WithMany(u => u.Photos)
                  .HasForeignKey(p => p.UserID)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── TimelineEntries ────────────────────────────────────────────────────
        modelBuilder.Entity<TimelineEntry>(entity =>
        {
            entity.ToTable("TimelineEntries");
            entity.HasKey(t => t.EntryID);
            entity.Property(t => t.Title)
                  .IsRequired()
                  .HasMaxLength(100);
            entity.Property(t => t.Content)
                  .IsRequired()
                  .HasMaxLength(1000);
            entity.Property(t => t.Timestamp)
                  .IsRequired()
                  .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");

            entity.HasOne(t => t.User)
                  .WithMany(u => u.TimelineEntries)
                  .HasForeignKey(t => t.UserID)
                  .OnDelete(DeleteBehavior.Cascade);

            // Index for median-timestamp pagination performance
            entity.HasIndex(t => t.Timestamp)
                  .HasDatabaseName("IX_TimelineEntries_Timestamp");
        });

        // ── ActivityLogs ───────────────────────────────────────────────────────
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.ToTable("ActivityLogs");
            entity.HasKey(l => l.LogID);
            entity.Property(l => l.IPAddress)
                  .IsRequired()
                  .HasMaxLength(50);
            entity.Property(l => l.PageVisited)
                  .IsRequired()
                  .HasMaxLength(255);
            entity.Property(l => l.Action)
                  .HasMaxLength(100);
            entity.Property(l => l.Timestamp)
                  .IsRequired()
                  .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
        });
    }
}
