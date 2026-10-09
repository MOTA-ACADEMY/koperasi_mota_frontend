import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ToastAction {
  label: string
  onClick?: () => void
  dismissOnClick?: boolean
}

export interface ToastCancel {
  label?: string
  onClick?: () => void
}

export interface Toast {
  id: string
  type: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  description?: string
  duration?: number
  dismissible?: boolean
  action?: ToastAction
  cancel?: ToastCancel
  persistent?: boolean
  createdAt: Date
}

export interface ToastOptions {
  type?: Toast['type']
  description?: string
  duration?: number
  dismissible?: boolean
  action?: ToastAction
  cancel?: ToastCancel
  persistent?: boolean
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  const defaultDuration = 4000

  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  const addToast = (title: string, options: ToastOptions = {}): string => {
    const id = generateId()
    const toast: Toast = {
      id,
      type: options.type || 'default',
      title,
      description: options.description,
      duration: options.duration ?? defaultDuration,
      dismissible: options.dismissible ?? true,
      action: options.action,
      cancel: options.cancel,
      persistent: options.persistent || false,
      createdAt: new Date()
    }

    toasts.value.push(toast)

    // Auto-dismiss if not persistent
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  const updateToast = (id: string, updates: Partial<Toast>) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      Object.assign(toast, updates)
    }
  }

  // Helper methods for different toast types
  const toast = (title: string, options?: ToastOptions) => {
    return addToast(title, { ...options, type: 'default' })
  }

  const success = (title: string, options?: ToastOptions) => {
    return addToast(title, { ...options, type: 'success' })
  }

  const error = (title: string, options?: ToastOptions) => {
    return addToast(title, { ...options, type: 'error', duration: 6000 })
  }

  const warning = (title: string, options?: ToastOptions) => {
    return addToast(title, { ...options, type: 'warning' })
  }

  const info = (title: string, options?: ToastOptions) => {
    return addToast(title, { ...options, type: 'info' })
  }

  const loading = (title: string, options?: ToastOptions) => {
    return addToast(title, { 
      ...options, 
      type: 'loading', 
      persistent: true,
      dismissible: false 
    })
  }

  const promise = async <T>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    }
  ): Promise<T> => {
    const loadingId = loading(messages.loading || 'Loading...')

    try {
      const result = await promise
      removeToast(loadingId)
      
      const successMessage = typeof messages.success === 'function' 
        ? messages.success(result)
        : messages.success || 'Success!'
      
      success(successMessage)
      return result
    } catch (err) {
      removeToast(loadingId)
      
      const errorMessage = typeof messages.error === 'function'
        ? messages.error(err)
        : messages.error || 'Something went wrong!'
      
      error(errorMessage)
      throw err
    }
  }

  const dismiss = (id: string) => {
    removeToast(id)
  }

  // Computed properties
  const toastCount = computed(() => toasts.value.length)
  const hasToasts = computed(() => toasts.value.length > 0)

  return {
    // State
    toasts: computed(() => toasts.value),
    
    // Getters
    toastCount,
    hasToasts,
    
    // Actions
    addToast,
    removeToast,
    clearToasts,
    updateToast,
    
    // Helper methods
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss
  }
})
