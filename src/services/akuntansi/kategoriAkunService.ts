import { apiService } from '@/lib/api'

export interface KategoriAkun {
  id: number
  kode: string
  nama_kategori: string
  dk_kode: 'D' | 'K'
  dk_label: string
  urutan: number
  is_aktif: boolean
  created_at: string
  updated_at: string
}

export interface KategoriAkunPayload {
  kode?: string
  nama_kategori: string
  dk_kode: 'D' | 'K'
  urutan?: number
  is_aktif?: boolean
}

const BASE = '/akuntansi/kategori-akun'

export const kategoriAkunService = {
  async list(params?: { search?: string; is_aktif?: boolean }): Promise<KategoriAkun[]> {
    const response = await apiService.get<{ data: KategoriAkun[] }>(BASE, params)
    return response.data
  },

  async create(payload: KategoriAkunPayload): Promise<KategoriAkun> {
    const response = await apiService.post<{ data: KategoriAkun }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: KategoriAkunPayload): Promise<KategoriAkun> {
    const response = await apiService.put<{ data: KategoriAkun }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  }
}
