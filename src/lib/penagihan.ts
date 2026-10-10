import type { AnggotaPeta } from '@/services/penagihanService'

export type StatusTitik = 'lewat' | 'tunggak' | 'menunggu' | 'bersih'

/** Warna status titik anggota — dipakai peta, legenda, dan daftar. */
export const WARNA_STATUS: Record<StatusTitik, string> = {
  lewat: '#dc2626',
  tunggak: '#d97706',
  menunggu: '#7c3aed',
  bersih: '#16a34a'
}

export const LABEL_STATUS_TITIK: Record<StatusTitik, string> = {
  lewat: 'Lewat jatuh tempo',
  tunggak: 'Ada tagihan',
  menunggu: 'Sudah bayar, menunggu setoran',
  bersih: 'Tidak ada tagihan'
}

export const statusTitik = (a: AnggotaPeta): StatusTitik =>
  a.tunggakan.lewat_jatuh_tempo > 0
    ? 'lewat'
    : a.tunggakan.sisa > 0
      ? 'tunggak'
      : a.tunggakan.menunggu_setoran > 0
        ? 'menunggu'
        : 'bersih'

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
