import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  simpananService,
  type SimpananBilling,
  type BillingCreateData,
  type SimpananType
} from '@/services/simpananService'
import { memberService, type MemberDetail } from '@/services/memberService'

export type { SimpananBilling, BillingCreateData }
export type Member = MemberDetail

export const useSimpananStore = defineStore('simpanan', () => {
  const billings = ref<SimpananBilling[]>([])
  const members = ref<Member[]>([])
  const loading = ref(false)

  const getBillings = async (type?: SimpananType): Promise<SimpananBilling[]> => {
    if (!type) {
      billings.value = []
      return []
    }

    loading.value = true
    try {
      const result = await simpananService.getBillings(type)
      billings.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  const getActiveMembers = async (): Promise<Member[]> => {
    loading.value = true
    try {
      const response = await memberService.list({ page: 1, rows: 100, filters: { status: 'aktif' } })
      members.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }

  const createBilling = async (data: BillingCreateData): Promise<void> => {
    loading.value = true
    try {
      await simpananService.createBilling(data)
    } finally {
      loading.value = false
    }
  }

  const deleteBilling = async (id: number | string): Promise<void> => {
    loading.value = true
    try {
      await simpananService.deleteBilling(id)
    } finally {
      loading.value = false
    }
  }

  const updateBillingStatus = async (id: number | string, status: 'lunas' | 'belum_lunas'): Promise<void> => {
    loading.value = true
    try {
      await simpananService.updateBillingStatus(id, status)
    } finally {
      loading.value = false
    }
  }

  return {
    billings,
    members,
    loading,
    getBillings,
    getActiveMembers,
    createBilling,
    deleteBilling,
    updateBillingStatus
  }
})
