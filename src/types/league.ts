/**
 * League data from TheSportsDB All Leagues API
 */
export interface League {
  idLeague: string
  strLeague: string
  strSport: string
  strLeagueAlternate: string | null
}

/**
 * API response wrapper for all_leagues.php endpoint
 */
export interface LeaguesResponse {
  leagues: League[] | null
}

/**
 * Season badge data from TheSportsDB Badge Lookup API
 */
export interface SeasonBadge {
  strSeason: string
  strBadge: string | null
}

/**
 * API response wrapper for search_all_seasons.php endpoint
 */
export interface SeasonsResponse {
  seasons: SeasonBadge[] | null
}

/**
 * Discriminated union for async operation state
 * Provides type-safe handling of loading/success/error states
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
