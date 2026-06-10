<script setup lang="ts">
import Header from "./components/Header.vue";
import Table from "./components/Table.vue";
import TableInventory from "./components/TableInventory.vue";
import ValueInfo from "./components/ValueInfo.vue";
import Toast from "primevue/toast";
import { storeToRefs } from "pinia";
import { useDataSharingService } from "@/api/data-sharing.service";

const { buscar } = storeToRefs(useDataSharingService());
</script>

<template>
  <Toast />
  <div class="app-layout">
    <div class="app-container">
      <Header />
      <main class="app-main">
        <ValueInfo />
        <Table v-if="!buscar" />
        <TableInventory v-else />
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
