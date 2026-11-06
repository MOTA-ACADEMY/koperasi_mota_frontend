<template>
  <PanelSheet :open="pinjamanId !== null" :title="d?.nomor || 'Pinjaman'" :subtitle="d?.member ? `${d.member.nama} · ${d.member.kode}` : ''" lebar="lebar" @close="$emit('close')">
    <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>

    <div v-else-if="d" class="space-y-5">
      <div class="flex flex-wrap items-center gap-2">
        <span class="badge" :class="KELAS_STATUS[d.status]">{{ LABEL_STATUS[d.status] }}</span>
        <span class="badge bg-muted text-foreground">{{ LABEL_JENIS_BUNGA[d.jenis_bunga] }}</span>
        <span v-if="(d.ringkasan?.angsuran_tertunggak ?? 0) > 0 && d.status === 'aktif'" class="badge bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
          {{ d.ringkasan?.angsuran_tertunggak }} angsuran tertunggak
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Pokok pinjaman</p>
          <p class="font-semibold tabular-nums text-foreground">{{ formatRupiah(d.pokok) }}</p>
        </div>
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Sisa pokok</p>
          <p class="font-semibold tabular-nums text-foreground">{{ formatRupiah(d.ringkasan?.sisa_pokok ?? 0) }}</p>
        </div>
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Sudah dibayar</p>
          <p class="font-semibold tabular-nums text-foreground">{{ formatRupiah(d.ringkasan?.terbayar ?? 0) }}</p>
        </div>
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Tertunggak</p>
          <p class="font-semibold tabular-nums" :class="(d.ringkasan?.nominal_tertunggak ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'">
            {{ formatRupiah(d.ringkasan?.nominal_tertunggak ?? 0) }}
          </p>
        </div>
      </div>

      <dl class="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div v-for="r in info" :key="r[0]" class="flex justify-between gap-3 sm:block">
          <dt class="text-muted-foreground">{{ r[0] }}</dt>
          <dd class="text-right text-foreground sm:text-left">{{ r[1] }}</dd>
        </div>
      </dl>

      <div v-if="d.menunggu_setoran > 0" class="flex gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
        <Clock class="mt-0.5 h-4 w-4 shrink-0" />
        {{ formatRupiah(d.menunggu_setoran) }} sudah dibayar ke kolektor dan menunggu setoran diverifikasi.
      </div>
      <div v-if="d.status === 'batal'" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
        Dibatalkan {{ formatWaktu(d.dibatalkan_at) }} — {{ d.alasan_batal }}
      </div>

      <!-- Jadwal -->
      <section>
        <h3 class="mb-2 text-sm font-semibold text-foreground">Jadwal angsuran</h3>
        <div class="overflow-x-auto rounded-lg border border-border">
          <table class="w-full min-w-[560px] text-sm">
            <thead class="bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th class="px-3 py-2 font-medium">Ke</th>
                <th class="px-3 py-2 font-medium">Jatuh tempo</th>
                <th class="px-3 py-2 text-right font-medium">Pokok</th>
                <th class="px-3 py-2 text-right font-medium">Bunga</th>
                <th class="px-3 py-2 text-right font-medium">Angsuran</th>
                <th class="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="a in d.angsuran" :key="a.id" :class="{ 'opacity-60': a.status === 'lunas' }">
                <td class="px-3 py-2 tabular-nums text-muted-foreground">{{ a.ke }}</td>
                <td class="whitespace-nowrap px-3 py-2 text-foreground">{{ formatTanggal(a.jatuh_tempo) }}</td>
                <td class="px-3 py-2 text-right tabular-nums text-foreground">{{ formatAngka(a.pokok) }}</td>
                <td class="px-3 py-2 text-right tabular-nums text-foreground">{{ formatAngka(a.bunga) }}</td>
                <td class="px-3 py-2 text-right font-medium tabular-nums text-foreground">{{ formatAngka(a.total) }}</td>
                <td class="px-3 py-2">
                  <span class="whitespace-nowrap text-xs font-medium" :class="statusAngsuran(a).kelas">{{ statusAngsuran(a).label }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Riwayat pembayaran -->
      <section>
        <h3 class="mb-2 text-sm font-semibold text-foreground">Riwayat pembayaran</h3>
        <ul v-if="d.pembayaran.length" class="divide-y divide-border rounded-lg border border-border">
          <li v-for="b in d.pembayaran" :key="b.id" class="flex items-start justify-between gap-3 px-3 py-2.5">
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground">{{ b.nomor }} <span class="font-normal text-muted-foreground">· {{ b.sumber === 'kolektor' ? 'via kolektor' : 'di kantor' }}</span></p>
              <p class="text-xs text-muted-foreground">
                {{ formatWaktu(b.tanggal) }} · angsuran ke-{{ b.rincian.map((r) => r.ke).join(', ') }}<template v-if="b.sumber === 'kantor'"> · {{ b.metode === 'transfer' ? 'transfer' : 'tunai' }}</template><template v-if="b.oleh"> · {{ b.oleh }}</template>
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(b.total) }}</p>
              <p class="text-[11px] text-muted-foreground">pokok {{ formatAngka(b.pokok) }} · bunga {{ formatAngka(b.bunga) }}</p>
            </div>
          </li>
        </ul>
        <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">Belum ada pembayaran.</p>
      </section>
    </div>

    <template v-if="d && !memuat && d.status === 'aktif'" #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button v-if="!d.pembayaran.length && d.menunggu_setoran <= 0" type="button" class="tombol-garis text-red-600 dark:text-red-400" @click="batalOpen = true">
          Batalkan
        </button>
        <button type="button" class="tombol-utama" @click="bukaBayar">
          <Wallet class="h-4 w-4" /> Bayar angsuran
        </button>
      </div>
    </template>
  </PanelSheet>

  <!-- Bayar di kantor -->
  <PanelSheet :open="bayarOpen" title="Bayar angsuran" :subtitle="d ? `${d.nomor} · ${d.member?.nama}` : ''" @close="bayarOpen = false">
    <div v-if="d" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-foreground" for="bayar-nominal">Nominal diterima</label>
        <InputRupiah id="bayar-nominal" v-model="nominal" besar :invalid="!!galatBayar" />
        <p v-if="galatBayar" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ galatBayar }}</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button v-if="angsuranBerikut" type="button" class="chip" @click="nominal = angsuranBerikut.sisa">
            Angsuran ke-{{ angsuranBerikut.ke }} · {{ formatAngka(angsuranBerikut.sisa) }}
          </button>
          <button v-if="(d.ringkasan?.nominal_tertunggak ?? 0) > 0" type="button" class="chip" @click="nominal = d.ringkasan?.nominal_tertunggak ?? null">
            Semua tertunggak · {{ formatAngka(d.ringkasan?.nominal_tertunggak ?? 0) }}
          </button>
          <button type="button" class="chip" @click="nominal = bisaDibayar">Lunasi semua · {{ formatAngka(bisaDibayar) }}</button>
        </div>
      </div>
      <div>
        <span class="mb-1 block text-sm font-medium text-foreground">Diterima lewat</span>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="m in (['tunai', 'transfer'] as const)" :key="m" type="button" class="pilihan" :class="{ 'pilihan-aktif': metodeBayar === m }" :aria-pressed="metodeBayar === m" @click="metodeBayar = m">
            {{ m === 'tunai' ? 'Tunai (Kas)' : 'Transfer (Bank)' }}
          </button>
        </div>
      </div>
      <p class="text-xs text-muted-foreground">
        Uang dialokasikan ke angsuran tertua lebih dulu; dalam tiap angsuran, bunga dibayar dulu baru pokok.
        Jurnal {{ metodeBayar === 'transfer' ? 'Bank' : 'Kas' }} / Piutang Pinjaman / Pendapatan Jasa Pinjaman langsung diposting.
      </p>
      <div>
        <label class="mb-1 block text-sm font-medium text-foreground" for="bayar-catatan">Catatan</label>
        <input id="bayar-catatan" v-model="catatanBayar" type="text" maxlength="500" class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30" />
      </div>
    </div>
    <template #footer>
      <button type="button" class="tombol-utama w-full" :disabled="memproses || !nominal" @click="bayar">
        <Loader2 v-if="memproses" class="h-4 w-4 animate-spin" />
        Terima {{ formatRupiah(nominal || 0) }}
      </button>
    </template>
  </PanelSheet>

  <!-- Batal -->
  <PanelSheet :open="batalOpen" title="Batalkan pinjaman" :subtitle="d?.nomor" @close="batalOpen = false">
    <div class="space-y-3">
      <p class="text-sm text-muted-foreground">
        Gunakan bila pinjaman salah input dan dananya belum/tidak jadi dicairkan. Jadwal angsuran dihapus dari tagihan
        dan jurnal pencairan dibalik.
      </p>
      <label class="block text-sm font-medium text-foreground" for="alasan-batal-pj">Alasan</label>
      <input id="alasan-batal-pj" v-model="alasan" type="text" maxlength="255" class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30" />
    </div>
    <template #footer>
      <button type="button" class="inline-flex h-10 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50" :disabled="!alasan.trim() || memproses" @click="batalkan">
        Batalkan pinjaman
      </button>
    </template>
  </PanelSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Clock, Loader2, Wallet } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/kasir/InputRupiah.vue'
