import { apiService } from '@/lib/api'
import type { LatLngPoint } from '@/components/map/PolygonAreaPicker.vue'

export interface Kolektor {
  id: number
  user_id: number
  nama: string
  email: string
  no_hp: string | null
  keterangan: string | null
  wilayah: LatLngPoint[]
  is_aktif: boolean
  created_at: string
  updated_at: string
}

export interface KolektorPayload {
  user_id: number
  no_hp?: string | null
  keterangan?: string | null
  wilayah?: LatLngPoint[]
  is_aktif?: boolean
}

export interface UserOption {
  id: number
  name: string
  email: string
}

const BASE = '/kolektor'

export const kolektorService = {
  async list(params?: { search?: string; is_aktif?: boolean }): Promise<Kolektor[]> {
    const response = await apiService.get<{ data: Kolektor[] }>(BASE, params)
    return response.data
  },

  async get(id: number | string): Promise<Kolektor> {
    const response = await apiService.get<{ data: Kolektor }>(`${BASE}/${id}`)
    return response.data
  },

  async create(payload: KolektorPayload): Promise<Kolektor> {
    const response = await apiService.post<{ data: Kolektor }>(BASE, payload)
    return response.data
  },

  async update(id: number | string, payload: KolektorPayload): Promise<Kolektor> {
    const response = await apiService.put<{ data: Kolektor }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number | string): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  },

  async userOptions(kolektorId?: number | string): Promise<UserOption[]> {
    const response = await apiService.get<{ data: UserOption[] }>(`${BASE}/user-options`, {
      kolektor_id: kolektorId
    })
    return response.data
  }
}
