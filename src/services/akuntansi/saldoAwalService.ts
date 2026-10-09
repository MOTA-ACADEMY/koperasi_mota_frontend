import { apiService } from '@/lib/api'

export interface SaldoAwalNode {
  id: number
  kode_akun: string
  full_kode: string
  nama_akun: string
  karakter_akun: 'D' | 'K'
  is_final: boolean
  nominal: number
  saldo_awal_id: number | null
  children: SaldoAwalNode[]
}

export interface SaldoAwalIndexResponse {
  buku_periode_id: number
  bulan_periode: number
  tahun_periode: number
  is_verified: boolean
  verified_at: string | null
  tree: SaldoAwalNode[]
}

export interface MatrixMonth {
  bulan: number
  tahun: number
  label: string
  key: string
}

export interface MatrixNode {
  id: number
  kode_akun: string
  full_kode: string
  nama_akun: string
  karakter_akun: 'D' | 'K'
  is_final: boolean
  nominals: Record<string, number | null>
  children: MatrixNode[]
}

export interface SaldoAwalMatrixResponse {
  buku_periode_id: number
  months: MatrixMonth[]
  tree: MatrixNode[]
}

const BASE = '/akuntansi/saldo-awal'

export const saldoAwalService = {
  async index(): Promise<SaldoAwalIndexResponse> {
    return apiService.get(BASE)
  },

  async simpan(saldos: { master_akun_id: number; nominal: number }[]): Promise<{ message: string }> {
    return apiService.post(BASE, { saldos })
  },

  async verifikasi(): Promise<{ message: string }> {
    return apiService.post(`${BASE}/verifikasi`)
  },

  async bukaVerifikasi(): Promise<{ message: string }> {
    return apiService.post(`${BASE}/buka-verifikasi`)
  },

  async matrix(): Promise<SaldoAwalMatrixResponse> {
    return apiService.get(`${BASE}/matrix`)
  },

  async generate(bulan: number, tahun: number): Promise<{ message: string; total_akun: number }> {
    return apiService.post(`${BASE}/generate`, { bulan, tahun })
  }
}