import { useToast } from '@/composables/useToast'
import { formatAngka, formatRupiah, formatTanggal } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { pesanGalat } from '@/services/tokoService'
import { LABEL_JENIS_BUNGA, pinjamanService, type Angsuran, type DetailPinjaman, type StatusPinjaman } from '@/services/pinjamanService'

const props = defineProps<{ pinjamanId: number | null }>()
const emit = defineEmits<{ close: []; berubah: [] }>()

const LABEL_STATUS: Record<StatusPinjaman, string> = { aktif: 'Aktif', lunas: 'Lunas', batal: 'Dibatalkan' }
const KELAS_STATUS: Record<StatusPinjaman, string> = {
  aktif: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  lunas: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  batal: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}
/** Sama dengan backend (Penagihan::BATAS_TERLAMBAT_HARI). */
const BATAS_TERLAMBAT_HARI = 3

const { success, warning, error: toastError } = useToast()
const memuat = ref(false)
const memproses = ref(false)
const d = ref<DetailPinjaman | null>(null)

const muat = async () => {
  if (props.pinjamanId === null) return
  memuat.value = true
  try {
    d.value = await pinjamanService.get(props.pinjamanId)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat pinjaman'))
    emit('close')
  } finally {
    memuat.value = false
  }
}

watch(
  () => props.pinjamanId,
  (id) => {
    d.value = null
    if (id !== null) muat()
  },
  { immediate: true }
)

