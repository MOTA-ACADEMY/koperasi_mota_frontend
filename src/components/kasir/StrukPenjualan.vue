<template>
  <!-- Struk belanja; dipakai di layar dan saat dicetak (lihat gaya cetak di PosView) -->
  <article class="struk font-mono text-xs leading-relaxed text-foreground">
    <header class="text-center">
      <p class="text-sm font-bold uppercase">{{ namaKoperasi || 'Koperasi' }}</p>
      <p v-if="alamat" class="text-muted-foreground">{{ alamat }}</p>
    </header>

    <div class="garis" />

    <dl class="space-y-0.5">
      <div class="flex justify-between gap-3"><dt>No.</dt><dd class="text-right">{{ penjualan.nomor }}</dd></div>
      <div class="flex justify-between gap-3"><dt>Tanggal</dt><dd class="text-right">{{ formatWaktu(penjualan.tanggal) }}</dd></div>
      <div class="flex justify-between gap-3"><dt>Kasir</dt><dd class="truncate text-right">{{ penjualan.kasir || kasir || '—' }}</dd></div>
    </dl>

    <div class="garis" />

    <ul class="space-y-1.5">
      <li v-for="(it, i) in penjualan.items" :key="i">
        <p class="break-words">{{ it.nama }}<template v-if="it.jenis === 'barang' && it.satuan"> ({{ it.satuan }})</template></p>
        <p v-if="it.no_pelanggan" class="break-all text-muted-foreground">No. {{ it.no_pelanggan }}</p>
        <p v-if="it.keterangan" class="break-words text-muted-foreground">{{ it.keterangan }}</p>
        <div class="flex justify-between gap-3 tabular-nums">
          <span class="text-muted-foreground">{{ formatQty(it.qty) }} × {{ formatAngka(it.harga_jual) }}</span>
          <span>{{ formatAngka(it.subtotal) }}</span>
        </div>
      </li>
    </ul>

    <div class="garis" />

    <dl class="space-y-0.5 tabular-nums">
      <div class="flex justify-between gap-3 text-sm font-bold"><dt>TOTAL</dt><dd>{{ formatRupiah(penjualan.total) }}</dd></div>
      <div class="flex justify-between gap-3"><dt>Bayar ({{ LABEL_METODE[penjualan.metode] }})</dt><dd>{{ formatRupiah(penjualan.dibayar) }}</dd></div>
      <div v-if="penjualan.metode === 'tunai'" class="flex justify-between gap-3"><dt>Kembalian</dt><dd>{{ formatRupiah(penjualan.kembalian) }}</dd></div>
      <div v-if="penjualan.ref_qris" class="flex justify-between gap-3"><dt>Ref. QRIS</dt><dd class="break-all text-right">{{ penjualan.ref_qris }}</dd></div>
    </dl>

    <p v-if="penjualan.status === 'batal'" class="mt-3 border border-current py-1 text-center font-bold uppercase">
      Dibatalkan<template v-if="penjualan.alasan_batal"> — {{ penjualan.alasan_batal }}</template>
    </p>

    <div class="garis" />
    <p class="text-center">Terima kasih atas kunjungan Anda</p>
  </article>
</template>

<script setup lang="ts">
import type { Penjualan } from '@/services/kasirService'
import { formatQty } from '@/services/tokoService'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { LABEL_METODE } from './kasir'

defineProps<{
  penjualan: Penjualan
  namaKoperasi?: string | null
  alamat?: string | null
  /** Cadangan nama kasir bila respons tidak menyertakannya. */
  kasir?: string | null
}>()
</script>

<style scoped>
@reference "../../assets/main.css";

.garis {
  @apply my-2 border-t border-dashed border-border;
}
</style>
