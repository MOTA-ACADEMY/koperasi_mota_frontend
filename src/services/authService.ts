import { apiService } from '@/lib/api'

// Auth interfaces
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  token: string
  expires_in: number
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  password: string
  password_confirmation: string
}

// Auth API service
export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post('/auth/login', credentials)
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiService.post('/auth/register', userData)
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiService.post('/auth/logout')
      return response
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string; expires_in: number }> {
    const response = await apiService.post('/auth/refresh')
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiService.post('/auth/forgot-password', data)
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post('/auth/reset-password', data)
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiService.post('/auth/verify-email', { token })
  },

  // Resend verification email
  async resendVerification(): Promise<{ message: string }> {
    return apiService.post('/auth/resend-verification')
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  // Get current user from localStorage
  getCurrentUser(): any {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },
}