const info = computed<[string, string][]>(() => {
  const p = d.value
  if (!p) return []
  const bunga = p.jenis_bunga === 'berjangka'
    ? (p.tingkat_bunga ?? []).map((t) => `bln ${t.dari}–${t.sampai}: ${formatAngka(t.bunga_persen)}%`).join(', ')
    : `${formatAngka(p.bunga_persen ?? 0)}%`
  return [
    ['Tanggal cair', `${formatTanggal(p.tanggal_cair)} · ${p.metode_cair === 'transfer' ? 'transfer bank' : 'tunai'}`],
    ['Jangka waktu', `${p.tenor_bulan} bulan`],
    ['Suku bunga', `${bunga} per ${p.satuan_bunga}`],
    ['Jatuh tempo', `tiap tanggal ${p.tanggal_jatuh_tempo}, mulai ${p.mulai_tagih === 'bulan_ini' ? 'bulan cair' : 'bulan berikutnya'}`],
    ['Total bunga', formatRupiah(p.total_bunga)],
    ['Total tagihan', formatRupiah(p.total_tagihan)],
    ['Keperluan', p.keperluan || '—'],
    ['Dicatat oleh', p.dibuat_oleh || '—']
  ]
})

const hariLewat = (tanggal: string) => {
  const t = new Date(`${tanggal}T00:00:00`)
  const kini = new Date()
  kini.setHours(0, 0, 0, 0)
  return Math.floor((kini.getTime() - t.getTime()) / 86_400_000)
}

