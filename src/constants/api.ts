/**
 * TheSportsDB API configuration
 * Using the free tier API key "3"
 * Free tier returns limited results; premium returns full dataset
 */
export const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3'

export const ENDPOINTS = {
  ALL_LEAGUES: `${API_BASE_URL}/all_leagues.php`,
  SEASON_BADGES: (leagueId: string) =>
    `${API_BASE_URL}/search_all_seasons.php?badge=1&id=${leagueId}`
} as const

/**
 * Pagination settings for client-side pagination
 */
export const PAGINATION = {
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
} as const

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT_MS = 10000

/**
 * Placeholder SVG for missing/broken badge images
 */
export const BADGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14"%3ENo Badge%3C/text%3E%3C/svg%3E'
