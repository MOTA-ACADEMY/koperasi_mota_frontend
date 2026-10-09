# API Integration with Axios

This project uses Axios for making HTTP requests to backend APIs. The setup includes proper error handling, authentication, and TypeScript support.

## Configuration

### Environment Variables

Configure your API base URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Koperasi MOTA
VITE_APP_ENV=development
```

### API Configuration

The main API configuration is in `src/lib/api.ts`:

- Base URL configuration
- Request/response interceptors
- Authentication token handling
- Error handling

## Usage Examples

### 1. Basic API Service

```typescript
import { apiService } from '@/lib/api'

// GET request
const users = await apiService.get('/users')

// POST request
const newUser = await apiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request
const updatedUser = await apiService.put('/users/1', {
  name: 'John Smith'
})

// DELETE request
await apiService.delete('/users/1')
```

### 2. Service Layer

Create service files for different API endpoints:

```typescript
// src/services/userService.ts
import { apiService } from '@/lib/api'

export const userService = {
  async getUsers() {
    return apiService.get('/users')
  },
  
  async createUser(userData) {
    return apiService.post('/users', userData)
  }
}
```

### 3. Vue Composables

Use composables for reactive API integration:

```typescript
// src/composables/useUsers.ts
import { ref } from 'vue'
import { userService } from '@/services/userService'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadUsers = async () => {
    try {
      loading.value = true
      users.value = await userService.getUsers()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { users, loading, error, loadUsers }
}
```

### 4. Component Usage

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

const { users, loading, error, loadUsers } = useUsers()

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="user in users" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

## Authentication

### Login

```typescript
import { authService } from '@/services/authService'

const login = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password })
    // Token is automatically stored in localStorage
    console.log('Logged in:', response.user)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### Logout

```typescript
const logout = async () => {
  try {
    await authService.logout()
    // Token is automatically removed from localStorage
    // Redirect to login page
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

## File Upload

```typescript
import { apiService } from '@/lib/api'

const uploadFile = async (file: File) => {
  try {
    const response = await apiService.upload('/upload', file, (progress) => {
      console.log('Upload progress:', progress + '%')
    })
    console.log('Upload successful:', response)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## Error Handling

The API service includes automatic error handling:

- **401 Unauthorized**: Automatically redirects to login
- **403 Forbidden**: Logs access denied message
- **500+ Server Errors**: Logs server error details
- **Network Errors**: Handles connection issues

### Custom Error Handling

```typescript
try {
  const data = await apiService.get('/users')
} catch (error) {
  if (error.status === 404) {
    console.log('Users not found')
  } else if (error.status === 0) {
    console.log('Network error')
  } else {
    console.log('Server error:', error.message)
  }
}
```

## Available Services

1. **authService** - Authentication (login, register, logout)
2. **userService** - User management (CRUD operations)
3. **dashboardService** - Dashboard data and statistics

## Demo Page

Visit `/dashboard/api-examples` to see live examples of:
- Dashboard statistics loading
- User creation
- File upload with progress
- Error handling
- API response display

## TypeScript Support

All services include TypeScript interfaces for:
- Request/response types
- Error handling
- Auto-completion and type safety

## Best Practices

1. **Always handle errors** in your components
2. **Use loading states** for better UX
3. **Implement composables** for reusable API logic
4. **Type your API responses** with TypeScript interfaces
5. **Use environment variables** for configuration
6. **Handle authentication** with interceptors
7. **Show progress** for file uploads
