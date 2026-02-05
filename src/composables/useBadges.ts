import { reactive, readonly } from 'vue'
import { fetchLeagueBadge } from '@/api/leagues'
import { ApiError } from '@/api/client'
import type { SeasonBadge } from '@/types/league'

/**
 * Badge fetch status for tracking prefetch progress
 */
type BadgeStatus = 'idle' | 'loading' | 'success' | 'error'

interface BadgeEntry {
  status: BadgeStatus
  badge: SeasonBadge | null
}

/**
 * Configuration for badge prefetching
 */
const PREFETCH_CONFIG = {
  BATCH_SIZE: 5, // Concurrent requests per batch
  BATCH_DELAY_MS: 100 // Delay between batches to avoid rate limiting
}

/**
 * Internal state - shared across all useBadges() calls
 */
const badgeStore = reactive(new Map<string, BadgeEntry>())
let prefetchAbortController: AbortController | null = null

/**
 * Fetch a single badge and update the store
 */
async function fetchBadgeForStore(leagueId: string, signal?: AbortSignal): Promise<void> {
  const existing = badgeStore.get(leagueId)
  if (existing && existing.status !== 'idle') {
    return // Already fetched or in progress
  }

  badgeStore.set(leagueId, { status: 'loading', badge: null })

  try {
    const badge = await fetchLeagueBadge(leagueId, signal)
    badgeStore.set(leagueId, { status: 'success', badge })
  } catch (error) {
    if (error instanceof ApiError && error.isAborted) {
      // Reset to idle on abort so it can be retried
      badgeStore.set(leagueId, { status: 'idle', badge: null })
      return
    }

    badgeStore.set(leagueId, { status: 'error', badge: null })
  }
}

/**
 * Prefetch badges for multiple leagues in batches
 * Uses controlled concurrency to avoid overwhelming the API
 */
async function prefetchBadges(leagueIds: string[]): Promise<void> {
  // Cancel any existing prefetch operation
  if (prefetchAbortController) {
    prefetchAbortController.abort()
  }

  prefetchAbortController = new AbortController()
  const signal = prefetchAbortController.signal

  // Filter out already fetched badges
  const toFetch = leagueIds.filter((id) => {
    const entry = badgeStore.get(id)
    return !entry || entry.status === 'idle'
  })

  // Process in batches
  for (let i = 0; i < toFetch.length; i += PREFETCH_CONFIG.BATCH_SIZE) {
    if (signal.aborted) break

    const batch = toFetch.slice(i, i + PREFETCH_CONFIG.BATCH_SIZE)

    // Fetch batch concurrently
    await Promise.all(batch.map((id) => fetchBadgeForStore(id, signal)))

    // Small delay between batches to be nice to the API
    if (i + PREFETCH_CONFIG.BATCH_SIZE < toFetch.length) {
      await new Promise((resolve) => setTimeout(resolve, PREFETCH_CONFIG.BATCH_DELAY_MS))
    }
  }
}

/**
 * Get badge entry for a league (for checking status)
 */
function getBadgeEntry(leagueId: string): BadgeEntry | undefined {
  return badgeStore.get(leagueId)
}

/**
 * Get badge for a league (null if not available or not fetched)
 */
function getBadge(leagueId: string): SeasonBadge | null {
  const entry = badgeStore.get(leagueId)
  return entry?.badge ?? null
}

/**
 * Retry fetching a badge that previously failed
 */
async function retryBadge(leagueId: string): Promise<void> {
  badgeStore.set(leagueId, { status: 'idle', badge: null })
  await fetchBadgeForStore(leagueId)
}

/**
 * Cancel any ongoing prefetch operations
 */
function cancelPrefetch(): void {
  if (prefetchAbortController) {
    prefetchAbortController.abort()
    prefetchAbortController = null
  }
}

/**
 * Composable for managing league badges with prefetching
 *
 * Features:
 * - Prefetches badges in batches after leagues load
 * - Stores badges for instant access in modal
 * - Handles loading/error states per badge
 * - Controlled concurrency to avoid rate limiting
 */
export function useBadges() {
  return {
    // Readonly access to the store for reactivity
    badgeStore: readonly(badgeStore),

    // Actions
    prefetchBadges,
    getBadge,
    getBadgeEntry,
    retryBadge,
    cancelPrefetch
  }
}
