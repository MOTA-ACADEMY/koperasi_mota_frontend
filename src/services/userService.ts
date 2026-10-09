import { apiService } from '@/lib/api'

// User data interfaces
export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
}

// User API service
export const userService = {
  // Get all users
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<{
    data: User[]
    total: number
    page: number
    limit: number
  }> {
    return apiService.get('/users', params)
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    return apiService.get(`/users/${id}`)
  },

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiService.post('/users', userData)
  },

  // Update user
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    return apiService.put(`/users/${id}`, userData)
  },

  // Delete user
  async deleteUser(id: number): Promise<{ message: string }> {
    return apiService.delete(`/users/${id}`)
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return apiService.get('/profile')
  },

  // Update current user profile
  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    return apiService.put('/profile', userData)
  },

  // Change password
  async changePassword(data: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<{ message: string }> {
    return apiService.post('/profile/change-password', data)
  },
}
