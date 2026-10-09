import { apiService } from '@/lib/api'

export type SimpananType = 'pokok' | 'wajib' | 'sukarela'

export interface SimpananBilling {
  id: number
  type: SimpananType
  period: string // YYYY-MM
  member_id: number
  member_name: string
  amount: number
  status: 'lunas' | 'belum_lunas'
  due_date: string
  created_at: string
  updated_at: string
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

  async updateBillingStatus(id: number | string, status: 'lunas' | 'belum_lunas'): Promise<SimpananBilling> {
    const response = await apiService.patch<{ data: SimpananBilling }>(`/simpanan/billings/${id}/status`, { status })
    return response.data
  },

  async deleteBilling(id: number | string): Promise<{ message: string }> {
    return apiService.delete(`/simpanan/billings/${id}`)
  }
}
