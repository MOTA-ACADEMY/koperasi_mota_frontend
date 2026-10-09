<template>
  <div class="p-4 border rounded-lg">
    <h3 class="text-lg font-semibold mb-2">Dark Mode Debug</h3>
    <div class="space-y-2">
      <p><strong>isDarkMode store value:</strong> {{ isDarkMode }}</p>
      <p><strong>HTML class list:</strong> {{ htmlClasses }}</p>
      <p><strong>LocalStorage value:</strong> {{ localStorageValue }}</p>
      <p><strong>System preference:</strong> {{ systemPreference }}</p>
      <button 
        @click="toggleDarkMode" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle Dark Mode
      </button>
      <button 
        @click="clearLocalStorage" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
      >
        Clear LocalStorage
      </button>
      <button 
        @click="forceLightMode" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
      >
        Force Light Mode
      </button>
      <button 
        @click="hardRefresh" 
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2"
      >
        Hard Refresh
      </button>
      
      <!-- Test badges -->
      <div class="mt-4">
        <h4 class="font-semibold">Badge Test:</h4>
        <div class="flex gap-2 mt-2">
          <Badge variant="green">Green Badge</Badge>
          <Badge variant="red">Red Badge</Badge>
          <Badge variant="default">Default Badge</Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDarkModeStore } from '../stores/darkMode'
import Badge from './ui/Badge.vue'

const darkModeStore = useDarkModeStore()
const { isDarkMode, toggleDarkMode } = darkModeStore

const htmlClasses = ref('')
const localStorageValue = ref('')
const systemPreference = ref(false)

const updateDebugInfo = () => {
  htmlClasses.value = document.documentElement.className
  localStorageValue.value = localStorage.getItem('darkMode') || 'null'
  systemPreference.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

const clearLocalStorage = () => {
  localStorage.removeItem('darkMode')
  // Also force light mode immediately
  document.documentElement.classList.remove('dark')
  location.reload()
}

const forceLightMode = () => {
  darkModeStore.setDarkMode(false)
  document.documentElement.classList.remove('dark')
  localStorage.setItem('darkMode', 'false')
  updateDebugInfo()
}

const hardRefresh = () => {
  // Clear all storage
  localStorage.clear()
  sessionStorage.clear()
  
  // Force reload with cache clear
  window.location.reload()
}

onMounted(() => {
  updateDebugInfo()
  
  // Watch for changes
  const observer = new MutationObserver(() => {
    updateDebugInfo()
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>