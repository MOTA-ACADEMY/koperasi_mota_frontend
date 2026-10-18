<template>
  <div class="space-y-4 p-4 sm:p-6">
    <!-- Kepala halaman -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">Jasa & Pembayaran</h1>
        <p class="mt-1 text-sm text-muted-foreground">Layanan yang dijual di kasir: tagihan & token listrik, PDAM, top up game, dan tagihan lain.</p>
      </div>
      <button v-if="bisaUbah" type="button" class="tombol-utama" @click="bukaForm(null)">
        <Plus class="h-4 w-4" /> Tambah Jasa
      </button>
    </div>

    <!-- Info: hanya pencatatan -->
    <div class="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
      <Info class="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <b>Hanya pencatatan.</b> Sistem belum terhubung ke PLN, PDAM, atau penyedia voucher game. Kasir tetap menyelesaikan pembayaran
        di aplikasi/loket penyedia di luar sistem, lalu mencatat penjualannya di kasir agar uang dan keuntungannya masuk pembukuan.
      </p>
    </div>

    <!-- Filter -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative min-w-0 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="cari"
          type="search"
          placeholder="Cari nama atau kode jasa…"
          aria-label="Cari jasa"
          class="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
        />
      </div>
      <div class="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist" aria-label="Filter status">
        <button
          v-for="s in FILTER_STATUS"
          :key="s.kode"
          type="button"
          role="tab"
          :aria-selected="status === s.kode"
          class="flex-1 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="status === s.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="status = s.kode"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Chip kategori -->
    <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button type="button" class="chip" :class="kategori === null ? CHIP_AKTIF : CHIP_BIASA" :aria-pressed="kategori === null" @click="kategori = null">
        Semua <span class="tabular-nums opacity-70">{{ tersaringStatus.length }}</span>
      </button>
      <button
        v-for="k in KATEGORI"
        :key="k"
        type="button"
        class="chip"
        :class="kategori === k ? CHIP_AKTIF : CHIP_BIASA"
        :aria-pressed="kategori === k"
        @click="kategori = kategori === k ? null : k"
      >
        <component :is="IKON_KATEGORI[k]" class="h-3.5 w-3.5" />
        {{ LABEL_KATEGORI_JASA[k] }} <span class="tabular-nums opacity-70">{{ jumlahPerKategori[k] }}</span>
      </button>
    </div>

    <!-- Daftar -->
    <div v-if="memuat" class="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>

    <div v-else-if="!kelompok.length" class="rounded-xl border border-border bg-card px-4 py-14 text-center">
      <Receipt class="mx-auto h-10 w-10 text-muted-foreground/70" />
      <template v-if="semua.length">
        <p class="mt-3 text-sm font-medium text-foreground">Tidak ada jasa yang cocok</p>
        <p class="mt-1 text-sm text-muted-foreground">Ubah kata kunci, kategori, atau filter status.</p>
      </template>
      <template v-else>
        <p class="mt-3 text-sm font-medium text-foreground">Belum ada jasa</p>
        <p class="mt-1 text-sm text-muted-foreground">Mis. "Token Listrik 20.000", "Tagihan PLN Pascabayar", "Diamond Mobile Legends 86".</p>
        <button v-if="bisaUbah" type="button" class="tombol-utama mt-4" @click="bukaForm(null)"><Plus class="h-4 w-4" /> Tambah Jasa</button>
      </template>
    </div>

    <div v-else class="space-y-4">
      <section v-for="g in kelompok" :key="g.kategori" class="overflow-hidden rounded-xl border border-border bg-card">
        <h2 class="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold text-foreground">
          <component :is="IKON_KATEGORI[g.kategori]" class="h-4 w-4 text-muted-foreground" />
          {{ LABEL_KATEGORI_JASA[g.kategori] }}
          <span class="text-xs font-normal text-muted-foreground">· {{ g.items.length }}</span>
        </h2>
        <ul class="divide-y divide-border">
          <li v-for="j in g.items" :key="j.id">
            <button
              type="button"
              class="flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-1.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
              :class="{ 'opacity-60': !j.is_aktif }"
              :aria-label="`Ubah ${j.nama}`"
              @click="bukaForm(j)"
            >
              <span class="min-w-0 flex-1">
                <span class="block break-words text-sm font-medium text-foreground">{{ j.nama }}</span>
                <span class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span class="font-mono">{{ j.kode }}</span>
                  <span v-if="j.nominal_bebas" class="lencana bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">Nominal bebas</span>
                  <span v-if="j.butuh_no_pelanggan" class="lencana bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    <Hash class="h-3 w-3" /> No. pelanggan
                  </span>
                  <span v-if="!j.is_aktif" class="lencana bg-muted text-muted-foreground">Nonaktif</span>
                </span>
              </span>

              <span class="shrink-0 text-right">
                <template v-if="j.nominal_bebas">
                  <span class="block text-sm font-semibold tabular-nums text-foreground">Nominal + admin {{ formatRupiah(j.biaya_admin) }}</span>
                  <span class="block text-xs text-muted-foreground">Nominal diisi kasir saat transaksi</span>
                </template>
                <template v-else>
                  <span class="block text-sm tabular-nums text-foreground">
                    <span class="text-muted-foreground">{{ formatRupiah(j.harga_modal) }}</span>
                    <ArrowRight class="mx-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    <span class="font-semibold">{{ formatRupiah(j.harga_jual) }}</span>
                  </span>
                  <span class="block text-xs font-medium tabular-nums" :class="kelasUntung(j.harga_jual - j.harga_modal)">
                    Untung {{ formatRupiah(j.harga_jual - j.harga_modal) }}
                  </span>
                </template>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>

    <!-- ============ Form jasa ============ -->
    <PanelSheet
      :open="formOpen"
      :title="diubah ? 'Ubah Jasa' : 'Tambah Jasa'"
      :subtitle="diubah ? `${diubah.kode} · ${diubah.nama}` : ''"
      @close="formOpen = false"
    >
      <form id="form-jasa" class="space-y-5" novalidate @submit.prevent="simpan">
        <fieldset>
          <legend class="label">Kategori <span class="text-red-600 dark:text-red-400">*</span></legend>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label
              v-for="k in KATEGORI"
              :key="k"
              class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
              :class="form.kategori === k ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'border-border text-foreground hover:bg-muted/60'"
            >
              <input v-model="form.kategori" type="radio" name="kategori-jasa" :value="k" class="sr-only" @change="kategoriDipilih(k)" />
              <component :is="IKON_KATEGORI[k]" class="h-4 w-4 shrink-0" />
              <span class="min-w-0 leading-tight">{{ LABEL_KATEGORI_JASA[k] }}</span>
            </label>
          </div>
          <p v-if="errors.kategori" class="pesan-galat">{{ errors.kategori }}</p>
        </fieldset>

        <div>
          <label for="jasa-nama" class="label">Nama jasa <span class="text-red-600 dark:text-red-400">*</span></label>
          <input id="jasa-nama" v-model="form.nama" type="text" maxlength="150" :placeholder="CONTOH_NAMA[form.kategori]" class="isian" :class="kelasGalat('nama')" />
          <p v-if="errors.nama" class="pesan-galat">{{ errors.nama }}</p>
        </div>

        <div>
          <label for="jasa-kode" class="label">Kode <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <input id="jasa-kode" v-model="form.kode" type="text" maxlength="30" placeholder="Otomatis, mis. JSA0001" class="isian font-mono" :class="kelasGalat('kode')" />
          <p v-if="errors.kode" class="pesan-galat">{{ errors.kode }}</p>
        </div>

        <fieldset>
          <legend class="label">Cara menentukan harga</legend>
          <div class="grid gap-2 sm:grid-cols-2">
            <label class="opsi" :class="!form.nominal_bebas ? OPSI_AKTIF : OPSI_BIASA">
              <input v-model="form.nominal_bebas" type="radio" name="nominal-bebas" :value="false" class="mt-0.5 h-4 w-4 accent-green-600" />
              <span>
                <span class="block text-sm font-medium text-foreground">Harga tetap</span>
                <span class="block text-xs text-muted-foreground">Mis. token listrik 20 ribu, voucher game.</span>
              </span>
            </label>
            <label class="opsi" :class="form.nominal_bebas ? OPSI_AKTIF : OPSI_BIASA">
              <input v-model="form.nominal_bebas" type="radio" name="nominal-bebas" :value="true" class="mt-0.5 h-4 w-4 accent-green-600" />
              <span>
                <span class="block text-sm font-medium text-foreground">Nominal bebas</span>
                <span class="block text-xs text-muted-foreground">Nominal tagihan diisi kasir, ditambah biaya admin.</span>
              </span>
            </label>
          </div>
        </fieldset>

        <!-- Harga tetap -->
        <div v-if="!form.nominal_bebas" class="space-y-3 rounded-xl bg-muted/50 p-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="jasa-modal" class="label-kecil">Harga modal *</label>
              <InputRupiah id="jasa-modal" v-model="form.harga_modal" placeholder="0" :invalid="!!errors.harga_modal" />
              <p v-if="errors.harga_modal" class="pesan-galat">{{ errors.harga_modal }}</p>
            </div>
            <div>
              <label for="jasa-jual" class="label-kecil">Harga jual *</label>
              <InputRupiah id="jasa-jual" v-model="form.harga_jual" placeholder="0" :invalid="!!errors.harga_jual" />
              <p v-if="errors.harga_jual" class="pesan-galat">{{ errors.harga_jual }}</p>
            </div>
          </div>
          <p class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Keuntungan per transaksi</span>
            <span class="font-semibold tabular-nums" :class="kelasUntung(untung)">{{ formatRupiah(untung) }}</span>
          </p>
        </div>

        <!-- Nominal bebas -->
        <div v-else class="space-y-3 rounded-xl bg-muted/50 p-3">
          <div>
            <label for="jasa-admin" class="label-kecil">Biaya admin</label>
            <InputRupiah id="jasa-admin" v-model="form.biaya_admin" placeholder="0" :invalid="!!errors.biaya_admin" />
            <p v-if="errors.biaya_admin" class="pesan-galat">{{ errors.biaya_admin }}</p>
          </div>
          <p class="text-xs text-muted-foreground">
            Harga ke pelanggan = nominal tagihan + biaya admin. Contoh: tagihan {{ formatRupiah(150000) }} → pelanggan bayar
            <b class="tabular-nums text-foreground">{{ formatRupiah(150000 + (form.biaya_admin ?? 0)) }}</b>.
          </p>
        </div>

        <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input v-model="form.butuh_no_pelanggan" type="checkbox" class="mt-0.5 h-4 w-4 accent-green-600" />
          <span>
            <span class="block text-sm font-medium text-foreground">Butuh nomor pelanggan</span>
            <span class="block text-xs text-muted-foreground">Kasir wajib mencatat ID pelanggan / nomor meter / ID game saat transaksi.</span>
          </span>
        </label>

        <div>
          <label for="jasa-ket" class="label">Keterangan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea id="jasa-ket" v-model="form.keterangan" rows="2" maxlength="1000" class="isian-area" placeholder="Mis. dibayar lewat aplikasi agen X" />
        </div>

        <label v-if="diubah" class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input v-model="form.is_aktif" type="checkbox" class="mt-0.5 h-4 w-4 accent-green-600" />
          <span>
            <span class="block text-sm font-medium text-foreground">Aktif</span>
            <span class="block text-xs text-muted-foreground">Jasa nonaktif tidak muncul di kasir.</span>
          </span>
        </label>
      </form>

      <template #footer>
        <div class="flex items-center gap-2">
          <button v-if="diubah && bisaUbah" type="button" class="tombol-hapus-teks" :disabled="menyimpan" @click="mintaHapus(diubah)">
            <Trash2 class="h-4 w-4" /> Hapus
          </button>
          <div class="ml-auto flex gap-2">
            <button type="button" class="tombol-garis" :disabled="menyimpan" @click="formOpen = false">Batal</button>
            <button v-if="bisaUbah" type="submit" form="form-jasa" class="tombol-utama" :disabled="menyimpan">
              <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
              {{ diubah ? 'Simpan perubahan' : 'Simpan' }}
            </button>
          </div>
        </div>
      </template>
    </PanelSheet>

    <KonfirmasiHapus
      :open="hapusTarget !== null"
      judul="Hapus jasa?"
      :nama="hapusTarget ? `${hapusTarget.kode} · ${hapusTarget.nama}` : ''"
      :galat="galatHapus"
      :memproses="menghapus"
      :bisa-nonaktifkan="!!hapusTarget?.is_aktif"
      @close="hapusTarget = null"
      @hapus="hapus"
      @nonaktifkan="nonaktifkan"
    >
      Jasa <b>{{ hapusTarget?.nama }}</b> akan dihapus permanen. Jasa yang sudah pernah terjual tidak bisa dihapus.
    </KonfirmasiHapus>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, type Component } from 'vue'
