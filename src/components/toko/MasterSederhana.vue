<template>
  <div class="space-y-4 p-4 sm:p-6">
    <!-- Kepala halaman -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">{{ judul }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ deskripsi }}</p>
      </div>
      <button v-if="bisaUbah" type="button" class="tombol-utama" @click="bukaTambah">
        <Plus class="h-4 w-4" /> Tambah {{ label }}
      </button>
    </div>

    <!-- Pencarian & filter status -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative min-w-0 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="cari"
          type="search"
          :placeholder="`Cari ${label}…`"
          :aria-label="`Cari ${label}`"
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

    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <!-- Kosong -->
      <div v-else-if="!daftar.length" class="px-4 py-14 text-center">
        <Inbox class="mx-auto h-10 w-10 text-muted-foreground/70" />
        <template v-if="cariAktif || status !== 'semua'">
          <p class="mt-3 text-sm font-medium text-foreground">Tidak ada {{ label }} yang cocok</p>
          <p class="mt-1 text-sm text-muted-foreground">Ubah kata kunci atau filter status.</p>
        </template>
        <template v-else>
          <p class="mt-3 text-sm font-medium text-foreground">Belum ada {{ label }}</p>
          <p v-if="bisaUbah" class="mt-1 text-sm text-muted-foreground">Tambahkan {{ label }} pertama untuk mulai memakainya.</p>
          <button v-if="bisaUbah" type="button" class="tombol-utama mt-4" @click="bukaTambah">
            <Plus class="h-4 w-4" /> Tambah {{ label }}
          </button>
        </template>
      </div>

      <template v-else>
        <!-- Tabel (layar lebar) -->
        <table class="hidden w-full text-sm md:table">
          <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th v-for="f in kolom" :key="f.key" class="px-4 py-3 font-medium">{{ f.label }}</th>
              <th class="w-28 px-4 py-3 font-medium">Status</th>
              <th v-if="bisaUbah" class="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="item in daftar" :key="item.id" class="transition-colors hover:bg-muted/40" :class="{ 'text-muted-foreground': !item.is_aktif }">
              <td
                v-for="(f, i) in kolom"
                :key="f.key"
                class="px-4 py-3"
                :class="[i === 0 ? 'font-medium' : '', i === 0 && item.is_aktif ? 'text-foreground' : 'text-muted-foreground']"
              >
                <span class="line-clamp-2 max-w-md break-words">{{ item[f.key] || '—' }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="item.is_aktif ? KELAS_AKTIF : KELAS_NONAKTIF">
                  {{ item.is_aktif ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td v-if="bisaUbah" class="whitespace-nowrap px-4 py-3 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button type="button" class="tombol-kecil" @click="bukaUbah(item)">
                    <Pencil class="h-3.5 w-3.5" /> Ubah
                  </button>
                  <button type="button" class="tombol-kecil" :disabled="mengubahStatus === item.id" @click="toggleAktif(item)">
                    <Loader2 v-if="mengubahStatus === item.id" class="h-3.5 w-3.5 animate-spin" />
                    {{ item.is_aktif ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                  <button
                    type="button"
                    class="tombol-kecil-hapus"
                    :aria-label="`Hapus ${judulItem(item)}`"
                    title="Hapus"
                    @click="mintaHapus(item)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Kartu (ponsel) -->
        <ul class="divide-y divide-border md:hidden">
          <li v-for="item in daftar" :key="item.id" class="px-4 py-3" :class="{ 'opacity-70': !item.is_aktif }">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="break-words text-sm font-medium text-foreground">{{ judulItem(item) }}</p>
                <p v-for="f in kolom.slice(1)" v-show="item[f.key]" :key="f.key" class="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">
                  <span class="font-medium">{{ f.label }}:</span> {{ item[f.key] }}
                </p>
              </div>
              <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="item.is_aktif ? KELAS_AKTIF : KELAS_NONAKTIF">
                {{ item.is_aktif ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
            <div v-if="bisaUbah" class="mt-2 flex flex-wrap gap-1.5">
              <button type="button" class="tombol-kecil" @click="bukaUbah(item)"><Pencil class="h-3.5 w-3.5" /> Ubah</button>
              <button type="button" class="tombol-kecil" :disabled="mengubahStatus === item.id" @click="toggleAktif(item)">
                {{ item.is_aktif ? 'Nonaktifkan' : 'Aktifkan' }}
              </button>
              <button type="button" class="tombol-kecil-hapus" @click="mintaHapus(item)">
                <Trash2 class="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </li>
        </ul>

        <p class="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {{ daftar.length }} {{ label }}<template v-if="jumlahNonaktif && status === 'semua'"> · {{ jumlahNonaktif }} nonaktif</template>
        </p>
      </template>
    </div>

    <!-- Form tambah / ubah -->
    <PanelSheet
      :open="formOpen"
      :title="editId ? `Ubah ${label}` : `Tambah ${label}`"
      :subtitle="editId ? String(form[fields[0]?.key] ?? '') : ''"
      @close="formOpen = false"
    >
      <form :id="idForm" class="space-y-4" novalidate @submit.prevent="simpan">
        <div v-for="f in fields" :key="f.key">
          <label :for="`${idForm}-${f.key}`" class="mb-1 block text-sm font-medium text-foreground">
            {{ f.label }}
            <span v-if="f.wajib" class="text-red-600 dark:text-red-400">*</span>
            <span v-else class="font-normal text-muted-foreground">(opsional)</span>
          </label>
          <textarea
            v-if="f.type === 'textarea'"
            :id="`${idForm}-${f.key}`"
            v-model="form[f.key]"
            rows="3"
            :placeholder="f.placeholder"
            class="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            :class="errors[f.key] ? 'border-red-500' : 'border-border'"
          />
          <input
            v-else
            :id="`${idForm}-${f.key}`"
            v-model="form[f.key]"
            type="text"
            :placeholder="f.placeholder"
            :required="f.wajib"
            class="h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            :class="errors[f.key] ? 'border-red-500' : 'border-border'"
          />
          <p v-if="errors[f.key]" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors[f.key] }}</p>
        </div>

        <label v-if="editId" class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input v-model="form.is_aktif" type="checkbox" class="mt-0.5 h-4 w-4 accent-green-600" />
          <span>
            <span class="block text-sm font-medium text-foreground">Aktif</span>
            <span class="block text-xs text-muted-foreground">{{ label.charAt(0).toUpperCase() + label.slice(1) }} nonaktif tidak muncul di pilihan, tetapi riwayatnya tetap tersimpan.</span>
          </span>
        </label>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="tombol-garis" :disabled="menyimpan" @click="formOpen = false">Batal</button>
          <button type="submit" :form="idForm" class="tombol-utama" :disabled="menyimpan">
            <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
            {{ editId ? 'Simpan perubahan' : 'Simpan' }}
          </button>
        </div>
      </template>
    </PanelSheet>

    <KonfirmasiHapus
      :open="hapusTarget !== null"
      :judul="`Hapus ${label}?`"
      :nama="hapusTarget ? judulItem(hapusTarget) : ''"
      :galat="galatHapus"
      :memproses="menghapus"
      :bisa-nonaktifkan="!!hapusTarget?.is_aktif"
      @close="hapusTarget = null"
      @hapus="hapus"
      @nonaktifkan="nonaktifkanDariHapus"
    />
  </div>
</template>

<script lang="ts">
/** Definisi kolom form & tabel master sederhana. */
export interface FieldMaster {
  key: string
  label: string
  type: 'text' | 'textarea'
  wajib?: boolean
  placeholder?: string
  /** Tampil sebagai kolom tabel (bawaan: ya). */
  diTabel?: boolean
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Inbox, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import KonfirmasiHapus from '@/components/toko/KonfirmasiHapus.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { masterService, pesanGalat, type JenisMaster } from '@/services/tokoService'

type ItemMaster = Record<string, any> & { id: number; is_aktif: boolean }
type Status = 'aktif' | 'nonaktif' | 'semua'

const props = defineProps<{
  judul: string
  deskripsi: string
  jenis: JenisMaster
  fields: FieldMaster[]
  /** Kode menu yang memberi hak tambah/ubah/hapus, mis. 'toko.satuan'. */
  menu: string
  /** Sebutan satu data untuk tombol & pesan, mis. "satuan". Bawaan: judul huruf kecil. */
  namaItem?: string
}>()

const FILTER_STATUS: { kode: Status; label: string }[] = [
  { kode: 'aktif', label: 'Aktif' },
  { kode: 'nonaktif', label: 'Nonaktif' },
  { kode: 'semua', label: 'Semua' }
]
const KELAS_AKTIF = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
const KELAS_NONAKTIF = 'bg-muted text-muted-foreground'

const { success, error: toastError } = useToast()
const userStore = useUserStore()

const label = computed(() => props.namaItem || props.judul.toLowerCase())
const bisaUbah = computed(() => userStore.can(props.menu))
const kolom = computed(() => props.fields.filter((f) => f.diTabel !== false))
const idForm = `form-master-${props.jenis}`

const cari = ref('')
const cariAktif = ref('')
const status = ref<Status>('semua')
const memuat = ref(true)
const daftar = ref<ItemMaster[]>([])
const jumlahNonaktif = computed(() => daftar.value.filter((d) => !d.is_aktif).length)

const judulItem = (item: ItemMaster) => String(item[props.fields[0]?.key ?? 'nama'] ?? '')

// --- Memuat daftar (pencarian di-debounce) ---
let urutan = 0
const muat = async (senyap = false) => {
  const ke = ++urutan
  if (!senyap) memuat.value = true
  try {
    const hasil = await masterService.list<ItemMaster>(props.jenis, {
      search: cariAktif.value || undefined,
      is_aktif: status.value === 'semua' ? undefined : status.value === 'aktif'
    })
    if (ke === urutan) daftar.value = hasil
  } catch (e: any) {
    if (ke === urutan) toastError(pesanGalat(e, `Gagal memuat ${label.value}`))
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
watch(status, () => muat())
onBeforeUnmount(() => clearTimeout(tundaCari))

// --- Form ---
const formOpen = ref(false)
const editId = ref<number | null>(null)
const form = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})
const menyimpan = ref(false)

const bersihkanGalat = () => Object.keys(errors).forEach((k) => delete errors[k])

const isiForm = (item: ItemMaster | null) => {
  Object.keys(form).forEach((k) => delete form[k])
  props.fields.forEach((f) => (form[f.key] = item?.[f.key] ?? ''))
  form.is_aktif = item?.is_aktif ?? true
  bersihkanGalat()
}

const bukaTambah = () => {
  editId.value = null
  isiForm(null)
  formOpen.value = true
}

const bukaUbah = (item: ItemMaster) => {
  editId.value = item.id
  isiForm(item)
  formOpen.value = true
}

const payloadDari = (sumber: Record<string, any>) => {
  const data: Record<string, any> = {}
  props.fields.forEach((f) => {
    const v = typeof sumber[f.key] === 'string' ? sumber[f.key].trim() : sumber[f.key]
    data[f.key] = v === '' || v === undefined ? null : v
  })
  return data
}

/** Galat validasi Laravel → di samping isian; sisanya lewat toast. */
const tampilkanGalat = (e: any, cadangan: string) => {
  const errs: Record<string, string[]> | undefined = e?.data?.errors
  let tertangani = false
  if (errs) {
    Object.entries(errs).forEach(([k, msgs]) => {
      if (props.fields.some((f) => f.key === k)) {
        errors[k] = msgs[0]
        tertangani = true
      }
    })
  }
  if (!tertangani) toastError(pesanGalat(e, cadangan))
}

const simpan = async () => {
  bersihkanGalat()
  props.fields.forEach((f) => {
    if (f.wajib && !String(form[f.key] ?? '').trim()) errors[f.key] = `${f.label} wajib diisi.`
  })
  if (Object.keys(errors).length) return

  menyimpan.value = true
  const payload = payloadDari(form)
  try {
    if (editId.value) {
      await masterService.update(props.jenis, editId.value, { ...payload, is_aktif: !!form.is_aktif })
      success(`${capital(label.value)} diperbarui`, { description: String(payload[props.fields[0].key] ?? '') })
    } else {
      await masterService.create(props.jenis, payload)
      success(`${capital(label.value)} ditambahkan`, { description: String(payload[props.fields[0].key] ?? '') })
    }
    formOpen.value = false
    muat(true)
  } catch (e: any) {
    tampilkanGalat(e, `Gagal menyimpan ${label.value}`)
  } finally {
    menyimpan.value = false
  }
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// --- Aktif / nonaktif ---
const mengubahStatus = ref<number | null>(null)
const toggleAktif = async (item: ItemMaster) => {
  mengubahStatus.value = item.id
  try {
    await masterService.update(props.jenis, item.id, { ...payloadDari(item), is_aktif: !item.is_aktif })
    success(item.is_aktif ? `${capital(label.value)} dinonaktifkan` : `${capital(label.value)} diaktifkan`, { description: judulItem(item) })
    await muat(true)
    return true
  } catch (e: any) {
    toastError(pesanGalat(e, `Gagal mengubah status ${label.value}`))
    return false
  } finally {
    mengubahStatus.value = null
  }
}

// --- Hapus ---
const hapusTarget = ref<ItemMaster | null>(null)
const galatHapus = ref<string | null>(null)
const menghapus = ref(false)

const mintaHapus = (item: ItemMaster) => {
  galatHapus.value = null
  hapusTarget.value = item
}

const hapus = async () => {
  if (!hapusTarget.value) return
  menghapus.value = true
  try {
    await masterService.remove(props.jenis, hapusTarget.value.id)
    success(`${capital(label.value)} dihapus`, { description: judulItem(hapusTarget.value) })
    hapusTarget.value = null
    muat(true)
  } catch (e: any) {
    // 422: masih dipakai → tampilkan di lembar konfirmasi, tawarkan nonaktifkan.
    if (e?.status === 422) galatHapus.value = pesanGalat(e, `${capital(label.value)} masih dipakai.`)
    else toastError(pesanGalat(e, `Gagal menghapus ${label.value}`))
  } finally {
    menghapus.value = false
  }
}

const nonaktifkanDariHapus = async () => {
  if (!hapusTarget.value) return
  menghapus.value = true
  const ok = await toggleAktif(hapusTarget.value)
  menghapus.value = false
  if (ok) hapusTarget.value = null
}

onMounted(() => muat())
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-utama {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.tombol-garis {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50;
}

.tombol-kecil {
  @apply inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
}

.tombol-kecil-hapus {
  @apply inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40;
}
</style>
