<template>
  <div :class="[
    'min-h-full transition-all duration-300'
  ]">
    <!-- Main Content Area -->
    <div class="p-6 space-y-6">
      <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 :class="[
              'text-3xl font-bold transition-colors duration-300',
              darkModeStore.themeClasses.text.primary
            ]">
              Dashboard Overview
            </h1>
            <p :class="[
              'text-sm mt-1 transition-colors duration-300',
              darkModeStore.themeClasses.text.secondary
            ]">
              Welcome back! Here's what's happening with your cooperative today.
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              @click="dashboardStore.refreshMetrics"
              :disabled="dashboardStore.loading"
              class="hover:scale-105 transition-all duration-300"
            >
              <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': dashboardStore.loading }]" />
              {{ dashboardStore.loading ? 'Refreshing...' : 'Refresh' }}
            </Button>
            <Button
              size="sm"
              class="hover:scale-105 transition-all duration-300"
            >
              <Download class="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            v-for="metric in dashboardStore.metrics"
            :key="metric.id"
            role="button"
            tabindex="0"
            :class="`hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer transform ${darkModeStore.themeClasses.card}`"
            @click="() => console.log('Metric clicked:', metric.title)"
            @keydown.enter="() => console.log('Metric clicked:', metric.title)"
            @keydown.space="() => console.log('Metric clicked:', metric.title)"
          >
            <CardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p :class="[
                    'text-sm font-medium transition-colors duration-300',
                    darkModeStore.themeClasses.text.secondary
                  ]">
                    {{ metric.title }}
                  </p>
                  <p :class="[
                    'text-2xl font-bold mt-2 transition-colors duration-300',
                    darkModeStore.themeClasses.text.primary
                  ]">
                    {{ metric.value }}
                  </p>
                  <div class="flex items-center mt-2">
                    <TrendingUp 
                      v-if="metric.changeType === 'increase'" 
                      class="h-4 w-4 text-green-500 mr-1" 
                    />
                    <TrendingDown 
                      v-else 
                      class="h-4 w-4 text-red-500 mr-1" 
                    />
                    <span :class="[
                      'text-sm font-medium',
                      metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ Math.abs(metric.change) }}%
                    </span>
                    <span :class="[
                      'text-sm ml-1 transition-colors duration-300',
                      darkModeStore.themeClasses.text.muted
                    ]">
                      vs last month
                    </span>
                  </div>
                </div>
                <Avatar class="h-12 w-12">
                  <AvatarFallback :class="metric.color + ' text-white text-lg'">
                    {{ metric.icon }}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Revenue Chart -->
          <Card :class="`hover:shadow-lg transition-all duration-300 ${darkModeStore.themeClasses.card}`">
            <CardContent class="p-4">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 :class="[
                    'text-lg font-semibold transition-colors duration-300',
                    darkModeStore.themeClasses.text.primary
                  ]">
                    Revenue Overview
                  </h3>
                  <p :class="[
                    'text-sm transition-colors duration-300',
                    darkModeStore.themeClasses.text.secondary
                  ]">
                    Monthly revenue and expenses comparison
                  </p>
                </div>
                <Badge variant="outline">6 Months</Badge>
              </div>
              
              <!-- Revenue Chart -->
              <div class="h-64 relative">
                <!-- Chart Container -->
                <div class="w-full h-full flex items-end justify-between px-4 pb-8 space-x-2">
                  <div 
                    v-for="(month, index) in dashboardStore.chartData.labels" 
                    :key="month" 
                    class="flex-1 flex flex-col items-center space-y-1"
                  >
                    <!-- Revenue Bar -->
                    <div class="w-full flex items-end space-x-1 h-40">
                      <div 
                        class="bg-blue-500 rounded-t-sm flex-1 transition-all duration-500 hover:bg-blue-600"
                        :style="{ 
                          height: `${(dashboardStore.chartData.datasets[0].data[index] / 100) * 100}%`,
                          minHeight: '8px'
                        }"
                        :title="`Revenue: $${dashboardStore.chartData.datasets[0].data[index]}k`"
                      />
                      <!-- Expenses Bar -->
                      <div 
                        class="bg-red-500 rounded-t-sm flex-1 transition-all duration-500 hover:bg-red-600"
                        :style="{ 
                          height: `${(dashboardStore.chartData.datasets[1].data[index] / 100) * 100}%`,
                          minHeight: '8px'
                        }"
                        :title="`Expenses: $${dashboardStore.chartData.datasets[1].data[index]}k`"
                      />
                    </div>
                    <!-- Month Label -->
                    <span :class="[
                      'text-xs font-medium transition-colors duration-300',
                      darkModeStore.themeClasses.text.secondary
                    ]">
                      {{ month }}
                    </span>
                  </div>
                </div>
                
                <!-- Legend -->
                <div class="absolute bottom-0 left-0 right-0 flex justify-center space-x-6 py-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-blue-500 rounded"></div>
                    <span :class="[
                      'text-xs transition-colors duration-300',
                      darkModeStore.themeClasses.text.secondary
                    ]">
                      Revenue (${{ dashboardStore.totalRevenue }}k)
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-red-500 rounded"></div>
                    <span :class="[
                      'text-xs transition-colors duration-300',
                      darkModeStore.themeClasses.text.secondary
                    ]">
                      Expenses (${{ dashboardStore.totalExpenses }}k)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Performance Chart -->
          <Card :class="`hover:shadow-lg transition-all duration-300 ${darkModeStore.themeClasses.card}`">
            <CardContent class="p-4">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 :class="[
                    'text-lg font-semibold transition-colors duration-300',
                    darkModeStore.themeClasses.text.primary
                  ]">
                    Branch Performance
                  </h3>
                  <p :class="[
                    'text-sm transition-colors duration-300',
                    darkModeStore.themeClasses.text.secondary
                  ]">
                    Performance vs targets
                  </p>
                </div>
                <Badge variant="secondary">Real-time</Badge>
              </div>
              
              <div class="space-y-4">
                <div 
                  v-for="performer in dashboardStore.topPerformers" 
                  :key="performer.id"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center space-x-3">
                    <div :class="['w-3 h-3 rounded-full', performer.color]" />
                    <span :class="[
                      'font-medium transition-colors duration-300',
                      darkModeStore.themeClasses.text.primary
                    ]">
                      {{ performer.name }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        :class="['h-2 rounded-full transition-all duration-500', performer.color]"
                        :style="{ width: `${performer.performance}%` }"
                      />
                    </div>
                    <span :class="[
                      'text-sm font-medium w-12 text-right transition-colors duration-300',
                      darkModeStore.themeClasses.text.secondary
                    ]">
                      {{ performer.performance }}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Activities List -->
          <Card :class="`hover:shadow-lg transition-all duration-300 ${darkModeStore.themeClasses.card}`">
            <CardContent class="p-4">
              <div class="flex items-center justify-between mb-6">
                <h3 :class="[
                  'text-lg font-semibold transition-colors duration-300',
                  darkModeStore.themeClasses.text.primary
                ]">
                  Recent Activities
                </h3>
                <Button variant="outline" size="sm" class="hover:scale-105 transition-all duration-300">
                  View All
                </Button>
              </div>
              
              <div class="space-y-4">
                <div 
                  v-for="activity in dashboardStore.recentActivities.slice(0, 5)" 
                  :key="activity.id"
                  class="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 dark:hover:text-white transition-all duration-300 group"
                >
                  <Avatar class="h-10 w-10">
                    <AvatarFallback :class="`text-sm font-medium ${getActivityColor(activity.type)}`">
                      {{ getActivityIcon(activity.type) }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="flex-1 min-w-0">
                    <p :class="[
                      'text-sm font-medium transition-colors duration-300 group-hover:text-white',
                      darkModeStore.themeClasses.text.primary
                    ]">
                      {{ activity.user }}
                    </p>
                    <p :class="[
                      'text-xs transition-colors duration-300 group-hover:text-white',
                      darkModeStore.themeClasses.text.secondary
                    ]">
                      {{ activity.action }} • {{ activity.amount }}
                    </p>
                  </div>
                  <span :class="[
                    'text-xs transition-colors duration-300 group-hover:text-white',
                    darkModeStore.themeClasses.text.muted
                  ]">
                    {{ activity.time }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Quick Actions -->
          <Card :class="`hover:shadow-lg transition-all duration-300 ${darkModeStore.themeClasses.card}`">
            <CardContent class="p-4">
              <h3 :class="[
                'text-lg font-semibold mb-6 transition-colors duration-300',
                darkModeStore.themeClasses.text.primary
              ]">
                Quick Actions
              </h3>
              
              <div class="grid grid-cols-2 gap-4">
                <Button
                  v-for="action in quickActions"
                  :key="action.name"
                  variant="outline"
                  size="lg"
                  class="!flex !flex-col !items-center !p-4 !h-auto"
                  @click="handleQuickAction(action.action)"
                >
                  <component :is="action.icon" class="h-8 w-8 mb-2" />
                  <span class="text-sm font-medium">{{ action.name }}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  UserPlus,
  CreditCard,
  FileText,
  Calculator
} from 'lucide-vue-next'
import { useDarkModeStore, useDashboardStore } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'

const darkModeStore = useDarkModeStore()
const dashboardStore = useDashboardStore()

const quickActions = [
  { name: 'Add Member', icon: UserPlus, action: 'add-member' },
  { name: 'New Account', icon: CreditCard, action: 'new-account' },
  { name: 'Generate Report', icon: FileText, action: 'generate-report' },
  { name: 'Loan Calculator', icon: Calculator, action: 'loan-calculator' }
]

const getActivityColor = (type: string) => {
  const colors = {
    deposit: 'bg-green-500 text-white',
    withdrawal: 'bg-orange-500 text-white',
    loan: 'bg-green-600 text-white',
    payment: 'bg-purple-500 text-white',
    account: 'bg-green-400 text-white'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500 text-white'
}

const getActivityIcon = (type: string) => {
  const icons = {
    deposit: '↓',
    withdrawal: '↑',
    loan: '💼',
    payment: '💳',
    account: '👤'
  }
  return icons[type as keyof typeof icons] || '•'
}

const handleQuickAction = (action: string) => {
  // Handle quick actions
  console.log('Quick action:', action)
  // You can add router navigation or modal opening here
}

onMounted(() => {
  // Initialize any dashboard data if needed
})
</script>