import { ArrowRight, Droplet, Gamepad2, Hash, Info, Loader2, Package, Plus, Receipt, Search, Trash2, Zap, PlugZap } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/toko/InputRupiah.vue'
import KonfirmasiHapus from '@/components/toko/KonfirmasiHapus.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatRupiah } from '@/lib/format'
import { LABEL_KATEGORI_JASA, jasaService, pesanGalat, type Jasa, type JasaPayload, type KategoriJasa } from '@/services/tokoService'

type Status = 'aktif' | 'nonaktif' | 'semua'

const KATEGORI = Object.keys(LABEL_KATEGORI_JASA) as KategoriJasa[]
const IKON_KATEGORI: Record<KategoriJasa, Component> = {
  listrik: Zap,
  token_listrik: PlugZap,
  air: Droplet,
  game: Gamepad2,
  tagihan: Receipt,
  lainnya: Package
}
const CONTOH_NAMA: Record<KategoriJasa, string> = {
  listrik: 'mis. Tagihan PLN Pascabayar',
  token_listrik: 'mis. Token Listrik 20.000',
  air: 'mis. Tagihan PDAM',
  game: 'mis. Diamond Mobile Legends 86',
  tagihan: 'mis. BPJS Kesehatan',
  lainnya: 'mis. Fotokopi'
}
/** Bawaan saat memilih kategori di form baru (masih bisa diubah). */
const BAWAAN_KATEGORI: Record<KategoriJasa, { nominal_bebas: boolean; butuh_no_pelanggan: boolean }> = {
  listrik: { nominal_bebas: true, butuh_no_pelanggan: true },
  token_listrik: { nominal_bebas: false, butuh_no_pelanggan: true },
  air: { nominal_bebas: true, butuh_no_pelanggan: true },
  game: { nominal_bebas: false, butuh_no_pelanggan: true },
  tagihan: { nominal_bebas: true, butuh_no_pelanggan: true },
  lainnya: { nominal_bebas: false, butuh_no_pelanggan: false }
}
const FILTER_STATUS: { kode: Status; label: string }[] = [
  { kode: 'aktif', label: 'Aktif' },
  { kode: 'nonaktif', label: 'Nonaktif' },
  { kode: 'semua', label: 'Semua' }
]
const CHIP_AKTIF = 'border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
const CHIP_BIASA = 'border-border bg-card text-foreground hover:bg-muted'
const OPSI_AKTIF = 'border-green-600 bg-green-50/60 dark:bg-green-950/30'
const OPSI_BIASA = 'border-border hover:bg-muted/60'

