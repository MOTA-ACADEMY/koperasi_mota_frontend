import { defineStore } from 'pinia'
import { ref } from 'vue'
import { memberService, type MemberDetail } from '@/services/memberService'

export type Member = MemberDetail

// Pagination interface
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Filter interface
export interface MemberFilter {
  search: string
  status: 'all' | 'aktif' | 'nonaktif'
}

export const useMembersStore = defineStore('members', () => {
  // State
  const members = ref<Member[]>([])
  const loading = ref(false)
  const totalRecords = ref(0) // For lazy loading
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const filters = ref<MemberFilter>({
    search: '',
    status: 'all'
  })

  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const setLimit = (limit: number) => {
    pagination.value.limit = limit
    pagination.value.page = 1
  }

  const setSearch = (search: string) => {
    filters.value.search = search
    pagination.value.page = 1
  }

  const setStatusFilter = (status: 'all' | 'aktif' | 'nonaktif') => {
    filters.value.status = status
    pagination.value.page = 1
  }

  const updateMemberStatus = async (memberId: number | string, status: 'aktif' | 'nonaktif') => {
    try {
      await memberService.updateStatus(memberId, status)
      await loadLazy({
        page: pagination.value.page,
        rows: pagination.value.limit,
        globalFilter: filters.value.search,
        filters: { status: filters.value.status === 'all' ? null : filters.value.status }
      })
      return true
    } catch (error) {
      console.error('Error updating member status:', error)
      return false
    }
  }

  const getMemberById = async (id: number | string) => {
    return memberService.get(id)
  }

  // Lazy loading method (drives the DataTable)
  const loadLazy = async (params: {
    page: number
    rows: number
    sortField?: string
    sortOrder?: 'asc' | 'desc'
    globalFilter?: string
    filters?: any
  }) => {
    loading.value = true

    try {
      const response = await memberService.list({
        page: params.page,
        rows: params.rows,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
        globalFilter: params.globalFilter,
        filters: { status: params.filters?.status ?? null }
      })

      members.value = response.data
      totalRecords.value = response.total
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchMembers = async () => {
    await loadLazy({
      page: pagination.value.page,
      rows: pagination.value.limit,
      globalFilter: filters.value.search,
      filters: { status: filters.value.status === 'all' ? null : filters.value.status }
    })
  }

  // Initialize
  const init = () => {
    loadLazy({
      page: 1,
      rows: 10,
      sortField: '',
      sortOrder: 'asc',
      globalFilter: '',
      filters: {}
    })
  }

  return {
    // State
    members,
    loading,
    totalRecords,
    pagination,
    filters,

    // Actions
    fetchMembers,
    loadLazy,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    updateMemberStatus,
    getMemberById,
    init
  }
})
