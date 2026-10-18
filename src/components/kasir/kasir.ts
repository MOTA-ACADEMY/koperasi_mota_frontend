import type { Penjualan, SesiKasir } from '@/services/kasirService'
import { formatRupiah } from '@/lib/format'

/** Warna selisih kas: 0 hijau, kurang merah, lebih kuning. */
export const kelasSelisih = (n: number | null | undefined) => {
  if (n === null || n === undefined) return 'text-muted-foreground'
  if (n === 0) return 'text-green-700 dark:text-green-400'
  return n < 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
}

/** "Pas", "Kurang Rp 5.000", "Lebih Rp 2.000". */
export const teksSelisih = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '—'
  if (n === 0) return 'Pas'
  return `${n < 0 ? 'Kurang' : 'Lebih'} ${formatRupiah(Math.abs(n))}`
}

export const KELAS_STATUS_SESI: Record<SesiKasir['status'], string> = {
  buka: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  tutup: 'bg-muted text-muted-foreground'
}

export const LABEL_STATUS_SESI: Record<SesiKasir['status'], string> = {
  buka: 'Buka',
  tutup: 'Tutup'
}

export const KELAS_METODE: Record<Penjualan['metode'], string> = {
  tunai: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  qris: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300'
}

export const LABEL_METODE: Record<Penjualan['metode'], string> = {
  tunai: 'Tunai',
  qris: 'QRIS'
}

/** Jam saja: "08.15". */
export const formatJam = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'
