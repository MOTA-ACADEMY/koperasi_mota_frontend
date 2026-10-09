import { apiService } from '@/lib/api'

export interface KoperasiProfil {
  id: number
  nama: string
  jenis_koperasi: string | null
  nomor_badan_hukum: string | null
  tanggal_badan_hukum: string | null
  nomor_induk_koperasi: string | null
  alamat: string | null
  desa_kelurahan: string | null
  kecamatan: string | null
  kabupaten_kota: string | null
  provinsi: string | null
  kode_pos: string | null
  telepon: string | null
  email: string | null
  is_aktif: boolean
}

export type KoperasiProfilPayload = Omit<KoperasiProfil, 'id' | 'is_aktif'>

export type KoperasiRole = 'admin' | 'staf'

export interface PenggunaKoperasi {
  id: number
  name: string
  email: string
  role: KoperasiRole
  is_aktif: boolean
  bergabung_at: string | null
}

export interface PenggunaPayload {
  email: string
  name?: string
  password?: string
  role: KoperasiRole
}

export const JENIS_KOPERASI = [
  { value: 'kdmp', label: 'Koperasi Desa/Kelurahan Merah Putih' },
  { value: 'ksp', label: 'Koperasi Simpan Pinjam' },
  { value: 'serba_usaha', label: 'Koperasi Serba Usaha' },
  { value: 'konsumen', label: 'Koperasi Konsumen' },
  { value: 'produsen', label: 'Koperasi Produsen' },
  { value: 'lainnya', label: 'Lainnya' }
]

export const koperasiService = {
  async profil(): Promise<KoperasiProfil> {
    const response = await apiService.get<{ data: KoperasiProfil }>('/koperasi/profil')
    return response.data
  },

  async updateProfil(payload: KoperasiProfilPayload): Promise<KoperasiProfil> {
    const response = await apiService.put<{ data: KoperasiProfil }>('/koperasi/profil', payload)
    return response.data
  },

  async listPengguna(): Promise<PenggunaKoperasi[]> {
    const response = await apiService.get<{ data: PenggunaKoperasi[] }>('/koperasi/users')
    return response.data
  },

  async tambahPengguna(payload: PenggunaPayload): Promise<PenggunaKoperasi> {
    const response = await apiService.post<{ data: PenggunaKoperasi }>('/koperasi/users', payload)
    return response.data
  },

  async ubahPengguna(id: number, payload: { role: KoperasiRole; is_aktif: boolean }): Promise<PenggunaKoperasi> {
    const response = await apiService.put<{ data: PenggunaKoperasi }>(`/koperasi/users/${id}`, payload)
    return response.data
  },

  async keluarkanPengguna(id: number): Promise<{ message: string }> {
    return apiService.delete(`/koperasi/users/${id}`)
  }
}
