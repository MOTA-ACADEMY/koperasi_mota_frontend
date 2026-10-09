import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: string
  color: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color: string
  }[]
}

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const loading = ref(false)
  const metrics = ref<DashboardMetric[]>([
    {
      id: '1',
      title: 'Total Members',
      value: '12,847',
      change: 12.5,
      changeType: 'increase',
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Total Assets',
      value: '$2.54M',
      change: 8.2,
      changeType: 'increase',
      icon: '💰',
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: 'Active Loans',
      value: '1,234',
      change: -2.1,
      changeType: 'decrease',
      icon: '🏦',
      color: 'bg-orange-500'
    },
    {
      id: '4',
      title: 'Monthly Growth',
      value: '15.6%',
      change: 4.3,
      changeType: 'increase',
      icon: '📈',
      color: 'bg-purple-500'
    }
  ])

  const chartData = ref<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 59, 80, 81, 56, 95],
        color: 'rgb(59, 130, 246)'
      },
      {
        label: 'Expenses',
        data: [28, 48, 40, 19, 86, 67],
        color: 'rgb(239, 68, 68)'
      }
    ]
  })

  const recentActivities = ref([
    {
      id: '1',
      user: 'John Smith',
      action: 'Made a deposit',
      amount: '$1,250',
      time: '2 minutes ago',
      type: 'deposit'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      action: 'Applied for loan',
      amount: '$15,000',
      time: '15 minutes ago',
      type: 'loan'
    },
    {
      id: '3',
      user: 'Mike Chen',
      action: 'Withdrawal',
      amount: '$750',
      time: '1 hour ago',
      type: 'withdrawal'
    },
    {
      id: '4',
      user: 'Emily Davis',
      action: 'Account opened',
      amount: '$500',
      time: '2 hours ago',
      type: 'account'
    },
    {
      id: '5',
      user: 'David Wilson',
      action: 'Loan payment',
      amount: '$2,100',
      time: '3 hours ago',
      type: 'payment'
    }
  ])

  const topPerformers = ref([
    {
      id: '1',
      name: 'Branch A',
      performance: 94.5,
      target: 100,
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Branch B',
      performance: 87.2,
      target: 100,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'Branch C',
      performance: 76.8,
      target: 100,
      color: 'bg-yellow-500'
    },
    {
      id: '4',
      name: 'Branch D',
      performance: 65.3,
      target: 100,
      color: 'bg-red-500'
    }
  ])

  // Getters
  const totalRevenue = computed(() => {
    return chartData.value.datasets[0].data.reduce((sum, value) => sum + value, 0)
  })

  const totalExpenses = computed(() => {
    return chartData.value.datasets[1].data.reduce((sum, value) => sum + value, 0)
  })

  const profit = computed(() => totalRevenue.value - totalExpenses.value)

  // Actions
  const refreshMetrics = async () => {
    loading.value = true
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update metrics with new random values
        metrics.value.forEach(metric => {
          if (metric.id === '1') {
            const newValue = 12847 + Math.floor(Math.random() * 100)
            metric.value = newValue.toLocaleString()
          }
        })
        loading.value = false
        resolve(metrics.value)
      }, 1500)
    })
  }

  const addActivity = (activity: any) => {
    recentActivities.value.unshift({
      ...activity,
      id: Date.now().toString(),
      time: 'Just now'
    })
    // Keep only last 10 activities
    if (recentActivities.value.length > 10) {
      recentActivities.value = recentActivities.value.slice(0, 10)
    }
  }

  return {
    // State
    loading,
    metrics,
    chartData,
    recentActivities,
    topPerformers,
    // Getters
    totalRevenue,
    totalExpenses,
    profit,
    // Actions
    refreshMetrics,
    addActivity
  }
})
