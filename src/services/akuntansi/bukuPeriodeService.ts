import { apiService } from '@/lib/api'

export interface BukuPeriode {
  id: number
  tahun_periode: number
  bulan_awal_periode: number
  bulan_saldo_awal: number
  lama_periode_bulan: number
  is_aktif: boolean
  is_closed: boolean
  tanggal_tutup_buku: string | null
  bulan_akhir_periode: number
  tahun_akhir_periode: number
  keterangan: string | null
  created_at: string
  updated_at: string
}

export interface BukuPeriodePayload {
  tahun_periode: number
  bulan_awal_periode: number
  bulan_saldo_awal: number
  lama_periode_bulan: number
  is_aktif?: boolean
  keterangan?: string | null
}

export interface TutupBukuResult {
  message: string
  data: {
    periode_ditutup: BukuPeriode
    periode_baru: BukuPeriode | null
    ringkasan_salin: { jumlah_akun: number; jumlah_saldo: number } | null
  }
}

const BASE = '/akuntansi/buku-periode'

export const bukuPeriodeService = {
  async list(): Promise<BukuPeriode[]> {
    const response = await apiService.get<{ data: BukuPeriode[] }>(BASE)
    return response.data
  },

  async aktif(): Promise<BukuPeriode | null> {
    try {
      const response = await apiService.get<{ data: BukuPeriode }>(`${BASE}/aktif`)
      return response.data
    } catch {
      return null
    }
  },

  async create(payload: BukuPeriodePayload): Promise<BukuPeriode> {
    const response = await apiService.post<{ data: BukuPeriode }>(BASE, payload)
    return response.data
  },

  async update(id: number, payload: BukuPeriodePayload): Promise<BukuPeriode> {
    const response = await apiService.put<{ data: BukuPeriode }>(`${BASE}/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete(`${BASE}/${id}`)
  },

  async aktifkan(id: number): Promise<BukuPeriode> {
    const response = await apiService.post<{ data: BukuPeriode }>(`${BASE}/${id}/aktifkan`)
    return response.data
  },

  async tutupBuku(id: number, options?: { tanggal_tutup_buku?: string; buat_periode_berikutnya?: boolean }): Promise<TutupBukuResult> {
    return apiService.post(`${BASE}/${id}/tutup-buku`, options ?? {})
  }
}
