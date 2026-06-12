<script setup lang="ts">
import Button from 'primevue/button';
import { useTheme } from '@/composables/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <Button
    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    outlined
    rounded
    size="small"
    @click="toggleTheme"
    class="theme-toggle"
  />
</template>

<style scoped>
.theme-toggle {
  transition: all 0.3s ease;
}

.theme-toggle :deep(.p-button) {
  border-radius: 8px;
}
</style>
