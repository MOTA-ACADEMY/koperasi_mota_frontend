<template>
  <header class="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-card">
    <div class="flex h-full items-center gap-2 px-3 sm:px-4">
      <!-- Satu tombol: mobile = buka drawer, desktop = ciutkan/lebarkan sidebar -->
      <button
        type="button"
        class="icon-btn"
        :aria-label="labelToggle"
        :aria-expanded="isMobile ? mobileMenuOpen : !sidebarStore.isCollapsed"
        @click="toggleSidebar"
      >
        <Menu class="h-5 w-5 md:hidden" />
        <PanelLeftClose v-if="!sidebarStore.isCollapsed" class="hidden h-5 w-5 md:block" />
        <PanelLeftOpen v-else class="hidden h-5 w-5 md:block" />
      </button>

      <RouterLink to="/dashboard" class="flex shrink-0 items-center gap-2.5 rounded-lg px-1 py-1">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm">
          <Handshake class="h-[18px] w-[18px]" />
        </span>
        <span class="hidden text-base font-semibold tracking-tight text-foreground sm:inline">Koperasi Mota</span>
      </RouterLink>

      <!-- Koperasi aktif (di layar kecil tampil di bawah sidebar) -->
      <RouterLink
        v-if="userStore.koperasi"
        to="/pilih-koperasi"
        :title="userStore.koperasiList.length > 1 ? 'Ganti koperasi' : userStore.koperasi.nama"
        class="ml-2 hidden min-w-0 max-w-[18rem] items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted md:inline-flex"
      >
        <Building2 class="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
        <span class="truncate font-medium">{{ userStore.koperasi.nama }}</span>
        <ChevronsUpDown v-if="userStore.koperasiList.length > 1" class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </RouterLink>

      <div class="ml-auto flex items-center gap-1">
        <button
          type="button"
          class="icon-btn"
          :aria-label="darkModeStore.isDarkMode ? 'Gunakan mode terang' : 'Gunakan mode gelap'"
          :title="darkModeStore.isDarkMode ? 'Mode terang' : 'Mode gelap'"
          @click="darkModeStore.toggleDarkMode"
        >
          <Sun v-if="darkModeStore.isDarkMode" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>

        <!-- Menu pengguna -->
        <div ref="menuRoot" class="relative ml-1">
          <button
            type="button"
            class="flex items-center gap-2.5 rounded-lg p-1 pr-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300">
              {{ inisial }}
            </span>
            <span class="hidden text-left leading-tight lg:block">
              <span class="block max-w-[10rem] truncate text-sm font-medium text-foreground">{{ userStore.user.name }}</span>
              <span class="block max-w-[10rem] truncate text-xs text-muted-foreground">{{ userStore.roleLabel || 'Pengguna' }}</span>
            </span>
            <ChevronDown class="hidden h-4 w-4 text-muted-foreground lg:block" />
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition duration-75 ease-in"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="menuOpen"
              role="menu"
              class="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              <div class="border-b border-border px-4 py-3">
                <p class="truncate text-sm font-medium text-foreground">{{ userStore.user.name }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ userStore.user.email }}</p>
                <p v-if="userStore.roleLabel" class="mt-1.5 truncate text-xs text-green-700 dark:text-green-400">
                  {{ userStore.roleLabel }} · {{ userStore.koperasi?.nama }}
                </p>
              </div>
              <div class="p-1.5">
                <RouterLink to="/pilih-koperasi" role="menuitem" class="menu-item" @click="menuOpen = false">
                  <Building2 class="h-4 w-4" />
                  {{ userStore.koperasiList.length > 1 ? 'Ganti koperasi' : 'Koperasi saya' }}
                </RouterLink>
                <button type="button" role="menuitem" class="menu-item text-red-600 dark:text-red-400" @click="handleLogout">
                  <LogOut class="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  Building2,
  ChevronDown,
  ChevronsUpDown,
  Handshake,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun
} from 'lucide-vue-next'
import { useDarkModeStore, useUserStore, useSidebarStore } from '@/stores'

const props = defineProps<{
  mobileMenuOpen: boolean
}>()

const emit = defineEmits<{
  'toggle-mobile-menu': []
}>()

const router = useRouter()
const darkModeStore = useDarkModeStore()
const userStore = useUserStore()
const sidebarStore = useSidebarStore()

const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth < 768)

const inisial = computed(() =>
  (userStore.user.name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase())
    .join('')
)

const labelToggle = computed(() => {
  if (isMobile.value) return props.mobileMenuOpen ? 'Tutup menu' : 'Buka menu'
  return sidebarStore.isCollapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'
})

const toggleSidebar = () => {
  if (window.innerWidth < 768) {
    emit('toggle-mobile-menu')
  } else {
    sidebarStore.toggleSidebar()
  }
}

const handleLogout = async () => {
  menuOpen.value = false
  await userStore.logout()
  router.push('/login')
}

const onClickOutside = (event: MouseEvent) => {
  if (menuOpen.value && menuRoot.value && !menuRoot.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') menuOpen.value = false
}
const onResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
@reference "../../assets/main.css";

.icon-btn {
  @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40;
}

.menu-item {
  @apply flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted;
}
</style>
