import { apiService } from '@/lib/api'
import type { Paginated } from './tokoService'

export interface RingkasanSesi {
  jumlah_transaksi: number
  jumlah_batal: number
  total_tunai: number
  total_qris: number
  penjualan_barang: number
  hpp_barang: number
  penjualan_jasa: number
  modal_jasa: number
  modal_awal: number
  /** modal awal + penjualan tunai = uang yang seharusnya ada di laci */
  uang_seharusnya: number
  uang_fisik?: number
  selisih?: number
}

export interface SesiKasir {
  id: number
  nomor: string
  status: 'buka' | 'tutup'
  kasir: string | null
  user_id: number
  dibuka_at: string
  modal_awal: number
  catatan_buka: string | null
  ditutup_at: string | null
  total_tunai: number
  total_qris: number
  jumlah_transaksi: number
  uang_fisik: number | null
  selisih: number | null
  catatan_tutup: string | null
  jurnal_buka_id: number | null
  jurnal_tutup_id: number | null
  ringkasan?: RingkasanSesi
}

export interface ItemPenjualan {
  jenis: 'barang' | 'jasa'
  barang_satuan_id: number | null
  jasa_id: number | null
  nama: string
  satuan: string | null
  qty: number
  harga_jual: number
  subtotal: number
  no_pelanggan: string | null
  keterangan: string | null
}

export interface Penjualan {
  id: number
  nomor: string
  sesi_id: number
  kasir: string | null
  tanggal: string
  metode: 'tunai' | 'qris'
  total: number
  dibayar: number
  kembalian: number
  ref_qris: string | null
  status: 'selesai' | 'batal'
  alasan_batal: string | null
  items: ItemPenjualan[]
}

export interface ItemKeranjangPayload {
  jenis: 'barang' | 'jasa'
  barang_satuan_id?: number
  jasa_id?: number
  qty: number
  nominal?: number
  no_pelanggan?: string | null
  keterangan?: string | null
}

export const kasirService = {
  async sesiAktif(): Promise<SesiKasir | null> {
    const res = await apiService.get<{ data: SesiKasir | null }>('/kasir/sesi-aktif')
    return res.data
  },
  buka(modal_awal: number, catatan?: string | null): Promise<{ data: SesiKasir; peringatan: string[] }> {
    return apiService.post('/kasir/buka', { modal_awal, catatan })
  },
  jual(payload: { metode: 'tunai' | 'qris'; dibayar?: number | null; ref_qris?: string | null; items: ItemKeranjangPayload[] }): Promise<{ data: Penjualan; ringkasan: RingkasanSesi }> {
    return apiService.post('/kasir/penjualan', payload)
  },
  batal(id: number, alasan: string): Promise<{ message: string; ringkasan: RingkasanSesi }> {
    return apiService.post(`/kasir/penjualan/${id}/batal`, { alasan })
  },
  tutup(uang_fisik: number, catatan?: string | null): Promise<{ data: SesiKasir; ringkasan: RingkasanSesi; peringatan: string[] }> {
    return apiService.post('/kasir/tutup', { uang_fisik, catatan })
  },
  async penjualan(sesiId?: number): Promise<Penjualan[]> {
    const res = await apiService.get<{ data: Penjualan[] }>('/kasir/penjualan', sesiId ? { sesi_id: sesiId } : undefined)
    return res.data
  },
  async detailPenjualan(id: number): Promise<Penjualan> {
    const res = await apiService.get<{ data: Penjualan }>(`/kasir/penjualan/${id}`)
    return res.data
  },
  daftarSesi(params: { status?: 'buka' | 'tutup'; dari?: string; sampai?: string; page?: number }): Promise<Paginated<SesiKasir> & { bisa_lihat_semua: boolean }> {
    return apiService.get('/kasir/sesi', params)
  },
  async detailSesi(id: number): Promise<SesiKasir> {
    const res = await apiService.get<{ data: SesiKasir }>(`/kasir/sesi/${id}`)
    return res.data
  }
}
