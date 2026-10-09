import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  authService,
  type KoperasiRingkas,
  type LoginRequest,
  type LoginResponse,
  type MenuNode,
  type RegisterKoperasiRequest
} from '@/services/authService'
import { useNavigationStore } from './navigation'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<{
    id: number | null
    name: string
    email: string
    /** Nama role di koperasi yang sedang aktif (bisa lebih dari satu). */
    roles: string[]
    isAuthenticated: boolean
  }>({
    id: null,
    name: '',
    email: '',
    roles: [],
    isAuthenticated: false
  })

  /** Koperasi aktif; null = sudah login tapi belum memilih koperasi. */
  const koperasi = ref<KoperasiRingkas | null>(null)
  const koperasiList = ref<KoperasiRingkas[]>([])
  /** Kode menu yang boleh diakses di koperasi aktif (RBAC). */
  const akses = ref<string[]>([])
  /** Pohon menu yang boleh diakses — sumber sidebar. */
  const menu = ref<MenuNode[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const aksesPenuh = computed(() => !!koperasi.value?.akses_penuh)
  const roleLabel = computed(() => user.value.roles.join(', '))
  /** Boleh mengakses salah satu menu yang disebut (lihat kode di MenuCatalog backend). */
  const can = (...kodes: string[]) => aksesPenuh.value || kodes.some((kode) => akses.value.includes(kode))
  const needsKoperasi = computed(() => user.value.isAuthenticated && !koperasi.value)
  const fullUserInfo = computed(() => ({
    ...user.value,
    displayName: user.value.name || 'Guest User'
  }))

  function applySession(session: Pick<LoginResponse, 'user' | 'koperasi' | 'koperasi_list' | 'akses' | 'menu'>) {
    koperasi.value = session.koperasi
    koperasiList.value = session.koperasi_list ?? []
    akses.value = session.akses ?? []
    menu.value = session.menu ?? []
    user.value = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      roles: session.koperasi?.roles ?? [],
      isAuthenticated: true
    }
    useNavigationStore().setFromMenu(menu.value)
  }

  function resetState() {
    user.value = { id: null, name: '', email: '', roles: [], isAuthenticated: false }
    koperasi.value = null
    koperasiList.value = []
    akses.value = []
    menu.value = []
    error.value = null
    useNavigationStore().setFromMenu([])
  }

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      applySession(response)
      return response
    } catch (err: any) {
      error.value = err?.data?.errors?.email?.[0] || err?.message || 'Email atau password salah'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function registerKoperasi(payload: RegisterKoperasiRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.registerKoperasi(payload)
      applySession(response)
      return response
    } finally {
      loading.value = false
    }
  }

  async function pilihKoperasi(koperasiId: number) {
    loading.value = true
    try {
      const response = await authService.pilihKoperasi(koperasiId)
      applySession(response)
      return response
    } finally {
      loading.value = false
    }
  }

  /** Sinkronkan sesi dengan backend (mis. daftar koperasi berubah). */
  async function refreshSession() {
    const response = await authService.me()
    applySession(response)
    return response
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      resetState()
    }
  }

  /**
   * Restore session from localStorage on app boot (page reload keeps you logged in).
   */
  function hydrate() {
    if (!authService.isAuthenticated()) return

    const stored = authService.getCurrentUser()
    if (stored) {
      applySession({
        user: stored,
        koperasi: authService.getKoperasi(),
        koperasi_list: authService.getKoperasiList(),
        akses: authService.getAkses(),
        menu: authService.getMenu()
      })
    }
  }

  function updateProfile(profileData: { name: string; email: string }) {
    user.value.name = profileData.name
    user.value.email = profileData.email
  }

  /** Perbarui nama/data ringkas koperasi aktif setelah profil diubah. */
  function updateKoperasiAktif(data: Partial<KoperasiRingkas>) {
    if (!koperasi.value) return
    koperasi.value = { ...koperasi.value, ...data }
    koperasiList.value = koperasiList.value.map((k) => (k.id === koperasi.value!.id ? { ...k, ...data } : k))
    localStorage.setItem('koperasi', JSON.stringify(koperasi.value))
    localStorage.setItem('koperasi_list', JSON.stringify(koperasiList.value))
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    koperasi,
    koperasiList,
    akses,
    menu,
    loading,
    error,
    // Getters
    aksesPenuh,
    roleLabel,
    can,
    needsKoperasi,
    fullUserInfo,
    // Actions
    login,
    registerKoperasi,
    pilihKoperasi,
    refreshSession,
    logout,
    hydrate,
    updateProfile,
    updateKoperasiAktif,
    clearError
  }
})
