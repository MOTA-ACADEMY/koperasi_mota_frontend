<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950 px-4 py-10">
    <!-- class di <Card> tidak diteruskan komponennya, jadi lebar & padding diatur di wrapper -->
    <div class="w-full max-w-lg">
      <Card>
        <div class="p-8">
          <div class="text-center mb-6">
            <div class="h-12 w-12 mx-auto mb-3 rounded-full bg-green-600 text-white flex items-center justify-center">
              <Building2 class="h-6 w-6" />
            </div>
            <h1 class="text-xl font-bold text-foreground">Pilih Koperasi</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Halo, {{ userStore.user.name || 'Pengguna' }}. Anda terdaftar di beberapa koperasi —
              pilih koperasi yang ingin dikelola.
            </p>
          </div>

          <div v-if="memuat" class="py-8 text-center text-sm text-muted-foreground">Memuat daftar koperasi...</div>

          <div v-else-if="userStore.koperasiList.length === 0" class="py-6 text-center space-y-2">
            <p class="text-sm text-muted-foreground">Akun Anda belum terhubung ke koperasi aktif mana pun.</p>
            <p class="text-xs text-muted-foreground">Minta admin koperasi menambahkan email Anda, atau daftarkan koperasi baru.</p>
          </div>

          <ul v-else class="space-y-2">
            <li v-for="kop in userStore.koperasiList" :key="kop.id">
              <button
                type="button"
                class="w-full text-left rounded-lg border border-border p-4 transition-colors hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-60 flex items-center justify-between gap-3"
                :class="{ 'border-green-600 bg-green-50 dark:bg-green-900/20': kop.id === userStore.koperasi?.id }"
                :disabled="dipilihId !== null"
                @click="pilih(kop.id)"
              >
                <div class="min-w-0">
                  <p class="font-medium text-foreground truncate">{{ kop.nama }}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ [kop.desa_kelurahan, kop.kabupaten_kota].filter(Boolean).join(', ') || 'Alamat belum diisi' }}
                  </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <Badge :variant="kop.role === 'admin' ? 'green' : 'secondary'">{{ kop.role === 'admin' ? 'Admin' : 'Staf' }}</Badge>
                  <Loader2 v-if="dipilihId === kop.id" class="h-4 w-4 animate-spin text-green-600" />
                  <ChevronRight v-else class="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </li>
          </ul>

          <div class="mt-6 flex items-center justify-between text-sm">
            <RouterLink v-if="userStore.koperasi" to="/dashboard" class="text-muted-foreground hover:text-foreground">
              ← Kembali
            </RouterLink>
            <span v-else />
            <button type="button" class="text-destructive hover:underline" @click="keluar">Keluar</button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Building2, ChevronRight, Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

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
