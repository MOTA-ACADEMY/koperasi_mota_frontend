<template>
  <div class="space-y-5 p-4 sm:p-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Kartu Stok</h1>
      <p class="mt-1 text-sm text-muted-foreground">Riwayat keluar-masuk stok per barang & satuan beserta saldonya.</p>
    </div>

    <div class="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
      <div>
        <span class="mb-1 block text-sm font-medium text-foreground">Barang</span>
        <div v-if="barang" class="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3">
          <span class="truncate text-sm text-foreground">{{ barang.label }} <span class="text-muted-foreground">· {{ barang.kode }}</span></span>
          <button type="button" class="text-xs font-medium text-green-700 hover:underline dark:text-green-400" @click="barang = null">Ganti</button>
        </div>
        <BarangPicker v-else @pilih="pilihBarang" />
      </div>
      <div>
        <label for="ks-dari" class="mb-1 block text-sm font-medium text-foreground">Dari</label>
        <input id="ks-dari" v-model="dari" type="date" class="masukan" />
      </div>
      <div>
        <label for="ks-sampai" class="mb-1 block text-sm font-medium text-foreground">Sampai</label>
        <input id="ks-sampai" v-model="sampai" type="date" class="masukan" />
      </div>
      <button type="button" class="h-10 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50" :disabled="!barang || memuat" @click="muat">
        Tampilkan
      </button>
    </div>

    <div v-if="!barang" class="rounded-xl border border-dashed border-border px-4 py-14 text-center text-sm text-muted-foreground">
      <ScrollText class="mx-auto mb-2 h-9 w-9 text-muted-foreground/60" />
      Pilih barang untuk melihat kartu stoknya.
    </div>

    <template v-else-if="kartu">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="t in tile" :key="t.label" class="rounded-xl border border-border bg-card p-4">
          <p class="text-sm text-muted-foreground">{{ t.label }}</p>
          <p class="mt-1 text-2xl font-bold tabular-nums" :class="t.kelas">{{ t.nilai }}</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-border bg-card">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-sm">
            <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th class="px-4 py-3 font-medium">Waktu</th>
                <th class="px-4 py-3 font-medium">Transaksi</th>
                <th class="px-4 py-3 font-medium">Referensi</th>
                <th class="px-4 py-3 text-right font-medium">Masuk</th>
                <th class="px-4 py-3 text-right font-medium">Keluar</th>
                <th class="px-4 py-3 text-right font-medium">Saldo</th>
                <th class="px-4 py-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr class="bg-muted/20">
                <td class="px-4 py-2.5 text-muted-foreground" colspan="5">Saldo awal per {{ formatTanggal(dari) }}</td>
                <td class="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">{{ formatQty(kartu.saldo_awal) }}</td>
                <td />
              </tr>
              <tr v-for="m in kartu.data" :key="m.id">
                <td class="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{{ formatWaktu(m.tanggal) }}</td>
                <td class="px-4 py-2.5 text-foreground">{{ LABEL_JENIS_MUTASI[m.jenis] ?? m.jenis }}</td>
                <td class="px-4 py-2.5 text-foreground">{{ m.ref_nomor || '—' }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums text-green-700 dark:text-green-400">{{ m.masuk ? formatQty(m.masuk) : '' }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums text-red-600 dark:text-red-400">{{ m.keluar ? formatQty(m.keluar) : '' }}</td>
                <td class="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">{{ formatQty(m.saldo) }}</td>
                <td class="max-w-[16rem] truncate px-4 py-2.5 text-muted-foreground" :title="m.keterangan || ''">{{ m.keterangan || '' }}<template v-if="m.oleh"> · {{ m.oleh }}</template></td>
              </tr>
              <tr v-if="!kartu.data.length">
                <td colspan="7" class="px-4 py-10 text-center text-muted-foreground">Tidak ada mutasi pada rentang tanggal ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Loader2, ScrollText } from 'lucide-vue-next'
import BarangPicker from '@/components/gudang/BarangPicker.vue'
import { useToast } from '@/composables/useToast'
import { formatTanggal } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { formatQty, pesanGalat, type BarangSatuanCari } from '@/services/tokoService'
import { LABEL_JENIS_MUTASI, gudangService, type MutasiStok } from '@/services/gudangService'

const { error: toastError } = useToast()

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const sekarang = new Date()

const barang = ref<BarangSatuanCari | null>(null)
const dari = ref(iso(new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)))
const sampai = ref(iso(sekarang))
const memuat = ref(false)
const kartu = ref<{ saldo_awal: number; total_masuk: number; total_keluar: number; saldo_akhir: number; data: MutasiStok[] } | null>(null)

const tile = computed(() => {
  const kt = kartu.value!
  return [
    { label: 'Saldo awal', nilai: formatQty(kt.saldo_awal), kelas: 'text-foreground' },
    { label: 'Masuk', nilai: `+${formatQty(kt.total_masuk)}`, kelas: 'text-green-700 dark:text-green-400' },
    { label: 'Keluar', nilai: `−${formatQty(kt.total_keluar)}`, kelas: 'text-red-600 dark:text-red-400' },
    { label: `Saldo akhir (${barang.value?.satuan ?? ''})`, nilai: formatQty(kt.saldo_akhir), kelas: 'text-foreground' }
  ]
})

const muat = async () => {
  if (!barang.value) return
  memuat.value = true
  try {
    kartu.value = await gudangService.kartuStok(barang.value.id, dari.value, sampai.value)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat kartu stok'))
  } finally {
    memuat.value = false
  }
}

const pilihBarang = (b: BarangSatuanCari) => {
  barang.value = b
  muat()
}

watch(barang, (b) => {
  if (!b) kartu.value = null
})
</script>

<style scoped>
@reference "../../assets/main.css";

.masukan {
  @apply h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
}
</style>
