import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  // State
  const isCollapsed = ref(false)
  const isHovered = ref(false)

  // Getters
  const sidebarWidth = computed(() => {
    if (isCollapsed.value && !isHovered.value) {
      return 'w-16' // Collapsed width (64px)
    }
    return 'w-64' // Expanded width (256px)
  })

  const shouldShowText = computed(() => {
    return !isCollapsed.value || isHovered.value
  })

  const sidebarClasses = computed(() => ({
    width: isCollapsed.value && !isHovered.value ? 'w-16' : 'w-64',
    transition: 'transition-all duration-300 ease-in-out'
  }))

  // Actions
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed.value))
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    isCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }

  const setHovered = (hovered: boolean) => {
    isHovered.value = hovered
  }

  const initializeSidebar = () => {
    const stored = localStorage.getItem('sidebarCollapsed')
    if (stored !== null) {
      isCollapsed.value = JSON.parse(stored)
    }
  }

  return {
    // State
    isCollapsed,
    isHovered,
    // Getters
    sidebarWidth,
    shouldShowText,
    sidebarClasses,
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    setHovered,
    initializeSidebar
  }
})
