<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { fetchLeagueBadge } from '@/api/leagues'
import { BADGE_PLACEHOLDER } from '@/constants/api'
import type { League, SeasonBadge, AsyncState } from '@/types/league'

const props = defineProps<{
  visible: boolean
  league: League | null
}>()

const emit = defineEmits<{
  close: []
}>()

const modalContent = ref<HTMLElement | null>(null)
const badge = ref<SeasonBadge | null>(null)
const state = ref<AsyncState<SeasonBadge>>({ status: 'idle' })

async function loadBadge() {
  if (!props.league) return

  state.value = { status: 'loading' }
  badge.value = null

  try {
    const data = await fetchLeagueBadge(props.league.idLeague)
    badge.value = data
    state.value = data ? { status: 'success', data } : { status: 'success', data: null as unknown as SeasonBadge }
  } catch (err) {
    state.value = {
      status: 'error',
      error: err instanceof Error ? err.message : 'Failed to load badge. Please try again.'
    }
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = BADGE_PLACEHOLDER
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Watch for league changes to load badge
watch(
  () => props.league,
  (newLeague) => {
    if (newLeague) {
      loadBadge()
    } else {
      badge.value = null
      state.value = { status: 'idle' }
    }
  },
  { immediate: true }
)

// Focus management and body scroll lock
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      // Focus modal content
      setTimeout(() => {
        modalContent.value?.focus()
      }, 0)
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="league ? 'badge-modal-title' : undefined"
      @click.self="emit('close')"
      @keydown="handleKeydown"
    >
      <div ref="modalContent" class="modal" tabindex="-1">
        <div class="modal__header">
          <div v-if="league">
            <h2 id="badge-modal-title" class="modal__title">{{ league.strLeague }}</h2>
            <span class="modal__subtitle">{{ league.strSport }}</span>
          </div>
          <button
            class="modal__close"
            type="button"
            aria-label="Close modal"
            @click="emit('close')"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal__body">
          <!-- Loading State -->
          <div v-if="state.status === 'loading'" class="modal__loading">
            <div class="spinner">
              <span class="spinner__circle"></span>
            </div>
            <p>Loading badge...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="state.status === 'error'" class="modal__error">
            <p>{{ state.error }}</p>
            <button class="btn btn--secondary" type="button" @click="loadBadge">Try Again</button>
          </div>

          <!-- Success State -->
          <div v-else-if="state.status === 'success'" class="modal__content">
            <div class="badge-container">
              <img
                v-if="badge && badge.strBadge"
                :src="badge.strBadge"
                :alt="`${league?.strLeague} ${badge.strSeason} badge`"
                class="badge-image"
                @error="handleImageError"
              />
              <div v-else class="badge-placeholder">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span>No badge available</span>
              </div>
            </div>
            <p v-if="badge" class="badge-season">Season {{ badge.strSeason }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 31, 54, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  z-index: 1000;
}

.modal {
  background: $color-background-white;
  border-radius: $border-radius-lg;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:focus {
    outline: none;
  }
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $color-border-light;
}

.modal__title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin: 0;
}

.modal__subtitle {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin-top: 2px;
  display: block;
}

.modal__close {
  background: none;
  border: none;
  color: $color-text-placeholder;
  cursor: pointer;
  padding: $spacing-xs;
  margin: -$spacing-xs;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $color-text-secondary;
    background: $color-background;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.modal__body {
  padding: $spacing-lg;
  overflow-y: auto;
}

.modal__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg;
  color: $color-text-secondary;

  p {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
  }
}

.modal__error {
  text-align: center;
  padding: $spacing-md;
  background: $color-background;
  border-radius: $border-radius-sm;

  p {
    color: $color-text-regular;
    font-size: $font-size-sm;
    margin: 0 0 $spacing-md;
  }
}

.modal__content {
  text-align: center;
}

.badge-container {
  background: $color-background;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-sm;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.badge-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.badge-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  color: $color-text-placeholder;

  span {
    font-size: $font-size-sm;
  }
}

.badge-season {
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-secondary;
}
</style>
