import { apiService } from '@/lib/api'

export interface TipeAkun {
  id: number
  kode: string
  nama_tipe: string
  keterangan: string | null
  is_aktif: boolean
  created_at: string
  updated_at: string
}

export interface TipeAkunPayload {
  kode?: string
  nama_tipe: string
  keterangan?: string | null
  is_aktif?: boolean
}

const BASE = '/akuntansi/tipe-akun'

export const tipeAkunService = {
  async list(params?: { search?: string; is_aktif?: boolean }): Promise<TipeAkun[]> {
    const response = await apiService.get<{ data: TipeAkun[] }>(BASE, params)
    return response.data
  },

  async create(payload: TipeAkunPayload): Promise<TipeAkun> {
    const response = await apiService.post<{ data: TipeAkun }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: TipeAkunPayload): Promise<TipeAkun> {
    const response = await apiService.put<{ data: TipeAkun }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  }
}
