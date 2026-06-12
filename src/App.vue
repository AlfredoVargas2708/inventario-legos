<script setup lang="ts">
import { onMounted } from 'vue';
import Toast from "primevue/toast";
import { useTheme } from '@/composables/useTheme';

const { initializeTheme } = useTheme();

onMounted(() => {
  initializeTheme();
});
</script>

<template>
  <Toast />
  <RouterView />
</template>
