import { apiService } from '@/lib/api'

export interface MasterAkunNode {
  id: number
  buku_periode_id: number
  parent_id: number | null
  parent_kode: string | null
  kode_akun: string
  full_kode: string
  nama_akun: string
  tipe_akun_id: number
  tipe_akun?: { id: number; kode: string; nama_tipe: string }
  kategori_akun_id: number
  kategori_akun?: { id: number; kode: string; nama_kategori: string; dk_kode: string }
  karakter_akun: 'D' | 'K'
  is_aktif: boolean
  children: MasterAkunNode[]
  has_children: boolean
  created_at: string
  updated_at: string
}

export interface MasterAkunPayload {
  buku_periode_id: number
  parent_id?: number | null
  kode_akun: string
  full_kode: string
  nama_akun: string
  tipe_akun_id: number
  kategori_akun_id: number
  karakter_akun: 'D' | 'K'
  is_aktif?: boolean
}

export interface ParentOption {
  id: number
  kode_akun: string
  full_kode: string
  nama_akun: string
}

const BASE = '/akuntansi/master-akun'

export const masterAkunService = {
  async tree(bukuPeriodeId?: number): Promise<{ data: MasterAkunNode[]; buku_periode_id: number | null }> {
    return apiService.get(BASE, bukuPeriodeId ? { buku_periode_id: bukuPeriodeId } : undefined)
  },

  async create(payload: MasterAkunPayload): Promise<MasterAkunNode> {
    const response = await apiService.post<{ data: MasterAkunNode }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: MasterAkunPayload): Promise<MasterAkunNode> {
    const response = await apiService.put<{ data: MasterAkunNode }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  },

  async parentOptions(bukuPeriodeId?: number): Promise<ParentOption[]> {
    const response = await apiService.get<{ data: ParentOption[] }>(`${BASE}/parent-options`, bukuPeriodeId ? { buku_periode_id: bukuPeriodeId } : undefined)
    return response.data
  }
}
