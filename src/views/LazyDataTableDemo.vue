<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Lazy Loading DataTable Demo</h1>
      <p class="text-muted-foreground">
        Demonstration of DataTable with lazy loading for large datasets.
        Data is fetched from the server on demand based on pagination, sorting, and filtering.
      </p>
    </div>

    <!-- Large Employee Dataset -->
    <div class="bg-card rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold mb-4 text-foreground">Employee Management (Lazy Loading)</h2>
      <p class="text-sm text-muted-foreground mb-4">
        This table simulates loading data from a server with {{ totalEmployees.toLocaleString() }} employees.
        Try searching, sorting, or changing pages to see the lazy loading in action.
      </p>
      
      <DataTable
        :data="employees"
        :columns="employeeColumns"
        :actions="employeeActions"
        :lazy="true"
        :total-records="totalEmployees"
        :lazy-loading="loading"
        :page-size="20"
        :page-size-options="[10, 20, 50, 100]"
        searchable
        @lazy-load="onLazyLoad"
        @search="onSearch"
        @sort="onSort"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </div>

    <!-- Event Log -->
    <div class="bg-muted/50 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-3 text-foreground">Event Log</h3>
      <div class="max-h-48 overflow-y-auto space-y-1">
        <div
          v-for="(event, index) in eventLog"
          :key="index"
          class="text-sm font-mono bg-card p-2 rounded border"
        >
          <span class="text-primary">{{ event.timestamp }}</span>
          <span class="text-muted-foreground mx-2">-</span>
          <span class="text-foreground">{{ event.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Eye, Edit } from 'lucide-vue-next'
import DataTable from '@/components/ui/DataTable.vue'
import type { Column, Action } from '@/components/ui/DataTable.vue'

// Simulated data store
const originalTotalEmployees = 10000 // Keep this constant
const totalEmployees = ref(originalTotalEmployees) // This will change only for filtering
const employees = ref<any[]>([])
const loading = ref(false)
const eventLog = ref<Array<{ timestamp: string; message: string }>>([])

// Current query state
const currentQuery = reactive({
  page: 1,
  rows: 20,
  sortField: '',
  sortOrder: 'asc' as 'asc' | 'desc',
  globalFilter: '',
  filters: {}
})

// Table configuration
const employeeColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, width: '20' },
  { key: 'name', label: 'Full Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'salary', label: 'Salary', sortable: true, align: 'right' },
  { key: 'hire_date', label: 'Hire Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

const employeeActions: Action[] = [
  {
    key: 'view',
    icon: Eye,
    variant: 'outline',
    size: 'sm',
    handler: (item: any) => {
      logEvent(`Viewed employee: ${item.name}`)
    }
  },
  {
    key: 'edit',
    icon: Edit,
    variant: 'outline',
    size: 'sm',
    handler: (item: any) => {
      logEvent(`Edited employee: ${item.name}`)
    }
  }
]

// Utility function to log events
const logEvent = (message: string) => {
  eventLog.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message
  })
  
  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20)
  }
}

// Generate sample employee data
const generateEmployees = (page: number, rows: number, sortField?: string, sortOrder?: string, filter?: string) => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Support']
  const positions = ['Manager', 'Senior', 'Junior', 'Lead', 'Director', 'Specialist', 'Coordinator', 'Analyst']
  const statuses = ['Active', 'Inactive', 'On Leave', 'Terminated']
  
  const allEmployees = []
  
  // Generate all employees first for sorting/filtering
  for (let i = 1; i <= originalTotalEmployees; i++) {
    const employee = {
      id: i,
      name: `Employee ${i.toString().padStart(4, '0')}`,
      email: `employee${i}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      salary: Math.floor(Math.random() * 100000) + 30000,
      hire_date: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }
    allEmployees.push(employee)
  }
  
  // Apply global filter
  let filteredEmployees = allEmployees
  if (filter) {
    const filterLower = filter.toLowerCase()
    filteredEmployees = allEmployees.filter(emp => 
      emp.name.toLowerCase().includes(filterLower) ||
      emp.email.toLowerCase().includes(filterLower) ||
      emp.department.toLowerCase().includes(filterLower) ||
      emp.position.toLowerCase().includes(filterLower) ||
      emp.status.toLowerCase().includes(filterLower)
    )
  }
  
  // Apply sorting
  if (sortField) {
    filteredEmployees.sort((a: any, b: any) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }
  
  // Calculate total after filtering (this is what the server would return)
  const filteredTotal = filteredEmployees.length
  
  // Apply pagination
  const start = (page - 1) * rows
  const end = start + rows
  
  return {
    data: filteredEmployees.slice(start, end),
    totalRecords: filteredTotal
  }
}

// Lazy loading event handler
const onLazyLoad = async (event: any) => {
  loading.value = true
  
  logEvent(`Lazy load: page ${event.page}, rows ${event.rows}, sort: ${event.sortField || 'none'} ${event.sortOrder || ''}, filter: "${event.globalFilter || ''}"`)
  
  // Update current query
  Object.assign(currentQuery, event)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  try {
    // Generate data based on lazy load parameters
    const result = generateEmployees(
      event.page,
      event.rows,
      event.sortField,
      event.sortOrder,
      event.globalFilter
    )
    
    employees.value = result.data
    
    // Only update totalEmployees if it actually changed (filtering scenario)
    if (totalEmployees.value !== result.totalRecords) {
      totalEmployees.value = result.totalRecords
    }
    
    logEvent(`Loaded ${employees.value.length} employees`)
  } catch (error) {
    logEvent(`Error loading data: ${error}`)
  } finally {
    loading.value = false
  }
}

// Event handlers
const onSearch = (query: string) => {
  logEvent(`Search: "${query}"`)
}

const onSort = (key: string, direction: 'asc' | 'desc') => {
  logEvent(`Sort: ${key} ${direction}`)
}

const onPageChange = (page: number) => {
  logEvent(`Page changed: ${page}`)
}

const onPageSizeChange = (size: number) => {
  logEvent(`Page size changed: ${size}`)
}
</script>
