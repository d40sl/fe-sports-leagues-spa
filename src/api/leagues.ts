import { apiGet, ApiError } from './client'
import { apiCache } from './cache'
import { ENDPOINTS } from '@/constants/api'
import type { League, LeaguesResponse, SeasonBadge, SeasonsResponse } from '@/types/league'

/**
 * Extended league with pre-normalized search fields
 * Avoids per-item lowercasing on every search operation
 */
export interface NormalizedLeague extends League {
  _searchName: string
  _searchAlternate: string
}

/**
 * Fetch all leagues from TheSportsDB and pre-normalize for search
 * Uses all_leagues.php as specified in the assignment
 * Note: Free tier returns limited results; premium tier returns full dataset
 */
export async function fetchAllLeagues(signal?: AbortSignal): Promise<NormalizedLeague[]> {
  const response = await apiGet<LeaguesResponse>(ENDPOINTS.ALL_LEAGUES, signal)

  if (!response.leagues) {
    return []
  }

  // Pre-normalize and sort for consistent ordering and fast filtering
  return response.leagues
    .map((league) => ({
      ...league,
      _searchName: league.strLeague?.toLowerCase() || '',
      _searchAlternate: league.strLeagueAlternate?.toLowerCase() || ''
    }))
    .sort((a, b) => {
      const sportCompare = a.strSport.localeCompare(b.strSport)
      if (sportCompare !== 0) return sportCompare
      return a.strLeague.localeCompare(b.strLeague)
    })
}

/**
 * Fetch season badge for a specific league with negative caching
 * Returns the most recent badge (last item in array) or null if none available
 *
 * @param leagueId - The league ID to fetch badge for
 * @param signal - Optional AbortSignal for request cancellation
 */
export async function fetchLeagueBadge(
  leagueId: string,
  signal?: AbortSignal
): Promise<SeasonBadge | null> {
  const url = ENDPOINTS.SEASON_BADGES(leagueId)

  try {
    const response = await apiGet<SeasonsResponse>(url, signal)

    if (!response.seasons || response.seasons.length === 0) {
      // Cache empty response to avoid repeated requests
      apiCache.setNegative(url, response)
      return null
    }

    // Return the most recent season (last in array)
    return response.seasons[response.seasons.length - 1]
  } catch (error) {
    // Don't cache aborted requests
    if (error instanceof ApiError && error.isAborted) {
      throw error
    }
    throw error
  }
}

/**
 * Extract unique sport types from leagues list
 * Used to populate the sport filter dropdown
 * Computed once from raw data, not on every render
 */
export function extractSportTypes(leagues: League[]): string[] {
  const sports = new Set<string>()

  for (const league of leagues) {
    if (league.strSport) {
      sports.add(league.strSport)
    }
  }

  return Array.from(sports).sort()
}
