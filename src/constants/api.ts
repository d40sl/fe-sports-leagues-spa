/**
 * API endpoints configuration
 *
 * All requests go through our API proxy which:
 * - Keeps the API key secure on the server side (SPORTSDB_API_KEY env var)
 * - Works with both free tier (key: 123) and premium keys
 * - Adds caching headers for better performance
 *
 * Development: Vite dev server proxies to TheSportsDB
 * Production: Vercel serverless functions handle the proxy
 */
export const ENDPOINTS = {
  ALL_LEAGUES: '/api/leagues',
  SEASON_BADGES: (leagueId: string) => `/api/seasons?id=${leagueId}`
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
