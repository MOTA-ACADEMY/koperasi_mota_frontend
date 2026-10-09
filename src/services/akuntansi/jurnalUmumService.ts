import { apiService } from '@/lib/api'

export interface JurnalUmumDetail {
  id?: number
  master_akun_id: number
  kode_akun?: string
  full_kode?: string
  nama_akun?: string
  kode_dk: 'D' | 'K'
  nominal: number
  uraian?: string | null
}

export interface JurnalUmum {
  id: number
  buku_periode_id: number
  nomor_transaksi: string
  tanggal_transaksi: string
  uraian: string
  kode_bantu: string | null
  is_posting: boolean
  tanggal_posting: string | null
  is_penyesuaian: boolean
  ref_penyesuaian_id: number | null
  jurnal_memorial_id: number | null
  jurnal_memorial?: { id: number; kode: string; nama_transaksi: string } | null
  total_debit: number
  total_kredit: number
  details: JurnalUmumDetail[]
  created_at: string
  updated_at: string
}

export interface JurnalUmumPayload {
  tanggal_transaksi: string
  uraian: string
  kode_bantu?: string | null
  jurnal_memorial_id?: number | null
  is_penyesuaian?: boolean
  ref_penyesuaian_id?: number | null
  details: { master_akun_id: number; kode_dk: 'D' | 'K'; nominal: number; uraian?: string | null }[]
}

export interface JurnalUmumListResponse {
  data: JurnalUmum[]
  total: number
  page: number
  limit: number
}

export interface DariMemorialResult {
  jurnal_memorial_id: number
  kode: string
  nama_transaksi: string
  uraian_sugesti: string
  details: {
    master_akun_id: number
    kode_akun: string
    full_kode: string
    nama_akun: string
    kode_dk: 'D' | 'K'
    nominal: number
  }[]
}

const BASE = '/akuntansi/jurnal-umum'

export const jurnalUmumService = {
  async list(params?: {
    buku_periode_id?: number
    search?: string
    is_posting?: boolean
    tanggal_dari?: string
    tanggal_sampai?: string
    page?: number
    rows?: number
  }): Promise<JurnalUmumListResponse> {
    return apiService.get(BASE, params)
  },

  async get(id: number): Promise<JurnalUmum> {
    const response = await apiService.get<{ data: JurnalUmum }>(`${BASE}/${id}`)
    return response.data
  },

  async create(payload: JurnalUmumPayload): Promise<JurnalUmum> {
    const response = await apiService.post<{ data: JurnalUmum }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: JurnalUmumPayload): Promise<JurnalUmum> {
    const response = await apiService.put<{ data: JurnalUmum }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  },

  async posting(id: number): Promise<JurnalUmum> {
    const response = await apiService.post<{ data: JurnalUmum }>(`${BASE}/${id}/posting`)
    return response.data
  },

  async unposting(id: number): Promise<JurnalUmum> {
    const response = await apiService.post<{ data: JurnalUmum }>(`${BASE}/${id}/unposting`)
    return response.data
  },

  async postingBatch(ids: number[]): Promise<{ message: string; count: number }> {
    return apiService.post(`${BASE}/posting-batch`, { ids })
  },

  async unpostingBatch(ids: number[]): Promise<{ message: string; count: number }> {
    return apiService.post(`${BASE}/unposting-batch`, { ids })
  },

  async dariMemorial(jurnalMemorialId: number): Promise<DariMemorialResult> {
    const response = await apiService.get<{ data: DariMemorialResult }>(`${BASE}/dari-memorial/${jurnalMemorialId}`)
    return response.data
  }
}
