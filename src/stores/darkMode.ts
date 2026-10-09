import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
  // State
  const isDarkMode = ref(false)

  // Initialize from localStorage or system preference
  const initializeDarkMode = () => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      isDarkMode.value = JSON.parse(stored)
    } else {
      // Force light mode by default for debugging
      isDarkMode.value = false
      // Explicitly save to localStorage to override system preference
      localStorage.setItem('darkMode', 'false')
    }
    applyDarkMode()
  }

  // Getters
  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')
  const themeClasses = computed(() => ({
    navbar: isDarkMode.value ? 'bg-gray-900' : 'bg-white',
    sidebar: isDarkMode.value ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
    main: isDarkMode.value ? 'bg-gray-800' : 'bg-gray-50',
    card: isDarkMode.value ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: isDarkMode.value ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode.value ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode.value ? 'text-gray-400' : 'text-gray-500'
    }
  }))

  // Actions
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
    applyDarkMode()
  }

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
    localStorage.setItem('darkMode', JSON.stringify(value))
    applyDarkMode()
  }

  const applyDarkMode = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    // State
    isDarkMode,
    // Getters
    currentTheme,
    themeClasses,
    // Actions
    toggleDarkMode,
    setDarkMode,
    initializeDarkMode
  }
})
