import { onBeforeUnmount, ref } from 'vue'
import { penagihanService } from '@/services/penagihanService'

export type StatusGps = 'mati' | 'mencari' | 'aktif' | 'ditolak' | 'tidak_didukung' | 'tidak_aman' | 'galat'

export interface PosisiGps {
  lat: number
  lng: number
  akurasi: number
  at: number
}

/** Posisi dikirim ke server paling sering sekali per interval ini. */
const JEDA_KIRIM_MS = 30_000

/**
 * GPS kolektor — hanya aktif selama halaman Penagihan terbuka (berhenti otomatis saat
 * halaman ditinggalkan). Bila `kirim` true, posisi juga dilaporkan ke server berkala.
 */
export function useGpsKolektor() {
  const posisi = ref<PosisiGps | null>(null)
  const status = ref<StatusGps>('mati')
  const diWilayah = ref<boolean | null>(null)

  let watchId: number | null = null
  let kirim = false
  let terakhirKirim = 0

  const laporkan = async (p: PosisiGps) => {
    if (!kirim || document.visibilityState !== 'visible' || p.at - terakhirKirim < JEDA_KIRIM_MS) return
    terakhirKirim = p.at
    try {
      const res = await penagihanService.kirimLokasi({ latitude: p.lat, longitude: p.lng, akurasi: p.akurasi })
      diWilayah.value = res.di_wilayah
    } catch {
      terakhirKirim = 0 // coba lagi pada posisi berikutnya
    }
  }

  const mulai = (opsi: { kirim: boolean }) => {
    berhenti()
    kirim = opsi.kirim

    if (!('geolocation' in navigator)) {
      status.value = 'tidak_didukung'
      return
    }
    if (!window.isSecureContext) {
      status.value = 'tidak_aman'
      return
    }

    status.value = 'mencari'
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, akurasi: Math.round(pos.coords.accuracy), at: Date.now() }
        posisi.value = p
        status.value = 'aktif'
        laporkan(p)
      },
      (err) => {
        status.value = err.code === err.PERMISSION_DENIED ? 'ditolak' : posisi.value ? 'aktif' : 'galat'
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 }
    )
  }

  const berhenti = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
    if (status.value !== 'tidak_didukung' && status.value !== 'tidak_aman') status.value = 'mati'
  }

  onBeforeUnmount(berhenti)

  return { posisi, status, diWilayah, mulai, berhenti }
}

/** Jarak dua titik (meter), rumus haversine. */
export function jarakMeter(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const formatJarak = (meter: number) => (meter < 1000 ? `${Math.round(meter)} m` : `${(meter / 1000).toFixed(1)} km`)