const { success, error: toastError } = useToast()
const userStore = useUserStore()
const bisaUbah = computed(() => userStore.can('toko.jasa'))

// --- Daftar (dimuat sekali; saring di sisi klien supaya hitungan per kategori akurat) ---
const memuat = ref(true)
const semua = ref<Jasa[]>([])
const cari = ref('')
const status = ref<Status>('semua')
const kategori = ref<KategoriJasa | null>(null)

const muat = async (senyap = false) => {
  if (!senyap) memuat.value = true
  try {
    semua.value = await jasaService.list()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat jasa'))
  } finally {
    memuat.value = false
  }
}

const tersaringStatus = computed(() => {
  const kata = cari.value.trim().toLowerCase()
  return semua.value.filter(
    (j) =>
      (status.value === 'semua' || j.is_aktif === (status.value === 'aktif')) &&
      (!kata || j.nama.toLowerCase().includes(kata) || j.kode.toLowerCase().includes(kata))
  )
})

const jumlahPerKategori = computed(() => {
  const hasil = Object.fromEntries(KATEGORI.map((k) => [k, 0])) as Record<KategoriJasa, number>
  tersaringStatus.value.forEach((j) => hasil[j.kategori]++)
  return hasil
})

const kelompok = computed(() =>
  KATEGORI.filter((k) => kategori.value === null || kategori.value === k)
    .map((k) => ({ kategori: k, items: tersaringStatus.value.filter((j) => j.kategori === k) }))
    .filter((g) => g.items.length)
)

