import type { AnggotaPeta } from '@/services/penagihanService'

/**
 * Status anggota di peta penagihan (dihitung backend, lihat Penagihan::statusAnggota):
 * merah = ada tagihan terlambat ≥ batas hari setelah jatuh tempo, kuning = belum bayar,
 * hijau = sudah bayar semua (termasuk yang uangnya masih dipegang kolektor).
 */
export type StatusTitik = 'merah' | 'kuning' | 'hijau'

export const URUTAN_STATUS: StatusTitik[] = ['merah', 'kuning', 'hijau']

/** Warna status titik anggota — dipakai peta, filter, dan daftar. */
export const WARNA_STATUS: Record<StatusTitik, string> = {
  merah: '#dc2626',
  kuning: '#eab308',
  hijau: '#16a34a'
}

export const labelStatus = (status: StatusTitik, batasHari = 3): string =>
  ({
    merah: `Terlambat ≥ ${batasHari} hari`,
    kuning: 'Belum bayar',
    hijau: 'Sudah bayar'
  })[status]

/** Status dari backend; hitung di klien hanya sebagai cadangan untuk respons lama. */
export const statusTitik = (a: AnggotaPeta): StatusTitik =>
  a.status ?? (a.tunggakan.terlambat > 0 ? 'merah' : a.tunggakan.sisa > 0 ? 'kuning' : 'hijau')

/** Nomor HP lokal → format wa.me (62…). */
export const nomorWa = (nomor: string) => {
  const angka = nomor.replace(/\D/g, '')
  return angka.startsWith('0') ? `62${angka.slice(1)}` : angka
}

/** '2026-10-15T09:00:00…' → '15 Okt 2026, 09.00' */
export const formatWaktu = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
