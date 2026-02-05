import { describe, it, expect } from 'vitest'
import { extractSportTypes } from '../leagues'
import type { League } from '@/types/league'

describe('extractSportTypes', () => {
  it('returns empty array for empty leagues list', () => {
    expect(extractSportTypes([])).toEqual([])
  })

  it('extracts unique sport types sorted alphabetically', () => {
    const leagues: League[] = [
      { idLeague: '1', strLeague: 'NBA', strSport: 'Basketball', strLeagueAlternate: null },
      { idLeague: '2', strLeague: 'EPL', strSport: 'Soccer', strLeagueAlternate: null },
      { idLeague: '3', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: null },
      { idLeague: '4', strLeague: 'F1', strSport: 'Motorsport', strLeagueAlternate: null }
    ]

    expect(extractSportTypes(leagues)).toEqual(['Basketball', 'Motorsport', 'Soccer'])
  })

  it('handles leagues with missing sport field', () => {
    const leagues = [
      { idLeague: '1', strLeague: 'Test', strSport: '', strLeagueAlternate: null },
      { idLeague: '2', strLeague: 'NBA', strSport: 'Basketball', strLeagueAlternate: null }
    ] as League[]

    expect(extractSportTypes(leagues)).toEqual(['Basketball'])
  })

  it('handles single sport', () => {
    const leagues: League[] = [
      { idLeague: '1', strLeague: 'EPL', strSport: 'Soccer', strLeagueAlternate: null },
      { idLeague: '2', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: null }
    ]

    expect(extractSportTypes(leagues)).toEqual(['Soccer'])
  })
})

describe('filtering logic (pure function test)', () => {
  const mockLeagues: League[] = [
    {
      idLeague: '1',
      strLeague: 'English Premier League',
      strSport: 'Soccer',
      strLeagueAlternate: 'EPL, Premier League'
    },
    {
      idLeague: '2',
      strLeague: 'NBA',
      strSport: 'Basketball',
      strLeagueAlternate: 'National Basketball Association'
    },
    { idLeague: '3', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: 'Spanish League' },
    { idLeague: '4', strLeague: 'Formula 1', strSport: 'Motorsport', strLeagueAlternate: 'F1' }
  ]

  // Pure filtering function matching implementation
  function filterLeagues(
    leagues: League[],
    searchQuery: string,
    selectedSport: string
  ): League[] {
    let result = leagues

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((league) => {
        const name = league.strLeague?.toLowerCase() || ''
        const alternate = league.strLeagueAlternate?.toLowerCase() || ''
        return name.includes(query) || alternate.includes(query)
      })
    }

    if (selectedSport) {
      result = result.filter((league) => league.strSport === selectedSport)
    }

    return result
  }

  it('returns all leagues when no filters applied', () => {
    expect(filterLeagues(mockLeagues, '', '')).toHaveLength(4)
  })

  it('filters by search query (case-insensitive)', () => {
    const result = filterLeagues(mockLeagues, 'premier', '')
    expect(result).toHaveLength(1)
    expect(result[0].strLeague).toBe('English Premier League')
  })

  it('filters by alternate name', () => {
    const result = filterLeagues(mockLeagues, 'F1', '')
    expect(result).toHaveLength(1)
    expect(result[0].strLeague).toBe('Formula 1')
  })

  it('filters by sport type', () => {
    const result = filterLeagues(mockLeagues, '', 'Soccer')
    expect(result).toHaveLength(2)
    expect(result.map((l) => l.strLeague)).toContain('English Premier League')
    expect(result.map((l) => l.strLeague)).toContain('La Liga')
  })

  it('combines search and sport filters', () => {
    const result = filterLeagues(mockLeagues, 'league', 'Soccer')
    expect(result).toHaveLength(2)
  })

  it('returns empty array when no matches', () => {
    const result = filterLeagues(mockLeagues, 'xyz123', '')
    expect(result).toHaveLength(0)
  })

  it('handles whitespace in search query', () => {
    const result = filterLeagues(mockLeagues, '  nba  ', '')
    expect(result).toHaveLength(1)
    expect(result[0].strLeague).toBe('NBA')
  })
})
