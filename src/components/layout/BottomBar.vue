<template>
  <footer :class="[
    'border-t transition-all duration-300 z-30 mt-auto',
    darkModeStore.isDarkMode 
      ? 'bg-gray-900 border-gray-700 text-gray-300' 
      : 'bg-white border-gray-200 text-gray-600',
    // Adaptive margin based on sidebar state
    sidebarStore.isCollapsed ? 'md:ml-16' : 'md:ml-64'
  ]">
    <div class="flex items-center justify-between h-12 px-6">
      <!-- Left side - Copyright -->
      <div class="flex items-center space-x-4">
        <p :class="[
          'text-sm transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          © {{ currentYear }} Koperasi Mota. All rights reserved.
        </p>
        <Separator orientation="vertical" class="h-4" />
        <p :class="[
          'text-xs transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          Version {{ version }}
        </p>
      </div>

      <!-- Center - Status (hidden on mobile) -->
      <div class="hidden md:flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span :class="[
            'text-xs transition-colors duration-300',
            darkModeStore.themeClasses.text.secondary
          ]">
            System Online
          </span>
        </div>
        <Separator orientation="vertical" class="h-4" />
        <span :class="[
          'text-xs transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          Last updated: {{ lastUpdated }}
        </span>
      </div>

      <!-- Right side - Links -->
      <div class="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          class="text-xs p-1 h-auto hover:scale-105 transition-all duration-300"
          :class="darkModeStore.isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
        >
          Privacy Policy
        </Button>
        <Separator orientation="vertical" class="h-4" />
        <Button
          variant="ghost"
          size="sm"
          class="text-xs p-1 h-auto hover:scale-105 transition-all duration-300"
          :class="darkModeStore.isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
        >
          Terms of Service
        </Button>
        <Separator orientation="vertical" class="h-4" />
        <Button
          variant="ghost"
          size="sm"
          class="text-xs p-1 h-auto hover:scale-105 transition-all duration-300"
          :class="darkModeStore.isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
        >
          Contact Support
        </Button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDarkModeStore, useSidebarStore } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Separator from '@/components/ui/Separator.vue'

const darkModeStore = useDarkModeStore()
const sidebarStore = useSidebarStore()

const currentYear = new Date().getFullYear()
const version = ref('1.0.0')

const lastUpdated = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
})
</script>
