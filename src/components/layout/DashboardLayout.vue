<template>
  <div :class="[
    'min-h-screen flex flex-col transition-all duration-300',
    darkModeStore.isDarkMode ? 'dark' : ''
  ]">
    <!-- Navbar -->
    <Navbar @toggle-mobile-menu="toggleMobileMenu" />
    
    <!-- Sidebar -->
    <Sidebar 
      :is-mobile-menu-open="isMobileMenuOpen" 
      @close-mobile-menu="closeMobileMenu" 
    />
    
    <!-- Main Content Wrapper -->
    <div class="flex flex-col flex-1 pt-16">
      <!-- Main Content -->
      <main :class="[
        'flex-1 transition-all duration-300',
        sidebarStore.isCollapsed ? 'md:ml-16' : 'md:ml-64'
      ]">
        <router-view />
      </main>
      
      <!-- Bottom Bar -->
      <BottomBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDarkModeStore, useSidebarStore, useUserStore } from '@/stores'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import BottomBar from '@/components/layout/BottomBar.vue'

const darkModeStore = useDarkModeStore()
const sidebarStore = useSidebarStore()
const userStore = useUserStore()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  // Initialize dark mode from localStorage or system preference
  darkModeStore.initializeDarkMode()
  
  // Initialize sidebar state from localStorage
  sidebarStore.initializeSidebar()

  // Segarkan menu & hak akses dari backend (role bisa diubah admin sejak login terakhir).
  // Gagal di sini tidak fatal: sidebar tetap memakai menu dari sesi tersimpan.
  userStore.refreshSession().catch(() => {})
  
  // Close mobile menu when clicking outside on larger screens
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      isMobileMenuOpen.value = false
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>