const kelasUntung = (n: number) =>
  n < 0 ? 'text-red-600 dark:text-red-400' : n === 0 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'

// --- Form ---
const formOpen = ref(false)
const diubah = ref<Jasa | null>(null)
const menyimpan = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive({
  kode: '',
  nama: '',
  kategori: 'token_listrik' as KategoriJasa,
  nominal_bebas: false,
  butuh_no_pelanggan: true,
  harga_modal: null as number | null,
  harga_jual: null as number | null,
  biaya_admin: null as number | null,
  keterangan: '',
  is_aktif: true
})
const untung = computed(() => (form.harga_jual ?? 0) - (form.harga_modal ?? 0))

const bersihkanGalat = () => Object.keys(errors).forEach((k) => delete errors[k])
const kelasGalat = (k: string) => (errors[k] ? 'border-red-500' : 'border-border')

const bukaForm = (j: Jasa | null) => {
  diubah.value = j
  bersihkanGalat()
  const k = j?.kategori ?? kategori.value ?? 'token_listrik'
  Object.assign(form, {
    kode: j?.kode ?? '',
    nama: j?.nama ?? '',
    kategori: k,
    nominal_bebas: j?.nominal_bebas ?? BAWAAN_KATEGORI[k].nominal_bebas,
    butuh_no_pelanggan: j?.butuh_no_pelanggan ?? BAWAAN_KATEGORI[k].butuh_no_pelanggan,
    harga_modal: j && !j.nominal_bebas ? j.harga_modal : null,
    harga_jual: j && !j.nominal_bebas ? j.harga_jual : null,
    biaya_admin: j ? j.biaya_admin : null,
    keterangan: j?.keterangan ?? '',
    is_aktif: j?.is_aktif ?? true
  })
  formOpen.value = true
}

