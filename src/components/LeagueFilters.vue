<script setup lang="ts">
defineProps<{
  searchQuery: string
  selectedSport: string
  sports: string[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedSport': [value: string]
}>()
</script>

<template>
  <div class="league-filters">
    <div class="league-filters__field">
      <label for="search-input" class="league-filters__label">Search</label>
      <div class="input-wrapper">
        <svg
          class="input-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-input"
          type="text"
          class="input"
          :value="searchQuery"
          placeholder="Search leagues..."
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="input-clear"
          aria-label="Clear search"
          @click="emit('update:searchQuery', '')"
        >
          &times;
        </button>
      </div>
    </div>

    <div class="league-filters__field league-filters__field--select">
      <label for="sport-select" class="league-filters__label">Sport</label>
      <div class="select-wrapper">
        <select
          id="sport-select"
          class="select"
          :value="selectedSport"
          @change="emit('update:selectedSport', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All sports</option>
          <option v-for="sport in sports" :key="sport" :value="sport">
            {{ sport }}
          </option>
        </select>
        <svg
          class="select-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.league-filters {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  @media (min-width: $breakpoint-md) {
    flex-direction: row;
    align-items: flex-end;
  }
}

.league-filters__field {
  flex: 1;
  min-width: 0;

  @media (min-width: $breakpoint-md) {
    max-width: 320px;
  }

  &--select {
    @media (min-width: $breakpoint-md) {
      max-width: 200px;
    }
  }
}

.league-filters__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-xs;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: $spacing-sm;
  color: $color-text-placeholder;
  pointer-events: none;
}

.input {
  width: 100%;
  height: 36px;
  padding: 0 $spacing-md 0 36px;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $color-text-primary;
  background: $color-background-white;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &::placeholder {
    color: $color-text-placeholder;
  }

  &:hover {
    border-color: color.adjust($color-border, $lightness: -10%);
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }
}

.input-clear {
  position: absolute;
  right: $spacing-xs;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: $color-text-placeholder;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: $border-radius-sm;

  &:hover {
    color: $color-text-secondary;
    background: $color-background;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.select-wrapper {
  position: relative;
}

.select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 $spacing-sm;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $color-text-primary;
  background: $color-background-white;
  appearance: none;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: color.adjust($color-border, $lightness: -10%);
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }
}

.select-arrow {
  position: absolute;
  right: $spacing-sm;
  top: 50%;
  transform: translateY(-50%);
  color: $color-text-placeholder;
  pointer-events: none;
}
</style>
