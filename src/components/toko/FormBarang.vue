<template>
  <PanelSheet
    :open="open"
    lebar="lebar"
    :title="barang ? 'Ubah Barang' : 'Tambah Barang'"
    :subtitle="barang ? `${barang.kode} · ${barang.nama}` : 'Data barang beserta satuan & harganya'"
    @close="$emit('close')"
  >
    <form id="form-barang" class="space-y-6" novalidate @submit.prevent="simpan">
      <!-- ============ Data barang ============ -->
      <section class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label for="barang-nama" class="label">Nama barang <span class="text-red-600 dark:text-red-400">*</span></label>
          <input id="barang-nama" v-model="form.nama" type="text" maxlength="150" placeholder="mis. Aqua Air Mineral 600 ml" class="isian" :class="kelasGalat('nama')" />
          <p v-if="errors.nama" class="pesan-galat">{{ errors.nama }}</p>
        </div>

        <div>
          <label for="barang-kode" class="label">Kode <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <input id="barang-kode" v-model="form.kode" type="text" maxlength="30" placeholder="Otomatis, mis. BRG00001" class="isian font-mono" :class="kelasGalat('kode')" />
          <p v-if="errors.kode" class="pesan-galat">{{ errors.kode }}</p>
          <p v-else-if="!barang" class="mt-1 text-xs text-muted-foreground">Kosongkan agar dibuat otomatis.</p>
        </div>

        <div>
          <label for="barang-kelompok" class="label">Kelompok</label>
          <select id="barang-kelompok" v-model="form.kelompok_id" class="isian" :class="kelasGalat('kelompok_id')">
            <option :value="null">— Tanpa kelompok —</option>
            <option v-for="k in pilihanKelompok" :key="k.id" :value="k.id">{{ k.nama }}{{ k.is_aktif ? '' : ' (nonaktif)' }}</option>
          </select>
          <p v-if="errors.kelompok_id" class="pesan-galat">{{ errors.kelompok_id }}</p>
        </div>

        <div>
          <label for="barang-merk" class="label">Merk</label>
          <select id="barang-merk" v-model="form.merk_id" class="isian" :class="kelasGalat('merk_id')">
            <option :value="null">— Tanpa merk —</option>
            <option v-for="m in pilihanMerk" :key="m.id" :value="m.id">{{ m.nama }}{{ m.is_aktif ? '' : ' (nonaktif)' }}</option>
          </select>
          <p v-if="errors.merk_id" class="pesan-galat">{{ errors.merk_id }}</p>
          <p v-else-if="!merkList.length" class="mt-1 text-xs text-muted-foreground">
            Belum ada merk.
            <RouterLink v-if="userStore.can('toko.merk')" to="/toko/merk" class="font-medium text-green-700 hover:underline dark:text-green-400">Tambah di menu Merk</RouterLink>
          </p>
        </div>

        <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input v-model="form.is_aktif" type="checkbox" class="mt-0.5 h-4 w-4 accent-green-600" />
          <span>
            <span class="block text-sm font-medium text-foreground">Barang aktif</span>
            <span class="block text-xs text-muted-foreground">Barang nonaktif tidak bisa dijual atau dibeli.</span>
          </span>
        </label>

        <div class="sm:col-span-2">
          <label for="barang-keterangan" class="label">Keterangan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea id="barang-keterangan" v-model="form.keterangan" rows="2" maxlength="1000" class="isian-area border-border" placeholder="Catatan tentang barang ini" />
        </div>
      </section>

      <!-- ============ Satuan & harga ============ -->
      <section class="space-y-3">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-foreground">Satuan & harga</h3>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Satu barang bisa dijual/dibeli dalam beberapa satuan, mis. Botol (isi 1) dan Dus (isi 24). Stok dicatat terpisah per satuan.
            </p>
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-xs text-foreground">
            <input v-model="bulat" type="checkbox" class="h-3.5 w-3.5 accent-green-600" @change="terapkanPembulatan" />
            Bulatkan harga jual ke atas Rp100
          </label>
        </div>

        <div v-if="memuatSatuan" class="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 class="h-4 w-4 animate-spin" /> Memuat satuan…</div>

        <div
          v-else-if="!satuanList.length && !baris.some((b) => b.satuan_id)"
          class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Belum ada data satuan (mis. Pcs, Botol, Dus).
            <RouterLink v-if="userStore.can('toko.satuan')" to="/toko/satuan" class="font-medium underline">Tambahkan satuan dulu di menu Satuan</RouterLink>
            <template v-else>Minta admin toko menambahkannya di menu Satuan.</template>
          </span>
        </div>

        <p v-if="errors.satuan" class="pesan-galat">{{ errors.satuan }}</p>

        <ul class="space-y-3">
          <li
            v-for="(b, i) in baris"
            :key="b.kunci"
            class="rounded-xl border p-3 sm:p-4"
            :class="b.is_aktif ? 'border-border' : 'border-dashed border-border bg-muted/40'"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <p class="min-w-0 truncate text-sm font-medium text-foreground">
                Satuan {{ i + 1 }}<span v-if="namaSatuan(b)" class="font-normal text-muted-foreground"> · {{ namaSatuan(b) }}<template v-if="b.isi"> isi {{ formatQty(b.isi) }}</template></span>
                <span v-if="!b.is_aktif" class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">nonaktif</span>
              </p>
              <button
                type="button"
                class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                :disabled="baris.length <= 1"
                :aria-label="`Hapus satuan ${i + 1}`"
                :title="b.id ? 'Hapus baris (bila sudah punya riwayat, satuan ini dinonaktifkan)' : 'Hapus baris'"
                @click="hapusBaris(i)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="col-span-2 sm:col-span-1">
                <label :for="`sat-${b.kunci}-satuan`" class="label-kecil">Satuan *</label>
                <select :id="`sat-${b.kunci}-satuan`" v-model="b.satuan_id" class="isian" :class="kelasGalat(`satuan.${i}.satuan_id`)">
                  <option :value="null" disabled>Pilih satuan</option>
                  <option v-for="s in pilihanSatuan(b)" :key="s.id" :value="s.id" :disabled="dipakaiBarisLain(s.id, i)">
                    {{ s.nama }}{{ s.singkatan ? ` (${s.singkatan})` : '' }}{{ s.is_aktif ? '' : ' — nonaktif' }}
                  </option>
                </select>
                <p v-if="errors[`satuan.${i}.satuan_id`]" class="pesan-galat">{{ errors[`satuan.${i}.satuan_id`] }}</p>
              </div>

              <div>
                <label :for="`sat-${b.kunci}-isi`" class="label-kecil" title="Jumlah satuan terkecil dalam satu satuan ini">Isi *</label>
                <input
                  :id="`sat-${b.kunci}-isi`"
                  v-model.number="b.isi"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="any"
                  placeholder="1"
                  class="isian tabular-nums"
                  :class="kelasGalat(`satuan.${i}.isi`)"
                />
                <p v-if="errors[`satuan.${i}.isi`]" class="pesan-galat">{{ errors[`satuan.${i}.isi`] }}</p>
              </div>

              <div>
                <label :for="`sat-${b.kunci}-barcode`" class="label-kecil">Barcode</label>
                <input
                  :id="`sat-${b.kunci}-barcode`"
                  v-model="b.barcode"
                  type="text"
                  maxlength="50"
                  placeholder="Scan / ketik"
                  class="isian font-mono"
                  :class="kelasGalat(`satuan.${i}.barcode`)"
                />
                <p v-if="errors[`satuan.${i}.barcode`]" class="pesan-galat">{{ errors[`satuan.${i}.barcode`] }}</p>
              </div>

              <div>
                <label :for="`sat-${b.kunci}-beli`" class="label-kecil">Harga beli *</label>
                <InputRupiah
                  :id="`sat-${b.kunci}-beli`"
                  :model-value="b.harga_beli"
                  placeholder="0"
                  :invalid="!!errors[`satuan.${i}.harga_beli`]"
                  @update:model-value="ubahBeli(b, $event)"
                />
                <p v-if="errors[`satuan.${i}.harga_beli`]" class="pesan-galat">{{ errors[`satuan.${i}.harga_beli`] }}</p>
              </div>

              <div>
                <label :for="`sat-${b.kunci}-margin`" class="label-kecil">Margin</label>
                <div class="relative">
                  <input
                    :id="`sat-${b.kunci}-margin`"
                    v-model.number="b.margin"
                    type="number"
                    inputmode="decimal"
                    step="any"
                    min="-100"
                    placeholder="mis. 10"
                    class="isian pr-8 tabular-nums"
                    :class="kelasGalat(`satuan.${i}.margin_persen`)"
                    @input="ubahMargin(b, ($event.target as HTMLInputElement).value)"
                  />
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div class="col-span-2 sm:col-span-1">
                <label :for="`sat-${b.kunci}-jual`" class="label-kecil">Harga jual *</label>
                <InputRupiah
                  :id="`sat-${b.kunci}-jual`"
                  :model-value="b.harga_jual"
                  placeholder="0"
                  :invalid="!!errors[`satuan.${i}.harga_jual`]"
                  @update:model-value="ubahJual(b, $event)"
                />
                <p v-if="errors[`satuan.${i}.harga_jual`]" class="pesan-galat">{{ errors[`satuan.${i}.harga_jual`] }}</p>
                <p v-else-if="b.harga_jual != null && b.harga_beli != null" class="mt-1 text-xs tabular-nums" :class="kelasTeksMargin(marginAktual(b))">
                  Untung {{ formatRupiah(b.harga_jual - b.harga_beli) }} · margin aktual {{ formatPersen(marginAktual(b)) }}
                </p>
              </div>

              <div>
                <label :for="`sat-${b.kunci}-min`" class="label-kecil" title="Batas peringatan stok menipis">Stok minimum</label>
                <input
                  :id="`sat-${b.kunci}-min`"
                  v-model.number="b.stok_minimum"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="any"
                  placeholder="0"
                  class="isian tabular-nums"
                  :class="kelasGalat(`satuan.${i}.stok_minimum`)"
                />
              </div>

              <div>
                <span class="label-kecil">Stok saat ini</span>
                <p
                  class="flex h-10 items-center gap-1.5 rounded-lg bg-muted/60 px-3 text-sm tabular-nums"
                  :class="b.id ? kelasTeksStok(b) : 'text-muted-foreground'"
                  title="Stok berubah lewat dokumen gudang (penerimaan, retur, penyesuaian, opname) dan penjualan kasir"
                >
                  <template v-if="b.id">{{ formatQty(b.stok ?? 0) }}</template>
                  <template v-else>0 · baru</template>
                </p>
              </div>

              <label class="col-span-2 flex cursor-pointer items-center gap-2 self-end pb-2.5 text-sm text-foreground sm:col-span-1">
                <input v-model="b.is_aktif" type="checkbox" class="h-4 w-4 accent-green-600" />
                Satuan aktif
              </label>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-foreground transition-colors hover:border-green-600 hover:text-green-700 disabled:opacity-50 dark:hover:text-green-400"
          :disabled="baris.length >= 10"
          @click="tambahBaris"
        >
          <Plus class="h-4 w-4" /> Tambah satuan lain
        </button>

        <p class="flex gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
          <Info class="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Isi harga beli dan margin, harga jual dihitung otomatis. Mengubah harga jual langsung memperbarui margin.
            Stok tidak bisa diubah di sini — stok bertambah/berkurang lewat dokumen gudang dan penjualan kasir.
            Satuan yang dihapus dari daftar ini akan dinonaktifkan bila sudah punya riwayat.
          </span>
        </p>
      </section>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <button v-if="barang" type="button" class="tombol-hapus-teks" :disabled="menyimpan" @click="$emit('hapus', barang)">
          <Trash2 class="h-4 w-4" /> <span class="hidden sm:inline">Hapus barang</span><span class="sm:hidden">Hapus</span>
        </button>
        <div class="ml-auto flex gap-2">
          <button type="button" class="tombol-garis" :disabled="menyimpan" @click="$emit('close')">Batal</button>
          <button type="submit" form="form-barang" class="tombol-utama" :disabled="menyimpan || memuatSatuan">
            <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
            {{ barang ? 'Simpan perubahan' : 'Simpan barang' }}
          </button>
        </div>
      </div>
    </template>
  </PanelSheet>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Info, Loader2, Plus, Trash2, TriangleAlert } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/toko/InputRupiah.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatRupiah } from '@/lib/format'
