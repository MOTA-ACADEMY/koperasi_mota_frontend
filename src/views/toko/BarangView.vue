<template>
  <div class="space-y-4 p-4 sm:p-6">
    <!-- Kepala halaman -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">Barang</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Daftar barang toko beserta satuan, harga, margin, dan stok per satuan.
        </p>
      </div>
      <button v-if="bisaUbah" type="button" class="tombol-utama" @click="bukaTambah">
        <Plus class="h-4 w-4" /> Tambah Barang
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <!-- ============ Kelompok (layar lebar) ============ -->
      <aside class="hidden self-start overflow-hidden rounded-xl border border-border bg-card lg:block">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 class="text-sm font-semibold text-foreground">Kelompok barang</h2>
          <button
            v-if="bisaUbah"
            type="button"
            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Tambah kelompok"
            title="Tambah kelompok"
            @click="bukaKelompok(null)"
          >
            <Plus class="h-4 w-4" />
          </button>
        </div>
        <ul class="max-h-[calc(100vh-14rem)] overflow-y-auto p-1.5 text-sm">
          <li>
            <button type="button" class="item-kelompok" :class="kelasItemKelompok(kelompokId === null)" @click="pilihKelompok(null)">
              <Boxes class="h-4 w-4 shrink-0" />
              <span class="flex-1 truncate">Semua barang</span>
            </button>
          </li>
          <li v-for="k in kelompokList" :key="k.id" class="group relative">
            <button
              type="button"
              class="item-kelompok pr-9"
              :class="[kelasItemKelompok(kelompokId === k.id), { 'opacity-60': !k.is_aktif }]"
              @click="pilihKelompok(k.id)"
            >
              <Folder class="h-4 w-4 shrink-0" />
              <span class="flex-1 truncate">{{ k.nama }}<span v-if="!k.is_aktif" class="text-xs"> (nonaktif)</span></span>
              <span class="text-xs tabular-nums text-muted-foreground group-hover:opacity-0 group-focus-within:opacity-0">{{ k.barang_count ?? 0 }}</span>
            </button>
            <button
              v-if="bisaUbah"
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus:opacity-100 group-hover:opacity-100"
              :aria-label="`Ubah kelompok ${k.nama}`"
              title="Ubah / hapus kelompok"
              @click="bukaKelompok(k)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
          </li>
          <li v-if="!kelompokList.length && !memuatKelompok" class="px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada kelompok.
            <button v-if="bisaUbah" type="button" class="font-medium text-green-700 hover:underline dark:text-green-400" @click="bukaKelompok(null)">Tambah</button>
          </li>
        </ul>
      </aside>

      <div class="min-w-0 space-y-3">
        <!-- ============ Kelompok (ponsel/tablet) ============ -->
        <div class="flex gap-2 lg:hidden">
          <select
            v-model="kelompokId"
            class="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            aria-label="Kelompok barang"
          >
            <option :value="null">Semua kelompok</option>
            <option v-for="k in kelompokList" :key="k.id" :value="k.id">
              {{ k.nama }} ({{ k.barang_count ?? 0 }}){{ k.is_aktif ? '' : ' — nonaktif' }}
            </option>
          </select>
          <template v-if="bisaUbah">
            <button
              type="button"
              class="tombol-ikon"
              :disabled="kelompokId === null"
              aria-label="Ubah kelompok terpilih"
              title="Ubah / hapus kelompok"
              @click="kelompokTerpilih && bukaKelompok(kelompokTerpilih)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button type="button" class="tombol-ikon" aria-label="Tambah kelompok" title="Tambah kelompok" @click="bukaKelompok(null)">
              <FolderPlus class="h-4 w-4" />
            </button>
          </template>
        </div>

        <!-- ============ Filter ============ -->
        <div class="flex flex-col gap-2 xl:flex-row">
          <div class="relative min-w-0 flex-1">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="cari"
              type="search"
              placeholder="Cari nama, kode, atau barcode…"
              aria-label="Cari barang"
              class="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            />
          </div>
          <div class="grid grid-cols-2 gap-2 sm:flex">
            <select v-if="merkList.length" v-model="merkId" class="pilih sm:w-44" aria-label="Filter merk">
              <option :value="null">Semua merk</option>
              <option v-for="m in merkList" :key="m.id" :value="m.id">{{ m.nama }}</option>
            </select>
            <select v-model="status" class="pilih sm:w-36" aria-label="Filter status">
              <option value="semua">Semua status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <button
              type="button"
              class="col-span-2 inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors"
              :class="
                stokMenipis
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              "
              :aria-pressed="stokMenipis"
              @click="stokMenipis = !stokMenipis"
            >
              <TriangleAlert class="h-4 w-4" /> Stok menipis
            </button>
          </div>
        </div>

        <!-- ============ Daftar barang ============ -->
        <div class="overflow-hidden rounded-xl border border-border bg-card">
          <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
          </div>

          <div v-else-if="!daftar.length" class="px-4 py-14 text-center">
            <PackageSearch class="mx-auto h-10 w-10 text-muted-foreground/70" />
            <template v-if="adaFilter">
              <p class="mt-3 text-sm font-medium text-foreground">Tidak ada barang yang cocok</p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ stokMenipis ? 'Tidak ada barang dengan stok di bawah batas minimum.' : 'Ubah kata kunci atau filter.' }}
              </p>
            </template>
            <template v-else>
              <p class="mt-3 text-sm font-medium text-foreground">Belum ada barang</p>
              <p class="mt-1 text-sm text-muted-foreground">Tambahkan barang beserta satuan dan harganya.</p>
              <button v-if="bisaUbah" type="button" class="tombol-utama mt-4" @click="bukaTambah"><Plus class="h-4 w-4" /> Tambah Barang</button>
            </template>
          </div>

          <template v-else>
            <!-- Kepala kolom (layar lebar) -->
            <div class="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
              <span>Barang</span>
              <span class="grid grid-cols-[minmax(0,1fr)_6.5rem_4rem_5.5rem] gap-x-3">
                <span>Satuan</span><span class="text-right">Harga jual</span><span class="text-center">Margin</span><span class="text-right">Stok</span>
              </span>
              <span class="w-14" />
            </div>

            <ul class="divide-y divide-border">
              <li v-for="b in daftar" :key="b.id">
                <button
                  type="button"
                  class="grid w-full gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] md:gap-4"
                  :class="{ 'opacity-60': !b.is_aktif }"
                  :aria-label="`Ubah ${b.nama}`"
                  @click="bukaUbah(b)"
                >
                  <span class="min-w-0">
                    <span class="flex items-start gap-2">
                      <span class="min-w-0 break-words text-sm font-medium text-foreground">{{ b.nama }}</span>
                      <span v-if="!b.is_aktif" class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Nonaktif</span>
                    </span>
                    <span class="mt-0.5 block truncate text-xs text-muted-foreground">
                      <span class="font-mono">{{ b.kode }}</span>
                      <template v-if="b.merk"> · {{ b.merk }}</template>
                      <template v-if="b.kelompok"> · {{ b.kelompok }}</template>
                    </span>
                  </span>

                  <span class="block min-w-0 space-y-1">
                    <span
                      v-for="s in b.satuan"
                      :key="s.id"
                      class="grid grid-cols-[minmax(0,1fr)_5.25rem_3.5rem_4.5rem] items-center gap-x-2 text-sm sm:grid-cols-[minmax(0,1fr)_6.5rem_4rem_5.5rem] sm:gap-x-3"
                      :class="{ 'opacity-50': !s.is_aktif }"
                      :title="`${s.satuan} · beli ${formatRupiah(s.harga_beli)} · jual ${formatRupiah(s.harga_jual)}${s.is_aktif ? '' : ' · nonaktif'}`"
                    >
                      <span class="min-w-0 truncate text-foreground">
                        {{ s.satuan || '—' }}<span v-if="s.isi !== 1" class="text-xs text-muted-foreground"> ×{{ formatQty(s.isi) }}</span>
                        <span v-if="!s.is_aktif" class="text-xs text-muted-foreground"> (nonaktif)</span>
                      </span>
                      <span class="text-right">
                        <span class="block font-medium tabular-nums text-foreground">{{ formatAngka(s.harga_jual) }}</span>
                        <span class="hidden text-[11px] tabular-nums text-muted-foreground sm:block">beli {{ formatAngka(s.harga_beli) }}</span>
                      </span>
                      <span class="text-center">
                        <span class="inline-block rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums" :class="KELAS_CHIP_MARGIN[tingkatMargin(s.margin_persen)]">
                          {{ formatPersen(s.margin_persen) }}
                        </span>
                      </span>
                      <span class="truncate text-right tabular-nums" :class="kelasStok(s)">
                        <span class="text-[11px] font-normal text-muted-foreground md:hidden">stok </span>{{ formatQty(s.stok) }}
                      </span>
                    </span>
                    <span v-if="!b.satuan.length" class="text-xs text-muted-foreground">Belum ada satuan</span>
                  </span>

                  <span class="hidden w-14 items-start justify-end md:flex">
                    <span class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground">
                      <Pencil class="h-3 w-3" /> Ubah
                    </span>
                  </span>
                </button>
              </li>
            </ul>

            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
              <span class="text-muted-foreground">
                {{ formatAngka(meta.total) }} barang<template v-if="meta.last_page > 1"> · hal. {{ meta.current_page }}/{{ meta.last_page }}</template>
              </span>
              <div v-if="meta.last_page > 1" class="flex gap-2">
                <button type="button" class="tombol-kecil" :disabled="meta.current_page <= 1" @click="muat(meta.current_page - 1)">Sebelumnya</button>
                <button type="button" class="tombol-kecil" :disabled="meta.current_page >= meta.last_page" @click="muat(meta.current_page + 1)">Berikutnya</button>
              </div>
            </div>
          </template>
        </div>

        <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Margin aktual dari harga beli terakhir:</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-green-500" /> ≥ {{ MARGIN_TIPIS }}%</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-amber-500" /> tipis</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-red-500" /> rugi</span>
          <span>· Stok <span class="font-medium text-amber-700 dark:text-amber-400">kuning</span> = di bawah minimum, <span class="font-medium text-red-600 dark:text-red-400">merah</span> = habis.</span>
        </p>
      </div>
    </div>

    <!-- ============ Form barang ============ -->
    <FormBarang
      :open="formOpen"
      :barang="barangDiubah"
      :kelompok-list="kelompokList"
      :merk-list="merkList"
      :kelompok-awal="kelompokId"
      @close="formOpen = false"
      @tersimpan="setelahSimpan"
      @hapus="mintaHapusBarang"
    />

    <!-- ============ Form kelompok ============ -->
    <PanelSheet
      :open="kelompokOpen"
      :title="kelompokDiubah ? 'Ubah Kelompok' : 'Tambah Kelompok'"
      :subtitle="kelompokDiubah ? `${kelompokDiubah.barang_count ?? 0} barang di kelompok ini` : 'Mis. Minuman, Makanan Ringan, Sembako'"
      @close="kelompokOpen = false"
    >
      <form id="form-kelompok" class="space-y-4" novalidate @submit.prevent="simpanKelompok">
        <div>
          <label for="kelompok-nama" class="mb-1 block text-sm font-medium text-foreground">Nama kelompok <span class="text-red-600 dark:text-red-400">*</span></label>
          <input
            id="kelompok-nama"
            v-model="formKelompok.nama"
            type="text"
            maxlength="100"
            placeholder="mis. Minuman"
            class="h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            :class="galatKelompok.nama ? 'border-red-500' : 'border-border'"
          />
          <p v-if="galatKelompok.nama" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ galatKelompok.nama }}</p>
        </div>
        <div>
          <label for="kelompok-ket" class="mb-1 block text-sm font-medium text-foreground">Keterangan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea
            id="kelompok-ket"
            v-model="formKelompok.keterangan"
            rows="2"
            maxlength="1000"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
          />
          <p v-if="galatKelompok.keterangan" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ galatKelompok.keterangan }}</p>
        </div>
        <label v-if="kelompokDiubah" class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input v-model="formKelompok.is_aktif" type="checkbox" class="mt-0.5 h-4 w-4 accent-green-600" />
          <span>
            <span class="block text-sm font-medium text-foreground">Aktif</span>
            <span class="block text-xs text-muted-foreground">Kelompok nonaktif tidak muncul di pilihan saat menambah barang.</span>
          </span>
        </label>
      </form>
      <template #footer>
        <div class="flex items-center gap-2">
          <button v-if="kelompokDiubah" type="button" class="tombol-hapus-teks" :disabled="menyimpanKelompok" @click="mintaHapusKelompok(kelompokDiubah)">
            <Trash2 class="h-4 w-4" /> Hapus
          </button>
          <div class="ml-auto flex gap-2">
            <button type="button" class="tombol-garis" :disabled="menyimpanKelompok" @click="kelompokOpen = false">Batal</button>
            <button type="submit" form="form-kelompok" class="tombol-utama" :disabled="menyimpanKelompok">
              <Loader2 v-if="menyimpanKelompok" class="h-4 w-4 animate-spin" /> Simpan
            </button>
          </div>
        </div>
      </template>
    </PanelSheet>

    <!-- ============ Konfirmasi hapus (barang / kelompok) ============ -->
    <KonfirmasiHapus
      :open="hapusTarget !== null"
      :judul="hapusTarget?.jenis === 'kelompok' ? 'Hapus kelompok?' : 'Hapus barang?'"
      :nama="hapusTarget ? (hapusTarget.jenis === 'kelompok' ? hapusTarget.item.nama : `${hapusTarget.item.kode} · ${hapusTarget.item.nama}`) : ''"
      :galat="galatHapus"
      :memproses="menghapus"
      :bisa-nonaktifkan="!!hapusTarget?.item.is_aktif"
      @close="hapusTarget = null"
      @hapus="hapus"
      @nonaktifkan="nonaktifkan"
    >
      <template v-if="hapusTarget?.jenis === 'kelompok'">
        Kelompok <b>{{ hapusTarget.item.nama }}</b> akan dihapus permanen.
        <template v-if="hapusTarget.item.barang_count">Masih ada {{ hapusTarget.item.barang_count }} barang di kelompok ini — pindahkan dulu atau nonaktifkan saja kelompoknya.</template>
      </template>
      <template v-else-if="hapusTarget">
        Barang <b>{{ hapusTarget.item.nama }}</b> beserta semua satuannya akan dihapus permanen. Barang yang sudah punya riwayat stok atau transaksi tidak bisa dihapus.
      </template>
    </KonfirmasiHapus>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Boxes, Folder, FolderPlus, Loader2, PackageSearch, Pencil, Plus, Search, Trash2, TriangleAlert } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import FormBarang from '@/components/toko/FormBarang.vue'
