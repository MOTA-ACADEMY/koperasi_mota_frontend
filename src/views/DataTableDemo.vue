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
          DataTable Demo
        </h1>
        <p :class="[
          'text-lg mt-1 transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          Advanced data table with search, sorting, and pagination
        </p>
      </div>

      <!-- Sample Data Table -->
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users with search, sorting, and pagination functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            :data="users"
            :columns="userColumns"
            :actions="userActions"
            search-placeholder="Search users..."
            :search-fields="['name', 'email', 'department']"
            :page-sizes="[5, 10, 20, 50]"
            row-key="id"
            empty-message="No users found"
            @search="handleSearch"
            @sort="handleSort"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          >
            <!-- Custom status cell -->
            <template #cell-status="{ value }">
              <Badge :variant="getStatusVariant(value)">
                {{ value }}
              </Badge>
            </template>

            <!-- Custom avatar cell -->
            <template #cell-avatar="{ item }">
              <Avatar class="h-8 w-8">
                <AvatarFallback>
                  {{ getInitials(item.name) }}
                </AvatarFallback>
              </Avatar>
            </template>
          </DataTable>
        </CardContent>
      </Card>

      <!-- Products Data Table -->
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Product management with different data types and formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            :data="products"
            :columns="productColumns"
            :actions="productActions"
            search-placeholder="Search products..."
            :search-fields="['name', 'category', 'sku']"
            :page-sizes="[5, 10, 15, 25]"
            :page-size="5"
            row-key="id"
            empty-message="No products available"
          >
            <!-- Custom stock status -->
            <template #cell-stock="{ value }">
              <div class="flex items-center space-x-2">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full',
                    value > 20 ? 'bg-green-500' : value > 5 ? 'bg-yellow-500' : 'bg-red-500'
                  ]"
                ></div>
                <span>{{ value }} units</span>
              </div>
            </template>
          </DataTable>
        </CardContent>
      </Card>

      <!-- Event Log -->
      <div class="mt-8 p-4 bg-muted rounded-lg">
        <h3 class="font-semibold mb-2">Event Log:</h3>
        <div class="space-y-1 max-h-40 overflow-y-auto">
          <p
            v-for="(event, index) in eventLog"
            :key="index"
            class="text-sm text-muted-foreground"
          >
            <span class="font-mono">{{ event.time }}</span> - {{ event.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit, Trash2, Eye, Package, ShoppingCart } from 'lucide-vue-next'
import { useDarkModeStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  DataTable, Badge, Avatar, AvatarFallback
} from '@/components/ui'

const darkModeStore = useDarkModeStore()
const { success, error, warning } = useToast()

// Event log for demo purposes
const eventLog = ref<Array<{ time: string; message: string }>>([])

const addEvent = (message: string) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    message
  })
  if (eventLog.value.length > 10) {
    eventLog.value.pop()
  }
}

// Sample user data
const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    role: 'Senior Developer',
    status: 'Active',
    joinDate: '2023-01-15',
    salary: 75000
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Design',
    role: 'UI/UX Designer',
    status: 'Active',
    joinDate: '2023-03-22',
    salary: 65000
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    department: 'Marketing',
    role: 'Marketing Manager',
    status: 'Inactive',
    joinDate: '2022-11-08',
    salary: 70000
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    department: 'Engineering',
    role: 'DevOps Engineer',
    status: 'Active',
    joinDate: '2023-05-10',
    salary: 80000
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    department: 'Sales',
    role: 'Sales Representative',
    status: 'Pending',
    joinDate: '2023-07-01',
    salary: 55000
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    department: 'HR',
    role: 'HR Specialist',
    status: 'Active',
    joinDate: '2023-02-14',
    salary: 60000
  },
  {
    id: 7,
    name: 'Robert Miller',
    email: 'robert.miller@example.com',
    department: 'Engineering',
    role: 'Frontend Developer',
    status: 'Active',
    joinDate: '2023-04-18',
    salary: 72000
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    department: 'Finance',
    role: 'Financial Analyst',
    status: 'Active',
    joinDate: '2023-06-05',
    salary: 68000
  }
])

