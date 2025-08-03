// Simple in-memory cache for API responses to reduce Hasura calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Configuration constants
const CLEANUP_PROBABILITY = 0.01; // 1% chance of cleanup per cache access

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    // Default 1 minute TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    const entries: Array<[string, CacheEntry<unknown>]> = [];
    this.cache.forEach((value, key) => {
      entries.push([key, value]);
    });
    
    return {
      totalEntries: this.cache.size,
      memoryUsage: JSON.stringify(entries).length,
    };
  }
}

// Global cache instance
export const apiCache = new SimpleCache();

// Helper function to cache API responses
export async function getCachedOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 60000 // 1 minute default
): Promise<T> {
  // Occasionally clean up expired entries to prevent memory bloat
  if (Math.random() < CLEANUP_PROBABILITY) {
    apiCache.cleanup();
  }

  // Try to get from cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Not in cache, fetch and store
  const data = await fetchFn();
  apiCache.set(cacheKey, data, ttlMs);

  return data;
}
