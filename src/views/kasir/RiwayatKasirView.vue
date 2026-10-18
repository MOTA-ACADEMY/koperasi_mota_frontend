<template>
  <div class="space-y-5 p-4 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">Riwayat Kasir</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          <template v-if="bisaLihatSemua">Sesi kasir semua petugas: modal awal, penjualan, dan selisih kas saat tutup.</template>
          <template v-else>Sesi kasir Anda: modal awal, penjualan, dan selisih kas saat tutup.</template>
        </p>
      </div>
      <RouterLink v-if="userStore.can('kasir.pos')" to="/kasir" class="tombol-aksi px-3">
        <Store class="h-4 w-4" /> Ke layar kasir
      </RouterLink>
    </div>

    <!-- Filter -->
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div class="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 text-sm sm:w-72" role="tablist" aria-label="Status sesi">
        <button
          v-for="s in FILTER"
          :key="s.kode"
          type="button"
          role="tab"
          :aria-selected="status === s.kode"
          class="flex-1 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="status === s.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="gantiStatus(s.kode)"
        >
          {{ s.label }}
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:flex sm:items-end">
        <label class="block min-w-0">
          <span class="mb-1 block text-xs font-medium text-muted-foreground">Dari</span>
          <input v-model="dari" type="date" :max="sampai" class="input-tanggal" @change="muat()" />
        </label>
        <label class="block min-w-0">
          <span class="mb-1 block text-xs font-medium text-muted-foreground">Sampai</span>
          <input v-model="sampai" type="date" :min="dari" class="input-tanggal" @change="muat()" />
        </label>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <template v-else>
        <!-- Tabel (layar lebar) -->
        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full text-sm">
            <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th class="px-4 py-3 font-medium">Nomor</th>
                <th class="px-4 py-3 font-medium">Kasir</th>
                <th class="px-4 py-3 font-medium">Dibuka</th>
                <th class="px-4 py-3 font-medium">Ditutup</th>
                <th class="px-4 py-3 text-right font-medium">Transaksi</th>
                <th class="px-4 py-3 text-right font-medium">Tunai</th>
                <th class="px-4 py-3 text-right font-medium">QRIS</th>
                <th class="px-4 py-3 text-right font-medium">Selisih</th>
                <th class="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="s in daftar"
                :key="s.id"
                class="cursor-pointer transition-colors hover:bg-muted/40"
                tabindex="0"
                @click="buka(s.id)"
                @keydown.enter="buka(s.id)"
              >
                <td class="whitespace-nowrap px-4 py-3 font-medium text-foreground">{{ s.nomor }}</td>
                <td class="px-4 py-3 text-foreground">{{ s.kasir || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-muted-foreground">{{ formatWaktu(s.dibuka_at) }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-muted-foreground">{{ s.ditutup_at ? formatWaktu(s.ditutup_at) : '—' }}</td>
                <td class="px-4 py-3 text-right tabular-nums text-foreground">{{ formatAngka(s.jumlah_transaksi) }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground">{{ formatRupiah(s.total_tunai) }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground">{{ formatRupiah(s.total_qris) }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums" :class="kelasSelisih(s.selisih)">{{ teksSelisih(s.selisih) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="KELAS_STATUS_SESI[s.status]">{{ LABEL_STATUS_SESI[s.status] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Daftar (ponsel/tablet) -->
        <ul class="divide-y divide-border lg:hidden">
          <li v-for="s in daftar" :key="s.id">
            <button type="button" class="w-full px-4 py-3 text-left hover:bg-muted/40" @click="buka(s.id)">
              <span class="flex items-start justify-between gap-3">
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-foreground">{{ s.nomor }}</span>
                  <span class="block truncate text-xs text-muted-foreground">{{ s.kasir || '—' }} · {{ formatWaktu(s.dibuka_at) }}</span>
                </span>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="KELAS_STATUS_SESI[s.status]">{{ LABEL_STATUS_SESI[s.status] }}</span>
              </span>
              <span class="mt-2 grid grid-cols-3 gap-2 text-xs">
                <span class="min-w-0">
                  <span class="block text-muted-foreground">Tunai</span>
                  <span class="block truncate font-medium tabular-nums text-foreground">{{ formatRupiah(s.total_tunai) }}</span>
                </span>
                <span class="min-w-0">
                  <span class="block text-muted-foreground">QRIS</span>
                  <span class="block truncate font-medium tabular-nums text-foreground">{{ formatRupiah(s.total_qris) }}</span>
                </span>
                <span class="min-w-0 text-right">
                  <span class="block text-muted-foreground">{{ formatAngka(s.jumlah_transaksi) }} transaksi</span>
                  <span class="block truncate font-medium tabular-nums" :class="kelasSelisih(s.selisih)">{{ s.status === 'buka' ? 'Masih buka' : teksSelisih(s.selisih) }}</span>
                </span>
              </span>
            </button>
          </li>
        </ul>

        <p v-if="!daftar.length" class="px-4 py-14 text-center text-sm text-muted-foreground">Tidak ada sesi kasir pada rentang tanggal ini.</p>

        <div v-if="meta.last_page > 1" class="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
          <span class="text-muted-foreground">Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span>
          <div class="flex gap-2">
            <button type="button" class="tombol-kecil" :disabled="meta.current_page <= 1" @click="muat(meta.current_page - 1)">Sebelumnya</button>
            <button type="button" class="tombol-kecil" :disabled="meta.current_page >= meta.last_page" @click="muat(meta.current_page + 1)">Berikutnya</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Detail sesi -->
    <PanelSheet
      :open="dibuka !== null"
      lebar="lebar"
      :title="detail?.nomor || 'Sesi kasir'"
      :subtitle="detail ? `${detail.kasir || '—'} · ${formatWaktu(detail.dibuka_at)}` : ''"
      @close="dibuka = null"
    >
      <div v-if="memuatDetail" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <div v-else-if="detail" class="space-y-5">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="KELAS_STATUS_SESI[detail.status]">{{ LABEL_STATUS_SESI[detail.status] }}</span>
          <span class="text-muted-foreground">
            {{ formatWaktu(detail.dibuka_at) }} — {{ detail.ditutup_at ? formatWaktu(detail.ditutup_at) : 'masih buka' }}
          </span>
          <RouterLink
            v-if="detail.status === 'buka' && detail.user_id === userStore.user?.id && userStore.can('kasir.pos')"
            to="/kasir"
            class="ml-auto text-sm font-medium text-green-700 hover:underline dark:text-green-400"
          >
            Lanjutkan di kasir
          </RouterLink>
        </div>

        <!-- Selisih kas -->
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-muted/60 p-4">
            <p class="text-xs text-muted-foreground">Uang seharusnya</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-foreground">{{ formatRupiah(rk.uang_seharusnya) }}</p>
            <p class="text-[11px] text-muted-foreground">modal awal + penjualan tunai</p>
          </div>
          <div class="rounded-xl bg-muted/60 p-4">
            <p class="text-xs text-muted-foreground">Uang fisik di laci</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-foreground">{{ uangFisik === null ? '—' : formatRupiah(uangFisik) }}</p>
            <p class="text-[11px] text-muted-foreground">{{ detail.status === 'buka' ? 'dihitung saat tutup' : 'dihitung kasir' }}</p>
          </div>
          <div class="rounded-xl p-4" :class="kotakSelisih">
            <p class="text-xs opacity-80">Selisih</p>
            <p class="mt-1 text-lg font-bold tabular-nums">{{ detail.status === 'buka' ? 'Belum ditutup' : teksSelisih(selisih) }}</p>
            <p class="text-[11px] opacity-80">fisik − seharusnya</p>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <section>
            <h3 class="mb-2 text-sm font-semibold text-foreground">Penjualan</h3>
            <dl class="space-y-1.5 text-sm">
              <div class="baris"><dt>Penjualan barang</dt><dd>{{ formatRupiah(rk.penjualan_barang) }}</dd></div>
              <div class="baris"><dt>HPP barang</dt><dd>{{ formatRupiah(rk.hpp_barang) }}</dd></div>
              <div class="baris"><dt>Penjualan jasa</dt><dd>{{ formatRupiah(rk.penjualan_jasa) }}</dd></div>
              <div class="baris"><dt>Modal jasa</dt><dd>{{ formatRupiah(rk.modal_jasa) }}</dd></div>
              <div class="flex justify-between gap-3 border-t border-border pt-1.5 font-medium">
                <dt class="text-foreground">Laba kotor</dt>
                <dd class="tabular-nums text-foreground">{{ formatRupiah(labaKotor) }}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3 class="mb-2 text-sm font-semibold text-foreground">Kas</h3>
            <dl class="space-y-1.5 text-sm">
              <div class="baris"><dt>Modal awal</dt><dd>{{ formatRupiah(rk.modal_awal) }}</dd></div>
              <div class="baris"><dt>Penjualan tunai</dt><dd>{{ formatRupiah(rk.total_tunai) }}</dd></div>
              <div class="baris"><dt>Penjualan QRIS</dt><dd>{{ formatRupiah(rk.total_qris) }}</dd></div>
              <div class="baris"><dt>Transaksi</dt><dd>{{ formatAngka(rk.jumlah_transaksi) }}<template v-if="rk.jumlah_batal"> · {{ rk.jumlah_batal }} batal</template></dd></div>
            </dl>
          </section>
        </div>

        <dl v-if="detail.catatan_buka || detail.catatan_tutup" class="space-y-1 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
          <div v-if="detail.catatan_buka" class="flex gap-3"><dt class="w-24 shrink-0 text-muted-foreground">Catatan buka</dt><dd class="min-w-0 break-words text-foreground">{{ detail.catatan_buka }}</dd></div>
          <div v-if="detail.catatan_tutup" class="flex gap-3"><dt class="w-24 shrink-0 text-muted-foreground">Catatan tutup</dt><dd class="min-w-0 break-words text-foreground">{{ detail.catatan_tutup }}</dd></div>
        </dl>

        <section>
          <h3 class="mb-2 text-sm font-semibold text-foreground">Daftar transaksi</h3>
          <div v-if="memuatPenjualan" class="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 class="h-4 w-4 animate-spin" /> Memuat transaksi...
          </div>
          <DaftarPenjualan v-else-if="penjualan.length" :penjualan="penjualan" />
          <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">Belum ada transaksi di sesi ini.</p>
        </section>
      </div>
    </PanelSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Loader2, Store } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import DaftarPenjualan from '@/components/kasir/DaftarPenjualan.vue'
import { KELAS_STATUS_SESI, LABEL_STATUS_SESI, kelasSelisih, teksSelisih } from '@/components/kasir/kasir'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { kasirService, type Penjualan, type RingkasanSesi, type SesiKasir } from '@/services/kasirService'
import { pesanGalat } from '@/services/tokoService'

type FilterStatus = 'semua' | SesiKasir['status']

const FILTER: { kode: FilterStatus; label: string }[] = [
  { kode: 'semua', label: 'Semua' },
  { kode: 'buka', label: 'Buka' },
  { kode: 'tutup', label: 'Tutup' }
]

const { error: toastError } = useToast()
const userStore = useUserStore()

/** Tanggal lokal "YYYY-MM-DD". */
const isoLokal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hariIni = new Date()

const status = ref<FilterStatus>('semua')
const dari = ref(isoLokal(new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() - 29)))
const sampai = ref(isoLokal(hariIni))

const memuat = ref(true)
const daftar = ref<SesiKasir[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
const bisaLihatSemua = ref(userStore.can('kasir.riwayat'))

const muat = async (page = 1) => {
  memuat.value = true
  try {
    const res = await kasirService.daftarSesi({
      status: status.value === 'semua' ? undefined : status.value,
      dari: dari.value || undefined,
      sampai: sampai.value || undefined,
      page
    })
    daftar.value = res.data
    meta.value = res.meta
    bisaLihatSemua.value = !!res.bisa_lihat_semua
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat riwayat kasir'))
  } finally {
    memuat.value = false
  }
}

const gantiStatus = (s: FilterStatus) => {
  status.value = s
  muat()
}

// ---------- Detail ----------
const dibuka = ref<number | null>(null)
const memuatDetail = ref(false)
const detail = ref<SesiKasir | null>(null)
const memuatPenjualan = ref(false)
const penjualan = ref<Penjualan[]>([])

const buka = async (id: number) => {
  dibuka.value = id
  detail.value = null
  penjualan.value = []
  memuatDetail.value = true
  memuatPenjualan.value = true
  kasirService
    .penjualan(id)
    .then((r) => {
      if (dibuka.value === id) penjualan.value = r
    })
    .catch((e: any) => toastError(pesanGalat(e, 'Gagal memuat transaksi sesi')))
    .finally(() => {
      if (dibuka.value === id) memuatPenjualan.value = false
    })
  try {
    const d = await kasirService.detailSesi(id)
    if (dibuka.value === id) detail.value = d
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat sesi kasir'))
    dibuka.value = null
  } finally {
    memuatDetail.value = false
  }
}

/** Ringkasan sesi; cadangan dari kolom sesi bila backend tidak menyertakannya. */
const rk = computed<RingkasanSesi>(() => {
  const d = detail.value
  if (d?.ringkasan) return d.ringkasan
  const modal = d?.modal_awal ?? 0
  const tunai = d?.total_tunai ?? 0
  return {
    jumlah_transaksi: d?.jumlah_transaksi ?? 0,
    jumlah_batal: 0,
    total_tunai: tunai,
    total_qris: d?.total_qris ?? 0,
    penjualan_barang: 0,
    hpp_barang: 0,
    penjualan_jasa: 0,
    modal_jasa: 0,
    modal_awal: modal,
    uang_seharusnya: modal + tunai,
    uang_fisik: d?.uang_fisik ?? undefined,
    selisih: d?.selisih ?? undefined
  }
})

const uangFisik = computed(() => rk.value.uang_fisik ?? detail.value?.uang_fisik ?? null)
const selisih = computed(() => rk.value.selisih ?? detail.value?.selisih ?? null)
const labaKotor = computed(() => rk.value.penjualan_barang - rk.value.hpp_barang + rk.value.penjualan_jasa - rk.value.modal_jasa)

const kotakSelisih = computed(() => {
  const n = selisih.value
  if (detail.value?.status === 'buka' || n === null) return 'bg-muted/60 text-foreground'
  if (n === 0) return 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
  return n < 0 ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
})

onMounted(() => muat())
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-aksi {
  @apply inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted [&>svg]:shrink-0;
}

.tombol-kecil {
  @apply rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
}

.input-tanggal {
  @apply h-9 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
}

.baris {
  @apply flex justify-between gap-3 text-muted-foreground;
}

.baris dd {
  @apply text-right tabular-nums text-foreground;
}
</style>