import KonfirmasiHapus from '@/components/toko/KonfirmasiHapus.vue'
import { KELAS_CHIP_MARGIN, MARGIN_TIPIS, formatPersen, tingkatMargin } from '@/components/toko/margin'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatAngka, formatRupiah } from '@/lib/format'
import {
  barangService,
  formatQty,
  masterService,
  pesanGalat,
  type Barang,
  type BarangPayload,
  type BarangSatuan,
  type KelompokBarang,
  type Merk
} from '@/services/tokoService'

type Status = 'aktif' | 'nonaktif' | 'semua'

const { success, error: toastError } = useToast()
const userStore = useUserStore()
const bisaUbah = computed(() => userStore.can('toko.barang'))

// --- Master pendukung ---
const kelompokList = ref<KelompokBarang[]>([])
const memuatKelompok = ref(true)
const merkList = ref<Merk[]>([])

const muatKelompok = async () => {
  try {
    kelompokList.value = await masterService.list<KelompokBarang>('kelompok-barang')
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat kelompok barang'))
  } finally {
    memuatKelompok.value = false
  }
}

const muatMerk = async () => {
  try {
    merkList.value = await masterService.list<Merk>('merk')
  } catch {
    // Tanpa merk pun halaman tetap bisa dipakai (filter merk disembunyikan).
    merkList.value = []
  }
}

