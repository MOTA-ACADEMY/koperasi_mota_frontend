<template>
  <AuthLayout ukuran="md">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Pilih koperasi</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Halo, {{ userStore.user.name || 'Pengguna' }}. Anda terdaftar di beberapa koperasi —
        pilih yang ingin dikelola sekarang.
      </p>
    </div>

    <div v-if="memuat" class="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat daftar koperasi...
    </div>

    <div v-else-if="userStore.koperasiList.length === 0" class="rounded-lg border border-dashed border-border p-6 text-center">
      <p class="text-sm font-medium text-foreground">Akun Anda belum terhubung ke koperasi aktif mana pun.</p>
      <p class="mt-1 text-xs text-muted-foreground">Minta admin koperasi menambahkan email Anda, atau daftarkan koperasi baru.</p>
      <RouterLink to="/daftar" class="mt-4 inline-block text-sm font-medium text-green-600 hover:underline">Daftarkan koperasi</RouterLink>
    </div>

    <ul v-else class="space-y-3">
      <li v-for="kop in userStore.koperasiList" :key="kop.id">
        <button
          type="button"
          class="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-green-600 hover:shadow-md hover:shadow-green-600/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-600/20 disabled:cursor-not-allowed disabled:opacity-60"
          :class="kop.id === userStore.koperasi?.id ? 'border-green-600 bg-green-50/60 dark:bg-green-950/30' : 'border-border'"
          :disabled="dipilihId !== null"
          @click="pilih(kop.id)"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            <Building2 class="h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium text-foreground">{{ kop.nama }}</span>
            <span class="block truncate text-xs text-muted-foreground">
              {{ [kop.desa_kelurahan, kop.kabupaten_kota].filter(Boolean).join(', ') || 'Alamat belum diisi' }}
            </span>
          </span>
          <span
            class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="kop.role === 'admin' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-muted text-muted-foreground'"
          >
            {{ kop.role === 'admin' ? 'Admin' : 'Staf' }}
          </span>
          <Loader2 v-if="dipilihId === kop.id" class="h-4 w-4 shrink-0 animate-spin text-green-600" />
          <ChevronRight v-else class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </button>
      </li>
    </ul>

    <div class="mt-8 flex items-center justify-between text-sm">
      <RouterLink
        v-if="userStore.koperasi"
        to="/dashboard"
        class="text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Kembali ke dashboard
      </RouterLink>
      <span v-else />
      <button type="button" class="font-medium text-red-600 hover:underline dark:text-red-400" @click="keluar">Keluar</button>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Building2, ChevronRight, Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const { error } = useToast()

const memuat = ref(false)
const dipilihId = ref<number | null>(null)

const pilih = async (koperasiId: number) => {
  dipilihId.value = koperasiId
  try {
    await userStore.pilihKoperasi(koperasiId)
    // Muat ulang penuh supaya tidak ada data koperasi sebelumnya yang tersisa di store/halaman.
    const tujuan = (route.query.redirect as string) || '/dashboard'
    window.location.href = tujuan.startsWith('/') ? tujuan : '/dashboard'
  } catch (err: any) {
    error('Gagal memilih koperasi', {
      description: err?.data?.errors?.koperasi_id?.[0] || err?.message || 'Terjadi kesalahan'
    })
    dipilihId.value = null
  }
}

const keluar = async () => {
  await userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  memuat.value = userStore.koperasiList.length === 0
  try {
    await userStore.refreshSession()
  } catch {
    // Interceptor menangani 401; error lain cukup pakai daftar dari localStorage.
  } finally {
    memuat.value = false
  }
})
</script>
