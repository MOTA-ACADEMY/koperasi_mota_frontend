import { apiService } from '@/lib/api'

export interface JurnalMemorialDetail {
  id?: number
  masterakun_kode: string
  nama_akun?: string | null
  full_kode?: string | null
  karakter_akun: 'D' | 'K'
}

export interface JurnalMemorial {
  id: number
  kode: string
  nama_transaksi: string
  keterangan: string | null
  is_aktif: boolean
  details: JurnalMemorialDetail[]
  created_at: string
  updated_at: string
}

export interface JurnalMemorialPayload {
  kode: string
  nama_transaksi: string
  keterangan?: string | null
  is_aktif?: boolean
  details: { masterakun_kode: string; karakter_akun: 'D' | 'K' }[]
}

export interface JurnalMemorialListResponse {
  data: JurnalMemorial[]
  total: number
  page: number
  limit: number
}

const BASE = '/akuntansi/jurnal-memorial'

export const jurnalMemorialService = {
  async list(params?: { search?: string; is_aktif?: boolean; page?: number; rows?: number }): Promise<JurnalMemorialListResponse> {
    return apiService.get(BASE, params)
  },

  async get(id: number): Promise<JurnalMemorial> {
    const response = await apiService.get<{ data: JurnalMemorial }>(`${BASE}/${id}`)
    return response.data
  },

  async create(payload: JurnalMemorialPayload): Promise<JurnalMemorial> {
    const response = await apiService.post<{ data: JurnalMemorial }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: JurnalMemorialPayload): Promise<JurnalMemorial> {
    const response = await apiService.put<{ data: JurnalMemorial }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  }
}
