<template>
  <div class="p-6 space-y-6">
    <!-- Header with refresh button -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">API Examples</h1>
      <Button @click="refreshAllData" :disabled="loading">
        <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': loading }]" />
        {{ loading ? 'Loading...' : 'Refresh Data' }}
      </Button>
    </div>

    <!-- Error Display -->
    <Alert v-if="error" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Dashboard Stats Card -->
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Statistics</CardTitle>
        <CardDescription>Real-time cooperative statistics</CardDescription>
      </CardHeader>
      <CardContent class="p-4">
        <div v-if="dashboardStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ dashboardStats.total_members }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${{ dashboardStats.total_deposits }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Deposits</div>
          </div>
          <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ dashboardStats.active_loans }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Active Loans</div>
          </div>
          <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">${{ dashboardStats.monthly_revenue }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <Skeleton class="h-20 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>

    <!-- User Management Example -->
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Create and manage users</CardDescription>
      </CardHeader>
      <CardContent class="p-4">
        <div class="space-y-4">
          <!-- User Form -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input v-model="newUser.name" placeholder="Enter name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input v-model="newUser.email" type="email" placeholder="Enter email" />
            </div>
            <div>
              <Label>Password</Label>
              <Input v-model="newUser.password" type="password" placeholder="Enter password" />
            </div>
            <div>
              <Label>Role</Label>
              <Select v-model="newUser.role">
                <option value="member">Member</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
          </div>
          <Button @click="createUser" :disabled="userLoading">
            <UserPlus class="h-4 w-4 mr-2" />
            {{ userLoading ? 'Creating...' : 'Create User' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- API Response Display -->
    <Card>
      <CardHeader>
        <CardTitle>API Response</CardTitle>
        <CardDescription>Last API response data</CardDescription>
      </CardHeader>
      <CardContent class="p-4">
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
          <pre class="text-sm">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
        </div>
      </CardContent>
    </Card>

    <!-- File Upload Example -->
    <Card>
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
        <CardDescription>Upload files using Axios</CardDescription>
      </CardHeader>
      <CardContent class="p-4">
        <div class="space-y-4">
          <Input 
            type="file" 
            @change="handleFileSelect"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          />
          <div v-if="uploadProgress > 0" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <Progress :value="uploadProgress" />
          </div>
          <Button 
            @click="uploadFile" 
            :disabled="!selectedFile || uploadLoading"
            v-if="selectedFile"
          >
            <Upload class="h-4 w-4 mr-2" />
            {{ uploadLoading ? 'Uploading...' : 'Upload File' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw, AlertTriangle, UserPlus, Upload } from 'lucide-vue-next'
import { 
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Select, Alert, AlertTitle, AlertDescription,
  Skeleton, Progress
} from '@/components/ui'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
import { userService, type CreateUserRequest } from '@/services/userService'
import { apiService } from '@/lib/api'

// State
const loading = ref(false)
const error = ref<string | null>(null)
const dashboardStats = ref<DashboardStats | null>(null)
const apiResponse = ref<any>(null)

// User management state
const userLoading = ref(false)
const newUser = ref<CreateUserRequest>({
  name: '',
  email: '',
  password: '',
  role: 'member'
})

// File upload state
const selectedFile = ref<File | null>(null)
const uploadLoading = ref(false)
const uploadProgress = ref(0)

// Load dashboard data
const loadDashboardStats = async () => {
  try {
    loading.value = true
    error.value = null
    dashboardStats.value = await dashboardService.getStats()
    apiResponse.value = dashboardStats.value
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard data'
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
}

// Create new user
const createUser = async () => {
  try {
    userLoading.value = true
    error.value = null
    
    const user = await userService.createUser(newUser.value)
    apiResponse.value = { message: 'User created successfully', user }
    
    // Reset form
    newUser.value = {
      name: '',
      email: '',
      password: '',
      role: 'member'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create user'
    console.error('User creation error:', err)
  } finally {
    userLoading.value = false
  }
}

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
  uploadProgress.value = 0
}

// Upload file
const uploadFile = async () => {
  if (!selectedFile.value) return
  
  try {
    uploadLoading.value = true
    error.value = null
    
    const response = await apiService.upload(
      '/upload',
      selectedFile.value,
      (progress) => {
        uploadProgress.value = progress
      }
    )
    
    apiResponse.value = { message: 'File uploaded successfully', response }
    selectedFile.value = null
    uploadProgress.value = 0
  } catch (err: any) {
    error.value = err.message || 'Failed to upload file'
    console.error('Upload error:', err)
  } finally {
    uploadLoading.value = false
  }
}

// Refresh all data
const refreshAllData = async () => {
  await loadDashboardStats()
}

// Initialize data on mount
onMounted(() => {
  loadDashboardStats()
})
</script>