import {
  barangService,
  formatQty,
  hargaJualDariMargin,
  marginDariHarga,
  masterService,
  pesanGalat,
  type Barang,
  type BarangPayload,
  type KelompokBarang,
  type Merk,
  type Satuan
} from '@/services/tokoService'
import { formatPersen, kelasTeksMargin } from '@/components/toko/margin'

interface BarisSatuan {
  kunci: number
  id?: number
  satuan_id: number | null
  /** Nama satuan tersimpan (untuk satuan yang sudah nonaktif di master). */
  satuanNama: string | null
  isi: number | null
  barcode: string
  harga_beli: number | null
  margin: number | null
  harga_jual: number | null
  stok_minimum: number | null
  stok: number | null
  is_aktif: boolean
  /** Harga di baris ini sudah disentuh di form ini (pembulatan boleh menghitung ulang). */
  diubah: boolean
}

const props = defineProps<{
  open: boolean
  /** null = tambah barang baru. */
  barang: Barang | null
  kelompokList: KelompokBarang[]
  merkList: Merk[]
  /** Kelompok terpilih di halaman — jadi bawaan barang baru. */
  kelompokAwal?: number | null
}>()

const emit = defineEmits<{
  close: []
  tersimpan: [barang: Barang, baru: boolean]
  hapus: [barang: Barang]
}>()

