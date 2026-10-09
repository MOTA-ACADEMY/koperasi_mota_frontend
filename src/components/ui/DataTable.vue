<template>
  <div class="data-table-wrapper">
    <!-- Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div class="flex items-center space-x-2">
        <div class="relative w-full sm:w-64">
          <input
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="w-full h-10 px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            type="text"
          />
        </div>
        <Button
          v-if="searchQuery"
          variant="outline"
          size="sm"
          @click="clearSearch"
          class="h-10 flex-shrink-0"
        >
          <X class="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <!-- Items per page selector -->
      <div class="flex items-center space-x-2">
        <Label class="text-sm whitespace-nowrap">Show:</Label>
        <select
          v-model="itemsPerPage"
          @change="handlePageSizeChangeSelect"
          class="h-10 w-20 px-2 py-1 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option 
            v-for="size in props.pageSizes" 
            :key="size" 
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <Label class="text-sm whitespace-nowrap">entries</Label>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border overflow-hidden">
      <div class="overflow-x-auto">
        <Table class="min-w-full">
          <TableHeader>
            <TableRow>
            <TableHead
              v-for="column in columns"
              :key="column.key"
              :class="cn(
                column.sortable && 'cursor-pointer hover:bg-accent',
                column.width && `w-${column.width}`,
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUp 
                    :class="[
                      'h-3 w-3 transition-colors',
                      sortKey === column.key && sortDirection === 'asc' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    ]"
                  />
                  <ChevronDown 
                    :class="[
                      'h-3 w-3 -mt-1 transition-colors',
                      sortKey === column.key && sortDirection === 'desc' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    ]"
                  />
                </div>
              </div>
            </TableHead>
            <TableHead v-if="actions.length > 0" class="text-center w-24">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading indicator for lazy loading -->
          <TableRow v-if="props.lazy && props.lazyLoading">
            <TableCell :colspan="columns.length + (actions.length > 0 ? 1 : 0)" class="text-center py-8">
              <div class="flex flex-col items-center space-y-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p class="text-muted-foreground">Loading...</p>
              </div>
            </TableCell>
          </TableRow>
          <!-- Empty state -->
          <TableRow v-else-if="paginatedData.length === 0">
            <TableCell :colspan="columns.length + (actions.length > 0 ? 1 : 0)" class="text-center py-8">
              <div class="flex flex-col items-center space-y-2">
                <FileX class="h-8 w-8 text-muted-foreground" />
                <p class="text-muted-foreground">{{ emptyMessage }}</p>
              </div>
            </TableCell>
          </TableRow>
          <TableRow
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            :class="cn(
              'hover:bg-accent/50 transition-colors',
              rowClass && rowClass(item, index)
            )"
          >
            <TableCell
              v-for="column in columns"
              :key="column.key"
              :class="cn(
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.cellClass && column.cellClass(item[column.key], item, index)
              )"
            >
              <slot
                :name="`cell-${column.key}`"
                :value="item[column.key]"
                :item="item"
                :index="index"
              >
                <span v-if="column.render">
                  <component
                    :is="column.render"
                    :value="item[column.key]"
                    :item="item"
                    :index="index"
                  />
                </span>
                <span v-else>
                  {{ formatCellValue(item[column.key], column) }}
                </span>
              </slot>
            </TableCell>
            <TableCell v-if="actions.length > 0" class="text-center">
              <div class="flex items-center justify-center space-x-1">
                <Button
                  v-for="action in actions"
                  :key="action.key"
                  :variant="action.variant || 'ghost'"
                  :size="action.size || 'sm'"
                  :disabled="action.disabled && action.disabled(item)"
                  @click="action.handler(item, index)"
                  class="h-8 w-8 p-0"
                >
                  <component :is="action.icon" class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      </div>
    </div>

    <!-- Footer with pagination and info -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
      <!-- Data count info -->
      <div class="text-sm text-muted-foreground order-2 sm:order-1">
        <span v-if="props.lazy ? totalItems > 0 : filteredData.length > 0">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ props.lazy ? totalItems : filteredData.length }} 
          {{ (props.lazy ? totalItems : filteredData.length) === 1 ? 'entry' : 'entries' }}
          <span v-if="!props.lazy && (searchQuery || filteredData.length !== totalItems)">
            (filtered from {{ totalItems }} total {{ totalItems === 1 ? 'entry' : 'entries' }})
          </span>
        </span>
        <span v-else>
          No entries found
        </span>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        
        <!-- Page numbers -->
        <div class="flex items-center space-x-1">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            class="w-8 h-8 p-0"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { 
  X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, FileX 
} from 'lucide-vue-next'
import { 
  Button, Label, Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell
} from '@/components/ui'
import { cn } from '@/lib/utils'

// Types
export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: any
  cellClass?: (value: any, item: any, index: number) => string
  format?: 'currency' | 'date' | 'datetime' | 'number' | 'percentage'
}

export interface Action {
  key: string
  icon: any
  handler: (item: any, index: number) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: (item: any) => boolean
}

