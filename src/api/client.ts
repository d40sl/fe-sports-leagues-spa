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
    public isTimeout = false,
    public isAborted = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Fetch with timeout and abort support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // Link external abort signal if provided
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', () => controller.abort())
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Check if it was a timeout or external abort
      if (externalSignal?.aborted) {
        throw new ApiError('Request cancelled', undefined, false, true)
      }
      throw new ApiError('Request timed out', undefined, true)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Generic API GET request with caching and in-flight deduplication
 * Returns cached data if available, otherwise fetches from network
 *
 * @param url - The API endpoint URL
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to the typed response data
 * @throws ApiError on network or HTTP errors
 */
export async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(url)
  if (cached !== null) {
    return cached
  }

  // Check for in-flight request to same URL (deduplication)
  const inFlight = inFlightRequests.get(url)
  if (inFlight) {
    return inFlight as Promise<T>
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const response = await fetchWithTimeout(url, {}, REQUEST_TIMEOUT_MS, signal)

      if (!response.ok) {
        throw new ApiError(`HTTP error: ${response.statusText}`, response.status)
      }

      const data = (await response.json()) as T
      apiCache.set(url, data)

      return data
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error instanceof TypeError) {
        throw new ApiError('Network error: Unable to connect to server')
      }
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      inFlightRequests.delete(url)
    }
  })()

  // Track in-flight request
  inFlightRequests.set(url, requestPromise)

  return requestPromise
}
