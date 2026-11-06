<template>
  <PanelSheet :open="tagihan !== null" title="Pembayaran simpanan" :subtitle="judul" @close="$emit('close')">
    <div v-if="tagihan" class="space-y-5">
      <div class="grid grid-cols-3 gap-2">
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Tagihan</p>
          <p class="font-semibold tabular-nums text-foreground">{{ formatRupiah(t.amount) }}</p>
        </div>
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Sudah masuk kas</p>
          <p class="font-semibold tabular-nums text-foreground">{{ formatRupiah(t.terbayar) }}</p>
        </div>
        <div class="kotak">
          <p class="text-[11px] text-muted-foreground">Sisa</p>
          <p class="font-semibold tabular-nums" :class="t.sisa > 0 ? 'text-foreground' : 'text-green-700 dark:text-green-400'">{{ formatRupiah(t.sisa) }}</p>
        </div>
      </div>

      <div v-if="t.menunggu_setoran > 0" class="flex gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
        <Clock class="mt-0.5 h-4 w-4 shrink-0" />
        {{ formatRupiah(t.menunggu_setoran) }} sudah dibayar ke kolektor dan menunggu setoran diverifikasi.
      </div>

      <!-- Form bayar -->
      <form v-if="t.status !== 'lunas' && t.sisa > 0" id="form-bayar-simpanan" class="space-y-3 rounded-lg border border-border p-3" @submit.prevent="bayar">
        <div>
          <label class="mb-1 block text-sm font-medium text-foreground" for="bayar-simpanan">Nominal diterima</label>
          <InputRupiah id="bayar-simpanan" v-model="nominal" :invalid="!!galat" />
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <button type="button" class="chip" @click="nominal = t.sisa">Lunasi · {{ formatAngka(t.sisa) }}</button>
          </div>
          <p v-if="galat" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ galat }}</p>
        </div>
        <div>
          <span class="mb-1 block text-sm font-medium text-foreground">Diterima lewat</span>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="m in (['tunai', 'transfer'] as const)" :key="m" type="button" class="pilihan" :class="{ 'pilihan-aktif': metode === m }" :aria-pressed="metode === m" @click="metode = m">
              {{ m === 'tunai' ? 'Tunai (Kas)' : 'Transfer (Bank)' }}
            </button>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-foreground" for="catatan-simpanan">Catatan</label>
          <input id="catatan-simpanan" v-model="catatan" type="text" maxlength="500" class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30" />
        </div>
        <p class="text-xs text-muted-foreground">
          Langsung dijurnal & diposting: {{ metode === 'transfer' ? 'Bank' : 'Kas' }} (D) / Simpanan {{ t.type }} (K). Boleh bayar sebagian.
        </p>
      </form>
      <p v-else-if="t.status === 'lunas'" class="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
        <CircleCheck class="h-4 w-4 shrink-0" /> Tagihan ini sudah lunas.
      </p>

      <!-- Riwayat -->
      <section>
        <h3 class="mb-2 text-sm font-semibold text-foreground">Riwayat pembayaran</h3>
        <div v-if="memuat" class="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 class="h-4 w-4 animate-spin" /> Memuat...</div>
        <ul v-else-if="riwayat.length" class="divide-y divide-border rounded-lg border border-border">
          <li v-for="r in riwayat" :key="r.id" class="px-3 py-2.5" :class="{ 'opacity-60': r.dibatalkan_at }">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-foreground">
                  {{ r.nomor || '—' }}
                  <span class="font-normal text-muted-foreground">· {{ r.sumber === 'kolektor' ? 'via kolektor' : r.metode === 'transfer' ? 'transfer bank' : 'tunai di kantor' }}</span>
                </p>
                <p class="text-xs text-muted-foreground">{{ formatWaktu(r.tanggal) }}<template v-if="r.oleh"> · {{ r.oleh }}</template></p>
                <p v-if="r.dibatalkan_at" class="text-xs text-red-600 dark:text-red-400">Dibatalkan: {{ r.alasan_batal }}</p>
                <p v-else-if="r.sumber === 'kolektor'" class="text-xs text-muted-foreground">{{ LABEL_KOLEKTOR[r.status ?? ''] ?? r.status }}</p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-semibold tabular-nums text-foreground" :class="{ 'line-through': r.dibatalkan_at }">{{ formatRupiah(r.nominal) }}</p>
                <button v-if="r.bisa_dibatalkan" type="button" class="mt-0.5 text-xs font-medium text-red-600 hover:underline dark:text-red-400" @click="mintaBatal(r)">Batalkan</button>
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">Belum ada pembayaran.</p>
      </section>

      <!-- Konfirmasi batal -->
      <div v-if="batalTarget" class="space-y-2 rounded-lg border border-red-200 p-3 dark:border-red-900">
        <p class="text-sm text-foreground">
          Batalkan <b>{{ batalTarget.nomor }}</b> ({{ formatRupiah(batalTarget.nominal) }})? Jurnal pembalik dibuat dan tagihan kembali tertagih.
        </p>
        <input v-model="alasan" type="text" maxlength="255" placeholder="Alasan pembatalan" aria-label="Alasan pembatalan" class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/30" />
        <div class="flex justify-end gap-2">
          <button type="button" class="h-9 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted" @click="batalTarget = null">Tidak</button>
          <button type="button" class="h-9 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50" :disabled="!alasan.trim() || memproses" @click="batalkan">Batalkan pembayaran</button>
        </div>
      </div>
    </div>

    <template v-if="tagihan && t.status !== 'lunas' && t.sisa > 0" #footer>
      <button type="submit" form="form-bayar-simpanan" class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50" :disabled="memproses || !nominal">
        <Loader2 v-if="memproses" class="h-4 w-4 animate-spin" />
        Terima {{ formatRupiah(nominal || 0) }}
      </button>
    </template>
  </PanelSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CircleCheck, Clock, Loader2 } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/kasir/InputRupiah.vue'