const statusAngsuran = (a: Angsuran) => {
  if (a.status === 'lunas') return { label: 'Lunas', kelas: 'text-green-700 dark:text-green-400' }
  if (a.status === 'batal') return { label: 'Batal', kelas: 'text-muted-foreground' }
  const lewat = hariLewat(a.jatuh_tempo)
  const sebagian = a.terbayar_pokok + a.terbayar_bunga > 0
  if (a.menunggu_setoran > 0 && a.sisa - a.menunggu_setoran <= 0) return { label: 'Dibayar ke kolektor', kelas: 'text-violet-700 dark:text-violet-400' }
  if (lewat >= BATAS_TERLAMBAT_HARI) return { label: `Terlambat ${lewat} hari`, kelas: 'text-red-600 dark:text-red-400' }
  if (lewat > 0) return { label: `Lewat ${lewat} hari`, kelas: 'text-amber-700 dark:text-amber-400' }
  if (sebagian) return { label: `Sebagian (sisa ${formatAngka(a.sisa)})`, kelas: 'text-sky-700 dark:text-sky-400' }
  return { label: 'Belum jatuh tempo', kelas: 'text-muted-foreground' }
}

// ---------- Bayar ----------
const bayarOpen = ref(false)
const nominal = ref<number | null>(null)
const catatanBayar = ref('')
const metodeBayar = ref<'tunai' | 'transfer'>('tunai')
const galatBayar = ref('')

const sisaBayar = (a: Angsuran) => Math.max(0, a.sisa - a.menunggu_setoran)
const angsuranBerikut = computed(() => {
  const a = d.value?.angsuran.find((x) => x.status === 'belum_lunas' && sisaBayar(x) > 0)
  return a ? { ke: a.ke, sisa: sisaBayar(a) } : null
})
const bisaDibayar = computed(() => (d.value?.angsuran ?? []).filter((a) => a.status === 'belum_lunas').reduce((n, a) => n + sisaBayar(a), 0))

const bukaBayar = () => {
  nominal.value = angsuranBerikut.value?.sisa ?? null
  catatanBayar.value = ''
  metodeBayar.value = 'tunai'
  galatBayar.value = ''
  bayarOpen.value = true
}

const bayar = async () => {
  if (!d.value || !nominal.value) return
  memproses.value = true
  galatBayar.value = ''
  try {
    const res = await pinjamanService.bayar(d.value.id, nominal.value, catatanBayar.value || null, metodeBayar.value)
    const lunas = res.data.status_pinjaman === 'lunas'
    const deskripsi = `Pokok ${formatRupiah(res.data.pokok)} · bunga ${formatRupiah(res.data.bunga)}${lunas ? ' — pinjaman LUNAS' : ''}`
    if (res.peringatan.length) warning(res.message, { description: res.peringatan[0] })
    else success(res.message, { description: deskripsi })
    bayarOpen.value = false
    await muat()
    emit('berubah')
  } catch (e: any) {
    galatBayar.value = pesanGalat(e, 'Gagal mencatat pembayaran')
  } finally {
    memproses.value = false
  }
}

// ---------- Batal ----------
const batalOpen = ref(false)
const alasan = ref('')
const batalkan = async () => {
  if (!d.value) return
  memproses.value = true
  try {
    const res = await pinjamanService.batal(d.value.id, alasan.value.trim())
    success(res.message)
    batalOpen.value = false
    alasan.value = ''
    await muat()
    emit('berubah')
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal membatalkan pinjaman'))
  } finally {
    memproses.value = false
  }
}
</script>

<style scoped>
@reference "../../assets/main.css";

@layer components {
  .badge {
    @apply inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium;
  }

  .kotak {
    @apply rounded-lg bg-muted/60 px-3 py-2;
  }

  .chip {
    @apply rounded-full border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted;
  }

  .tombol-utama {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .pilihan {
    @apply h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted;
  }

  .pilihan-aktif {
    @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
  }

  .tombol-garis {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50;
  }
}
</style>
