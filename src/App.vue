<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LeagueFilters from './components/LeagueFilters.vue'
import LeagueList from './components/LeagueList.vue'
import BadgeModal from './components/BadgeModal.vue'
import { useLeagues } from './composables/useLeagues'
import type { League } from './types/league'

const {
  state,
  searchQuery,
  selectedSport,
  currentPage,
  pageSize,
  sportTypes,
  filteredLeagues,
  paginatedLeagues,
  loadLeagues,
  setPageSize,
  goToPage
} = useLeagues()

const selectedLeague = ref<League | null>(null)

function handleLeagueSelect(league: League) {
  selectedLeague.value = league
}

function closeModal() {
  selectedLeague.value = null
}

onMounted(() => {
  loadLeagues()
})
</script>

<template>
  <div id="app" class="app">
    <header class="app-header">
      <div class="app-header__inner">
        <h1 class="app-title">Sports Leagues</h1>
        <span class="app-subtitle">League Directory</span>
      </div>
    </header>

    <main class="app-main">
      <!-- Loading State -->
      <div v-if="state.status === 'loading'" class="app-loading">
        <div class="spinner" role="status" aria-label="Loading leagues">
          <span class="spinner__circle"></span>
        </div>
        <p>Loading leagues...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="state.status === 'error'" class="app-error" role="alert">
        <div class="app-error__icon">!</div>
        <p class="app-error__message">{{ state.error }}</p>
        <button class="btn btn--danger" type="button" @click="loadLeagues">Try Again</button>
      </div>

      <!-- Success State -->
      <template v-else-if="state.status === 'success'">
        <LeagueFilters
          :search-query="searchQuery"
          :selected-sport="selectedSport"
          :sports="sportTypes"
          @update:search-query="searchQuery = $event"
          @update:selected-sport="selectedSport = $event"
        />

        <LeagueList
          :leagues="paginatedLeagues"
          :total-count="filteredLeagues.length"
          :current-page="currentPage"
          :page-size="pageSize"
          @select="handleLeagueSelect"
          @page-change="goToPage"
          @page-size-change="setPageSize"
        />
      </template>

      <!-- Badge Modal -->
      <BadgeModal :visible="selectedLeague !== null" :league="selectedLeague" @close="closeModal" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: $color-background-white;
  border-bottom: 1px solid $color-border;
  padding: $spacing-md $spacing-lg;
}

.app-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: $spacing-sm;
}

.app-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin: 0;
  letter-spacing: -0.01em;
}

.app-subtitle {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.app-main {
  flex: 1;
  padding: $spacing-lg;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-xl $spacing-lg;
  }
}

// Loading State
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
  color: $color-text-secondary;

  p {
    margin-top: $spacing-md;
    font-size: $font-size-sm;
  }
}

// Error State
.app-error {
  text-align: center;
  padding: $spacing-xl;
  background: $color-background-white;
  border: 1px solid $color-border;
  border-radius: $border-radius-md;
  max-width: 400px;
  margin: $spacing-xl auto;
}

.app-error__icon {
  width: 40px;
  height: 40px;
  background: #fef2f2;
  color: $color-danger;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: $font-weight-semibold;
  font-size: $font-size-lg;
  margin: 0 auto $spacing-md;
}

.app-error__message {
  color: $color-text-regular;
  margin-bottom: $spacing-md;
  font-size: $font-size-sm;
}
</style>
