<template>
  <!-- Overlay drawer mobile -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="mobileOpen" class="fixed inset-0 z-30 bg-black/40 md:hidden" aria-hidden="true" @click="$emit('close')" />
  </Transition>

  <aside
    class="fixed bottom-0 left-0 top-16 z-30 flex flex-col border-r border-border bg-card transition-[width,transform] duration-200 ease-out"
    :class="[
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      // Mobile selalu lebar penuh drawer; desktop mengikuti status ciut.
      collapsed ? 'w-72 md:w-[4.5rem]' : 'w-72 md:w-64'
    ]"
    aria-label="Navigasi utama"
  >
    <nav class="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
      <template v-for="(item, index) in navigationStore.navigationItems" :key="item.id">
        <!-- Judul grup; saat ciut diganti garis pemisah tipis -->
        <div v-if="item.type === 'header'" :class="index === 0 ? '' : 'mt-5'">
          <p
            class="mb-1.5 truncate px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80"
            :class="{ 'md:hidden': collapsed }"
          >
            {{ item.name }}
          </p>
          <div v-if="collapsed && index !== 0" class="mx-auto mb-2 hidden h-px w-6 bg-border md:block" />
        </div>

        <RouterLink
          v-else-if="item.path"
          :to="item.path"
          class="group relative mb-0.5 flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors"
          :class="[
            aktif(item.path)
              ? 'bg-green-50 font-medium text-green-800 dark:bg-green-950/50 dark:text-green-300'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            collapsed ? 'md:justify-center md:px-0' : ''
          ]"
          :aria-current="aktif(item.path) ? 'page' : undefined"
          :title="collapsed ? item.name : undefined"
        >
          <!-- Penanda halaman aktif -->
          <span
            v-if="aktif(item.path)"
            class="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-green-600 dark:bg-green-400"
            :class="{ 'md:hidden': collapsed }"
          />
          <component
            :is="item.icon"
            class="h-[18px] w-[18px] shrink-0"
            :class="aktif(item.path) ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground group-hover:text-foreground'"
          />
          <span class="truncate" :class="{ 'md:hidden': collapsed }">{{ item.name }}</span>

        </RouterLink>
      </template>

      <p v-if="!navigationStore.navigationItems.length" class="px-3 text-sm text-muted-foreground">
        Tidak ada menu yang dapat diakses.
      </p>
    </nav>

    <!-- Koperasi aktif — hanya di drawer mobile; di desktop sudah ada di navbar -->
    <div v-if="userStore.koperasi" class="border-t border-border p-3 md:hidden">
      <RouterLink
        to="/pilih-koperasi"
        class="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        :class="{ 'md:justify-center': collapsed }"
        :title="userStore.koperasiList.length > 1 ? 'Ganti koperasi' : userStore.koperasi.nama"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
          <Building2 class="h-4 w-4" />
        </span>
        <span class="min-w-0 flex-1" :class="{ 'md:hidden': collapsed }">
          <span class="block truncate text-sm font-medium text-foreground">{{ userStore.koperasi.nama }}</span>
          <span class="block truncate text-xs text-muted-foreground">
            {{ userStore.koperasiList.length > 1 ? 'Ganti koperasi' : (userStore.koperasi.desa_kelurahan || 'Koperasi aktif') }}
          </span>
        </span>
        <ChevronsUpDown
          v-if="userStore.koperasiList.length > 1"
          class="h-4 w-4 shrink-0 text-muted-foreground"
          :class="{ 'md:hidden': collapsed }"
        />
      </RouterLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Building2, ChevronsUpDown } from 'lucide-vue-next'
import { useSidebarStore, useNavigationStore, useUserStore } from '@/stores'

defineProps<{
  mobileOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()
const sidebarStore = useSidebarStore()
const navigationStore = useNavigationStore()
const userStore = useUserStore()

const collapsed = computed(() => sidebarStore.isCollapsed)

const cocok = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

// Aktif juga untuk sub-halaman (mis. /members/12 di bawah Anggota). Bila beberapa menu cocok
// (/penagihan & /penagihan/setoran), hanya path terpanjang yang ditandai aktif.
const pathAktif = computed(() =>
  navigationStore.navigationItems
    .map((item) => item.path)
    .filter((path): path is string => !!path && cocok(path))
    .sort((a, b) => b.length - a.length)[0] ?? null
)
const aktif = (path: string) => path === pathAktif.value
</script>

<style scoped>
.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}
</style>