// --- Filter & daftar ---
const kelompokId = ref<number | null>(null)
const kelompokTerpilih = computed(() => kelompokList.value.find((k) => k.id === kelompokId.value) ?? null)
const cari = ref('')
const cariAktif = ref('')
const merkId = ref<number | null>(null)
const status = ref<Status>('semua')
const stokMenipis = ref(false)
const adaFilter = computed(() => !!cariAktif.value || kelompokId.value !== null || merkId.value !== null || status.value !== 'semua' || stokMenipis.value)

const memuat = ref(true)
const daftar = ref<Barang[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 })

let urutan = 0
const muat = async (page = 1, senyap = false): Promise<void> => {
  const ke = ++urutan
  if (!senyap) memuat.value = true
  try {
    const res = await barangService.list({
      search: cariAktif.value || undefined,
      kelompok_id: kelompokId.value ?? undefined,
      merk_id: merkId.value ?? undefined,
      is_aktif: status.value === 'semua' ? undefined : status.value === 'aktif',
      stok_menipis: stokMenipis.value || undefined,
      page,
      per_page: 20
    })
    if (ke !== urutan) return
    // Halaman kosong setelah hapus data terakhir → mundur satu halaman.
    if (!res.data.length && page > 1) return muat(page - 1, senyap)
    daftar.value = res.data
    meta.value = res.meta
  } catch (e: any) {
    if (ke === urutan) toastError(pesanGalat(e, 'Gagal memuat barang'))
  } finally {
    if (ke === urutan) memuat.value = false
  }
}

