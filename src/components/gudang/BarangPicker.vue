<template>
  <div ref="akar" class="relative">
    <div class="relative">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref="masukan"
        v-model="kata"
        type="search"
        :placeholder="placeholder ?? 'Cari nama / kode barang atau scan barcode…'"
        class="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
        role="combobox"
        :aria-expanded="terbuka"
        aria-autocomplete="list"
        @focus="terbuka = kata.length >= 2"
        @keydown.down.prevent="geser(1)"
        @keydown.up.prevent="geser(-1)"
        @keydown.enter.prevent="enter"
        @keydown.esc="terbuka = false"
      />
      <Loader2 v-if="memuat" class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
    </div>

    <ul
      v-if="terbuka && (hasil.length || (!memuat && kata.length >= 2))"
      class="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
      role="listbox"
    >
      <li v-for="(b, i) in hasil" :key="b.id" role="option" :aria-selected="i === aktif">
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition-colors"
          :class="[i === aktif ? 'bg-muted' : 'hover:bg-muted/60', dipakai(b.id) ? 'opacity-50' : '']"
          @mouseenter="aktif = i"
          @click="pilih(b)"
        >
          <span class="min-w-0">
            <span class="block truncate font-medium text-foreground">{{ b.nama }} <span class="font-normal text-muted-foreground">· {{ b.satuan }}</span></span>
            <span class="block truncate text-xs text-muted-foreground">{{ b.kode }}<template v-if="b.barcode"> · {{ b.barcode }}</template><template v-if="b.merk"> · {{ b.merk }}</template></span>
          </span>
          <span class="shrink-0 text-right text-xs">
            <span class="block tabular-nums text-foreground">Stok {{ formatQty(b.stok) }}</span>
            <span class="block tabular-nums text-muted-foreground">Beli {{ formatRupiah(b.harga_beli) }}</span>
          </span>
        </button>
      </li>
      <li v-if="!hasil.length" class="px-3 py-3 text-sm text-muted-foreground">Barang tidak ditemukan.</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Loader2, Search } from 'lucide-vue-next'
import { formatRupiah } from '@/lib/format'
import { barangService, formatQty, type BarangSatuanCari } from '@/services/tokoService'

const props = defineProps<{
  placeholder?: string
  /** id barang-satuan yang sudah ada di dokumen (ditampilkan redup). */
  sudahDipilih?: number[]
}>()

const emit = defineEmits<{ pilih: [barang: BarangSatuanCari] }>()

const akar = ref<HTMLDivElement>()
const masukan = ref<HTMLInputElement>()
const kata = ref('')
const hasil = ref<BarangSatuanCari[]>([])
const memuat = ref(false)
const terbuka = ref(false)
const aktif = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined
let urutan = 0

const dipakai = (id: number) => props.sudahDipilih?.includes(id) ?? false

const cari = async (q: string) => {
  const ke = ++urutan
  memuat.value = true
  try {
    const data = await barangService.cari({ q, limit: 15 })
    if (ke === urutan) {
      hasil.value = data
      aktif.value = 0
      terbuka.value = true
    }
  } catch {
    if (ke === urutan) hasil.value = []
  } finally {
    if (ke === urutan) memuat.value = false
  }
}

watch(kata, (v) => {
  clearTimeout(timer)
  if (v.trim().length < 2) {
    hasil.value = []
    terbuka.value = false
    return
  }
  timer = setTimeout(() => cari(v.trim()), 250)
})

const geser = (arah: number) => {
  if (!hasil.value.length) return
  terbuka.value = true
  aktif.value = (aktif.value + arah + hasil.value.length) % hasil.value.length
}

const pilih = (b: BarangSatuanCari) => {
  emit('pilih', b)
  kata.value = ''
  hasil.value = []
  terbuka.value = false
  masukan.value?.focus()
}

/** Enter: barcode yang cocok persis langsung dipilih (scanner mengirim Enter), selain itu baris aktif. */
const enter = async () => {
  const q = kata.value.trim()
  if (!q) return
  clearTimeout(timer)
  try {
    const persis = await barangService.cari({ barcode: q, limit: 2 })
    if (persis.length === 1) return pilih(persis[0])
  } catch {
    /* lanjut ke hasil pencarian biasa */
  }
  if (terbuka.value && hasil.value[aktif.value]) return pilih(hasil.value[aktif.value])
  await cari(q)
}

const klikLuar = (e: MouseEvent) => {
  if (akar.value && !akar.value.contains(e.target as Node)) terbuka.value = false
}

onMounted(() => document.addEventListener('mousedown', klikLuar))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', klikLuar)
  clearTimeout(timer)
})

defineExpose({ fokus: () => masukan.value?.focus() })
</script>
