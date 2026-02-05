<script setup lang="ts">
import type { League } from '@/types/league'

defineProps<{
  league: League
}>()

const emit = defineEmits<{
  select: [league: League]
}>()
</script>

<template>
  <tr
    class="league-row"
    tabindex="0"
    role="button"
    :aria-label="`View badge for ${league.strLeague}`"
    @click="emit('select', league)"
    @keydown.enter="emit('select', league)"
    @keydown.space.prevent="emit('select', league)"
  >
    <td class="league-row__name">
      <span class="league-row__primary">{{ league.strLeague }}</span>
      <span v-if="league.strLeagueAlternate" class="league-row__secondary">
        {{ league.strLeagueAlternate }}
      </span>
    </td>
    <td class="league-row__sport">
      <span class="sport-badge">{{ league.strSport }}</span>
    </td>
    <td class="league-row__action">
      <span class="league-row__arrow" aria-hidden="true">&rarr;</span>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.league-row {
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: $color-background;
  }

  &:focus {
    outline: none;
    background-color: $color-background;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: -2px;
  }

  td {
    padding: $spacing-sm $spacing-md;
    border-bottom: 1px solid $color-border-light;
    vertical-align: middle;

    @media (min-width: $breakpoint-md) {
      padding: $spacing-md;
    }
  }
}

.league-row__name {
  width: 60%;
}

.league-row__primary {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-primary;

  @media (min-width: $breakpoint-md) {
    font-size: $font-size-base;
  }
}

.league-row__secondary {
  display: block;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;

  @media (min-width: $breakpoint-md) {
    max-width: 400px;
  }
}

.league-row__sport {
  width: 30%;
}

.sport-badge {
  display: inline-block;
  padding: 2px $spacing-sm;
  background: $color-background;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
}

.league-row__action {
  width: 10%;
  text-align: right;
}

.league-row__arrow {
  color: $color-text-placeholder;
  font-size: $font-size-lg;
  transition:
    color 0.1s ease,
    transform 0.1s ease;

  .league-row:hover & {
    color: $color-primary;
    transform: translateX(2px);
  }
}
</style>