let tundaCari: ReturnType<typeof setTimeout> | undefined
watch(cari, (nilai) => {
  clearTimeout(tundaCari)
  tundaCari = setTimeout(() => {
    cariAktif.value = nilai.trim()
    muat()
  }, 300)
})
watch([kelompokId, merkId, status, stokMenipis], () => muat())
onBeforeUnmount(() => clearTimeout(tundaCari))

const pilihKelompok = (id: number | null) => {
  kelompokId.value = id
}

const kelasItemKelompok = (aktif: boolean) =>
  aktif ? 'bg-green-50 font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'text-foreground hover:bg-muted/60'

const kelasStok = (s: BarangSatuan) => {
  if (!s.is_aktif) return 'text-muted-foreground'
  if (s.stok <= 0) return 'font-semibold text-red-600 dark:text-red-400'
  if (s.stok <= s.stok_minimum) return 'font-semibold text-amber-700 dark:text-amber-400'
  return 'text-foreground'
}

// --- Form barang ---
const formOpen = ref(false)
const barangDiubah = ref<Barang | null>(null)

const bukaTambah = () => {
  barangDiubah.value = null
  formOpen.value = true
}

const bukaUbah = (b: Barang) => {
  barangDiubah.value = b
  formOpen.value = true
}

const setelahSimpan = () => {
  formOpen.value = false
  muat(meta.value.current_page, true)
  muatKelompok()
}