import { useToast } from '@/composables/useToast'
import { formatAngka, formatPeriode, formatRupiah } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { pesanGalat } from '@/services/tokoService'
import { simpananService, type MetodeBayar, type RiwayatPembayaranSimpanan, type SimpananBilling } from '@/services/simpananService'

const props = defineProps<{ tagihan: SimpananBilling | null }>()
const emit = defineEmits<{ close: []; berubah: [] }>()

const LABEL_KOLEKTOR: Record<string, string> = {
  diterima_kolektor: 'Dipegang kolektor',
  disetor: 'Menunggu verifikasi setoran',
  diverifikasi: 'Masuk kas (setoran diverifikasi)',
  dibatalkan: 'Dibatalkan kolektor'
}

const { success, warning, error: toastError } = useToast()

/** Data tagihan terbaru (diperbarui setelah bayar/batal). */
const terkini = ref<SimpananBilling | null>(null)
const t = computed(() => (terkini.value ?? props.tagihan) as SimpananBilling)
const judul = computed(() => (props.tagihan ? `${props.tagihan.member_name} · ${props.tagihan.type} ${formatPeriode(props.tagihan.period)}` : ''))

const riwayat = ref<RiwayatPembayaranSimpanan[]>([])
const memuat = ref(false)
const memproses = ref(false)
const nominal = ref<number | null>(null)
const metode = ref<MetodeBayar>('tunai')
const catatan = ref('')
const galat = ref('')
const batalTarget = ref<RiwayatPembayaranSimpanan | null>(null)
const alasan = ref('')

const muatRiwayat = async () => {
  if (!props.tagihan) return
  memuat.value = true
  try {
    const res = await simpananService.riwayat(props.tagihan.id)
    riwayat.value = res.data
    terkini.value = res.tagihan
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat riwayat pembayaran'))
  } finally {
    memuat.value = false
  }
}

watch(
  () => props.tagihan,
  (baru) => {
    terkini.value = null
    riwayat.value = []
    batalTarget.value = null
    galat.value = ''
    catatan.value = ''
    metode.value = 'tunai'
    nominal.value = baru ? baru.sisa ?? baru.amount : null
    if (baru) muatRiwayat()
  },
  { immediate: true }
)

const bayar = async () => {
  if (!props.tagihan || !nominal.value) return
  memproses.value = true
  galat.value = ''
  try {
    const res = await simpananService.bayar(props.tagihan.id, { nominal: nominal.value, metode: metode.value, catatan: catatan.value || null })
    if (res.peringatan.length) warning(res.message, { description: res.peringatan[0] })
    else success(res.message, { description: res.data.status === 'lunas' ? 'Tagihan lunas.' : `Sisa ${formatRupiah(res.data.sisa)}.` })
    terkini.value = res.data
    nominal.value = res.data.sisa || null
    catatan.value = ''
    await muatRiwayat()
    emit('berubah')
  } catch (e: any) {
    galat.value = pesanGalat(e, 'Gagal mencatat pembayaran')
  } finally {
    memproses.value = false
  }
}

const mintaBatal = (r: RiwayatPembayaranSimpanan) => {
  batalTarget.value = r
  alasan.value = ''
}

const batalkan = async () => {
  if (!batalTarget.value) return
  memproses.value = true
  try {
    const res = await simpananService.batalPembayaran(Number(batalTarget.value.id), alasan.value.trim())
    success(res.message)
    batalTarget.value = null
    await muatRiwayat()
    nominal.value = t.value.sisa || null
    emit('berubah')
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal membatalkan pembayaran'))
  } finally {
    memproses.value = false
  }
}
</script>

<style scoped>
@reference "../../assets/main.css";

@layer components {
  .kotak {
    @apply rounded-lg bg-muted/60 px-3 py-2;
  }

  .chip {
    @apply rounded-full border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted;
  }

  .pilihan {
    @apply h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted;
  }

  .pilihan-aktif {
    @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
  }
}
</style>
