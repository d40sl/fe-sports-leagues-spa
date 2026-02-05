import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useLeagues } from '../useLeagues'
import { apiCache } from '@/api/cache'
import type { League } from '@/types/league'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockLeagues: League[] = [
  { idLeague: '1', strLeague: 'English Premier League', strSport: 'Soccer', strLeagueAlternate: 'EPL' },
  { idLeague: '2', strLeague: 'NBA', strSport: 'Basketball', strLeagueAlternate: null },
  { idLeague: '3', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: 'Spanish League' },
  { idLeague: '4', strLeague: 'Formula 1', strSport: 'Motorsport', strLeagueAlternate: 'F1' }
]

describe('useLeagues', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    apiCache.clear()
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ leagues: mockLeagues })
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with idle state', () => {
    const { state } = useLeagues()
    expect(state.value.status).toBe('idle')
  })

  it('loads leagues and updates state', async () => {
    const { state, loadLeagues, leagues } = useLeagues()

    const loadPromise = loadLeagues()
    expect(state.value.status).toBe('loading')

    await loadPromise
    expect(state.value.status).toBe('success')
    expect(leagues.value).toHaveLength(4)
  })

  it('handles API errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { state, loadLeagues } = useLeagues()
    await loadLeagues()

    expect(state.value.status).toBe('error')
    if (state.value.status === 'error') {
      expect(state.value.error).toContain('Network error')
    }
  })

  it('extracts unique sport types', async () => {
    const { loadLeagues, sportTypes } = useLeagues()
    await loadLeagues()

    expect(sportTypes.value).toEqual(['Basketball', 'Motorsport', 'Soccer'])
  })

  it('filters by search query with debounce', async () => {
    const { loadLeagues, searchQuery, filteredLeagues } = useLeagues()
    await loadLeagues()

    expect(filteredLeagues.value).toHaveLength(4)

    searchQuery.value = 'premier'
    await nextTick() // Wait for watch to trigger
    // Before debounce fires, still shows all
    expect(filteredLeagues.value).toHaveLength(4)

    // After debounce delay
    vi.advanceTimersByTime(250)
    await nextTick() // Wait for reactivity to update
    expect(filteredLeagues.value).toHaveLength(1)
    expect(filteredLeagues.value[0].strLeague).toBe('English Premier League')
  })

  it('filters by sport type', async () => {
    const { loadLeagues, selectedSport, filteredLeagues } = useLeagues()
    await loadLeagues()

    selectedSport.value = 'Soccer'
    expect(filteredLeagues.value).toHaveLength(2)
  })

  it('combines search and sport filters', async () => {
    const { loadLeagues, searchQuery, selectedSport, filteredLeagues } = useLeagues()
    await loadLeagues()

    searchQuery.value = 'league'
    vi.advanceTimersByTime(250)
    selectedSport.value = 'Soccer'

    expect(filteredLeagues.value).toHaveLength(2) // Both Soccer leagues have "league" in name
  })

  it('resets to page 1 when filters change', async () => {
    const { loadLeagues, searchQuery, currentPage } = useLeagues()
    await loadLeagues()

    currentPage.value = 2

    searchQuery.value = 'test'
    await nextTick() // Wait for watch to trigger
    vi.advanceTimersByTime(250)
    await nextTick() // Wait for debounced value to update and trigger page reset watch

    expect(currentPage.value).toBe(1)
  })

  it('paginates results correctly', async () => {
    const { loadLeagues, pageSize, paginatedLeagues } = useLeagues()
    await loadLeagues()

    pageSize.value = 2
    expect(paginatedLeagues.value).toHaveLength(2)
  })

  it('calculates total pages', async () => {
    const { loadLeagues, pageSize, totalPages } = useLeagues()
    await loadLeagues()

    pageSize.value = 2
    expect(totalPages.value).toBe(2) // 4 leagues / 2 per page
  })
})