/** Payload lengkap barang yang sudah ada (semua satuan ikut, agar tidak ada yang terhapus). */
const payloadDari = (b: Barang, perubahan: Partial<BarangPayload>): BarangPayload => ({
  kode: b.kode,
  nama: b.nama,
  kelompok_id: b.kelompok_id,
  merk_id: b.merk_id,
  keterangan: b.keterangan,
  is_aktif: b.is_aktif,
  satuan: b.satuan.map((s) => ({
    id: s.id,
    satuan_id: s.satuan_id,
    barcode: s.barcode,
    isi: s.isi,
    harga_beli: s.harga_beli,
    margin_persen: s.margin_persen,
    harga_jual: s.harga_jual,
    stok_minimum: s.stok_minimum,
    is_aktif: s.is_aktif
  })),
  ...perubahan
})

// --- Form kelompok ---
const kelompokOpen = ref(false)
const kelompokDiubah = ref<KelompokBarang | null>(null)
const formKelompok = reactive({ nama: '', keterangan: '', is_aktif: true })
const galatKelompok = reactive<Record<string, string>>({})
const menyimpanKelompok = ref(false)

const bukaKelompok = (k: KelompokBarang | null) => {
  kelompokDiubah.value = k
  Object.assign(formKelompok, { nama: k?.nama ?? '', keterangan: k?.keterangan ?? '', is_aktif: k?.is_aktif ?? true })
  Object.keys(galatKelompok).forEach((x) => delete galatKelompok[x])
  kelompokOpen.value = true
}