interface Props {
  data: any[]
  columns: Column[]
  actions?: Action[]
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: string[]
  pageSize?: number
  pageSizes?: number[]
  emptyMessage?: string
  rowKey?: string | ((item: any, index: number) => string | number)
  rowClass?: (item: any, index: number) => string
  loading?: boolean
  // Lazy loading props
  lazy?: boolean
  totalRecords?: number
  lazyLoading?: boolean
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  searchable: true,
  searchPlaceholder: 'Search...',
  searchFields: () => [],
  pageSize: 5,
  pageSizes: () => [5, 10, 20, 50, 100],
  emptyMessage: 'No data available',
  loading: false,
  lazy: false,
  totalRecords: 0,
  lazyLoading: false
})

// Emits
const emit = defineEmits<{
  'search': [query: string]
  'sort': [key: string, direction: 'asc' | 'desc']
  'page-change': [page: number]
  'page-size-change': [size: number]
  'lazy-load': [event: LazyLoadEvent]
}>()

interface LazyLoadEvent {
  first: number
  rows: number
  page: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  globalFilter?: string
}

// Reactive state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(props.pageSize)
const sortKey = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Lazy loading helper
const emitLazyLoad = () => {
  if (props.lazy) {
    const lazyEvent: LazyLoadEvent = {
      first: (currentPage.value - 1) * itemsPerPage.value,
      rows: itemsPerPage.value,
      page: currentPage.value,
      sortField: sortKey.value || undefined,
      sortOrder: sortDirection.value,
      globalFilter: searchQuery.value,
      filters: {}
    }
    emit('lazy-load', lazyEvent)
  }
}

// Computed properties
const totalItems = computed(() => {
  return props.lazy ? props.totalRecords : props.data.length
})

const searchFields = computed(() => {
  if (props.searchFields.length > 0) {
    return props.searchFields
  }
  return props.columns.map(col => col.key)
})

const filteredData = computed(() => {
  if (props.lazy) {
    // For lazy loading, return data as-is since filtering is done server-side
    return props.data
  }

  let filtered = [...props.data]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(item => {
      return searchFields.value.some(field => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(query)
      })
    })
  }

  // Apply sorting
  if (sortKey.value) {
    filtered.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      
      let comparison = 0
      if (aVal < bVal) comparison = -1
      else if (aVal > bVal) comparison = 1
      
      return sortDirection.value === 'desc' ? -comparison : comparison
    })
  }

  return filtered
})

const totalPages = computed(() => {
  if (props.lazy) {
    return Math.ceil(props.totalRecords / itemsPerPage.value)
  }
  return Math.ceil(filteredData.value.length / itemsPerPage.value)
})

const startIndex = computed(() => 
  (currentPage.value - 1) * itemsPerPage.value
)

const endIndex = computed(() => {
  if (props.lazy) {
    return Math.min(startIndex.value + itemsPerPage.value, props.totalRecords)
  }
  return Math.min(startIndex.value + itemsPerPage.value, filteredData.value.length)
})

const paginatedData = computed(() => {
  if (props.lazy) {
    // For lazy loading, return data as-is since pagination is handled server-side
    return props.data
  }
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Watch for changes that trigger lazy loading
watch(searchQuery, (newValue) => {
  currentPage.value = 1 // Reset to first page when searching
  emit('search', newValue)
  if (props.lazy) {
    emitLazyLoad()
  }
})

watch(currentPage, (newPage, oldPage) => {
  if (props.lazy && newPage !== oldPage) {
    emitLazyLoad()
  }
})

watch(itemsPerPage, () => {
  currentPage.value = 1
  if (props.lazy) {
    emitLazyLoad()
  }
})

watch(() => [sortKey.value, sortDirection.value], () => {
  if (props.lazy) {
    emitLazyLoad()
  }
})

// Watch for totalRecords changes and adjust current page if needed
watch(() => props.totalRecords, (newTotal) => {
  if (props.lazy && newTotal > 0) {
    const maxPage = Math.ceil(newTotal / itemsPerPage.value)
    if (currentPage.value > maxPage) {
      currentPage.value = Math.max(1, maxPage)
    }
  }
})

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  emit('search', '')
  if (props.lazy) {
    emitLazyLoad()
  }
}

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('sort', sortKey.value, sortDirection.value)
  
  if (props.lazy) {
    emitLazyLoad()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
    
    if (props.lazy) {
      emitLazyLoad()
    }
  }
}

const handlePageSizeChangeSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newSize = parseInt(target.value)
  itemsPerPage.value = newSize
  currentPage.value = 1
  emit('page-size-change', newSize)
  
  if (props.lazy) {
    emitLazyLoad()
  }
}

const getRowKey = (item: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return props.rowKey ? item[props.rowKey] : index
}

// Initialize lazy loading on mount
onMounted(() => {
  if (props.lazy) {
    emitLazyLoad()
  }
})

const formatCellValue = (value: any, column: Column) => {
  if (value == null) return '-'
  
  switch (column.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(value))
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'datetime':
      return new Date(value).toLocaleString()
    case 'number':
      return new Intl.NumberFormat().format(Number(value))
    case 'percentage':
      return `${Number(value)}%`
    default:
      return value
  }
}

// Watch for data changes and reset pagination (only for non-lazy mode)
watch(() => props.data, () => {
  if (!props.lazy) {
    currentPage.value = 1
  }
})
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

/* Ensure table doesn't get too narrow on mobile */
.data-table-wrapper table {
  min-width: 600px;
}

/* Smooth scrolling for horizontal scroll */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>
