<template>
  <ul class="space-y-2">
    <li
      v-for="p in penjualan"
      :key="p.id"
      class="rounded-lg border"
      :class="p.status === 'batal' ? 'border-red-200 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20' : 'border-border'"
    >
      <button
        type="button"
        class="flex w-full items-start gap-3 px-3 py-2.5 text-left"
        :aria-expanded="terbuka.has(p.id)"
        @click="toggle(p.id)"
      >
        <ChevronRight class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform" :class="{ 'rotate-90': terbuka.has(p.id) }" />
        <span class="min-w-0 flex-1">
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-sm font-medium text-foreground">{{ p.nomor }}</span>
            <span class="rounded-full px-1.5 py-0.5 text-[11px] font-medium" :class="KELAS_METODE[p.metode]">{{ LABEL_METODE[p.metode] }}</span>
            <span v-if="p.status === 'batal'" class="rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-900/50 dark:text-red-300">Batal</span>
          </span>
          <span class="block text-xs text-muted-foreground">{{ formatJam(p.tanggal) }} · {{ p.items.length }} item<template v-if="tampilKasir && p.kasir"> · {{ p.kasir }}</template></span>
          <span v-if="!terbuka.has(p.id)" class="mt-0.5 block truncate text-xs text-muted-foreground">{{ ringkasItem(p) }}</span>
        </span>
        <span class="shrink-0 text-sm font-semibold tabular-nums" :class="p.status === 'batal' ? 'text-muted-foreground line-through' : 'text-foreground'">
          {{ formatRupiah(p.total) }}
        </span>
      </button>

      <div v-if="terbuka.has(p.id)" class="border-t border-border px-3 py-2.5">
        <ul class="space-y-1.5 text-sm">
          <li v-for="(it, i) in p.items" :key="i" class="flex items-start justify-between gap-3">
            <span class="min-w-0">
              <span class="block text-foreground">{{ it.nama }}<template v-if="it.jenis === 'barang' && it.satuan"> <span class="text-muted-foreground">· {{ it.satuan }}</span></template></span>
              <span class="block text-xs text-muted-foreground tabular-nums">
                {{ formatQty(it.qty) }} × {{ formatRupiah(it.harga_jual) }}
                <template v-if="it.no_pelanggan"> · No. {{ it.no_pelanggan }}</template>
                <template v-if="it.keterangan"> · {{ it.keterangan }}</template>
              </span>
            </span>
            <span class="shrink-0 tabular-nums text-foreground">{{ formatRupiah(it.subtotal) }}</span>
          </li>
        </ul>
        <dl class="mt-2 space-y-0.5 border-t border-dashed border-border pt-2 text-xs text-muted-foreground tabular-nums">
          <div class="flex justify-between gap-3"><dt>Dibayar</dt><dd>{{ formatRupiah(p.dibayar) }}</dd></div>
          <div v-if="p.metode === 'tunai'" class="flex justify-between gap-3"><dt>Kembalian</dt><dd>{{ formatRupiah(p.kembalian) }}</dd></div>
          <div v-if="p.ref_qris" class="flex justify-between gap-3"><dt>Ref. QRIS</dt><dd class="break-all text-right">{{ p.ref_qris }}</dd></div>
        </dl>
        <p v-if="p.status === 'batal'" class="mt-2 rounded-md bg-red-100/70 px-2 py-1.5 text-xs text-red-800 dark:bg-red-950/50 dark:text-red-300">
          Dibatalkan<template v-if="p.alasan_batal">: {{ p.alasan_batal }}</template>
        </p>

        <!-- Aksi (hanya di layar kasir) -->
        <div v-if="(bisaBatal || bisaCetak) && batalId !== p.id" class="mt-3 flex flex-wrap justify-end gap-2">
          <button v-if="bisaCetak" type="button" class="tombol-kecil" @click="$emit('cetak', p)">
            <Printer class="h-3.5 w-3.5" /> Cetak struk
          </button>
          <button
            v-if="bisaBatal && p.status === 'selesai'"
            type="button"
            class="tombol-kecil text-red-600 dark:text-red-400"
            @click="mintaBatal(p.id)"
          >
            <Ban class="h-3.5 w-3.5" /> Batalkan
          </button>
        </div>

        <div v-if="batalId === p.id" class="mt-3 space-y-2 rounded-lg border border-red-200 p-3 dark:border-red-900/60">
          <label :for="`alasan-${p.id}`" class="block text-xs font-medium text-foreground">Alasan pembatalan</label>
          <textarea
            :id="`alasan-${p.id}`"
            v-model="alasan"
            rows="2"
            maxlength="255"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/30"
            placeholder="Mis. salah input barang, pembeli batal"
          />
          <p class="text-xs text-muted-foreground">Stok barang dikembalikan dan transaksi tidak dihitung di ringkasan kasir.</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="tombol-kecil" :disabled="memprosesId === p.id" @click="batalId = null">Urungkan</button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="!alasan.trim() || memprosesId === p.id"
              @click="$emit('batal', { id: p.id, alasan: alasan.trim() })"
            >
              <Loader2 v-if="memprosesId === p.id" class="h-3.5 w-3.5 animate-spin" />
              Ya, batalkan
            </button>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Ban, ChevronRight, Loader2, Printer } from 'lucide-vue-next'
import type { Penjualan } from '@/services/kasirService'
import { formatQty } from '@/services/tokoService'
import { formatRupiah } from '@/lib/format'
import { formatJam, KELAS_METODE, LABEL_METODE } from './kasir'

const props = defineProps<{
  penjualan: Penjualan[]
  bisaBatal?: boolean
  bisaCetak?: boolean
  tampilKasir?: boolean
  /** Id transaksi yang sedang dibatalkan (spinner). */
  memprosesId?: number | null
}>()

defineEmits<{
  batal: [data: { id: number; alasan: string }]
  cetak: [penjualan: Penjualan]
}>()

const terbuka = ref(new Set<number>())
const batalId = ref<number | null>(null)
const alasan = ref('')

const toggle = (id: number) => {
  const s = new Set(terbuka.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  terbuka.value = s
}

const mintaBatal = async (id: number) => {
  batalId.value = id
  alasan.value = ''
  await nextTick()
  document.getElementById(`alasan-${id}`)?.focus()
}

const ringkasItem = (p: Penjualan) =>
  p.items.map((it) => `${it.nama}${it.qty !== 1 ? ` ×${formatQty(it.qty)}` : ''}`).join(', ')

// Daftar dimuat ulang (mis. setelah pembatalan) → tutup form batal.
watch(
  () => props.penjualan,
  () => {
    batalId.value = null
    alasan.value = ''
  }
)
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-kecil {
  @apply inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
}
</style>
