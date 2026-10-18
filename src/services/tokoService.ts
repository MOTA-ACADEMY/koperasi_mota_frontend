import { apiService } from '@/lib/api'

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface Satuan {
  id: number
  nama: string
  singkatan: string | null
  is_aktif: boolean
}

export interface Merk {
  id: number
  nama: string
  keterangan: string | null
  is_aktif: boolean
}

export interface Distributor {
  id: number
  nama: string
  kontak_person: string | null
  telepon: string | null
  alamat: string | null
  keterangan: string | null
  is_aktif: boolean
}

export interface KelompokBarang {
  id: number
  nama: string
  keterangan: string | null
  is_aktif: boolean
  barang_count?: number
}

/** Satu satuan jual/beli sebuah barang (stok dipegang per satuan). */
export interface BarangSatuan {
  id: number
  barang_id: number
  satuan_id: number
  satuan: string | null
  barcode: string | null
  /** Isi dalam satuan terkecil, mis. 1 dus = 24. */
  isi: number
  harga_beli: number
  margin_persen: number
  harga_jual: number
  stok: number
  stok_minimum: number
  is_aktif: boolean
}

/** Hasil pencarian barang per satuan (pemilih barang & kasir). */
export interface BarangSatuanCari extends BarangSatuan {
  kode: string
  nama: string
  merk: string | null
  /** "Aqua 600ml — Dus" */
  label: string
}

export interface Barang {
  id: number
  kode: string
  nama: string
  kelompok_id: number | null
  kelompok: string | null
  merk_id: number | null
  merk: string | null
  keterangan: string | null
  is_aktif: boolean
  satuan: BarangSatuan[]
}

export interface BarangPayload {
  kode?: string | null
  nama: string
  kelompok_id: number | null
  merk_id: number | null
  keterangan?: string | null
  is_aktif?: boolean
  satuan: {
    id?: number
    satuan_id: number
    barcode?: string | null
    isi: number
    harga_beli: number
    margin_persen?: number | null
    harga_jual: number
    stok_minimum?: number
    is_aktif?: boolean
  }[]
}

export type KategoriJasa = 'listrik' | 'token_listrik' | 'air' | 'game' | 'tagihan' | 'lainnya'

export const LABEL_KATEGORI_JASA: Record<KategoriJasa, string> = {
  listrik: 'Tagihan Listrik',
  token_listrik: 'Token Listrik',
  air: 'Air / PDAM',
  game: 'Top Up Game',
  tagihan: 'Tagihan Lain',
  lainnya: 'Lainnya'
}

export interface Jasa {
  id: number
  kode: string
  nama: string
  kategori: KategoriJasa
  /** Nominal diisi kasir saat transaksi (mis. tagihan listrik); harga jual = nominal + biaya admin. */
  nominal_bebas: boolean
  butuh_no_pelanggan: boolean
  harga_modal: number
  harga_jual: number
  biaya_admin: number
  keterangan: string | null
  is_aktif: boolean
}

export type JasaPayload = Omit<Jasa, 'id' | 'kode' | 'is_aktif'> & { kode?: string | null; is_aktif?: boolean }

/** Master sederhana: satuan, merk, kelompok-barang, distributor. */
export type JenisMaster = 'satuan' | 'merk' | 'kelompok-barang' | 'distributor'

export const masterService = {
  async list<T = any>(jenis: JenisMaster, params?: { search?: string; is_aktif?: boolean }): Promise<T[]> {
    const res = await apiService.get<{ data: T[] }>(`/toko/${jenis}`, params)
    return res.data
  },
  async create<T = any>(jenis: JenisMaster, payload: Record<string, any>): Promise<T> {
    const res = await apiService.post<{ data: T }>(`/toko/${jenis}`, payload)
    return res.data
  },
  async update<T = any>(jenis: JenisMaster, id: number, payload: Record<string, any>): Promise<T> {
    const res = await apiService.put<{ data: T }>(`/toko/${jenis}/${id}`, payload)
    return res.data
  },
  remove(jenis: JenisMaster, id: number): Promise<{ message: string }> {
    return apiService.delete(`/toko/${jenis}/${id}`)
  }
}

export const barangService = {
  list(params: { search?: string; kelompok_id?: number | null; merk_id?: number | null; is_aktif?: boolean; stok_menipis?: boolean; page?: number; per_page?: number }): Promise<Paginated<Barang>> {
    return apiService.get('/toko/barang', params)
  },
  async get(id: number): Promise<Barang> {
    const res = await apiService.get<{ data: Barang }>(`/toko/barang/${id}`)
    return res.data
  },
  async create(payload: BarangPayload): Promise<Barang> {
    const res = await apiService.post<{ data: Barang }>('/toko/barang', payload)
    return res.data
  },
  async update(id: number, payload: BarangPayload): Promise<Barang> {
    const res = await apiService.put<{ data: Barang }>(`/toko/barang/${id}`, payload)
    return res.data
  },
  remove(id: number): Promise<{ message: string }> {
    return apiService.delete(`/toko/barang/${id}`)
  },
  /** Cari barang per satuan — nama, kode, atau barcode. `barcode` = cocok persis (scan). */
  async cari(params: { q?: string; barcode?: string; barang_id?: number; limit?: number; semua?: boolean }): Promise<BarangSatuanCari[]> {
    const res = await apiService.get<{ data: BarangSatuanCari[] }>('/toko/barang-satuan', params)
    return res.data
  }
}

export const jasaService = {
  async list(params?: { search?: string; kategori?: KategoriJasa; is_aktif?: boolean }): Promise<Jasa[]> {
    const res = await apiService.get<{ data: Jasa[] }>('/toko/jasa', params)
    return res.data
  },
  async create(payload: JasaPayload): Promise<Jasa> {
    const res = await apiService.post<{ data: Jasa }>('/toko/jasa', payload)
    return res.data
  },
  async update(id: number, payload: JasaPayload): Promise<Jasa> {
    const res = await apiService.put<{ data: Jasa }>(`/toko/jasa/${id}`, payload)
    return res.data
  },
  remove(id: number): Promise<{ message: string }> {
    return apiService.delete(`/toko/jasa/${id}`)
  }
}

/** Harga jual dari harga beli + margin (%), dibulatkan ke atas ke kelipatan `bulat` rupiah. */
export function hargaJualDariMargin(hargaBeli: number, marginPersen: number, bulat = 100): number {
  const mentah = hargaBeli * (1 + (marginPersen || 0) / 100)
  return bulat > 0 ? Math.ceil(mentah / bulat) * bulat : Math.round(mentah)
}

/** Margin (%) aktual dari harga beli & harga jual. */
export function marginDariHarga(hargaBeli: number, hargaJual: number): number {
  return hargaBeli > 0 ? Math.round(((hargaJual - hargaBeli) / hargaBeli) * 10000) / 100 : 0
}

/** Pesan galat pertama dari respons Laravel. */
export function pesanGalat(e: any, cadangan: string): string {
  const errs = e?.data?.errors
  const pertama = errs ? (Object.values(errs)[0] as string[] | undefined)?.[0] : null
  return pertama || e?.message || cadangan
}

/** 12,5 → "12,5"; 3 → "3" (jumlah stok). */
export const formatQty = (n: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(n || 0)
