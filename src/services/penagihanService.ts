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
  status: 'merah' | 'kuning' | 'hijau'
  tunggakan: {
    jumlah: number
    sisa: number
    menunggu_setoran: number
    lewat_jatuh_tempo: number
    /** Jumlah tagihan yang lewat jatuh tempo ≥ batas_terlambat_hari. */
    terlambat: number
    hari_lewat_terlama: number
  }
}

export interface Tagihan {
  /** id tagihan simpanan atau id angsuran pinjaman (lihat `sumber`). */
  id: number
  sumber: 'simpanan' | 'pinjaman'
  /** Kunci unik lintas sumber, mis. "pinjaman-12". */
  kunci: string
  member_id: number
  jenis: 'pokok' | 'wajib' | 'pinjaman'
  periode: string
  jatuh_tempo: string | null
  lewat_jatuh_tempo: boolean
  /** Berapa hari lewat jatuh tempo (0 bila belum). */
  hari_lewat: number
  /** Lewat jatuh tempo ≥ batas hari (titik merah). */
  terlambat: boolean
  nominal: number
  /** Sudah masuk kas (setoran terverifikasi). */
  terbayar: number
  /** Sudah diterima kolektor, belum diverifikasi bendahara. */
  menunggu_setoran: number
  sisa: number
  // Hanya untuk angsuran pinjaman:
  pinjaman_id?: number
  pinjaman_nomor?: string
  angsuran_ke?: number
  tenor?: number
  pokok?: number
  bunga?: number
}

export interface AlokasiPembayaran {
  billing_id: number | null
  angsuran_id: number | null
  jenis: 'pokok' | 'wajib' | 'pinjaman' | null
  periode: string | null
  pinjaman_nomor: string | null
  angsuran_ke: number | null
  nominal: number
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
  alokasi?: AlokasiPembayaran[]
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
  /** Satu baris menunjuk tagihan simpanan (billing_id) ATAU angsuran pinjaman (angsuran_id). */
  alokasi: { billing_id?: number; angsuran_id?: number; nominal: number }[]
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

  wilayah(kolektorId?: number | null): Promise<{ kolektor: KolektorRingkas; anggota: AnggotaPeta[]; batas_terlambat_hari: number }> {
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

export const LABEL_JENIS: Record<string, string> = { pokok: 'Simpanan Pokok', wajib: 'Simpanan Wajib', pinjaman: 'Angsuran Pinjaman' }

/** "Simpanan Wajib" / "Angsuran 3/12 · PJM-2610-0001" */
export const labelTagihan = (t: Pick<Tagihan, 'jenis' | 'angsuran_ke' | 'tenor' | 'pinjaman_nomor'>) =>
  t.jenis === 'pinjaman' ? `Angsuran ${t.angsuran_ke}${t.tenor ? `/${t.tenor}` : ''} · ${t.pinjaman_nomor ?? 'pinjaman'}` : LABEL_JENIS[t.jenis] ?? t.jenis

/** Baris kwitansi: "Simpanan Wajib Oktober 2026" / "Angsuran ke-3 PJM-2610-0001 (Oktober 2026)" */
export const labelAlokasi = (a: AlokasiPembayaran, periodeTeks: (p: string) => string) =>
  a.jenis === 'pinjaman'
    ? `Angsuran ke-${a.angsuran_ke ?? '?'} ${a.pinjaman_nomor ?? ''}${a.periode ? ` (${periodeTeks(a.periode)})` : ''}`
    : `${LABEL_JENIS[a.jenis ?? ''] ?? ''} ${a.periode ? periodeTeks(a.periode) : ''}`.trim()

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
