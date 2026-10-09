<template>
  <nav :class="[
    'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
    darkModeStore.themeClasses.navbar,
    'border-b',
    darkModeStore.isDarkMode ? 'border-gray-700' : 'border-gray-200'
  ]">
    <div class="flex items-center justify-between h-full px-6">
      <!-- Left side - Logo and Title -->
      <div class="flex items-center space-x-4">
        <!-- Sidebar Toggle Button -->
        <Button
          variant="ghost"
          size="sm"
          @click="sidebarStore.toggleSidebar"
          class="p-2 hover:scale-110 transition-all duration-300 hidden md:flex text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
        >
          <Menu v-if="!sidebarStore.isCollapsed" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </Button>
        
        <div class="flex items-center space-x-3">
          <Avatar class="h-8 w-8">
            <AvatarFallback class="bg-green-600 text-white font-bold text-sm">KM</AvatarFallback>
          </Avatar>
          <h1 class="text-xl font-bold transition-colors duration-300 text-green-700 dark:text-green-400">
            Koperasi Mota
          </h1>
        </div>
        <!-- Koperasi aktif — klik untuk pindah koperasi -->
        <RouterLink
          v-if="userStore.koperasi"
          to="/pilih-koperasi"
          :title="userStore.koperasiList.length > 1 ? 'Ganti koperasi' : userStore.koperasi.nama"
          class="hidden sm:inline-flex items-center gap-1.5 max-w-[16rem] rounded-full border border-green-600 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
        >
          <Building2 class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">{{ userStore.koperasi.nama }}</span>
          <ChevronsUpDown v-if="userStore.koperasiList.length > 1" class="h-3.5 w-3.5 shrink-0 opacity-70" />
        </RouterLink>
      </div>

      <!-- Right side - Actions -->
      <div class="flex items-center space-x-3">
        <!-- Notifications -->
        <Button
          variant="ghost"
          size="sm"
          class="relative p-2 hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
        >
          <Bell class="h-5 w-5" />
          <span class="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold leading-none">
            3
          </span>
        </Button>

        <!-- Dark Mode Toggle -->
        <Button
          variant="ghost"
          size="sm"
          @click="darkModeStore.toggleDarkMode"
          class="p-2 hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
        >
          <Moon v-if="!darkModeStore.isDarkMode" class="h-5 w-5" />
          <Sun v-else class="h-5 w-5" />
        </Button>

        <!-- Settings -->
        <Button
          variant="ghost"
          size="sm"
          class="p-2 hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
        >
          <Settings class="h-5 w-5" />
        </Button>

        <!-- User Profile -->
        <div class="flex items-center space-x-2">
          <Avatar class="h-8 w-8 cursor-pointer hover:scale-110 transition-all duration-300">
            <!-- <AvatarImage src="/user-avatar.jpg" alt="User" /> -->
            <AvatarFallback class="font-semibold text-sm">
              <CircleUser class="h-4 w-4 text-green-100 dark:text-green-900" />
            </AvatarFallback>
          </Avatar>
          <div class="hidden lg:block">
            <p class="text-sm font-medium text-green-700 dark:text-green-400">
              {{ userStore.fullUserInfo.displayName }}
            </p>
            <p class="text-xs text-green-600 dark:text-green-500">
              {{ userStore.user.role === 'admin' ? 'Admin' : userStore.user.role === 'staf' ? 'Staf' : '' }}
            </p>
          </div>
        </div>

        <!-- Logout -->
        <Button
          variant="ghost"
          size="sm"
          @click="handleLogout"
          class="p-2 hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
        >
          <LogOut class="h-5 w-5" />
        </Button>

        <!-- Mobile Menu Button -->
        <Button
          variant="ghost"
          size="sm"
          class="md:hidden p-2 hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
          @click="$emit('toggle-mobile-menu')"
        >
          <Menu class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  Bell,
  Settings,
  Moon,
  Sun,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  CircleUser,
  LogOut,
  Building2,
  ChevronsUpDown
} from 'lucide-vue-next'
import { useRouter, RouterLink } from 'vue-router'
import { useDarkModeStore, useUserStore, useSidebarStore } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'

defineEmits<{
  'toggle-mobile-menu': []
}>()

const router = useRouter()
const darkModeStore = useDarkModeStore()
const userStore = useUserStore()
const sidebarStore = useSidebarStore()

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>
