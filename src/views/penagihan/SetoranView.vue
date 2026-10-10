<template>
  <div class="space-y-5 p-4 sm:p-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Setoran Kolektor</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Terima uang hasil penagihan dari kolektor. Tagihan anggota baru tercatat lunas setelah setoran diverifikasi.
      </p>
    </div>

    <!-- Ringkasan -->
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">Menunggu verifikasi</p>
        <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">{{ formatAngka(ringkasan.menunggu_jumlah) }} <span class="text-sm font-normal text-muted-foreground">setoran</span></p>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">Uang yang harus diterima</p>
        <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">{{ formatRupiah(ringkasan.menunggu_total) }}</p>
      </div>
    </div>

    <!-- Filter status -->
    <div class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
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

    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <template v-else>
        <!-- Tabel (layar lebar) -->
        <table class="hidden w-full text-sm md:table">
          <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Nomor</th>
              <th class="px-4 py-3 font-medium">Kolektor</th>
              <th class="px-4 py-3 font-medium">Diajukan</th>
              <th class="px-4 py-3 text-right font-medium">Kwitansi</th>
              <th class="px-4 py-3 text-right font-medium">Total</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="s in daftar" :key="s.id" class="transition-colors hover:bg-muted/40">
              <td class="px-4 py-3 font-medium text-foreground">{{ s.nomor }}</td>
              <td class="px-4 py-3 text-foreground">{{ s.kolektor?.nama || '—' }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ formatWaktu(s.diajukan_at) }}</td>
              <td class="px-4 py-3 text-right tabular-nums text-foreground">{{ s.jumlah_pembayaran }}</td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{{ formatRupiah(s.total) }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="KELAS_STATUS[s.status]">{{ LABEL_STATUS_SETORAN[s.status] }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <button type="button" class="tombol-kecil" @click="buka(s.id)">{{ s.status === 'menunggu' ? 'Periksa' : 'Lihat' }}</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Daftar (ponsel) -->
        <ul class="divide-y divide-border md:hidden">
          <li v-for="s in daftar" :key="s.id">
            <button type="button" class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40" @click="buka(s.id)">
              <span class="min-w-0">
                <span class="block text-sm font-medium text-foreground">{{ s.kolektor?.nama || '—' }}</span>
                <span class="block text-xs text-muted-foreground">{{ s.nomor }} · {{ formatWaktu(s.diajukan_at) }}</span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(s.total) }}</span>
                <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="KELAS_STATUS[s.status]">{{ LABEL_STATUS_SETORAN[s.status] }}</span>
              </span>
            </button>
          </li>
        </ul>

        <p v-if="!daftar.length" class="px-4 py-14 text-center text-sm text-muted-foreground">
          {{ status === 'menunggu' ? 'Tidak ada setoran yang menunggu verifikasi.' : 'Belum ada setoran.' }}
        </p>

        <div v-if="meta.last_page > 1" class="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span class="text-muted-foreground">Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span>
          <div class="flex gap-2">
            <button type="button" class="tombol-kecil" :disabled="meta.current_page <= 1" @click="muat(meta.current_page - 1)">Sebelumnya</button>
            <button type="button" class="tombol-kecil" :disabled="meta.current_page >= meta.last_page" @click="muat(meta.current_page + 1)">Berikutnya</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Detail setoran -->
    <PanelSheet :open="dibuka !== null" :title="detail?.nomor || 'Setoran'" :subtitle="detail?.kolektor?.nama || ''" @close="tutup">
      <div v-if="memuatDetail" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <div v-else-if="detail" class="space-y-5">
        <div class="rounded-xl bg-muted/60 p-4 text-center">
          <p class="text-sm text-muted-foreground">Total setoran · {{ detail.jumlah_pembayaran }} kwitansi</p>
          <p class="mt-1 text-3xl font-bold tabular-nums text-foreground">{{ formatRupiah(detail.total) }}</p>
          <span class="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium" :class="KELAS_STATUS[detail.status]">{{ LABEL_STATUS_SETORAN[detail.status] }}</span>
        </div>

        <dl class="space-y-1 text-sm">
          <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Diajukan</dt><dd class="text-right text-foreground">{{ formatWaktu(detail.diajukan_at) }}</dd></div>
          <div v-if="detail.kolektor?.no_hp" class="flex justify-between gap-3"><dt class="text-muted-foreground">No. HP kolektor</dt><dd class="text-right text-foreground">{{ detail.kolektor.no_hp }}</dd></div>
          <div v-if="detail.catatan_kolektor" class="flex justify-between gap-3"><dt class="text-muted-foreground">Catatan kolektor</dt><dd class="text-right text-foreground">{{ detail.catatan_kolektor }}</dd></div>
          <template v-if="detail.status !== 'menunggu'">
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Diproses</dt><dd class="text-right text-foreground">{{ formatWaktu(detail.diproses_at) }} · {{ detail.diproses_oleh || '—' }}</dd></div>
            <div v-if="detail.catatan_verifikasi" class="flex justify-between gap-3"><dt class="text-muted-foreground">Catatan</dt><dd class="text-right text-foreground">{{ detail.catatan_verifikasi }}</dd></div>
          </template>
        </dl>

        <!-- Hasil verifikasi barusan -->
        <div v-if="hasil" class="space-y-2">
          <div v-if="hasil.jurnal" class="flex gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
            <CircleCheck class="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Jurnal draft <b>{{ hasil.jurnal.nomor_transaksi }}</b> dibuat (Kas / Simpanan).
              <RouterLink v-if="userStore.can('akuntansi.jurnal-umum')" to="/akuntansi/jurnal-umum" class="font-medium underline">Buka Jurnal Umum</RouterLink>
              untuk memeriksa & memposting.
            </span>
          </div>
          <div v-for="(p, i) in hasil.peringatan" :key="i" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
            {{ p }}
          </div>
        </div>

        <section v-if="detail.pembayaran?.length">
          <h3 class="mb-2 text-sm font-semibold text-foreground">Rincian kwitansi</h3>
          <ul class="divide-y divide-border rounded-lg border border-border">
            <li v-for="p in detail.pembayaran" :key="p.id" class="px-3 py-2.5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-foreground">{{ p.member?.nama }} <span class="font-normal text-muted-foreground">· {{ p.member?.kode }}</span></p>
                  <p class="text-xs text-muted-foreground">{{ p.nomor }} · {{ formatWaktu(p.dibayar_at) }}</p>
                </div>
                <p class="shrink-0 text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(p.total) }}</p>
              </div>
              <ul class="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <li v-for="a in p.alokasi" :key="a.billing_id" class="flex justify-between gap-3">
                  <span>{{ LABEL_JENIS[a.jenis || ''] }} {{ a.periode ? formatPeriode(a.periode) : '' }}</span>
                  <span class="tabular-nums">{{ formatRupiah(a.nominal) }}</span>
                </li>
              </ul>
              <a
                v-if="p.lokasi"
                :href="`https://www.google.com/maps?q=${p.lokasi.lat},${p.lokasi.lng}`"
                target="_blank"
                rel="noopener"
                class="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <MapPin class="h-3 w-3" /> Lokasi saat bayar
              </a>
            </li>
          </ul>
        </section>
        <p v-else-if="detail.status === 'ditolak'" class="text-sm text-muted-foreground">
          Kwitansi dari setoran yang ditolak sudah dikembalikan ke kolektor untuk disetor ulang.
        </p>

        <div v-if="detail.status === 'menunggu'">
          <label for="catatan-verifikasi" class="mb-1 block text-sm font-medium text-foreground">
            Catatan <span class="font-normal text-muted-foreground">(wajib bila menolak)</span>
          </label>
          <textarea
            id="catatan-verifikasi"
            v-model="catatan"
            rows="2"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            placeholder="Mis. uang kurang Rp 5.000"
          />
        </div>
      </div>

      <template v-if="detail?.status === 'menunggu'" #footer>
        <div class="grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            :disabled="memproses"
            :title="catatan.trim() ? '' : 'Isi catatan alasan penolakan'"
            @click="tolak"
          >
            Tolak
          </button>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            :disabled="memproses"
            @click="verifikasi"
          >
            <Loader2 v-if="memproses" class="h-4 w-4 animate-spin" />
            Uang {{ formatRupiah(detail.total) }} sudah diterima
          </button>
        </div>
      </template>
    </PanelSheet>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CircleCheck, Loader2, MapPin, TriangleAlert } from 'lucide-vue-next'
