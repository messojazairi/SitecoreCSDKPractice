/**
 * Caching Utility for Sitecore MCP Server
 * Provides in-memory caching with TTL and LRU eviction
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  onEvict?: (key: string, value: any) => void;
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly onEvict?: (key: string, value: T) => void;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000; // Default: 1 minute
    this.maxSize = options.maxSize || 1000; // Default: 1000 entries
    this.onEvict = options.onEvict;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.onEvict) {
      this.onEvict(key, entry.data);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    if (this.onEvict) {
      this.cache.forEach((entry, key) => {
        this.onEvict!(key, entry.data);
      });
    }
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    maxSize: number;
    ttl: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry && this.onEvict) {
        this.onEvict(oldestKey, entry.data);
      }
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry.data);
        }
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Multi-layer cache manager
 */
export class CacheManager {
  private caches: Map<string, Cache<any>>;

  constructor() {
    this.caches = new Map();
  }

  /**
   * Create or get a cache layer
   */
  getCache<T>(name: string, options?: CacheOptions): Cache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Cache<T>(options));
    }
    return this.caches.get(name)!;
  }

  /**
   * Clear a specific cache
   */
  clearCache(name: string): void {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.forEach((cache) => cache.clear());
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    this.caches.forEach((cache, name) => {
      stats[name] = cache.getStats();
    });
    return stats;
  }

  /**
   * Cleanup expired entries in all caches
   */
  cleanupAll(): number {
    let total = 0;
    this.caches.forEach((cache) => {
      total += cache.cleanupExpired();
    });
    return total;
  }
}

