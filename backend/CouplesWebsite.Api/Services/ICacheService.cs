namespace CouplesWebsite.Api.Services;

public interface ICacheService
{
    T? Get<T>(string key);
    void Set<T>(string key, T value, TimeSpan ttl);
    void Remove(string key);
}
