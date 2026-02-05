/**
 * In-memory cache for API responses
 * Prevents duplicate network requests for the same endpoint
 * Assignment requirement: "Responses should be cached to avoid repeat calls"
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>()

  /**
   * Get cached data if available
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }
    return entry.data as T
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size for debugging/testing
   */
  get size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const apiCache = new ApiCache()
