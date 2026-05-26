const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = TTL_MS): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const placesCache = new MemoryCache();
