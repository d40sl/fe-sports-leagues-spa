import { describe, it, expect, beforeEach } from 'vitest'
import { apiCache } from '../cache'

describe('apiCache', () => {
  beforeEach(() => {
    apiCache.clear()
  })

  it('stores and retrieves data', () => {
    const data = { leagues: [{ id: '1', name: 'Test League' }] }
    apiCache.set('test-key', data)

    expect(apiCache.get('test-key')).toEqual(data)
  })

  it('returns null for missing keys', () => {
    expect(apiCache.get('nonexistent')).toBeNull()
  })

  it('checks if key exists with has()', () => {
    apiCache.set('exists', { value: 1 })

    expect(apiCache.has('exists')).toBe(true)
    expect(apiCache.has('missing')).toBe(false)
  })

  it('clears all cached data', () => {
    apiCache.set('key1', { a: 1 })
    apiCache.set('key2', { b: 2 })

    expect(apiCache.size).toBe(2)

    apiCache.clear()

    expect(apiCache.size).toBe(0)
    expect(apiCache.has('key1')).toBe(false)
  })

  it('overwrites existing entries', () => {
    apiCache.set('key', { version: 1 })
    apiCache.set('key', { version: 2 })

    expect(apiCache.get('key')).toEqual({ version: 2 })
    expect(apiCache.size).toBe(1)
  })

  it('handles different data types', () => {
    apiCache.set('string', 'hello')
    apiCache.set('number', 42)
    apiCache.set('array', [1, 2, 3])
    apiCache.set('null', null)

    expect(apiCache.get('string')).toBe('hello')
    expect(apiCache.get('number')).toBe(42)
    expect(apiCache.get('array')).toEqual([1, 2, 3])
    expect(apiCache.get('null')).toBeNull()
  })
})
