import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden')
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// API helper functions
export const apiService = {
  // GET request
  async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await api.get(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // POST request
  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.post(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PUT request
  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.put(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // PATCH request
  async patch<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.patch(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // DELETE request
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await api.delete(url)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // File upload
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Error handler
  handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      }
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
        data: null,
      }
    }
  },
}

// Export the configured axios instance for direct use if needed
export default api
