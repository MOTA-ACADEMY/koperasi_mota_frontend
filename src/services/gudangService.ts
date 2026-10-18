import { apiService } from '@/lib/api'
import type { BarangSatuanCari, Paginated } from './tokoService'

export type JenisDokumen = 'pre-order' | 'purchase-order' | 'receiving' | 'retur' | 'adjustment' | 'opname'

export type StatusDokumen = 'draft' | 'disetujui' | 'ditolak' | 'sebagian' | 'selesai'

export const LABEL_STATUS_DOKUMEN: Record<StatusDokumen, string> = {
  draft: 'Menunggu persetujuan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  sebagian: 'Diterima sebagian',
  selesai: 'Selesai'
}

export const KELAS_STATUS_DOKUMEN: Record<StatusDokumen, string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  disetujui: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  ditolak: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  sebagian: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  selesai: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

/** Baris item dokumen dari API (kolom bervariasi per jenis dokumen). */
export interface ItemDokumen {
  id: number
  barang_satuan_id: number
  qty: number
  harga?: number
  subtotal?: number
  harga_po?: number | null
  qty_diterima?: number
  purchase_order_item_id?: number | null
  ke_barang_satuan_id?: number | null
  qty_ke?: number | null
  stok_sistem?: number
  stok_fisik?: number
  selisih?: number
  keterangan?: string | null
  alasan?: string | null
  barang: BarangSatuanCari | null
  ke_barang?: BarangSatuanCari | null
}

export interface Dokumen {
  id: number
  nomor: string
  tanggal: string
  status: StatusDokumen
  catatan: string | null
  pembuat: string | null
  pemroses: string | null
  diproses_at: string | null
  catatan_proses: string | null
  jumlah_item: number | null
  bisa_diubah: boolean
  total: number | null
  distributor_id?: number | null
  distributor?: string | null
  pre_order_id?: number | null
  purchase_order_id?: number | null
  receiving_id?: number | null
  pre_order_nomor?: string | null
  purchase_order_nomor?: string | null
  receiving_nomor?: string | null
  no_faktur?: string | null
  pembayaran?: 'tunai' | 'tempo'
  jatuh_tempo?: string | null
  pengembalian?: 'potong_utang' | 'tunai'
  jenis?: 'penyesuaian' | 'konversi' | 'stok_awal'
  jurnal_id?: number | null
  items?: ItemDokumen[]
}

export interface HasilSetujui {
  message: string
  data: Dokumen
  peringatan: string[]
  harga_berubah?: { barang_satuan_id: number; nama: string; harga_lama: number; harga_baru: number; harga_po: number | null }[]
}

export interface SisaPo {
  id: number
  nomor: string
  status: StatusDokumen
  distributor_id: number
  distributor: string | null
  items: { purchase_order_item_id: number; barang_satuan_id: number; qty_po: number; qty_diterima: number; sisa: number; harga_po: number; barang: BarangSatuanCari | null }[]
}

export interface DokumenMenunggu {
  jenis: JenisDokumen
  jenis_label: string
  id: number
  nomor: string
  tanggal: string
  distributor: string | null
  keterangan: string | null
  total: number | null
  jumlah_item: number
  pembuat: string | null
  dibuat_at: string
}

export interface MutasiStok {
  id: number
  tanggal: string
  jenis: string
  ref_nomor: string | null
  masuk: number
  keluar: number
  saldo: number
  harga: number
  keterangan: string | null
  oleh: string | null
}

export const LABEL_JENIS_MUTASI: Record<string, string> = {
  stok_awal: 'Stok awal',
  receiving: 'Penerimaan (RO)',
  retur: 'Retur ke distributor',
  adjustment: 'Adjustment',
  konversi: 'Konversi satuan',
  opname: 'Stok opname',
  penjualan: 'Penjualan kasir',
  batal_penjualan: 'Batal penjualan'
}

export const gudangService = {
  list(jenis: JenisDokumen, params: { status?: string; search?: string; distributor_id?: number; page?: number }): Promise<Paginated<Dokumen>> {
    return apiService.get(`/gudang/${jenis}`, params)
  },
  async get(jenis: JenisDokumen, id: number): Promise<Dokumen> {
    const res = await apiService.get<{ data: Dokumen }>(`/gudang/${jenis}/${id}`)
    return res.data
  },
  async create(jenis: JenisDokumen, payload: Record<string, any>): Promise<Dokumen> {
    const res = await apiService.post<{ data: Dokumen }>(`/gudang/${jenis}`, payload)
    return res.data
  },
  async update(jenis: JenisDokumen, id: number, payload: Record<string, any>): Promise<Dokumen> {
    const res = await apiService.put<{ data: Dokumen }>(`/gudang/${jenis}/${id}`, payload)
    return res.data
  },
  remove(jenis: JenisDokumen, id: number): Promise<{ message: string }> {
    return apiService.delete(`/gudang/${jenis}/${id}`)
  },
  setujui(jenis: JenisDokumen, id: number, catatan?: string | null): Promise<HasilSetujui> {
    return apiService.post(`/gudang/${jenis}/${id}/setujui`, { catatan })
  },
  tolak(jenis: JenisDokumen, id: number, catatan: string): Promise<{ message: string; data: Dokumen }> {
    return apiService.post(`/gudang/${jenis}/${id}/tolak`, { catatan })
  },
  async sisaPo(poId: number): Promise<SisaPo> {
    const res = await apiService.get<{ data: SisaPo }>(`/gudang/receiving/sisa-po/${poId}`)
    return res.data
  },
  persetujuan(): Promise<{ data: DokumenMenunggu[]; ringkasan: Partial<Record<JenisDokumen, number>> }> {
    return apiService.get('/gudang/persetujuan')
  },
  kartuStok(barangSatuanId: number, dari: string, sampai: string): Promise<{
    barang: BarangSatuanCari
    saldo_awal: number
    total_masuk: number
    total_keluar: number
    saldo_akhir: number
    data: MutasiStok[]
  }> {
    return apiService.get(`/gudang/kartu-stok/${barangSatuanId}`, { dari, sampai })
  }
}