import PanelSheet from '@/components/penagihan/PanelSheet.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatAngka, formatPeriode, formatRupiah } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { LABEL_JENIS, LABEL_STATUS_SETORAN, penagihanService, type Setoran, type StatusSetoran } from '@/services/penagihanService'

const FILTER: { kode: StatusSetoran | 'semua'; label: string }[] = [
  { kode: 'menunggu', label: 'Menunggu' },
  { kode: 'diverifikasi', label: 'Diverifikasi' },
  { kode: 'ditolak', label: 'Ditolak' },
  { kode: 'semua', label: 'Semua' }
]

const KELAS_STATUS: Record<StatusSetoran, string> = {
  menunggu: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  diverifikasi: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  ditolak: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
}

const { success, warning, error: toastError } = useToast()
const userStore = useUserStore()

const status = ref<StatusSetoran | 'semua'>('menunggu')
const memuat = ref(true)
const daftar = ref<Setoran[]>([])
const meta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
const ringkasan = ref({ menunggu_jumlah: 0, menunggu_total: 0 })

const dibuka = ref<number | null>(null)
const memuatDetail = ref(false)
const detail = ref<Setoran | null>(null)
const catatan = ref('')
const memproses = ref(false)
const hasil = ref<{ jurnal: { id: number; nomor_transaksi: string } | null; peringatan: string[] } | null>(null)

