using CouplesWebsite.Api.Services;

namespace CouplesWebsite.Tests.Tests;

/// <summary>
/// A no-op ICacheService implementation for integration tests.
/// Always returns null from Get&lt;T&gt; (cache miss) and ignores Set/Remove calls.
/// This prevents cache state from leaking between tests.
/// </summary>
internal sealed class NoOpCacheService : ICacheService
{
    public T? Get<T>(string key) => default;
    public void Set<T>(string key, T value, TimeSpan ttl) { }
    public void Remove(string key) { }
}
