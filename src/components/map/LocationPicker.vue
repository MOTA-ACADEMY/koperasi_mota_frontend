<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <Input
        v-model="searchQuery"
        placeholder="Cari alamat/tempat..."
        class="flex-1"
        @keydown.enter.prevent="search"
      />
      <Button type="button" variant="outline" :disabled="searching" @click="search">
        <Loader2 v-if="searching" class="h-4 w-4 animate-spin" />
        <Search v-else class="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" :disabled="locating" title="Gunakan lokasi saat ini" @click="useMyLocation">
        <Loader2 v-if="locating" class="h-4 w-4 animate-spin" />
        <LocateFixed v-else class="h-4 w-4" />
      </Button>
    </div>

    <ul v-if="results.length" class="border border-border rounded-lg divide-y divide-border overflow-hidden max-h-40 overflow-y-auto bg-popover">
      <li
        v-for="(result, idx) in results"
        :key="idx"
        class="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
        @click="pickResult(result)"
      >
        {{ result.display_name }}
      </li>
    </ul>

    <div ref="mapEl" class="h-72 w-full rounded-lg border border-border overflow-hidden"></div>

    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span v-if="latitude != null && longitude != null">
        Pin: {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}
      </span>
      <span v-else>Klik peta untuk menandai lokasi anggota.</span>
      <button
        v-if="latitude != null || longitude != null"
        type="button"
        class="text-destructive hover:underline"
        @click="clearPin"
      >
        Hapus pin
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Search, LocateFixed, Loader2 } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import L, { OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/leaflet-setup'

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

const props = defineProps<{
  latitude?: number | null
  longitude?: number | null
}>()

const emit = defineEmits<{
  'update:latitude': [value: number | null]
  'update:longitude': [value: number | null]
}>()

const mapEl = ref<HTMLDivElement>()
const searchQuery = ref('')
const searching = ref(false)
const locating = ref(false)
const results = ref<NominatimResult[]>([])

let map: L.Map | null = null
let marker: L.Marker | null = null

const setPin = (lat: number, lng: number, fly = true) => {
  emit('update:latitude', lat)
  emit('update:longitude', lng)

  if (!map) return

  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker!.getLatLng()
      emit('update:latitude', pos.lat)
      emit('update:longitude', pos.lng)
    })
  }

  if (fly) map.setView([lat, lng], Math.max(map.getZoom(), 16))
}

const clearPin = () => {
  emit('update:latitude', null)
  emit('update:longitude', null)
  if (marker && map) {
    map.removeLayer(marker)
    marker = null
  }
}

const search = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  searching.value = true
  results.value = []
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=id&q=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    results.value = await res.json()
  } catch {
    results.value = []
  } finally {
    searching.value = false
  }
}

const pickResult = (result: NominatimResult) => {
  setPin(parseFloat(result.lat), parseFloat(result.lon))
  results.value = []
  searchQuery.value = result.display_name
}

const useMyLocation = () => {
  if (!navigator.geolocation) return
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setPin(pos.coords.latitude, pos.coords.longitude)
      locating.value = false
    },
    () => {
      locating.value = false
    }
  )
}

onMounted(() => {
  if (!mapEl.value) return

  const hasPin = props.latitude != null && props.longitude != null
  map = L.map(mapEl.value).setView(
    hasPin ? [props.latitude as number, props.longitude as number] : DEFAULT_CENTER,
    hasPin ? 16 : DEFAULT_ZOOM
  )

  L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map)

  if (hasPin) {
    setPin(props.latitude as number, props.longitude as number, false)
  }

  map.on('click', (e: L.LeafletMouseEvent) => {
    setPin(e.latlng.lat, e.latlng.lng, false)
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
})

watch(
  () => [props.latitude, props.longitude],
  ([lat, lng]) => {
    if (lat == null || lng == null) return
    if (marker && marker.getLatLng().lat === lat && marker.getLatLng().lng === lng) return
    setPin(lat, lng, false)
  }
)
</script>
