<template>
  <!-- `isolate`: z-index internal Leaflet (s.d. 1000) tidak menembus navbar/sidebar/panel -->
  <div class="relative isolate h-full w-full">
    <div ref="mapEl" class="h-full w-full" />

    <div class="absolute right-3 top-3 z-[500] flex flex-col gap-2">
      <button
        type="button"
        class="peta-tombol"
        title="Tampilkan seluruh wilayah"
        aria-label="Tampilkan seluruh wilayah"
        @click="fitWilayah"
      >
        <Maximize2 class="h-4 w-4" />
      </button>
      <button
        v-if="posisiSaya"
        type="button"
        class="peta-tombol"
        title="Ke posisi saya"
        aria-label="Ke posisi saya"
        @click="keSaya"
      >
        <LocateFixed class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { LocateFixed, Maximize2 } from 'lucide-vue-next'
import L, { OSM_ATTRIBUTION, OSM_TILE_URL, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leaflet-setup'
import type { LatLngPoint } from '@/components/map/PolygonAreaPicker.vue'
import type { AnggotaPeta } from '@/services/penagihanService'
import { WARNA_STATUS, statusTitik } from '@/lib/penagihan'

const props = defineProps<{
  wilayah: LatLngPoint[]
  anggota: AnggotaPeta[]
  terpilihId: number | null
  /** Posisi GPS perangkat ini (kolektor). */
  posisiSaya: { lat: number; lng: number; akurasi: number } | null
  /** Posisi terakhir kolektor yang dipantau (mode pantau). */
  posisiKolektor?: { lat: number; lng: number; label: string } | null
}>()

const emit = defineEmits<{ pilih: [id: number] }>()

const mapEl = ref<HTMLDivElement>()
let map: L.Map | null = null
let lapisWilayah: L.LayerGroup | null = null
let lapisAnggota: L.LayerGroup | null = null
let lapisSaya: L.LayerGroup | null = null
let sudahKeSaya = false

const ikonAnggota = (warna: string, terpilih: boolean) => {
  const ukuran = terpilih ? 24 : 16
  const cincin = terpilih ? `box-shadow:0 0 0 4px ${warna}55, 0 1px 3px rgba(0,0,0,.4);` : 'box-shadow:0 1px 3px rgba(0,0,0,.4);'
  return L.divIcon({
    className: '',
    html: `<div style="width:${ukuran}px;height:${ukuran}px;border-radius:9999px;background:${warna};border:2px solid #fff;${cincin}"></div>`,
    iconSize: [ukuran, ukuran],
    iconAnchor: [ukuran / 2, ukuran / 2]
  })
}

const ikonSaya = L.divIcon({
  className: '',
  html: '<div class="peta-saya"><span></span></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

const ikonKolektor = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:4px;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transform:rotate(45deg)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})

const gambarWilayah = () => {
  if (!lapisWilayah) return
  lapisWilayah.clearLayers()
  if (props.wilayah.length >= 3) {
    L.polygon(
      props.wilayah.map((p) => [p.lat, p.lng] as [number, number]),
      { color: '#16a34a', weight: 2, fillOpacity: 0.08, interactive: false }
    ).addTo(lapisWilayah)
  }
}

const gambarAnggota = () => {
  if (!lapisAnggota) return
  lapisAnggota.clearLayers()
  props.anggota.forEach((a) => {
    const terpilih = a.id === props.terpilihId
    L.marker([a.latitude, a.longitude], {
      icon: ikonAnggota(WARNA_STATUS[statusTitik(a)], terpilih),
      zIndexOffset: terpilih ? 1000 : 0,
      keyboard: true,
      title: a.nama
    })
      .bindTooltip(a.nama, { direction: 'top', offset: [0, -10] })
      .on('click', () => emit('pilih', a.id))
      .addTo(lapisAnggota!)
  })
}

const gambarSaya = () => {
  if (!lapisSaya) return
  lapisSaya.clearLayers()
  const p = props.posisiSaya
  if (p) {
    L.circle([p.lat, p.lng], { radius: p.akurasi, color: '#2563eb', weight: 1, fillOpacity: 0.1, interactive: false }).addTo(lapisSaya)
    L.marker([p.lat, p.lng], { icon: ikonSaya, zIndexOffset: 2000, interactive: false }).addTo(lapisSaya)
    if (!sudahKeSaya && map) {
      // Pertama kali GPS terkunci: pastikan posisi kolektor terlihat bersama wilayahnya.
      sudahKeSaya = true
      const b = batasWilayah()
      if (b) map.fitBounds(b.extend([p.lat, p.lng]), { padding: [40, 40], maxZoom: 17 })
      else map.setView([p.lat, p.lng], 16)
    }
  }
  const k = props.posisiKolektor
  if (k) {
    L.marker([k.lat, k.lng], { icon: ikonKolektor, zIndexOffset: 2000 }).bindTooltip(k.label).addTo(lapisSaya)
  }
}

const batasWilayah = () => {
  const titik: [number, number][] = [
    ...props.wilayah.map((p) => [p.lat, p.lng] as [number, number]),
    ...props.anggota.map((a) => [a.latitude, a.longitude] as [number, number])
  ]
  return titik.length ? L.latLngBounds(titik) : null
}

const fitWilayah = () => {
  const b = batasWilayah()
  if (map && b) map.fitBounds(b, { padding: [40, 40], maxZoom: 17 })
}

const keSaya = () => {
  if (map && props.posisiSaya) map.setView([props.posisiSaya.lat, props.posisiSaya.lng], Math.max(map.getZoom(), 17))
}

/** Dipanggil halaman saat anggota dipilih dari daftar. */
const fokus = (lat: number, lng: number) => {
  map?.setView([lat, lng], Math.max(map.getZoom(), 17))
}

defineExpose({ fokus, fitWilayah })

onMounted(() => {
  if (!mapEl.value) return
  // zoomSnap pecahan: wilayah kecil tetap memenuhi peta (tidak terkunci ke zoom bulat).
  map = L.map(mapEl.value, { zoomControl: true, zoomSnap: 0.25 }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)
  L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map)
  lapisWilayah = L.layerGroup().addTo(map)
  lapisAnggota = L.layerGroup().addTo(map)
  lapisSaya = L.layerGroup().addTo(map)

  gambarWilayah()
  gambarAnggota()
  fitWilayah()
  gambarSaya()

  // Ukuran kontainer bisa berubah (tab, sidebar ciut) — sesuaikan ulang ukuran peta.
  const ro = new ResizeObserver(() => map?.invalidateSize())
  ro.observe(mapEl.value)
  onBeforeUnmount(() => ro.disconnect())
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

watch(
  () => props.wilayah,
  () => {
    gambarWilayah()
    fitWilayah()
  }
)
watch(() => [props.anggota, props.terpilihId], gambarAnggota)
watch(() => [props.posisiSaya, props.posisiKolektor], gambarSaya)
</script>

<style scoped>
@reference "../../assets/main.css";

.peta-tombol {
  @apply flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted;
}

:deep(.peta-saya) {
  position: relative;
  width: 18px;
  height: 18px;
}

:deep(.peta-saya span) {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #2563eb;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

:deep(.peta-saya)::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.35);
  animation: denyut 2s ease-out infinite;
}

@keyframes denyut {
  from {
    transform: scale(0.4);
    opacity: 1;
  }
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.peta-saya)::before {
    animation: none;
  }
}
</style>
