<template>
  <aside :class="[
    'fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 border-r z-40',
    darkModeStore.themeClasses.sidebar,
    sidebarStore.sidebarWidth,
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]"
  @mouseenter="sidebarStore.setHovered(true)"
  @mouseleave="sidebarStore.setHovered(false)"
  >
    <div class="flex flex-col h-full">
      <!-- Navigation Links - Scrollable Container -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto hover:overflow-y-scroll">
        <div v-for="item in navigationStore.navigationItems" :key="item.id">
          <!-- Section Header -->
          <div v-if="item.type === 'header'" 
               :class="[
                 'px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity duration-300',
                 darkModeStore.themeClasses.text.muted,
                 sidebarStore.shouldShowText ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
               ]">
            {{ item.name }}
          </div>
          
          <!-- Navigation Link -->
          <router-link
            v-else-if="item.path"
            :to="item.path"
            role="button"
            :class="[
              'flex items-center text-sm font-medium transition-all duration-300 group relative rounded-lg cursor-pointer',
              'hover:scale-105 hover:shadow-md transform active:scale-95',
              // Dynamic padding based on sidebar state - ensure icon is covered
              sidebarStore.isCollapsed && !sidebarStore.isHovered 
                ? 'px-3 py-2.5 mx-1 justify-center' 
                : 'px-3 py-2.5',
              // Selection colors
              $route.path === item.path
                ? darkModeStore.isDarkMode 
                  ? 'bg-green-900 text-white shadow-lg' 
                  : 'bg-green-100 text-green-900 shadow-lg'
                : darkModeStore.isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <component 
              :is="item.icon" 
              :class="[
                'h-5 w-5 transition-all duration-300 group-hover:scale-110 flex-shrink-0',
                sidebarStore.shouldShowText ? 'mr-3' : ''
              ]" 
            />
            
            <!-- Text content with smooth transition -->
            <div :class="[
              'flex items-center justify-between flex-1 transition-all duration-300',
              sidebarStore.shouldShowText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            ]">
              <span class="whitespace-nowrap">{{ item.name }}</span>
              <Badge 
                v-if="item.badge && sidebarStore.shouldShowText" 
                :variant="$route.path === item.path ? 'default' : 'secondary'"
                class="text-xs ml-auto"
              >
                {{ item.badge }}
              </Badge>
            </div>

            <!-- Tooltip for collapsed state -->
            <div v-if="sidebarStore.isCollapsed && !sidebarStore.isHovered"
                 :class="[
                   'absolute left-full ml-2 px-2 py-1 text-sm rounded opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50',
                   'group-hover:opacity-100',
                   $route.path === item.path
                     ? 'bg-green-700 text-white'
                     : 'bg-gray-900 text-white'
                 ]">
              {{ item.name }}
              <Badge v-if="item.badge" variant="secondary" class="ml-2 text-xs">
                {{ item.badge }}
              </Badge>
            </div>
          </router-link>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          :class="`w-full transition-all duration-300 ${
            darkModeStore.isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'hover:bg-gray-50'
          } ${
            sidebarStore.shouldShowText ? 'justify-start hover:scale-105' : 'justify-center p-2'
          }`"
        >
          <HelpCircle :class="[
            'h-4 w-4 transition-all duration-300',
            sidebarStore.shouldShowText ? 'mr-2' : ''
          ]" />
          <span v-if="sidebarStore.shouldShowText" class="transition-opacity duration-300">
            Help & Support
          </span>
        </Button>
      </div>
    </div>
  </aside>

  <!-- Mobile Menu Overlay -->
  <div
    v-if="isMobileMenuOpen"
    role="button"
    tabindex="0"
    class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden cursor-pointer transition-opacity duration-300 hover:bg-opacity-60"
    @click="$emit('close-mobile-menu')"
    @keydown.enter="$emit('close-mobile-menu')"
    @keydown.space="$emit('close-mobile-menu')"
  />
</template>

<script setup lang="ts">
import {
  HelpCircle
} from 'lucide-vue-next'
import { useDarkModeStore, useSidebarStore, useNavigationStore } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

defineProps<{
  isMobileMenuOpen: boolean
}>()

defineEmits<{
  'close-mobile-menu': []
}>()

const darkModeStore = useDarkModeStore()
const sidebarStore = useSidebarStore()
const navigationStore = useNavigationStore()
</script>

<style scoped>
/* Custom scrollbar styling */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Dark mode scrollbar */
.dark nav::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark nav::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}

/* Firefox scrollbar */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.dark nav {
  scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}
</style>
