import { apiService } from '@/lib/api'
import type { Paginated } from './tokoService'

export type JenisBunga = 'flat' | 'menurun' | 'anuitas' | 'berjangka'
export type SatuanBunga = 'bulan' | 'tahun'
export type MulaiTagih = 'bulan_ini' | 'bulan_depan'
export type StatusPinjaman = 'aktif' | 'lunas' | 'batal'

export interface TingkatBunga {
  dari: number
  sampai: number
  bunga_persen: number
}

export interface InputPinjaman {
  pokok: number
  jenis_bunga: JenisBunga
  bunga_persen: number | null
  satuan_bunga: SatuanBunga
  tingkat_bunga: TingkatBunga[] | null
  tenor_bulan: number
  tanggal_cair: string
  mulai_tagih: MulaiTagih
  tanggal_jatuh_tempo: number
}

export interface PinjamanPayload extends InputPinjaman {
  member_id: number
  keperluan?: string | null
  catatan?: string | null
}

export interface BarisJadwal {
  ke: number
  periode: string
  jatuh_tempo: string
  pokok: number
  bunga: number
  total: number
  sisa_pokok: number
  bunga_persen: number
}

export interface Simulasi {
  jadwal: BarisJadwal[]
  total_pokok: number
  total_bunga: number
  total_tagihan: number
}

export interface RingkasanPinjaman {
  terbayar: number
  terbayar_pokok: number
  sisa_tagihan: number
  sisa_pokok: number
  angsuran_lunas: number
  angsuran_tertunggak: number
  nominal_tertunggak: number
  jatuh_tempo_berikutnya: string | null
}

export interface Pinjaman extends InputPinjaman {
  id: number
  nomor: string
  member: { id: number; kode: string; nama: string; alamat: string | null; telepon: string | null } | null
  total_bunga: number
  total_tagihan: number
  status: StatusPinjaman
  keperluan: string | null
  catatan: string | null
  jurnal_id: number | null
  lunas_at: string | null
  dibatalkan_at: string | null
  alasan_batal: string | null
  dibuat_oleh: string | null
  ringkasan: RingkasanPinjaman | null
}

export interface Angsuran {
  id: number
  ke: number
  periode: string
  jatuh_tempo: string
  pokok: number
  bunga: number
  total: number
  sisa_pokok: number
  terbayar_pokok: number
  terbayar_bunga: number
  sisa: number
  menunggu_setoran: number
  status: 'belum_lunas' | 'lunas' | 'batal'
  lunas_at: string | null
}

export interface PembayaranPinjaman {
  id: number
  nomor: string
  tanggal: string
  sumber: 'kantor' | 'kolektor'
  total: number
  pokok: number
  bunga: number
  rincian: { angsuran_id: number; ke: number; pokok: number; bunga: number }[]
  catatan: string | null
  oleh: string | null
}

export interface DetailPinjaman extends Pinjaman {
  angsuran: Angsuran[]
  pembayaran: PembayaranPinjaman[]
  menunggu_setoran: number
}

export interface RingkasanDaftar {
  jumlah_aktif: number
  sisa_pokok: number
  jumlah_tertunggak: number
  nominal_tertunggak: number
}

export const LABEL_JENIS_BUNGA: Record<JenisBunga, string> = {
  flat: 'Flat / tetap',
  menurun: 'Menurun',
  anuitas: 'Anuitas',
  berjangka: 'Berjangka (bertingkat)'
}

export const PENJELASAN_JENIS_BUNGA: Record<JenisBunga, string> = {
  flat: 'Bunga dihitung dari pokok awal. Angsuran sama setiap bulan.',
  menurun: 'Bunga dihitung dari sisa pokok. Angsuran makin kecil tiap bulan.',
  anuitas: 'Angsuran sama setiap bulan; porsi bunga mengecil, porsi pokok membesar.',
  berjangka: 'Suku bunga berbeda per rentang bulan, dihitung dari pokok awal.'
}

export const pinjamanService = {
  list(params: { status?: StatusPinjaman | 'semua' | 'tertunggak'; search?: string; page?: number }): Promise<Paginated<Pinjaman> & { ringkasan: RingkasanDaftar }> {
    return apiService.get('/pinjaman', params)
  },
  async get(id: number): Promise<DetailPinjaman> {
    const res = await apiService.get<{ data: DetailPinjaman }>(`/pinjaman/${id}`)
    return res.data
  },
  simulasi(input: InputPinjaman): Promise<Simulasi> {
    return apiService.post('/pinjaman/simulasi', input)
  },
  buat(payload: PinjamanPayload): Promise<{ message: string; data: Pinjaman; peringatan: string[] }> {
    return apiService.post('/pinjaman', payload)
  },
  bayar(id: number, nominal: number, catatan?: string | null): Promise<{
    message: string
    data: { nomor: string; total: number; pokok: number; bunga: number; status_pinjaman: StatusPinjaman; rincian: PembayaranPinjaman['rincian'] }
    peringatan: string[]
  }> {
    return apiService.post(`/pinjaman/${id}/bayar`, { nominal, catatan })
  },
  batal(id: number, alasan: string): Promise<{ message: string; peringatan: string[] }> {
    return apiService.post(`/pinjaman/${id}/batal`, { alasan })
  }
}
