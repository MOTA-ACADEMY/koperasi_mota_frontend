<template>
  <div id="app" class="min-h-screen">
    <RouterView />
    <!-- Posisi responsif supaya tidak menutupi tombol aksi di panel (PanelSheet) -->
    <Toaster position="responsif" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useDarkModeStore } from '@/stores'
import Toaster from '@/components/ui/Toaster.vue'

const darkModeStore = useDarkModeStore()

onMounted(() => {
  // Initialize dark mode on app start
  darkModeStore.initializeDarkMode()
})

// Watch for dark mode changes and ensure they're applied
watch(
  () => darkModeStore.isDarkMode,
  (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)
</script>
