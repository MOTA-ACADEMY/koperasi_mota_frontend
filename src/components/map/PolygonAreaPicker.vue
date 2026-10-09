<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" :disabled="!points.length" @click="undoLast">
        <Undo2 class="h-3.5 w-3.5 mr-1" /> Hapus Titik Terakhir
      </Button>
      <Button type="button" variant="outline" size="sm" :disabled="!points.length" @click="resetAll">
        <Trash2 class="h-3.5 w-3.5 mr-1" /> Hapus Semua
      </Button>
      <label v-if="referencePoints?.length" class="flex items-center gap-2 text-sm text-muted-foreground ml-auto cursor-pointer">
        <Checkbox :checked="showReference" @update:checked="(v) => (showReference = v)" />
        Tampilkan anggota ({{ referencePoints.length }})
      </label>
    </div>

    <div ref="mapEl" class="h-96 w-full rounded-lg border border-border overflow-hidden"></div>

    <p class="text-xs text-muted-foreground">
      Klik peta untuk menambah titik wilayah ({{ points.length }} titik). Seret titik untuk mengatur ulang bentuk,
      klik kanan titik untuk menghapusnya.
    </p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Undo2, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import L, { OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leaflet-setup'

export interface LatLngPoint {
  lat: number
  lng: number
}

export interface ReferencePoint {
  id: number | string
  nama: string
  latitude: number
  longitude: number
}

const props = defineProps<{
  modelValue: LatLngPoint[]
  referencePoints?: ReferencePoint[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LatLngPoint[]]
}>()

const mapEl = ref<HTMLDivElement>()
const points = ref<LatLngPoint[]>(props.modelValue ? [...props.modelValue] : [])
const showReference = ref(false)

let map: L.Map | null = null
let shapeLayer: L.LayerGroup | null = null
let referenceLayer: L.LayerGroup | null = null

const vertexIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,.5);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })

const referenceIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:10px;height:10px;border-radius:9999px;background:#3b82f6;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,.5);"></div>',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  })

const emitUpdate = () => emit('update:modelValue', [...points.value])

const redraw = () => {
  if (!map || !shapeLayer) return
  shapeLayer.clearLayers()

  if (points.value.length >= 3) {
    L.polygon(
      points.value.map((p) => [p.lat, p.lng]),
      { color: '#16a34a', weight: 2, fillOpacity: 0.15 }
    ).addTo(shapeLayer)
  } else if (points.value.length === 2) {
    L.polyline(
      points.value.map((p) => [p.lat, p.lng]),
      { color: '#16a34a', weight: 2 }
    ).addTo(shapeLayer)
  }

  points.value.forEach((point, idx) => {
    const marker = L.marker([point.lat, point.lng], { icon: vertexIcon(), draggable: true }).addTo(shapeLayer!)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      points.value[idx] = { lat: pos.lat, lng: pos.lng }
      emitUpdate()
      redraw()
    })
    marker.on('contextmenu', (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault()
      points.value.splice(idx, 1)
      emitUpdate()
      redraw()
    })
  })
}

const redrawReference = () => {
  if (!referenceLayer) return
  referenceLayer.clearLayers()
  if (!showReference.value || !props.referencePoints?.length) return

  props.referencePoints.forEach((ref) => {
    L.marker([ref.latitude, ref.longitude], { icon: referenceIcon() })
      .bindTooltip(ref.nama)
      .addTo(referenceLayer!)
  })
}

const undoLast = () => {
  points.value.pop()
  emitUpdate()
  redraw()
}

const resetAll = () => {
  points.value = []
  emitUpdate()
  redraw()
}

onMounted(() => {
  if (!mapEl.value) return

  const hasPoints = points.value.length > 0
  map = L.map(mapEl.value).setView(
    hasPoints ? [points.value[0].lat, points.value[0].lng] : DEFAULT_CENTER,
    hasPoints ? 14 : DEFAULT_ZOOM
  )

  L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map)

  shapeLayer = L.layerGroup().addTo(map)
  referenceLayer = L.layerGroup().addTo(map)

  map.on('click', (e: L.LeafletMouseEvent) => {
    points.value.push({ lat: e.latlng.lat, lng: e.latlng.lng })
    emitUpdate()
    redraw()
  })

  redraw()

  if (hasPoints) {
    const bounds = L.latLngBounds(points.value.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
  }
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

watch(showReference, redrawReference)
watch(() => props.referencePoints, redrawReference)

// Syncs external assignment (e.g. data arriving after an async edit-form load),
// while ignoring the round-trip of our own emitUpdate() so drawing stays smooth.
watch(
  () => props.modelValue,
  (val) => {
    const incoming = val || []
    const same =
      incoming.length === points.value.length &&
      incoming.every((p, i) => p.lat === points.value[i]?.lat && p.lng === points.value[i]?.lng)
    if (same) return

    points.value = [...incoming]
    if (!map) return

    redraw()
    if (points.value.length) {
      const bounds = L.latLngBounds(points.value.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }
)
</script>
