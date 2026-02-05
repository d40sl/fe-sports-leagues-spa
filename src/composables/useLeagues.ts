import { ref, computed, watch, onUnmounted, shallowRef, getCurrentInstance } from 'vue'
import { fetchAllLeagues, extractSportTypes } from '@/api/leagues'
import type { NormalizedLeague } from '@/api/leagues'
import { debounce } from '@/utils/debounce'
import type { AsyncState } from '@/types/league'

const DEBOUNCE_DELAY_MS = 250

/**
 * Composable for managing leagues data, filtering, and pagination
 *
 * Features:
 * - Fetches leagues from API with loading/error/success states
 * - Pre-normalized search fields for fast filtering
 * - Debounced search input to avoid excessive filtering
 * - Sport type filtering
 * - Client-side pagination
 * - Extracts unique sport types for dropdown
 */
export function useLeagues() {
  // Use shallowRef for large arrays - individual league objects don't need deep reactivity
  const leagues = shallowRef<NormalizedLeague[]>([])
  const state = ref<AsyncState<NormalizedLeague[]>>({ status: 'idle' })

  // Filter state
  const searchQuery = ref('')
  const debouncedSearchQuery = ref('')
  const selectedSport = ref('')

  // Pagination state
  const currentPage = ref(1)
  const pageSize = ref(20)

  // Create debounced search handler
  const updateDebouncedSearch = debounce((value: string) => {
    debouncedSearchQuery.value = value
  }, DEBOUNCE_DELAY_MS)

  // Watch searchQuery and debounce updates
  watch(searchQuery, (newValue) => {
    updateDebouncedSearch(newValue)
  })

  // Cleanup on unmount (only in component context)
  if (getCurrentInstance()) {
    onUnmounted(() => {
      updateDebouncedSearch.cancel()
    })
  }

  // Computed: unique sport types from raw data (computed once, not on every filter)
  const sportTypes = computed(() => extractSportTypes(leagues.value))

  // Computed: filtered leagues using pre-normalized search fields
  const filteredLeagues = computed(() => {
    let result = leagues.value

    // Apply search filter using pre-normalized fields (no per-item toLowerCase)
    if (debouncedSearchQuery.value.trim()) {
      const query = debouncedSearchQuery.value.toLowerCase().trim()
      result = result.filter((league) => {
        return league._searchName.includes(query) || league._searchAlternate.includes(query)
      })
    }

    // Apply sport filter
    if (selectedSport.value) {
      result = result.filter((league) => league.strSport === selectedSport.value)
    }

    return result
  })

  // Computed: paginated results
  const paginatedLeagues = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredLeagues.value.slice(start, end)
  })

  // Computed: total pages
  const totalPages = computed(() => Math.ceil(filteredLeagues.value.length / pageSize.value))

  // Reset to page 1 when filters change
  watch([debouncedSearchQuery, selectedSport], () => {
    currentPage.value = 1
  })

  // Reset to page 1 when page size changes
  watch(pageSize, () => {
    currentPage.value = 1
  })

  /**
   * Load leagues from API
   */
  async function loadLeagues() {
    state.value = { status: 'loading' }

    try {
      const data = await fetchAllLeagues()
      leagues.value = data
      state.value = { status: 'success', data }
    } catch (err) {
      state.value = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to load leagues. Please try again.'
      }
    }
  }

  /**
   * Set page size and reset to page 1
   */
  function setPageSize(size: number) {
    pageSize.value = size
  }

  /**
   * Navigate to a specific page
   */
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    // State
    state,
    leagues,
    searchQuery,
    selectedSport,
    currentPage,
    pageSize,

    // Computed
    sportTypes,
    filteredLeagues,
    paginatedLeagues,
    totalPages,

    // Actions
    loadLeagues,
    setPageSize,
    goToPage
  }
}