const { success, error: toastError } = useToast()
const userStore = useUserStore()

const form = reactive({
  kode: '',
  nama: '',
  kelompok_id: null as number | null,
  merk_id: null as number | null,
  keterangan: '',
  is_aktif: true
})
const baris = ref<BarisSatuan[]>([])
const errors = reactive<Record<string, string>>({})
const bulat = ref(true)
const menyimpan = ref(false)
const memuatSatuan = ref(false)
const satuanList = ref<Satuan[]>([])

let kunciBerikut = 1
const barisBaru = (sebelum?: BarisSatuan): BarisSatuan => ({
  kunci: kunciBerikut++,
  satuan_id: null,
  satuanNama: null,
  isi: sebelum ? null : 1,
  barcode: '',
  harga_beli: null,
  // Margin baris baru mengikuti baris sebelumnya supaya cepat diisi.
  margin: sebelum?.margin ?? null,
  harga_jual: null,
  stok_minimum: null,
  stok: null,
  is_aktif: true,
  diubah: false
})

const bersihkanGalat = () => Object.keys(errors).forEach((k) => delete errors[k])
const kelasGalat = (kunci: string) => (errors[kunci] ? 'border-red-500' : 'border-border')

// --- Pilihan select (yang aktif + yang sedang dipakai barang ini) ---
const pilihanKelompok = computed(() => props.kelompokList.filter((k) => k.is_aktif || k.id === form.kelompok_id))
const pilihanMerk = computed(() => props.merkList.filter((m) => m.is_aktif || m.id === form.merk_id))
const pilihanSatuan = (b: BarisSatuan): Satuan[] => {
  if (b.satuan_id && !satuanList.value.some((s) => s.id === b.satuan_id)) {
    return [...satuanList.value, { id: b.satuan_id, nama: b.satuanNama || `Satuan #${b.satuan_id}`, singkatan: null, is_aktif: false }]
  }
  return satuanList.value
}
const dipakaiBarisLain = (satuanId: number, i: number) => baris.value.some((b, j) => j !== i && b.satuan_id === satuanId)
const namaSatuan = (b: BarisSatuan) =>
  b.satuan_id ? satuanList.value.find((s) => s.id === b.satuan_id)?.nama || b.satuanNama || '' : ''

