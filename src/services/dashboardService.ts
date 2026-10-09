import { apiService } from '@/lib/api'

// Dashboard interfaces
export interface DashboardStats {
  total_members: number
  total_accounts: number
  total_loans: number
  total_deposits: number
  monthly_revenue: number
  monthly_expenses: number
  active_loans: number
  pending_applications: number
}

export interface RecentActivity {
  id: number
  user_name: string
  action: string
  amount: string
  type: 'deposit' | 'withdrawal' | 'loan' | 'payment' | 'account'
  timestamp: string
}

export interface BranchPerformance {
  id: number
  name: string
  performance: number
  target: number
  color: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

// Dashboard API service
export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    return apiService.get('/dashboard/stats')
  },

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    return apiService.get('/dashboard/activities', { limit })
  },

  // Get branch performance data
  async getBranchPerformance(): Promise<BranchPerformance[]> {
    return apiService.get('/dashboard/branch-performance')
  },

  // Get revenue chart data
  async getRevenueChart(period: string = '6months'): Promise<ChartData> {
    return apiService.get('/dashboard/revenue-chart', { period })
  },

  // Get member growth chart data
  async getMemberGrowthChart(period: string = '12months'): Promise<ChartData> {
    return apiService.get('/dashboard/member-growth', { period })
  },

  // Get loan distribution data
  async getLoanDistribution(): Promise<ChartData> {
    return apiService.get('/dashboard/loan-distribution')
  },

  // Export dashboard data
  async exportData(format: 'pdf' | 'excel', dateRange: {
    start_date: string
    end_date: string
  }): Promise<Blob> {
    const response = await apiService.get('/dashboard/export', {
      format,
      ...dateRange
    })
    return response
  },

  // Get alerts/notifications
  async getAlerts(): Promise<{
    id: number
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    created_at: string
  }[]> {
    return apiService.get('/dashboard/alerts')
  },
}

// ---------------------------------------------------------------------------
// Ringkasan dashboard koperasi (GET /dashboard/ringkasan). Tiap bagian null bila
// user tidak punya hak akses ke menu sumbernya.
// ---------------------------------------------------------------------------

export type JenisSimpanan = 'pokok' | 'wajib' | 'sukarela'

export interface RingkasanDashboard {
  /** Periode berjalan, format YYYY-MM. */
  periode: string
  anggota: {
    total: number
    aktif: number
    baru_bulan_ini: number
    terbaru: { id: number; kode: string; nama: string; tanggal_bergabung: string | null; status: 'aktif' | 'nonaktif' }[]
  } | null
  simpanan: {
    jenis: JenisSimpanan[]
    tren: { periode: string; lunas: number; belum_lunas: number }[]
    per_jenis: { jenis: JenisSimpanan; jumlah_tagihan: number; jumlah_lunas: number; ditagih: number; terkumpul: number }[]
    belum_lunas: { jumlah: number; nominal: number; jatuh_tempo: number }
    tagihan_terlama: {
      id: number
      jenis: JenisSimpanan
      periode: string
      nominal: number
      jatuh_tempo: string | null
      lewat_jatuh_tempo: boolean
      anggota: string | null
    }[]
  } | null
  akuntansi: {
    periode_aktif: { id: number; tahun: number; is_closed: boolean } | null
    jurnal_draft?: number
    jurnal_terposting?: number
    saldo_awal_terverifikasi?: boolean
  } | null
}

export const ringkasanService = {
  async ringkasan(): Promise<RingkasanDashboard> {
    return apiService.get<RingkasanDashboard>('/dashboard/ringkasan')
  }
}
