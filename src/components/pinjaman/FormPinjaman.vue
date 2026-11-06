<template>
  <PanelSheet :open="open" title="Pinjaman Baru" subtitle="Langsung dicairkan & jadwal angsuran dibuat" lebar="penuh" @close="$emit('close')">
    <form id="form-pinjaman" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" @submit.prevent="simpan">
      <!-- ================= Input ================= -->
      <div class="space-y-5">
        <!-- Anggota -->
        <div>
          <span class="label">Anggota <span class="text-red-600">*</span></span>
          <div v-if="anggota" class="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-foreground">{{ anggota.nama }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ anggota.kode }} · {{ anggota.alamat || 'Tanpa alamat' }}</span>
            </span>
            <button type="button" class="text-xs font-medium text-green-700 hover:underline dark:text-green-400" @click="anggota = null">Ganti</button>
          </div>
          <div v-else class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input v-model="cariAnggota" type="search" class="masukan pl-9" placeholder="Cari nama / kode anggota aktif…" aria-label="Cari anggota" />
            <ul v-if="hasilAnggota.length" class="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
              <li v-for="m in hasilAnggota" :key="m.id">
                <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted" @click="pilihAnggota(m)">
                  <span class="block font-medium text-foreground">{{ m.nama }}</span>
                  <span class="block text-xs text-muted-foreground">{{ m.kode }} · {{ m.alamat || 'Tanpa alamat' }}</span>
                </button>
              </li>
            </ul>
          </div>
          <p v-if="galat.member_id" class="galat">{{ galat.member_id }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="pj-pokok">Jumlah pinjaman <span class="text-red-600">*</span></label>
            <InputRupiah id="pj-pokok" v-model="f.pokok" :invalid="!!galat.pokok" />
            <p v-if="galat.pokok" class="galat">{{ galat.pokok }}</p>
          </div>
          <div>
            <label class="label" for="pj-tenor">Jangka waktu <span class="text-red-600">*</span></label>
            <div class="relative">
              <input id="pj-tenor" v-model.number="f.tenor_bulan" type="number" min="1" max="360" class="masukan pr-16" />
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">bulan</span>
            </div>
            <div class="mt-1.5 flex flex-wrap gap-1">
              <button v-for="t in [3, 6, 10, 12, 24, 36]" :key="t" type="button" class="chip" :class="{ 'chip-aktif': f.tenor_bulan === t }" @click="f.tenor_bulan = t">{{ t }}</button>
            </div>
          </div>
        </div>

        <!-- Jenis bunga -->
        <div>
          <span class="label">Jenis bunga</span>
          <div class="grid gap-2 sm:grid-cols-2">
            <button
              v-for="(label, kode) in LABEL_JENIS_BUNGA"
              :key="kode"
              type="button"
              class="rounded-lg border p-3 text-left transition-colors"
              :class="f.jenis_bunga === kode ? 'border-green-600 bg-green-50/60 ring-2 ring-green-600/20 dark:bg-green-950/30' : 'border-border hover:bg-muted/50'"
              :aria-pressed="f.jenis_bunga === kode"
              @click="f.jenis_bunga = kode"
            >
              <span class="block text-sm font-medium text-foreground">{{ label }}</span>
              <span class="mt-0.5 block text-xs text-muted-foreground">{{ PENJELASAN_JENIS_BUNGA[kode] }}</span>
            </button>
          </div>
        </div>

        <!-- Suku bunga -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-if="f.jenis_bunga !== 'berjangka'">
            <label class="label" for="pj-bunga">Suku bunga</label>
            <div class="relative">
              <input id="pj-bunga" v-model.number="f.bunga_persen" type="number" min="0" max="100" step="0.01" class="masukan pr-8" />
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            <p v-if="galat.bunga_persen" class="galat">{{ galat.bunga_persen }}</p>
          </div>
          <div :class="{ 'sm:col-span-2': f.jenis_bunga === 'berjangka' }">
            <span class="label">Suku bunga dihitung per</span>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="s in (['bulan', 'tahun'] as const)" :key="s" type="button" class="pilihan" :class="{ 'pilihan-aktif': f.satuan_bunga === s }" @click="f.satuan_bunga = s">
                {{ s === 'bulan' ? 'Bulan' : 'Tahun' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tingkat bunga (berjangka) -->
        <div v-if="f.jenis_bunga === 'berjangka'" class="rounded-lg border border-border p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">Tingkat bunga</span>
            <button type="button" class="text-xs font-medium text-green-700 hover:underline dark:text-green-400" :disabled="!bisaTambahTingkat" @click="tambahTingkat">+ Tambah tingkat</button>
          </div>
          <ul class="space-y-2">
            <li v-for="(t, i) in f.tingkat_bunga" :key="i" class="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <div>
                <label class="label-kecil">Bulan ke</label>
                <input v-model.number="t.dari" type="number" min="1" class="masukan" :aria-label="`Tingkat ${i + 1} mulai bulan`" />
              </div>
              <div>
                <label class="label-kecil">s.d. bulan ke</label>
                <input v-model.number="t.sampai" type="number" min="1" class="masukan" :aria-label="`Tingkat ${i + 1} sampai bulan`" />
              </div>
              <div>
                <label class="label-kecil">Bunga %</label>
                <input v-model.number="t.bunga_persen" type="number" min="0" step="0.01" class="masukan" :aria-label="`Tingkat ${i + 1} bunga`" />
              </div>
              <button type="button" class="mb-1 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-red-600 disabled:opacity-30" :disabled="f.tingkat_bunga.length <= 1" :aria-label="`Hapus tingkat ${i + 1}`" @click="f.tingkat_bunga.splice(i, 1)">
                <X class="h-4 w-4" />
              </button>
            </li>
          </ul>
          <p class="mt-2 text-xs text-muted-foreground">Tingkat harus berurutan dari bulan ke-1 sampai ke-{{ f.tenor_bulan || '…' }} tanpa celah.</p>
          <p v-for="(p, k) in galatTingkat" :key="k" class="galat">{{ p }}</p>
        </div>

        <!-- Jadwal tagihan -->
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="label" for="pj-cair">Tanggal cair</label>
            <input id="pj-cair" v-model="f.tanggal_cair" type="date" class="masukan" @change="ikutiTanggalCair" />
          </div>
          <div class="sm:col-span-2">
            <span class="label">Tagihan pertama</span>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="m in (['bulan_ini', 'bulan_depan'] as const)" :key="m" type="button" class="pilihan" :class="{ 'pilihan-aktif': f.mulai_tagih === m }" @click="f.mulai_tagih = m">
                {{ m === 'bulan_ini' ? 'Bulan ini' : 'Bulan depan' }}
              </button>
            </div>
          </div>
          <div>
            <label class="label" for="pj-tgl">Jatuh tempo tiap tanggal</label>
            <input id="pj-tgl" v-model.number="f.tanggal_jatuh_tempo" type="number" min="1" max="31" class="masukan" />
          </div>
          <p class="self-end text-xs text-muted-foreground sm:col-span-2">
            Angsuran pertama jatuh tempo <b class="text-foreground">{{ simulasi?.jadwal[0] ? formatTanggal(simulasi.jadwal[0].jatuh_tempo) : '—' }}</b>.
            Tanggal 29–31 menyesuaikan akhir bulan.
          </p>
        </div>

        <div>
          <span class="label">Dana dicairkan lewat</span>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="m in (['tunai', 'transfer'] as const)" :key="m" type="button" class="pilihan" :class="{ 'pilihan-aktif': metodeCair === m }" :aria-pressed="metodeCair === m" @click="metodeCair = m">
              {{ m === 'tunai' ? 'Tunai (Kas)' : 'Transfer (Bank)' }}
            </button>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="pj-perlu">Keperluan</label>
            <input id="pj-perlu" v-model="keperluan" type="text" maxlength="500" class="masukan" placeholder="Mis. modal usaha" />
          </div>
          <div>
            <label class="label" for="pj-catatan">Catatan</label>
            <input id="pj-catatan" v-model="catatan" type="text" maxlength="1000" class="masukan" />
          </div>
        </div>
      </div>

      <!-- ================= Simulasi ================= -->
      <section class="min-w-0 space-y-3 xl:sticky xl:top-0 xl:self-start" aria-live="polite">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground">Simulasi angsuran</h3>
          <Loader2 v-if="menghitung" class="h-4 w-4 animate-spin text-muted-foreground" />
        </div>

        <div v-if="pesanSimulasi" class="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {{ pesanSimulasi }}
        </div>

        <template v-else-if="simulasi">
          <div class="grid grid-cols-3 gap-2">
            <div class="kotak">
              <p class="text-[11px] text-muted-foreground">{{ angsuranTetap ? 'Angsuran / bulan' : 'Angsuran pertama' }}</p>
              <p class="text-base font-bold tabular-nums text-foreground">{{ formatRupiah(simulasi.jadwal[0]?.total || 0) }}</p>
            </div>
            <div class="kotak">
              <p class="text-[11px] text-muted-foreground">Total bunga</p>
              <p class="text-base font-bold tabular-nums text-foreground">{{ formatRupiah(simulasi.total_bunga) }}</p>
            </div>
            <div class="kotak">
              <p class="text-[11px] text-muted-foreground">Total dibayar</p>
              <p class="text-base font-bold tabular-nums text-foreground">{{ formatRupiah(simulasi.total_tagihan) }}</p>
            </div>
          </div>

          <div class="max-h-[50vh] overflow-auto rounded-lg border border-border xl:max-h-[calc(100vh-18rem)]">
            <table class="w-full min-w-[440px] text-sm">
              <thead class="sticky top-0 bg-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th class="px-2 py-2 font-medium">Ke</th>
                  <th class="px-2 py-2 font-medium">Jatuh tempo</th>
                  <th class="px-2 py-2 text-right font-medium">Pokok</th>
                  <th class="px-2 py-2 text-right font-medium">Bunga</th>
                  <th class="px-2 py-2 text-right font-medium">Angsuran</th>
                  <th class="px-2 py-2 text-right font-medium">Sisa pokok</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="b in simulasi.jadwal" :key="b.ke">
                  <td class="px-2 py-1.5 tabular-nums text-muted-foreground">{{ b.ke }}</td>
                  <td class="whitespace-nowrap px-2 py-1.5 text-foreground">
                    {{ formatTanggal(b.jatuh_tempo) }}
                    <span v-if="f.jenis_bunga === 'berjangka'" class="ml-1 text-[11px] text-muted-foreground">{{ formatAngka(b.bunga_persen) }}%</span>
                  </td>
                  <td class="px-2 py-1.5 text-right tabular-nums text-foreground">{{ formatAngka(b.pokok) }}</td>
                  <td class="px-2 py-1.5 text-right tabular-nums text-foreground">{{ formatAngka(b.bunga) }}</td>
                  <td class="px-2 py-1.5 text-right font-medium tabular-nums text-foreground">{{ formatAngka(b.total) }}</td>
                  <td class="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{{ formatAngka(b.sisa_pokok) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </form>

    <template #footer>
      <div class="flex items-center gap-3">
        <p class="min-w-0 flex-1 text-xs text-muted-foreground">
          Saat disimpan, dana dicatat keluar dari {{ metodeCair === 'transfer' ? 'Bank' : 'Kas' }} (jurnal Piutang Pinjaman / {{ metodeCair === 'transfer' ? 'Bank' : 'Kas' }}, langsung diposting) dan angsuran mulai tertagih — termasuk oleh kolektor.
        </p>
        <button type="submit" form="form-pinjaman" class="tombol-utama" :disabled="menyimpan || !anggota || !simulasi || !!pesanSimulasi">
          <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
          Cairkan pinjaman
        </button>
      </div>
    </template>
  </PanelSheet>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Loader2, Search, X } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/kasir/InputRupiah.vue'
import { useToast } from '@/composables/useToast'
import { formatAngka, formatRupiah, formatTanggal } from '@/lib/format'
import { memberService, type MemberDetail } from '@/services/memberService'
import { pesanGalat } from '@/services/tokoService'
import {
  LABEL_JENIS_BUNGA,
  PENJELASAN_JENIS_BUNGA,
  pinjamanService,
  type JenisBunga,
  type MulaiTagih,
  type Pinjaman,
  type SatuanBunga,
  type Simulasi,
  type TingkatBunga
} from '@/services/pinjamanService'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; tersimpan: [pinjaman: Pinjaman] }>()

const { success, warning, error: toastError } = useToast()

const hariIni = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const awal = () => ({
  pokok: null as number | null,
  jenis_bunga: 'flat' as JenisBunga,
  bunga_persen: 1 as number | null,
  satuan_bunga: 'bulan' as SatuanBunga,
  tingkat_bunga: [{ dari: 1, sampai: 6, bunga_persen: 1 }] as TingkatBunga[],
  tenor_bulan: 12,
  tanggal_cair: hariIni(),
  mulai_tagih: 'bulan_depan' as MulaiTagih,
  tanggal_jatuh_tempo: new Date().getDate()
})

const f = reactive(awal())
const anggota = ref<MemberDetail | null>(null)
const keperluan = ref('')
const metodeCair = ref<'tunai' | 'transfer'>('tunai')
const catatan = ref('')
const galat = reactive<Record<string, string>>({})
const menyimpan = ref(false)

// ---------- Anggota ----------
const cariAnggota = ref('')
const hasilAnggota = ref<MemberDetail[]>([])
let timerAnggota: ReturnType<typeof setTimeout> | undefined
watch(cariAnggota, (q) => {
  clearTimeout(timerAnggota)
  if (q.trim().length < 2) {
    hasilAnggota.value = []
    return
  }
  timerAnggota = setTimeout(async () => {
    try {
      hasilAnggota.value = (await memberService.list({ globalFilter: q.trim(), rows: 8, filters: { status: 'aktif' } })).data
    } catch {
      hasilAnggota.value = []
    }
  }, 250)
})
const pilihAnggota = (m: MemberDetail) => {
  anggota.value = m
  cariAnggota.value = ''
  hasilAnggota.value = []
  delete galat.member_id
}

// ---------- Tingkat bunga ----------
const bisaTambahTingkat = computed(() => {
  const akhir = f.tingkat_bunga[f.tingkat_bunga.length - 1]
  return !akhir || akhir.sampai < f.tenor_bulan
})
const tambahTingkat = () => {
  const akhir = f.tingkat_bunga[f.tingkat_bunga.length - 1]
  const dari = akhir ? akhir.sampai + 1 : 1
  f.tingkat_bunga.push({ dari, sampai: f.tenor_bulan, bunga_persen: akhir?.bunga_persen ?? 1 })
}
const galatTingkat = computed(() =>
  Object.entries(galat)
    .filter(([k]) => k.startsWith('tingkat_bunga'))
    .map(([, v]) => v)
)

// Berpindah ke berjangka: dua tingkat bawaan yang menutup seluruh jangka waktu.
watch(
  () => f.jenis_bunga,
  (jenis) => {
    if (jenis !== 'berjangka') return
    const n = f.tenor_bulan || 1
    const dasar = f.bunga_persen ?? 1
    const tengah = Math.floor(n / 2)
    f.tingkat_bunga = n >= 2
      ? [{ dari: 1, sampai: tengah, bunga_persen: dasar }, { dari: tengah + 1, sampai: n, bunga_persen: dasar + 0.5 }]
      : [{ dari: 1, sampai: 1, bunga_persen: dasar }]
  }
)

// Jangka waktu berubah: tingkat terakhir ikut sampai bulan terakhir (yang melewati tenor dibuang).
watch(
  () => f.tenor_bulan,
  (n) => {
    if (f.jenis_bunga !== 'berjangka' || !n) return
    f.tingkat_bunga = f.tingkat_bunga.filter((t, i) => i === 0 || t.dari <= n)
    f.tingkat_bunga[f.tingkat_bunga.length - 1].sampai = n
  }
)

const ikutiTanggalCair = () => {
  const hari = Number(f.tanggal_cair.slice(8, 10))
  if (hari) f.tanggal_jatuh_tempo = hari
}

const angsuranTetap = computed(() => f.jenis_bunga === 'flat' || f.jenis_bunga === 'anuitas')

// ---------- Simulasi (debounce) ----------
const simulasi = ref<Simulasi | null>(null)
const menghitung = ref(false)
const pesanSimulasi = ref<string | null>('Isi jumlah pinjaman untuk melihat jadwal angsuran.')
let timerSimulasi: ReturnType<typeof setTimeout> | undefined
let urutan = 0

const input = () => ({
  pokok: f.pokok ?? 0,
  jenis_bunga: f.jenis_bunga,
  bunga_persen: f.jenis_bunga === 'berjangka' ? null : f.bunga_persen,
  satuan_bunga: f.satuan_bunga,
  tingkat_bunga: f.jenis_bunga === 'berjangka' ? f.tingkat_bunga : null,
  tenor_bulan: f.tenor_bulan,
  tanggal_cair: f.tanggal_cair,
  mulai_tagih: f.mulai_tagih,
  tanggal_jatuh_tempo: f.tanggal_jatuh_tempo
})

const hitung = async () => {
  if (!f.pokok || f.pokok <= 0) {
    simulasi.value = null
    pesanSimulasi.value = 'Isi jumlah pinjaman untuk melihat jadwal angsuran.'
    return
  }
  const ke = ++urutan
  menghitung.value = true
  try {
    const hasil = await pinjamanService.simulasi(input())
    if (ke !== urutan) return
    simulasi.value = hasil
    pesanSimulasi.value = null
    Object.keys(galat).filter((k) => k !== 'member_id').forEach((k) => delete galat[k])
  } catch (e: any) {
    if (ke !== urutan) return
    simulasi.value = null
    const errs = e?.data?.errors as Record<string, string[]> | undefined
    Object.keys(galat).filter((k) => k !== 'member_id').forEach((k) => delete galat[k])
    if (errs) Object.entries(errs).forEach(([k, v]) => (galat[k] = v[0]))
    pesanSimulasi.value = pesanGalat(e, 'Periksa kembali isian pinjaman.')
  } finally {
    if (ke === urutan) menghitung.value = false
  }
}

watch(
  () => JSON.stringify(input()),
  () => {
    clearTimeout(timerSimulasi)
    timerSimulasi = setTimeout(hitung, 300)
  }
)

// Form selalu mulai bersih saat dibuka.
watch(
  () => props.open,
  (buka) => {
    if (!buka) return
    Object.assign(f, awal())
    anggota.value = null
    keperluan.value = ''
    catatan.value = ''
    metodeCair.value = 'tunai'
    simulasi.value = null
    pesanSimulasi.value = 'Isi jumlah pinjaman untuk melihat jadwal angsuran.'
    Object.keys(galat).forEach((k) => delete galat[k])
  }
)

const simpan = async () => {
  if (!anggota.value) {
    galat.member_id = 'Pilih anggota peminjam.'
    return
  }
  menyimpan.value = true
  try {
    const res = await pinjamanService.buat({
      ...input(),
      member_id: anggota.value.id,
      metode_cair: metodeCair.value,
      keperluan: keperluan.value || null,
      catatan: catatan.value || null
    })
    if (res.peringatan.length) warning(res.message, { description: res.peringatan[0] })
    else success(res.message)
    emit('tersimpan', res.data)
  } catch (e: any) {
    const errs = e?.data?.errors as Record<string, string[]> | undefined
    if (errs) Object.entries(errs).forEach(([k, v]) => (galat[k] = v[0]))
    toastError(pesanGalat(e, 'Gagal menyimpan pinjaman'))
  } finally {
    menyimpan.value = false
  }
}
</script>

<style scoped>
@reference "../../assets/main.css";

/* Dalam layer components supaya utility Tailwind tetap bisa menimpa. */
@layer components {
  .label {
    @apply mb-1 block text-sm font-medium text-foreground;
  }

  .label-kecil {
    @apply mb-1 block text-xs text-muted-foreground;
  }

  .masukan {
    @apply h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }

  .pilihan {
    @apply h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted;
  }

  .pilihan-aktif {
    @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
  }

  .chip {
    @apply rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground;
  }

  .chip-aktif {
    @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
  }

  .kotak {
    @apply rounded-lg bg-muted/60 px-3 py-2;
  }

  .tombol-utama {
    @apply inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .galat {
    @apply mt-1 text-xs text-red-600 dark:text-red-400;
  }
}
</style>