// --- Harga: beli + margin → jual; ubah jual → margin ---
const hitungJual = (beli: number, margin: number) => hargaJualDariMargin(beli, margin, bulat.value ? 100 : 0)
const marginAktual = (b: BarisSatuan) => marginDariHarga(b.harga_beli ?? 0, b.harga_jual ?? 0)

const ubahBeli = (b: BarisSatuan, nilai: number | null) => {
  b.harga_beli = nilai
  b.diubah = true
  if (nilai == null) return
  if (b.margin != null) b.harga_jual = hitungJual(nilai, b.margin)
  else if (b.harga_jual != null) b.margin = marginDariHarga(nilai, b.harga_jual)
}

const ubahMargin = (b: BarisSatuan, mentah: string) => {
  const nilai = mentah === '' ? null : Number(mentah)
  if (nilai != null && !Number.isFinite(nilai)) return
  b.margin = nilai
  b.diubah = true
  if (nilai != null && b.harga_beli != null) b.harga_jual = hitungJual(b.harga_beli, nilai)
}

const ubahJual = (b: BarisSatuan, nilai: number | null) => {
  b.harga_jual = nilai
  b.diubah = true
  if (nilai != null && b.harga_beli) b.margin = marginDariHarga(b.harga_beli, nilai)
}

/** Centang/lepas pembulatan: hitung ulang baris yang harganya sedang diisi di form ini. */
const terapkanPembulatan = () => {
  baris.value.forEach((b) => {
    if (b.diubah && b.harga_beli != null && b.margin != null) b.harga_jual = hitungJual(b.harga_beli, b.margin)
  })
}

