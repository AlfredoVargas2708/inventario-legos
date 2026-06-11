<script setup lang="ts">
import SearchHeader from "@/components/search/SearchHeader.vue";
import ValueInfo from "@/components/info/ValueInfo.vue";
</script>

<template>
  <div class="app-layout">
    <div class="app-container">
      <SearchHeader />
      <main class="app-main">
        <ValueInfo />
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding: 1rem;
}

.app-container {
  width: 100%;
  margin: 0 auto;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .app-layout {
    padding: 1.5rem 2rem 2rem;
  }

  .app-main {
    gap: 1.25rem;
  }
}
</style>
