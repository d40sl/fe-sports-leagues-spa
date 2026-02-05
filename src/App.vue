<script setup lang="ts">
// App component - will be implemented in subsequent slices
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
      <p>Vue 3 project scaffold complete. Implementation coming next.</p>
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
</style>
