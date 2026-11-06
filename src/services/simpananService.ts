import { apiService } from '@/lib/api'

export type SimpananType = 'pokok' | 'wajib' | 'sukarela'

export interface SimpananBilling {
  id: number
  type: SimpananType
  period: string // YYYY-MM
  member_id: number
  member_name: string
  amount: number
  /** Sudah masuk kas (bayar di kantor + setoran kolektor terverifikasi). */
  terbayar: number
  /** Sudah dibayar ke kolektor, belum disetor/diverifikasi. */
  menunggu_setoran: number
  /** Yang masih bisa dibayar sekarang. */
  sisa: number
  status: 'lunas' | 'belum_lunas'
  due_date: string
  created_at: string
  updated_at: string
}

export type MetodeBayar = 'tunai' | 'transfer'

export interface RiwayatPembayaranSimpanan {
  id: number | string
  nomor: string | null
  sumber: 'kantor' | 'kolektor'
  tanggal: string | null
  nominal: number
  metode: MetodeBayar
  /** kantor: diterima | dibatalkan; kolektor: status kwitansi kolektor */
  status: string | null
  oleh: string | null
  catatan: string | null
  dibatalkan_at: string | null
  alasan_batal: string | null
  bisa_dibatalkan: boolean
}

export interface BillingCreateData {
  type: SimpananType
  period: string
  members: {
    member_id: number
    amount: number
  }[]
}

export interface BillingCreateResult {
  message: string
  created: number
  skipped: number
}

export const simpananService = {
  async getBillings(type: SimpananType): Promise<SimpananBilling[]> {
    const response = await apiService.get<{ data: SimpananBilling[] }>('/simpanan/billings', { type })
    return response.data
  },

  async createBilling(data: BillingCreateData): Promise<BillingCreateResult> {
    return apiService.post('/simpanan/billings', data)
  },

  /** Terima pembayaran di kantor (boleh sebagian) — langsung dijurnal Kas/Bank / Simpanan. */
  bayar(id: number, payload: { nominal: number; metode: MetodeBayar; catatan?: string | null }): Promise<{
    message: string
    data: SimpananBilling
    pembayaran: RiwayatPembayaranSimpanan
    peringatan: string[]
  }> {
    return apiService.post(`/simpanan/billings/${id}/bayar`, payload)
  },

  riwayat(id: number): Promise<{ data: RiwayatPembayaranSimpanan[]; tagihan: SimpananBilling }> {
    return apiService.get(`/simpanan/billings/${id}/pembayaran`)
  },

  batalPembayaran(pembayaranId: number, alasan: string): Promise<{ message: string; peringatan: string[] }> {
    return apiService.post(`/simpanan/pembayaran/${pembayaranId}/batal`, { alasan })
  },

  async deleteBilling(id: number | string): Promise<{ message: string }> {
    return apiService.delete(`/simpanan/billings/${id}`)
  }
}