const simpanKelompok = async () => {
  Object.keys(galatKelompok).forEach((x) => delete galatKelompok[x])
  if (!formKelompok.nama.trim()) {
    galatKelompok.nama = 'Nama kelompok wajib diisi.'
    return
  }
  menyimpanKelompok.value = true
  const payload = { nama: formKelompok.nama.trim(), keterangan: formKelompok.keterangan.trim() || null }
  try {
    if (kelompokDiubah.value) {
      await masterService.update('kelompok-barang', kelompokDiubah.value.id, { ...payload, is_aktif: formKelompok.is_aktif })
      success('Kelompok diperbarui', { description: payload.nama })
    } else {
      const baru = await masterService.create<KelompokBarang>('kelompok-barang', payload)
      success('Kelompok ditambahkan', { description: payload.nama })
      kelompokId.value = baru.id
    }
    kelompokOpen.value = false
    await muatKelompok()
    // Nama kelompok tampil di daftar barang.
    if (kelompokDiubah.value) muat(meta.value.current_page, true)
  } catch (e: any) {
    const errs: Record<string, string[]> | undefined = e?.data?.errors
    if (errs?.nama || errs?.keterangan) {
      if (errs.nama) galatKelompok.nama = errs.nama[0]
      if (errs.keterangan) galatKelompok.keterangan = errs.keterangan[0]
    } else {
      toastError(pesanGalat(e, 'Gagal menyimpan kelompok'))
    }
  } finally {
    menyimpanKelompok.value = false
  }
}

// --- Hapus (barang / kelompok) ---
type TargetHapus = { jenis: 'barang'; item: Barang } | { jenis: 'kelompok'; item: KelompokBarang }
const hapusTarget = ref<TargetHapus | null>(null)
const galatHapus = ref<string | null>(null)
const menghapus = ref(false)

const mintaHapusBarang = (b: Barang) => {
  formOpen.value = false
  galatHapus.value = null
  hapusTarget.value = { jenis: 'barang', item: b }
}

const mintaHapusKelompok = (k: KelompokBarang) => {
  kelompokOpen.value = false
  galatHapus.value = null
  hapusTarget.value = { jenis: 'kelompok', item: k }
}

const hapus = async () => {
  const t = hapusTarget.value
  if (!t) return
  menghapus.value = true
  try {
    if (t.jenis === 'barang') {
      await barangService.remove(t.item.id)
      success('Barang dihapus', { description: t.item.nama })
    } else {
      await masterService.remove('kelompok-barang', t.item.id)
      success('Kelompok dihapus', { description: t.item.nama })
      if (kelompokId.value === t.item.id) kelompokId.value = null
    }
    hapusTarget.value = null
    muat(meta.value.current_page, true)
    muatKelompok()
  } catch (e: any) {
    if (e?.status === 422) galatHapus.value = pesanGalat(e, 'Data ini masih dipakai. Nonaktifkan saja.')
    else toastError(pesanGalat(e, 'Gagal menghapus'))
  } finally {
    menghapus.value = false
  }
}

const nonaktifkan = async () => {
  const t = hapusTarget.value
  if (!t) return
  menghapus.value = true
  try {
    if (t.jenis === 'barang') {
      await barangService.update(t.item.id, payloadDari(t.item, { is_aktif: false }))
      success('Barang dinonaktifkan', { description: t.item.nama })
    } else {
      await masterService.update('kelompok-barang', t.item.id, { nama: t.item.nama, keterangan: t.item.keterangan, is_aktif: false })
      success('Kelompok dinonaktifkan', { description: t.item.nama })
    }
    hapusTarget.value = null
    muat(meta.value.current_page, true)
    muatKelompok()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menonaktifkan'))
  } finally {
    menghapus.value = false
  }
}

onMounted(() => {
  muat()
  muatKelompok()
  muatMerk()
})
</script>

<style scoped>
@reference "../../assets/main.css";

@layer components {
  .tombol-utama {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .tombol-garis {
    @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50;
  }

  .tombol-kecil {
    @apply rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
  }

  .tombol-ikon {
    @apply inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
  }

  .tombol-hapus-teks {
    @apply inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30;
  }

  .item-kelompok {
    @apply flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors;
  }

  .pilih {
    @apply h-10 min-w-0 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }
}
</style>
