import { useToastStore, type ToastOptions } from '@/stores/toast'

export function useToast() {
  const toastStore = useToastStore()

  const toast = (title: string, options?: ToastOptions) => {
    return toastStore.toast(title, options)
  }

  const success = (title: string, options?: ToastOptions) => {
    return toastStore.success(title, options)
  }

  const error = (title: string, options?: ToastOptions) => {
    return toastStore.error(title, options)
  }

  const warning = (title: string, options?: ToastOptions) => {
    return toastStore.warning(title, options)
  }

  const info = (title: string, options?: ToastOptions) => {
    return toastStore.info(title, options)
  }

  const loading = (title: string, options?: ToastOptions) => {
    return toastStore.loading(title, options)
  }

  const promise = async <T>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    }
  ): Promise<T> => {
    return toastStore.promise(promise, messages)
  }

  const dismiss = (id: string) => {
    return toastStore.dismiss(id)
  }

  const clearAll = () => {
    return toastStore.clearToasts()
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    clearAll
  }
}

// Export individual functions for convenience
export const { 
  toast: showToast, 
  success: showSuccess, 
  error: showError, 
  warning: showWarning, 
  info: showInfo, 
  loading: showLoading,
  dismiss: dismissToast
} = useToast()
