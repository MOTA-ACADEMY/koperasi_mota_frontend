<template>
  <div class="flex items-center justify-center px-6 py-20">
    <div class="max-w-md text-center">
      <span class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <ShieldAlert class="h-7 w-7" />
      </span>
      <h1 class="text-2xl font-bold text-foreground">Akses tidak diizinkan</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Role Anda di <span class="font-medium text-foreground">{{ userStore.koperasi?.nama }}</span>
        tidak memiliki hak akses ke halaman ini. Hubungi admin koperasi bila Anda memerlukannya.
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          v-if="halamanPertama"
          :to="halamanPertama"
          class="inline-flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Ke halaman yang tersedia
        </RouterLink>
        <RouterLink
          to="/pilih-koperasi"
          class="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Ganti koperasi
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ShieldAlert } from 'lucide-vue-next'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const halamanPertama = computed(() => userStore.menu[0]?.children?.[0]?.path ?? null)
</script>
