import { apiService } from '@/lib/api'

// Auth interfaces
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

/** Koperasi tempat user terafiliasi, beserta role user di koperasi tersebut. */
export interface KoperasiRingkas {
  id: number
  nama: string
  jenis_koperasi: string | null
  desa_kelurahan: string | null
  kabupaten_kota: string | null
  role: 'admin' | 'staf'
}

export interface SessionUser {
  id: number
  name: string
  email: string
}

/**
 * Payload sesi dari backend. `koperasi` null berarti user terafiliasi ke lebih dari
 * satu koperasi dan harus memilih dulu (POST /auth/pilih-koperasi).
 */
export interface LoginResponse {
  user: SessionUser
  koperasi: KoperasiRingkas | null
  koperasi_list: KoperasiRingkas[]
  token?: string
  expires_in?: number | null
}

export interface RegisterKoperasiRequest {
  koperasi: {
    nama: string
    jenis_koperasi?: string | null
    alamat?: string | null
    desa_kelurahan?: string | null
    kecamatan?: string | null
    kabupaten_kota?: string | null
    provinsi?: string | null
    telepon?: string | null
    email?: string | null
  }
  admin: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }
  gunakan_coa_standar?: boolean
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

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function saveSession(session: LoginResponse) {
  if (session.token) localStorage.setItem('auth_token', session.token)
  localStorage.setItem('user', JSON.stringify(session.user))
  localStorage.setItem('koperasi_list', JSON.stringify(session.koperasi_list ?? []))
  if (session.koperasi) {
    localStorage.setItem('koperasi', JSON.stringify(session.koperasi))
  } else {
    localStorage.removeItem('koperasi')
  }
}

export function clearSession() {
  ;['auth_token', 'user', 'koperasi', 'koperasi_list'].forEach((key) => localStorage.removeItem(key))
}

// Auth API service
export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials)
    saveSession(response)
    return response
  },

  // Daftarkan koperasi baru beserta admin pertamanya
  async registerKoperasi(payload: RegisterKoperasiRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/register-koperasi', payload)
    saveSession(response)
    return response
  },

  // Pilih / pindah koperasi aktif — backend menerbitkan token baru yang terikat ke koperasi itu
  async pilihKoperasi(koperasiId: number): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/pilih-koperasi', { koperasi_id: koperasiId })
    saveSession(response)
    return response
  },

  // Ambil ulang sesi (user, koperasi aktif, daftar koperasi) dari backend
  async me(): Promise<LoginResponse> {
    const response = await apiService.get<LoginResponse>('/auth/me')
    saveSession(response)
    return response
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiService.post('/auth/logout')
      return response
    } finally {
      // Clear local storage regardless of API response
      clearSession()
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
  getCurrentUser(): SessionUser | null {
    return readJson<SessionUser>('user')
  },

  // Koperasi aktif (null = belum memilih)
  getKoperasi(): KoperasiRingkas | null {
    return readJson<KoperasiRingkas>('koperasi')
  },

  getKoperasiList(): KoperasiRingkas[] {
    return readJson<KoperasiRingkas[]>('koperasi_list') ?? []
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },
}
