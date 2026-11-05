<template>
  <div class="space-y-5 p-4 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">Pinjaman Anggota</h1>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          Pinjaman langsung dicairkan dan jadwal angsurannya dibuat. Angsuran yang jatuh tempo ikut ditagih kolektor.
        </p>
      </div>
      <button type="button" class="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700" @click="formOpen = true">
        <Plus class="h-4 w-4" /> Pinjaman Baru
      </button>
    </div>

    <!-- Ringkasan -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">Pinjaman aktif</p>
        <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">{{ formatAngka(ringkasan.jumlah_aktif) }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">Sisa pokok beredar</p>
        <p class="mt-1 truncate text-2xl font-bold tabular-nums text-foreground" :title="formatRupiah(ringkasan.sisa_pokok)">{{ formatRupiahRingkas(ringkasan.sisa_pokok) }}</p>
      </div>
      <button type="button" class="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40" @click="gantiStatus('tertunggak')">
        <p class="text-sm text-muted-foreground">Peminjam menunggak</p>
        <p class="mt-1 text-2xl font-bold tabular-nums" :class="ringkasan.jumlah_tertunggak ? 'text-red-600 dark:text-red-400' : 'text-foreground'">{{ formatAngka(ringkasan.jumlah_tertunggak) }}</p>
      </button>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">Nominal tertunggak</p>
        <p class="mt-1 truncate text-2xl font-bold tabular-nums" :class="ringkasan.nominal_tertunggak ? 'text-red-600 dark:text-red-400' : 'text-foreground'" :title="formatRupiah(ringkasan.nominal_tertunggak)">
          {{ formatRupiahRingkas(ringkasan.nominal_tertunggak) }}
        </p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
        <button
          v-for="t in TAB"
          :key="t.kode"
          type="button"
          role="tab"
          :aria-selected="status === t.kode"
          class="whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="status === t.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="gantiStatus(t.kode)"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="relative sm:ml-auto sm:w-72">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="cari"
          type="search"
          placeholder="Cari nomor, nama, atau kode anggota…"
          class="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
        />
      </div>
    </div>

    <!-- Daftar -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>
      <template v-else>
        <table class="hidden w-full text-sm md:table">
          <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Nomor</th>
              <th class="px-4 py-3 font-medium">Anggota</th>
              <th class="px-4 py-3 font-medium">Jenis</th>
              <th class="px-4 py-3 text-right font-medium">Pokok</th>
              <th class="px-4 py-3 font-medium">Progres</th>
              <th class="px-4 py-3 text-right font-medium">Sisa pokok</th>
              <th class="px-4 py-3 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="p in daftar" :key="p.id" class="cursor-pointer transition-colors hover:bg-muted/40" @click="detailId = p.id">
              <td class="px-4 py-3">
                <span class="block font-medium text-foreground">{{ p.nomor }}</span>
                <span class="block text-xs text-muted-foreground">{{ formatTanggal(p.tanggal_cair) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="block text-foreground">{{ p.member?.nama }}</span>
                <span class="block text-xs text-muted-foreground">{{ p.member?.kode }}</span>
              </td>
              <td class="px-4 py-3 text-foreground">
                {{ LABEL_JENIS_BUNGA[p.jenis_bunga] }}
                <span class="block text-xs text-muted-foreground">{{ p.tenor_bulan }} bulan</span>
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-foreground">{{ formatRupiah(p.pokok) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted" role="progressbar" :aria-valuenow="p.ringkasan?.angsuran_lunas ?? 0" :aria-valuemax="p.tenor_bulan">
                    <div class="h-full rounded-full bg-green-600" :style="{ width: `${persenLunas(p)}%` }" />
                  </div>
                  <span class="text-xs tabular-nums text-muted-foreground">{{ p.ringkasan?.angsuran_lunas ?? 0 }}/{{ p.tenor_bulan }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{{ formatRupiah(p.ringkasan?.sisa_pokok ?? 0) }}</td>
              <td class="px-4 py-3"><span class="text-xs font-medium" :class="keterangan(p).kelas">{{ keterangan(p).label }}</span></td>
            </tr>
          </tbody>
        </table>

        <ul class="divide-y divide-border md:hidden">
          <li v-for="p in daftar" :key="p.id">
            <button type="button" class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40" @click="detailId = p.id">
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-foreground">{{ p.member?.nama }}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ p.nomor }} · {{ LABEL_JENIS_BUNGA[p.jenis_bunga] }} · {{ p.ringkasan?.angsuran_lunas ?? 0 }}/{{ p.tenor_bulan }} lunas</span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(p.ringkasan?.sisa_pokok ?? 0) }}</span>
                <span class="block text-[11px] font-medium" :class="keterangan(p).kelas">{{ keterangan(p).label }}</span>
              </span>
            </button>
          </li>
        </ul>

        <div v-if="!daftar.length" class="px-4 py-14 text-center">
          <Banknote class="mx-auto h-9 w-9 text-muted-foreground/60" />
          <p class="mt-2 text-sm text-muted-foreground">{{ cari.trim() ? 'Tidak ada pinjaman yang cocok.' : 'Belum ada pinjaman.' }}</p>
        </div>

        <div v-if="meta.last_page > 1" class="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span class="text-muted-foreground">Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span>
          <div class="flex gap-2">
            <button type="button" class="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40" :disabled="meta.current_page <= 1" @click="muat(meta.current_page - 1)">Sebelumnya</button>
            <button type="button" class="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40" :disabled="meta.current_page >= meta.last_page" @click="muat(meta.current_page + 1)">Berikutnya</button>
          </div>
        </div>
      </template>
    </div>

    <FormPinjaman :open="formOpen" @close="formOpen = false" @tersimpan="tersimpan" />
    <DetailPinjaman :pinjaman-id="detailId" @close="detailId = null" @berubah="muat(meta.current_page)" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Banknote, Loader2, Plus, Search } from 'lucide-vue-next'
import DetailPinjaman from '@/components/pinjaman/DetailPinjaman.vue'
import FormPinjaman from '@/components/pinjaman/FormPinjaman.vue'
import { useToast } from '@/composables/useToast'
import { formatAngka, formatRupiah, formatRupiahRingkas, formatTanggal } from '@/lib/format'
import { pesanGalat } from '@/services/tokoService'
import { LABEL_JENIS_BUNGA, pinjamanService, type Pinjaman, type RingkasanDaftar } from '@/services/pinjamanService'

type Tab = 'aktif' | 'tertunggak' | 'lunas' | 'batal' | 'semua'
const TAB: { kode: Tab; label: string }[] = [
  { kode: 'aktif', label: 'Aktif' },
  { kode: 'tertunggak', label: 'Menunggak' },
  { kode: 'lunas', label: 'Lunas' },
  { kode: 'batal', label: 'Dibatalkan' },
  { kode: 'semua', label: 'Semua' }
]

const { error: toastError } = useToast()
const status = ref<Tab>('aktif')
const cari = ref('')
const memuat = ref(true)
const daftar = ref<Pinjaman[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
const ringkasan = ref<RingkasanDaftar>({ jumlah_aktif: 0, sisa_pokok: 0, jumlah_tertunggak: 0, nominal_tertunggak: 0 })
const formOpen = ref(false)
const detailId = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

const muat = async (page = 1) => {
  memuat.value = true
  try {
    const res = await pinjamanService.list({ status: status.value, search: cari.value.trim() || undefined, page })
    daftar.value = res.data
    meta.value = res.meta
    ringkasan.value = res.ringkasan
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat pinjaman'))
  } finally {
    memuat.value = false
  }
}

const gantiStatus = (s: Tab) => {
  status.value = s
  muat()
}

watch(cari, () => {
  clearTimeout(timer)
  timer = setTimeout(() => muat(), 300)
})

const persenLunas = (p: Pinjaman) => Math.round(((p.ringkasan?.angsuran_lunas ?? 0) / p.tenor_bulan) * 100)

const keterangan = (p: Pinjaman) => {
  if (p.status === 'lunas') return { label: 'Lunas', kelas: 'text-green-700 dark:text-green-400' }
  if (p.status === 'batal') return { label: 'Dibatalkan', kelas: 'text-muted-foreground' }
  const r = p.ringkasan
  if (r && r.angsuran_tertunggak > 0) return { label: `${r.angsuran_tertunggak} angsuran tertunggak`, kelas: 'text-red-600 dark:text-red-400' }
  return { label: r?.jatuh_tempo_berikutnya ? `Berikutnya ${formatTanggal(r.jatuh_tempo_berikutnya)}` : 'Lancar', kelas: 'text-muted-foreground' }
}

const tersimpan = (p: Pinjaman) => {
  formOpen.value = false
  status.value = 'aktif'
  muat()
  detailId.value = p.id
}

onMounted(() => muat())
</script>
