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
