import { apiService } from '@/lib/api'
import type { MenuNode } from '@/services/authService'

export interface RbacRole {
  id: number
  nama: string
  deskripsi: string | null
  /** Role akses penuh (Admin) otomatis mendapat semua menu; menu_ids-nya selalu kosong. */
  akses_penuh: boolean
  /** Role bawaan sistem — tidak bisa dihapus. */
  is_sistem: boolean
  menu_ids: number[]
  jumlah_pengguna: number
}

export interface RbacRolePayload {
  nama: string
  deskripsi: string | null
  menu_ids: number[]
}

const BASE = '/rbac'

export const rbacService = {
  /** Katalog menu (grup → menu) untuk memilih hak akses. */
  async menu(): Promise<MenuNode[]> {
    const response = await apiService.get<{ data: MenuNode[] }>(`${BASE}/menu`)
    return response.data
  },

  async roles(): Promise<RbacRole[]> {
    const response = await apiService.get<{ data: RbacRole[] }>(`${BASE}/roles`)
    return response.data
  },

  async createRole(payload: RbacRolePayload): Promise<RbacRole> {
    const response = await apiService.post<{ data: RbacRole }>(`${BASE}/roles`, payload)
    return response.data
  },

  async updateRole(id: number, payload: RbacRolePayload): Promise<RbacRole> {
    const response = await apiService.put<{ data: RbacRole }>(`${BASE}/roles/${id}`, payload)
    return response.data
  },

  async deleteRole(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/roles/${id}`)
  }
}
