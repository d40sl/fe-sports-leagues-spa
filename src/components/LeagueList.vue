<script setup lang="ts">
import { computed } from 'vue'
import LeagueCard from './LeagueCard.vue'
import { PAGINATION } from '@/constants/api'
import type { League } from '@/types/league'

const props = defineProps<{
  leagues: League[]
  totalCount: number
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  select: [league: League]
  'page-change': [page: number]
  'page-size-change': [size: number]
}>()

const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS

const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize))

const startIndex = computed(() => (props.currentPage - 1) * props.pageSize + 1)

const endIndex = computed(() => Math.min(props.currentPage * props.pageSize, props.totalCount))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = props.currentPage
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  const end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})
</script>

<template>
  <section class="league-list" aria-label="Sports leagues">
    <!-- Empty State -->
    <div v-if="leagues.length === 0 && totalCount === 0" class="league-list__empty">
      <div class="league-list__empty-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p class="league-list__empty-title">No leagues found</p>
      <p class="league-list__empty-text">Try adjusting your search or filter criteria.</p>
    </div>

    <!-- Results -->
    <div v-else class="league-list__container">
      <div class="league-list__toolbar">
        <span class="league-list__count">
          Showing {{ startIndex }}–{{ endIndex }} of {{ totalCount }} leagues
        </span>
        <div class="league-list__page-size">
          <label for="page-size" class="league-list__page-size-label">Per page:</label>
          <select
            id="page-size"
            class="league-list__page-size-select"
            :value="pageSize"
            @change="emit('page-size-change', Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
      </div>

      <table class="league-table">
        <thead class="league-table__head">
          <tr>
            <th class="league-table__th">League</th>
            <th class="league-table__th">Sport</th>
            <th class="league-table__th"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <LeagueCard
            v-for="league in leagues"
            :key="league.idLeague"
            :league="league"
            @select="emit('select', $event)"
          />
        </tbody>
      </table>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
        <button
          class="pagination__btn"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="emit('page-change', currentPage - 1)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="pagination__pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination__page"
            :class="{ 'pagination__page--active': page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="emit('page-change', page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="pagination__btn"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="emit('page-change', currentPage + 1)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </nav>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.league-list__container {
  background: $color-background-white;
  border: 1px solid $color-border;
  border-radius: $border-radius-md;
  overflow: hidden;
}

.league-list__toolbar {
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $color-border-light;
  background: $color-background;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-sm;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-md;
  }
}

.league-list__count {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.league-list__page-size {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.league-list__page-size-label {
  font-size: $font-size-xs;
  color: $color-text-secondary;
}

.league-list__page-size-select {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  font-family: inherit;
  color: $color-text-primary;
  background: $color-background-white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.league-table {
  width: 100%;
  border-collapse: collapse;
}

.league-table__head {
  background: $color-background;
}

.league-table__th {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid $color-border;

  &:last-child {
    width: 48px;
  }
}

// Pagination
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-md;
  border-top: 1px solid $color-border-light;
  background: $color-background;
}

.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  background: $color-background-white;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: $color-primary;
    color: $color-primary;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.pagination__pages {
  display: flex;
  gap: $spacing-xs;
}

.pagination__page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 $spacing-sm;
  border: 1px solid transparent;
  border-radius: $border-radius-sm;
  background: none;
  color: $color-text-secondary;
  font-size: $font-size-sm;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: $color-background;
  }

  &--active {
    background: $color-primary;
    color: white;
    border-color: $color-primary;

    &:hover {
      background: $color-primary-hover;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

// Empty state
.league-list__empty {
  text-align: center;
  padding: $spacing-2xl $spacing-lg;
  background: $color-background-white;
  border: 1px solid $color-border;
  border-radius: $border-radius-md;
}

.league-list__empty-icon {
  width: 48px;
  height: 48px;
  background: $color-background;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-md;
  color: $color-text-placeholder;
}

.league-list__empty-title {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin: 0 0 $spacing-xs;
}

.league-list__empty-text {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
}
</style>
