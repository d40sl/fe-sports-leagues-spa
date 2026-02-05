/**
 * In-memory cache for API responses with TTL and LRU eviction
 * Prevents duplicate network requests for the same endpoint
 * Assignment requirement: "Responses should be cached to avoid repeat calls"
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  isNegative?: boolean // For caching 404/no-data responses
}

interface CacheConfig {
  maxSize: number // Maximum number of entries
  ttlMs: number // Time-to-live in milliseconds
  negativeTtlMs: number // TTL for negative (error/empty) responses
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 500,
  ttlMs: 5 * 60 * 1000, // 5 minutes
  negativeTtlMs: 30 * 1000 // 30 seconds for errors/empty
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private accessOrder: string[] = [] // For LRU tracking
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    // Check TTL
    const ttl = entry.isNegative ? this.config.negativeTtlMs : this.config.ttlMs
    if (Date.now() - entry.timestamp > ttl) {
      this.delete(key)
      return null
    }

    // Update LRU order
    this.touchKey(key)

    return entry.data as T
  }

  /**
   * Store data in cache with LRU eviction
   */
  set<T>(key: string, data: T, isNegative = false): void {
    // Evict oldest entries if at capacity
    while (this.cache.size >= this.config.maxSize && this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isNegative
    })

    this.touchKey(key)
  }

  /**
   * Cache a negative response (error or empty data)
   */
  setNegative<T>(key: string, data: T): void {
    this.set(key, data, true)
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key)
    const idx = this.accessOrder.indexOf(key)
    if (idx > -1) {
      this.accessOrder.splice(idx, 1)
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  /**
   * Get cache size for debugging/testing
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Update LRU access order
   */
  private touchKey(key: string): void {
    const idx = this.accessOrder.indexOf(key)
    if (idx > -1) {
      this.accessOrder.splice(idx, 1)
    }
    this.accessOrder.push(key)
  }
}

// Singleton instance
export const apiCache = new ApiCache()