const pesanGalat = (e: any, cadangan: string) => {
  const errs = e?.data?.errors
  const pertama = errs ? (Object.values(errs)[0] as string[] | undefined)?.[0] : null
  return pertama || e?.message || cadangan
}

const muat = async (page = 1) => {
  memuat.value = true
  try {
    const res = await penagihanService.daftarSetoran({ status: status.value, page })
    daftar.value = res.data
    meta.value = res.meta
    ringkasan.value = res.ringkasan
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat setoran'))
  } finally {
    memuat.value = false
  }
}

const gantiStatus = (s: StatusSetoran | 'semua') => {
  status.value = s
  muat()
}

const buka = async (id: number) => {
  dibuka.value = id
  catatan.value = ''
  hasil.value = null
  detail.value = null
  memuatDetail.value = true
  try {
    detail.value = await penagihanService.detailSetoran(id)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat setoran'))
    dibuka.value = null
  } finally {
    memuatDetail.value = false
  }
}

const tutup = () => {
  dibuka.value = null
}

const verifikasi = async () => {
  if (!detail.value) return
  memproses.value = true
  try {
    const res = await penagihanService.verifikasi(detail.value.id, catatan.value.trim() || null)
    hasil.value = { jurnal: res.jurnal, peringatan: res.peringatan }
    detail.value = { ...detail.value, ...res.data, pembayaran: detail.value.pembayaran }
    if (res.peringatan.length) warning('Setoran diverifikasi dengan catatan', { description: res.peringatan[0] })
    else success('Setoran diverifikasi', { description: 'Tagihan anggota terkait sudah diperbarui.' })
    muat(meta.value.current_page)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memverifikasi setoran'))
  } finally {
    memproses.value = false
  }
}

const tolak = async () => {
  if (!detail.value) return
  if (!catatan.value.trim()) {
    toastError('Isi catatan alasan penolakan terlebih dahulu')
    document.getElementById('catatan-verifikasi')?.focus()
    return
  }
  memproses.value = true
  try {
    await penagihanService.tolak(detail.value.id, catatan.value.trim())
    success('Setoran ditolak', { description: 'Kwitansinya kembali ke kolektor untuk disetor ulang.' })
    tutup()
    muat(meta.value.current_page)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menolak setoran'))
  } finally {
    memproses.value = false
  }
}

onMounted(() => muat())
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-kecil {
  @apply rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
}
</style>
