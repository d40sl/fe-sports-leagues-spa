import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiGet, ApiError } from '../client'
import { apiCache } from '../cache'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('apiGet', () => {
  beforeEach(() => {
    apiCache.clear()
    mockFetch.mockClear()
  })

  it('fetches data and caches response', async () => {
    const mockData = { leagues: [{ id: '1', name: 'Test' }] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const result = await apiGet<typeof mockData>('https://api.example.com/data')

    expect(result).toEqual(mockData)
    expect(apiCache.has('https://api.example.com/data')).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns cached data without fetching again', async () => {
    const mockData = { leagues: [{ id: '1', name: 'Cached' }] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    // First call - fetches
    await apiGet('https://api.example.com/cached')
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Second call - uses cache
    const result = await apiGet('https://api.example.com/cached')
    expect(result).toEqual(mockData)
    expect(mockFetch).toHaveBeenCalledTimes(1) // Still 1, not 2
  })

  it('throws ApiError on HTTP error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    try {
      await apiGet('https://api.example.com/notfound')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).message).toBe('HTTP error: Not Found')
      expect((error as ApiError).statusCode).toBe(404)
    }
  })

  it('throws ApiError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(apiGet('https://api.example.com/offline')).rejects.toThrow(
      'Network error: Unable to connect to server'
    )
  })
})

describe('ApiError', () => {
  it('creates error with message only', () => {
    const error = new ApiError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('ApiError')
    expect(error.statusCode).toBeUndefined()
    expect(error.isTimeout).toBe(false)
  })

  it('creates error with status code', () => {
    const error = new ApiError('Not found', 404)
    expect(error.statusCode).toBe(404)
  })

  it('creates timeout error', () => {
    const error = new ApiError('Request timed out', undefined, true)
    expect(error.isTimeout).toBe(true)
  })
})
