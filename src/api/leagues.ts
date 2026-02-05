import { apiGet } from './client'
import { ENDPOINTS } from '@/constants/api'
import type { League, LeaguesResponse, SeasonBadge, SeasonsResponse } from '@/types/league'

/**
 * Fetch all leagues from TheSportsDB
 * Uses all_leagues.php as specified in the assignment
 * Note: Free tier returns limited results; premium tier returns full dataset
 */
export async function fetchAllLeagues(): Promise<League[]> {
  const response = await apiGet<LeaguesResponse>(ENDPOINTS.ALL_LEAGUES)

  if (!response.leagues) {
    return []
  }

  // Sort by sport first, then by league name for consistent ordering
  return response.leagues.sort((a, b) => {
    const sportCompare = a.strSport.localeCompare(b.strSport)
    if (sportCompare !== 0) return sportCompare
    return a.strLeague.localeCompare(b.strLeague)
  })
}

/**
 * Fetch season badge for a specific league
 * Returns the most recent badge (last item in array) or null if none available
 */
export async function fetchLeagueBadge(leagueId: string): Promise<SeasonBadge | null> {
  const url = ENDPOINTS.SEASON_BADGES(leagueId)
  const response = await apiGet<SeasonsResponse>(url)

  if (!response.seasons || response.seasons.length === 0) {
    return null
  }

  // Return the most recent season (last in array)
  return response.seasons[response.seasons.length - 1]
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
