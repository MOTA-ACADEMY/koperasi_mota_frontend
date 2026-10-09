import { ref } from 'vue'
import { dashboardService, type DashboardStats, type RecentActivity, type BranchPerformance } from '@/services/dashboardService'

export function useDashboard() {
  // Reactive state
  const stats = ref<DashboardStats | null>(null)
  const activities = ref<RecentActivity[]>([])
  const branchPerformance = ref<BranchPerformance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load dashboard data
  const loadStats = async () => {
    try {
      loading.value = true
      error.value = null
      stats.value = await dashboardService.getStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard statistics'
      console.error('Dashboard stats error:', err)
    } finally {
      loading.value = false
    }
  }

  // Load recent activities
  const loadActivities = async (limit = 10) => {
    try {
      error.value = null
      activities.value = await dashboardService.getRecentActivities(limit)
    } catch (err: any) {
      error.value = err.message || 'Failed to load recent activities'
      console.error('Activities error:', err)
    }
  }

  // Load branch performance
  const loadBranchPerformance = async () => {
    try {
      error.value = null
      branchPerformance.value = await dashboardService.getBranchPerformance()
    } catch (err: any) {
      error.value = err.message || 'Failed to load branch performance'
      console.error('Branch performance error:', err)
    }
  }

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      loadStats(),
      loadActivities(),
      loadBranchPerformance()
    ])
  }

  // Export data
  const exportData = async (format: 'pdf' | 'excel', dateRange: { start_date: string; end_date: string }) => {
    try {
      loading.value = true
      const blob = await dashboardService.exportData(format, dateRange)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.message || 'Failed to export data'
      console.error('Export error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    stats,
    activities,
    branchPerformance,
    loading,
    error,

    // Methods
    loadStats,
    loadActivities,
    loadBranchPerformance,
    refreshData,
    exportData,
  }
}