const kategoriDipilih = (k: KategoriJasa) => {
  // Hanya untuk jasa baru: isi bawaan yang lazim untuk kategori ini.
  if (diubah.value) return
  Object.assign(form, BAWAAN_KATEGORI[k])
}

const simpan = async () => {
  bersihkanGalat()
  if (!form.nama.trim()) errors.nama = 'Nama jasa wajib diisi.'
  if (!form.nominal_bebas) {
    if (form.harga_modal == null) errors.harga_modal = 'Isi harga modal.'
    if (form.harga_jual == null) errors.harga_jual = 'Isi harga jual.'
  }
  if (Object.keys(errors).length) return

  const payload: JasaPayload = {
    kode: form.kode.trim() || null,
    nama: form.nama.trim(),
    kategori: form.kategori,
    nominal_bebas: form.nominal_bebas,
    butuh_no_pelanggan: form.butuh_no_pelanggan,
    // Nominal bebas: harga ditentukan saat transaksi; harga tetap: biaya admin tidak dipakai.
    harga_modal: form.nominal_bebas ? 0 : form.harga_modal ?? 0,
    harga_jual: form.nominal_bebas ? 0 : form.harga_jual ?? 0,
    biaya_admin: form.nominal_bebas ? form.biaya_admin ?? 0 : 0,
    keterangan: form.keterangan.trim() || null,
    ...(diubah.value ? { is_aktif: form.is_aktif } : {})
  }

  menyimpan.value = true
  try {
    const hasil = diubah.value ? await jasaService.update(diubah.value.id, payload) : await jasaService.create(payload)
    success(diubah.value ? 'Jasa diperbarui' : 'Jasa ditambahkan', { description: `${hasil.kode} · ${hasil.nama}` })
    formOpen.value = false
    muat(true)
  } catch (e: any) {
    const errs: Record<string, string[]> | undefined = e?.data?.errors
    const dikenal = ['kode', 'nama', 'kategori', 'harga_modal', 'harga_jual', 'biaya_admin']
    if (errs) Object.entries(errs).forEach(([k, m]) => dikenal.includes(k) && (errors[k] = m[0]))
    if (!errs || Object.keys(errs).some((k) => !dikenal.includes(k))) toastError(pesanGalat(e, 'Gagal menyimpan jasa'))
  } finally {
    menyimpan.value = false
  }
}

