<template>
  <div class="min-h-screen bg-background text-foreground">
    <Navbar :mobile-menu-open="mobileMenuOpen" @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen" />

    <Sidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />

    <!-- Konten: padding kiri mengikuti lebar sidebar (desktop) — transisi hanya pada padding -->
    <div
      class="flex min-h-screen flex-col pt-16 transition-[padding] duration-200 ease-out"
      :class="sidebarStore.isCollapsed ? 'md:pl-[4.5rem]' : 'md:pl-64'"
    >
      <main class="flex-1">
        <router-view />
      </main>

      <footer class="border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {{ tahun }} Koperasi Mota
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkModeStore, useSidebarStore, useUserStore } from '@/stores'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const darkModeStore = useDarkModeStore()
const sidebarStore = useSidebarStore()
const userStore = useUserStore()
const route = useRoute()

const mobileMenuOpen = ref(false)
const tahun = new Date().getFullYear()

// Drawer mobile otomatis tertutup setelah berpindah halaman.
watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
})

const onResize = () => {
  if (window.innerWidth >= 768) mobileMenuOpen.value = false
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') mobileMenuOpen.value = false
}

onMounted(() => {
  darkModeStore.initializeDarkMode()
  sidebarStore.initializeSidebar()

  // Segarkan menu & hak akses dari backend (role bisa diubah admin sejak login terakhir).
  // Gagal di sini tidak fatal: sidebar tetap memakai menu dari sesi tersimpan.
  userStore.refreshSession().catch(() => {})

  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
})
</script>
