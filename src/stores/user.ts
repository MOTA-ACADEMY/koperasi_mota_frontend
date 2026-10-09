import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginRequest } from '@/services/authService'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<{
    id: number | null
    name: string
    email: string
    role: 'admin' | 'staff' | 'member' | 'guest'
    isAuthenticated: boolean
  }>({
    id: null,
    name: '',
    email: '',
    role: 'guest',
    isAuthenticated: false
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAdmin = computed(() => user.value.role === 'admin')
  const isMember = computed(() => user.value.role === 'member')
  const fullUserInfo = computed(() => ({
    ...user.value,
    displayName: user.value.name || 'Guest User'
  }))

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      user.value = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: (response.user.role as typeof user.value.role) || 'staff',
        isAuthenticated: true
      }
      return user.value
    } catch (err: any) {
      error.value = err?.message || 'Email atau password salah'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      user.value = {
        id: null,
        name: '',
        email: '',
        role: 'guest',
        isAuthenticated: false
      }
      error.value = null
    }
  }

  /**
   * Restore session from localStorage on app boot (page reload keeps you logged in).
   */
  function hydrate() {
    if (!authService.isAuthenticated()) return

    const stored = authService.getCurrentUser()
    if (stored) {
      user.value = {
        id: stored.id,
        name: stored.name,
        email: stored.email,
        role: stored.role || 'staff',
        isAuthenticated: true
      }
    }
  }

  function updateProfile(profileData: { name: string; email: string }) {
    user.value.name = profileData.name
    user.value.email = profileData.email
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    // Getters
    isAdmin,
    isMember,
    fullUserInfo,
    // Actions
    login,
    logout,
    hydrate,
    updateProfile,
    clearError
  }
})