const kelasTeksStok = (b: BarisSatuan) => {
  const stok = b.stok ?? 0
  if (stok <= 0) return 'font-semibold text-red-600 dark:text-red-400'
  if (stok <= (b.stok_minimum ?? 0)) return 'font-semibold text-amber-700 dark:text-amber-400'
  return 'text-foreground'
}

const tambahBaris = () => {
  baris.value.push(barisBaru(baris.value[baris.value.length - 1]))
}

const hapusBaris = (i: number) => {
  if (baris.value.length <= 1) return
  baris.value.splice(i, 1)
  // Indeks galat dari server tidak lagi cocok.
  Object.keys(errors).filter((k) => k.startsWith('satuan.')).forEach((k) => delete errors[k])
}

// --- Buka form ---
const isi = () => {
  bersihkanGalat()
  bulat.value = true
  const b = props.barang
  Object.assign(form, {
    kode: b?.kode ?? '',
    nama: b?.nama ?? '',
    kelompok_id: b ? b.kelompok_id : props.kelompokAwal ?? null,
    merk_id: b?.merk_id ?? null,
    keterangan: b?.keterangan ?? '',
    is_aktif: b?.is_aktif ?? true
  })
  baris.value = b?.satuan.length
    ? b.satuan.map((s) => ({
        kunci: kunciBerikut++,
        id: s.id,
        satuan_id: s.satuan_id,
        satuanNama: s.satuan,
        isi: s.isi,
        barcode: s.barcode ?? '',
        harga_beli: s.harga_beli,
        margin: s.margin_persen,
        harga_jual: s.harga_jual,
        stok_minimum: s.stok_minimum,
        stok: s.stok,
        is_aktif: s.is_aktif,
        diubah: false
      }))
    : [barisBaru()]
}

const muatSatuan = async () => {
  memuatSatuan.value = true
  try {
    satuanList.value = await masterService.list<Satuan>('satuan', { is_aktif: true })
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat daftar satuan'))
  } finally {
    memuatSatuan.value = false
  }
}

watch(
  () => props.open,
  (buka) => {
    if (!buka) return
    isi()
    muatSatuan()
  },
  { immediate: true }
)