// --- Hapus ---
const hapusTarget = ref<Jasa | null>(null)
const galatHapus = ref<string | null>(null)
const menghapus = ref(false)

const mintaHapus = (j: Jasa) => {
  formOpen.value = false
  galatHapus.value = null
  hapusTarget.value = j
}

const hapus = async () => {
  const j = hapusTarget.value
  if (!j) return
  menghapus.value = true
  try {
    await jasaService.remove(j.id)
    success('Jasa dihapus', { description: j.nama })
    hapusTarget.value = null
    muat(true)
  } catch (e: any) {
    if (e?.status === 422) galatHapus.value = pesanGalat(e, 'Jasa ini sudah pernah terjual. Nonaktifkan saja.')
    else toastError(pesanGalat(e, 'Gagal menghapus jasa'))
  } finally {
    menghapus.value = false
  }
}

const nonaktifkan = async () => {
  const j = hapusTarget.value
  if (!j) return
  menghapus.value = true
  try {
    const { id: _id, ...sisa } = j
    await jasaService.update(j.id, { ...sisa, is_aktif: false })
    success('Jasa dinonaktifkan', { description: j.nama })
    hapusTarget.value = null
    muat(true)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menonaktifkan jasa'))
  } finally {
    menghapus.value = false
  }
}

onMounted(() => muat())
</script>

<style scoped>
@reference "../../assets/main.css";

@layer components {
  .label {
    @apply mb-1.5 block text-sm font-medium text-foreground;
  }

  .label-kecil {
    @apply mb-1 block text-xs font-medium text-muted-foreground;
  }

  .isian {
    @apply h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }

  .isian-area {
    @apply w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30;
  }

  .pesan-galat {
    @apply mt-1 text-xs text-red-600 dark:text-red-400;
  }

  .chip {
    @apply inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors;
  }

  .lencana {
    @apply inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium;
  }

  .opsi {
    @apply flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors;
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
}
</style>
