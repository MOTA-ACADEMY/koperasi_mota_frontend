import { apiService } from '@/lib/api'
import type { LatLngPoint } from '@/components/map/PolygonAreaPicker.vue'

export interface LokasiTerakhir {
  lat: number
  lng: number
  akurasi: number | null
  at: string
}

export interface KolektorRingkas {
  id: number
  user_id: number
  nama: string | null
  no_hp: string | null
  wilayah: LatLngPoint[]
  lokasi_terakhir: LokasiTerakhir | null
}

export interface UangDipegang {
  jumlah: number
  total: number
}

export interface KonteksPenagihan {
  /** Baris kolektor milik pengguna ini (null bila bukan kolektor, mis. bendahara yang memantau). */
  kolektor: KolektorRingkas | null
  bisa_memantau: boolean
  kolektor_list: KolektorRingkas[]
  uang_dipegang: UangDipegang | null
}

export interface AnggotaPeta {
  id: number
  kode: string
  nama: string
  alamat: string | null
  latitude: number
  longitude: number
  tunggakan: {
    jumlah: number
    sisa: number
    menunggu_setoran: number
    lewat_jatuh_tempo: number
  }
}

export interface Tagihan {
  id: number
  member_id: number
  jenis: 'pokok' | 'wajib'
  periode: string
  jatuh_tempo: string | null
  lewat_jatuh_tempo: boolean
  nominal: number
  /** Sudah masuk kas (setoran terverifikasi). */
  terbayar: number
  /** Sudah diterima kolektor, belum diverifikasi bendahara. */
  menunggu_setoran: number
  sisa: number
}

export type StatusPembayaran = 'diterima_kolektor' | 'disetor' | 'diverifikasi' | 'dibatalkan'

export interface Pembayaran {
  id: number
  nomor: string
  status: StatusPembayaran
  total: number
  dibayar_at: string
  member?: { id: number; kode: string; nama: string; alamat: string | null } | null
  kolektor?: { id: number; nama: string | null } | null
  alokasi?: { billing_id: number; jenis: 'pokok' | 'wajib' | null; periode: string | null; nominal: number }[]
  lokasi: { lat: number; lng: number; akurasi: number | null } | null
  catatan: string | null
  setoran_id: number | null
  dibatalkan_at: string | null
  alasan_batal: string | null
}

export interface DetailAnggota {
  anggota: {
    id: number
    kode: string
    nama: string
    foto: string | null
    alamat: string | null
    latitude: number
    longitude: number
    telepon: string | null
    whatsapp: string | null
  }
  tagihan: Tagihan[]
  pembayaran_menunggu: Pembayaran[]
}

export type StatusSetoran = 'menunggu' | 'diverifikasi' | 'ditolak'

export interface Setoran {
  id: number
  nomor: string
  status: StatusSetoran
  total: number
  jumlah_pembayaran: number
  diajukan_at: string
  catatan_kolektor: string | null
  kolektor?: { id: number; nama: string | null; no_hp: string | null } | null
  diproses_at: string | null
  diproses_oleh?: string | null
  catatan_verifikasi: string | null
  jurnal_id: number | null
  pembayaran?: Pembayaran[]
}

export interface PembayaranPayload {
  member_id: number
  alokasi: { billing_id: number; nominal: number }[]
  latitude?: number | null
  longitude?: number | null
  akurasi?: number | null
  catatan?: string | null
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

const kolektorParam = (kolektorId?: number | null) => (kolektorId ? { kolektor_id: kolektorId } : undefined)

export const penagihanService = {
  konteks(): Promise<KonteksPenagihan> {
    return apiService.get('/penagihan/konteks')
  },

  wilayah(kolektorId?: number | null): Promise<{ kolektor: KolektorRingkas; anggota: AnggotaPeta[] }> {
    return apiService.get('/penagihan/wilayah', kolektorParam(kolektorId))
  },

  anggota(memberId: number, kolektorId?: number | null): Promise<DetailAnggota> {
    return apiService.get(`/penagihan/anggota/${memberId}`, kolektorParam(kolektorId))
  },

  async bayar(payload: PembayaranPayload): Promise<Pembayaran> {
    const res = await apiService.post<{ data: Pembayaran }>('/penagihan/pembayaran', payload)
    return res.data
  },

  pembayaranSaya(status: StatusPembayaran | 'semua' = 'diterima_kolektor'): Promise<{ data: Pembayaran[]; uang_dipegang: UangDipegang }> {
    return apiService.get('/penagihan/pembayaran', { status })
  },

  batalkan(id: number, alasan: string): Promise<{ message: string }> {
    return apiService.post(`/penagihan/pembayaran/${id}/batal`, { alasan })
  },

  async ajukanSetoran(payload: { pembayaran_ids?: number[]; catatan?: string | null }): Promise<Setoran> {
    const res = await apiService.post<{ data: Setoran }>('/penagihan/setoran-saya', payload)
    return res.data
  },

  async setoranSaya(): Promise<Setoran[]> {
    const res = await apiService.get<{ data: Setoran[] }>('/penagihan/setoran-saya')
    return res.data
  },

  kirimLokasi(posisi: { latitude: number; longitude: number; akurasi?: number | null }): Promise<{ di_wilayah: boolean }> {
    return apiService.post('/penagihan/lokasi', posisi)
  },

  // --- Bendahara (menu Setoran Kolektor) ---

  daftarSetoran(params: { status?: StatusSetoran | 'semua'; page?: number }): Promise<
    Paginated<Setoran> & { ringkasan: { menunggu_jumlah: number; menunggu_total: number } }
  > {
    return apiService.get('/penagihan/setoran', params)
  },

  async detailSetoran(id: number): Promise<Setoran> {
    const res = await apiService.get<{ data: Setoran }>(`/penagihan/setoran/${id}`)
    return res.data
  },

  verifikasi(id: number, catatan?: string | null): Promise<{
    message: string
    data: Setoran
    jurnal: { id: number; nomor_transaksi: string } | null
    peringatan: string[]
  }> {
    return apiService.post(`/penagihan/setoran/${id}/verifikasi`, { catatan })
  },

  tolak(id: number, catatan: string): Promise<{ message: string; data: Setoran }> {
    return apiService.post(`/penagihan/setoran/${id}/tolak`, { catatan })
  }
}

export const LABEL_JENIS: Record<string, string> = { pokok: 'Simpanan Pokok', wajib: 'Simpanan Wajib' }

export const LABEL_STATUS_PEMBAYARAN: Record<StatusPembayaran, string> = {
  diterima_kolektor: 'Dipegang kolektor',
  disetor: 'Menunggu verifikasi',
  diverifikasi: 'Masuk kas',
  dibatalkan: 'Dibatalkan'
}

export const LABEL_STATUS_SETORAN: Record<StatusSetoran, string> = {
  menunggu: 'Menunggu verifikasi',
  diverifikasi: 'Diverifikasi',
  ditolak: 'Ditolak'
}
