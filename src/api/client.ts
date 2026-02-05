import { apiCache } from './cache'
import { REQUEST_TIMEOUT_MS } from '@/constants/api'

/**
 * Custom error class for API errors
 * Provides structured error information for UI handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Fetch with timeout support using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', undefined, true)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Generic API GET request with caching
 * Returns cached data if available, otherwise fetches from network
 *
 * @param url - The API endpoint URL
 * @returns Promise resolving to the typed response data
 * @throws ApiError on network or HTTP errors
 */
export async function apiGet<T>(url: string): Promise<T> {
  // Check cache first
  if (apiCache.has(url)) {
    const cached = apiCache.get<T>(url)
    if (cached !== null) {
      return cached
    }
  }

  try {
    const response = await fetchWithTimeout(url)

    if (!response.ok) {
      throw new ApiError(`HTTP error: ${response.statusText}`, response.status)
    }

    const data = (await response.json()) as T

    // Cache successful response
    apiCache.set(url, data)

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new ApiError('Network error: Unable to connect to server')
    }

    throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}