// Sample product data
const products = ref([
  {
    id: 101,
    name: 'Wireless Headphones',
    sku: 'WH-001',
    category: 'Electronics',
    price: 199.99,
    stock: 45,
    createdAt: '2023-08-01'
  },
  {
    id: 102,
    name: 'Gaming Mouse',
    sku: 'GM-002',
    category: 'Electronics',
    price: 79.99,
    stock: 23,
    createdAt: '2023-08-02'
  },
  {
    id: 103,
    name: 'Mechanical Keyboard',
    sku: 'MK-003',
    category: 'Electronics',
    price: 149.99,
    stock: 12,
    createdAt: '2023-08-03'
  },
  {
    id: 104,
    name: 'USB-C Cable',
    sku: 'UC-004',
    category: 'Accessories',
    price: 24.99,
    stock: 150,
    createdAt: '2023-08-04'
  },
  {
    id: 105,
    name: 'Laptop Stand',
    sku: 'LS-005',
    category: 'Accessories',
    price: 89.99,
    stock: 8,
    createdAt: '2023-08-05'
  },
  {
    id: 106,
    name: 'Wireless Charger',
    sku: 'WC-006',
    category: 'Electronics',
    price: 39.99,
    stock: 67,
    createdAt: '2023-08-06'
  },
  {
    id: 107,
    name: 'Phone Case',
    sku: 'PC-007',
    category: 'Accessories',
    price: 19.99,
    stock: 3,
    createdAt: '2023-08-07'
  }
])

// User table columns
const userColumns = [
  {
    key: 'avatar',
    label: '',
    width: '16',
    align: 'center' as const
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true
  },
  {
    key: 'role',
    label: 'Role'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    align: 'center' as const
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    sortable: true,
    format: 'date' as const
  },
  {
    key: 'salary',
    label: 'Salary',
    sortable: true,
    align: 'right' as const,
    format: 'currency' as const
  }
]

// Product table columns
const productColumns = [
  {
    key: 'name',
    label: 'Product Name',
    sortable: true
  },
  {
    key: 'sku',
    label: 'SKU',
    sortable: true
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    align: 'right' as const,
    format: 'currency' as const
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    align: 'center' as const
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    format: 'date' as const
  }
]

// User actions
const userActions = [
  {
    key: 'view',
    icon: Eye,
    handler: (user: any) => {
      success(`Viewing ${user.name}`)
      addEvent(`Viewed user: ${user.name}`)
    }
  },
  {
    key: 'edit',
    icon: Edit,
    handler: (user: any) => {
      warning(`Editing ${user.name}`)
      addEvent(`Edited user: ${user.name}`)
    }
  },
  {
    key: 'delete',
    icon: Trash2,
    variant: 'destructive' as const,
    handler: (user: any) => {
      error(`Deleting ${user.name}`)
      addEvent(`Deleted user: ${user.name}`)
    },
    disabled: (user: any) => user.status === 'Active'
  }
]

// Product actions
const productActions = [
  {
    key: 'view',
    icon: Package,
    handler: (product: any) => {
      success(`Viewing ${product.name}`)
      addEvent(`Viewed product: ${product.name}`)
    }
  },
  {
    key: 'order',
    icon: ShoppingCart,
    handler: (product: any) => {
      warning(`Ordering ${product.name}`)
      addEvent(`Ordered product: ${product.name}`)
    },
    disabled: (product: any) => product.stock < 5
  }
]

// Helper functions
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'pending':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Event handlers
const handleSearch = (query: string) => {
  addEvent(`Search performed: "${query}"`)
}

const handleSort = (key: string, direction: 'asc' | 'desc') => {
  addEvent(`Sorted by ${key} (${direction})`)
}

const handlePageChange = (page: number) => {
  addEvent(`Changed to page ${page}`)
}

const handlePageSizeChange = (size: number) => {
  addEvent(`Changed page size to ${size}`)
}
</script>
