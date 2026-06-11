<script setup lang="ts">
import Card from "primevue/card";
</script>

<template>
  <Card class="table-card">
    <template v-if="$slots.title" #title>
      <span class="table-card-title">
        <slot name="title" />
      </span>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>

<style scoped src="@/assets/styles/table.css"></style>
