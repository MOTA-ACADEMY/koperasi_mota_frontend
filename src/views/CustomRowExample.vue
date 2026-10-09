<template>
  <div :class="[
    'min-h-full transition-all duration-300',
    darkModeStore.themeClasses.main
  ]">
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div>
        <h1 :class="[
          'text-3xl font-bold transition-colors duration-300',
          darkModeStore.themeClasses.text.primary
        ]">
          Custom Row Examples
        </h1>
        <p :class="[
          'text-lg mt-1 transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          Examples of custom row and cell formatting in DataTable
        </p>
      </div>

      <!-- Custom Row Example -->
      <Card>
        <CardHeader>
          <CardTitle>Employee Management with Custom Rows</CardTitle>
          <CardDescription>
            Demonstrates various custom cell templates and formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            :data="employees"
            :columns="employeeColumns"
            :actions="employeeActions"
            search-placeholder="Search employees..."
            :search-fields="['name', 'email', 'position']"
            :page-sizes="[5, 10, 20]"
            row-key="id"
            empty-message="No employees found"
          >
            <!-- Custom Avatar Cell -->
            <template #cell-avatar="{ item }">
              <div class="flex items-center space-x-3">
                <Avatar class="h-10 w-10">
                  <AvatarImage :src="item.avatar" :alt="item.name" />
                  <AvatarFallback class="bg-primary text-primary-foreground">
                    {{ getInitials(item.name) }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <!-- Custom Status Cell with Badge -->
            <template #cell-status="{ value }">
              <Badge :variant="getStatusVariant(value)" class="capitalize">
                <div class="flex items-center space-x-1">
                  <div 
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusColor(value)
                    ]"
                  ></div>
                  <span>{{ value }}</span>
                </div>
              </Badge>
            </template>

            <!-- Custom Salary Cell with Currency Formatting -->
            <template #cell-salary="{ value }">
              <div class="text-right font-mono">
                <span class="text-lg font-semibold">{{ formatCurrency(value) }}</span>
                <div class="text-xs text-muted-foreground">per month</div>
              </div>
            </template>

            <!-- Custom Performance Cell with Progress Bar -->
            <template #cell-performance="{ value }">
              <div class="w-full">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium">{{ value }}%</span>
                  <span 
                    :class="[
                      'text-sm',
                      value >= 90 ? 'text-green-600' : 
                      value >= 70 ? 'text-yellow-600' : 
                      'text-red-600'
                    ]"
                  >
                    {{ getPerformanceLabel(value) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    :class="[
                      'h-2 rounded-full transition-all duration-300',
                      value >= 90 ? 'bg-green-500' : 
                      value >= 70 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    ]"
                    :style="{ width: value + '%' }"
                  ></div>
                </div>
              </div>
            </template>

            <!-- Custom Department Cell with Icons -->
            <template #cell-department="{ value }">
              <div class="flex items-center space-x-2">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    getDepartmentBg(value)
                  ]"
                >
                  <component :is="getDepartmentIcon(value)" class="w-4 h-4" />
                </div>
                <span class="font-medium">{{ value }}</span>
              </div>
            </template>

            <!-- Custom Skills Cell with Tags -->
            <template #cell-skills="{ value }">
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="skill in value" 
                  :key="skill" 
                  variant="outline" 
                  class="text-xs"
                >
                  {{ skill }}
                </Badge>
              </div>
            </template>
          </DataTable>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Code, Users, TrendingUp, Shield, Palette, 
  Edit, Trash2, Eye, MessageSquare 
} from 'lucide-vue-next'
import { useDarkModeStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  DataTable, Badge, Avatar, AvatarImage, AvatarFallback
} from '@/components/ui'

const darkModeStore = useDarkModeStore()
const { success, error, warning } = useToast()

// Sample employee data with custom fields
const employees = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: '',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'active',
    salary: 85000,
    performance: 92,
    skills: ['Vue.js', 'TypeScript', 'CSS'],
    joinDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    avatar: '',
    position: 'UX Designer',
    department: 'Design',
    status: 'active',
    salary: 75000,
    performance: 88,
    skills: ['Figma', 'Prototyping', 'User Research'],
    joinDate: '2023-03-22'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    avatar: '',
    position: 'Marketing Manager',
    department: 'Marketing',
    status: 'on-leave',
    salary: 70000,
    performance: 85,
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    joinDate: '2022-11-08'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    avatar: '',
    position: 'DevOps Engineer',
    department: 'Engineering',
    status: 'active',
    salary: 90000,
    performance: 95,
    skills: ['Docker', 'Kubernetes', 'AWS'],
    joinDate: '2023-05-10'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@company.com',
    avatar: '',
    position: 'Sales Representative',
    department: 'Sales',
    status: 'inactive',
    salary: 55000,
    performance: 65,
    skills: ['CRM', 'Lead Generation', 'Negotiation'],
    joinDate: '2023-07-01'
  }
])

// Column configuration
const employeeColumns = [
  {
    key: 'avatar',
    label: 'Employee',
    width: '300px'
  },
  {
    key: 'position',
    label: 'Position',
    sortable: true
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    align: 'center' as const
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    align: 'center' as const
  },
  {
    key: 'salary',
    label: 'Salary',
    sortable: true,
    align: 'right' as const
  },
  {
    key: 'performance',
    label: 'Performance',
    sortable: true,
    width: '200px'
  },
  {
    key: 'skills',
    label: 'Skills',
    width: '250px'
  }
]

// Actions
const employeeActions = [
  {
    key: 'view',
    icon: Eye,
    handler: (employee: any) => {
      success(`Viewing ${employee.name}`)
    }
  },
  {
    key: 'message',
    icon: MessageSquare,
    handler: (employee: any) => {
      warning(`Messaging ${employee.name}`)
    }
  },
  {
    key: 'edit',
    icon: Edit,
    handler: (employee: any) => {
      warning(`Editing ${employee.name}`)
    }
  },
  {
    key: 'delete',
    icon: Trash2,
    variant: 'destructive' as const,
    handler: (employee: any) => {
      error(`Deleting ${employee.name}`)
    },
    disabled: (employee: any) => employee.status === 'active'
  }
]

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'on-leave':
      return 'secondary'
    case 'inactive':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'on-leave':
      return 'bg-yellow-500'
    case 'inactive':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount)
}

const getPerformanceLabel = (score: number) => {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 70) return 'Average'
  return 'Needs Improvement'
}

const getDepartmentIcon = (department: string) => {
  switch (department.toLowerCase()) {
    case 'engineering':
      return Code
    case 'design':
      return Palette
    case 'marketing':
      return TrendingUp
    case 'sales':
      return Users
    default:
      return Shield
  }
}

const getDepartmentBg = (department: string) => {
  switch (department.toLowerCase()) {
    case 'engineering':
      return 'bg-blue-100 text-blue-600'
    case 'design':
      return 'bg-purple-100 text-purple-600'
    case 'marketing':
      return 'bg-green-100 text-green-600'
    case 'sales':
      return 'bg-orange-100 text-orange-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
</script>
