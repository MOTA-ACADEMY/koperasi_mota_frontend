<template>
  <div class="space-y-5 p-4 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Persetujuan Gudang</h1>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          Semua dokumen gudang yang menunggu persetujuan. Stok, harga beli, dan jurnal baru berubah setelah dokumen disetujui.
        </p>
      </div>
      <button type="button" class="tombol-garis" :disabled="memuat" @click="muat">
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': memuat }" /> Muat ulang
      </button>
    </div>

    <!-- Ringkasan per jenis -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <button
        v-for="j in JENIS"
        :key="j.kode"
        type="button"
        class="rounded-xl border bg-card p-3 text-left transition-colors"
        :class="filter === j.kode ? 'border-green-600 ring-2 ring-green-600/20' : 'border-border hover:bg-muted/40'"
        @click="filter = filter === j.kode ? null : j.kode"
      >
        <component :is="j.ikon" class="h-4 w-4 text-muted-foreground" />
        <p class="mt-2 text-2xl font-bold tabular-nums text-foreground">{{ ringkasan[j.kode] || 0 }}</p>
        <p class="text-xs text-muted-foreground">{{ j.label }}</p>
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat && !data.length" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>
      <ul v-else class="divide-y divide-border">
        <li v-for="d in tampil" :key="`${d.jenis}-${d.id}`">
          <RouterLink
            :to="{ path: `/gudang/${d.jenis}`, query: { buka: d.id } }"
            class="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span class="min-w-0">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-foreground">{{ d.nomor }}</span>
                <span class="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{{ d.jenis_label }}</span>
              </span>
              <span class="mt-0.5 block truncate text-xs text-muted-foreground">
                {{ formatTanggal(d.tanggal) }} · {{ d.jumlah_item }} barang
                <template v-if="d.distributor"> · {{ d.distributor }}</template>
                <template v-if="d.keterangan"> · {{ LABEL_KET[d.keterangan] ?? d.keterangan }}</template>
                · oleh {{ d.pembuat || '—' }}
              </span>
            </span>
            <span class="flex shrink-0 items-center gap-2">
              <span v-if="d.total != null" class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(d.total) }}</span>
              <ChevronRight class="h-4 w-4 text-muted-foreground" />
            </span>
          </RouterLink>
        </li>
        <li v-if="!tampil.length" class="px-4 py-14 text-center">
          <BadgeCheck class="mx-auto h-9 w-9 text-green-600/70" />
          <p class="mt-2 text-sm text-muted-foreground">Tidak ada dokumen yang menunggu persetujuan.</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BadgeCheck,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  SlidersHorizontal,
  Undo2
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { formatRupiah, formatTanggal } from '@/lib/format'
import { pesanGalat } from '@/services/tokoService'
import { gudangService, type DokumenMenunggu, type JenisDokumen } from '@/services/gudangService'

const JENIS: { kode: JenisDokumen; label: string; ikon: unknown }[] = [
  { kode: 'pre-order', label: 'Pre Order', ikon: ClipboardList },
  { kode: 'purchase-order', label: 'Purchase Order', ikon: ShoppingCart },
  { kode: 'receiving', label: 'Receiving Order', ikon: PackageCheck },
  { kode: 'retur', label: 'Retur', ikon: Undo2 },
  { kode: 'adjustment', label: 'Adjustment', ikon: SlidersHorizontal },
  { kode: 'opname', label: 'Stok Opname', ikon: ClipboardCheck }
]

const LABEL_KET: Record<string, string> = {
  penyesuaian: 'penyesuaian',
  konversi: 'konversi satuan',
  stok_awal: 'stok awal',
  tunai: 'bayar tunai',
  tempo: 'tempo'
}

const { error: toastError } = useToast()
const memuat = ref(true)
const data = ref<DokumenMenunggu[]>([])
const ringkasan = ref<Partial<Record<JenisDokumen, number>>>({})
const filter = ref<JenisDokumen | null>(null)

const tampil = computed(() => (filter.value ? data.value.filter((d) => d.jenis === filter.value) : data.value))

const muat = async () => {
  memuat.value = true
  try {
    const res = await gudangService.persetujuan()
    data.value = res.data
    ringkasan.value = res.ringkasan
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat dokumen'))
  } finally {
    memuat.value = false
  }
}

onMounted(muat)
</script>

<style scoped>
@reference "../../assets/main.css";

/* Dalam layer components supaya utility Tailwind (mis. text-red-600) tetap bisa menimpa. */
@layer components {
  .tombol-garis {
    @apply inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50;
  }
}
</style>