// --- Simpan ---
const validasi = () => {
  bersihkanGalat()
  if (!form.nama.trim()) errors.nama = 'Nama barang wajib diisi.'
  if (!baris.value.length) errors.satuan = 'Minimal satu satuan.'
  baris.value.forEach((b, i) => {
    if (!b.satuan_id) errors[`satuan.${i}.satuan_id`] = 'Pilih satuan.'
    else if (baris.value.findIndex((x) => x.satuan_id === b.satuan_id) < i) errors[`satuan.${i}.satuan_id`] = 'Satuan yang sama dipakai dua kali.'
    if (!b.isi || b.isi <= 0) errors[`satuan.${i}.isi`] = 'Isi harus lebih dari 0.'
    if (b.harga_beli == null) errors[`satuan.${i}.harga_beli`] = 'Isi harga beli.'
    if (b.harga_jual == null) errors[`satuan.${i}.harga_jual`] = 'Isi harga jual.'
    const bc = b.barcode.trim()
    if (bc && baris.value.findIndex((x) => x.barcode.trim() === bc) < i) errors[`satuan.${i}.barcode`] = 'Barcode yang sama dipakai dua kali.'
  })
  return Object.keys(errors).length === 0
}

const payload = (): BarangPayload => ({
  kode: form.kode.trim() || null,
  nama: form.nama.trim(),
  kelompok_id: form.kelompok_id,
  merk_id: form.merk_id,
  keterangan: form.keterangan.trim() || null,
  is_aktif: form.is_aktif,
  satuan: baris.value.map((b) => ({
    ...(b.id ? { id: b.id } : {}),
    satuan_id: b.satuan_id as number,
    barcode: b.barcode.trim() || null,
    isi: b.isi as number,
    harga_beli: b.harga_beli ?? 0,
    margin_persen: b.margin,
    harga_jual: b.harga_jual ?? 0,
    stok_minimum: b.stok_minimum ?? 0,
    is_aktif: b.is_aktif
  }))
})

const simpan = async () => {
  if (!validasi()) {
    document.querySelector<HTMLElement>('#form-barang [aria-invalid="true"], #form-barang .border-red-500')?.focus()
    return
  }
  menyimpan.value = true
  try {
    const baru = !props.barang
    const hasil = props.barang ? await barangService.update(props.barang.id, payload()) : await barangService.create(payload())
    success(baru ? 'Barang ditambahkan' : 'Barang diperbarui', { description: `${hasil.kode} · ${hasil.nama}` })
    emit('tersimpan', hasil, baru)
  } catch (e: any) {
    const errs: Record<string, string[]> | undefined = e?.data?.errors
    if (errs) {
      Object.entries(errs).forEach(([k, msgs]) => (errors[k] = msgs[0]))
      // Galat yang tidak punya tempat di form (mis. satuan.0.id) → toast.
      const dikenal = /^(kode|nama|kelompok_id|merk_id|satuan|satuan\.\d+\.(satuan_id|isi|barcode|harga_beli|harga_jual|margin_persen))$/
      const lain = Object.keys(errs).find((k) => !dikenal.test(k))
      toastError('Periksa kembali isian barang', { description: lain ? errs[lain][0] : pesanGalat(e, 'Ada isian yang belum benar.') })
    } else {
      toastError(pesanGalat(e, 'Gagal menyimpan barang'))
    }
  } finally {
    menyimpan.value = false
  }
}
</script>

<style scoped>
@reference "../../assets/main.css";

/* Di layer components supaya utilitas (pr-8, border-*) tetap bisa menimpa. */
@layer components {
  .label {
    @apply mb-1 block text-sm font-medium text-foreground;
  }

  .label-kecil {
    @apply mb-1 block text-xs font-medium text-muted-foreground;
  }

  .isian {
    @apply h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }

  .pesan-galat {
    @apply mt-1 text-xs text-red-600 dark:text-red-400;
  }

  .tombol-utama {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .tombol-garis {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50;
  }

  .tombol-hapus-teks {
    @apply inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30;
  }

  .isian-area {
    @apply w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }
}
</style>
