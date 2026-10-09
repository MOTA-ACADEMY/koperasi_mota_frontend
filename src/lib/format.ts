const rupiahPenuh = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const rupiahRingkas = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  maximumFractionDigits: 1
})
const angka = new Intl.NumberFormat('id-ID')

/** Rp 1.250.000 */
export const formatRupiah = (nilai: number) => rupiahPenuh.format(nilai || 0)

/** Rp 1,3 jt — untuk angka besar di tile & sumbu grafik. */
export const formatRupiahRingkas = (nilai: number) => rupiahRingkas.format(nilai || 0)

/** 12.847 */
export const formatAngka = (nilai: number) => angka.format(nilai || 0)

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** '2026-10' → 'Oktober 2026' (atau 'Okt' bila pendek). */
export const formatPeriode = (periode: string, pendek = false) => {
  const [tahun, bulan] = periode.split('-').map(Number)
  const nama = BULAN[(bulan || 1) - 1]
  return pendek ? nama.slice(0, 3) : `${nama} ${tahun}`
}

/** '2026-10-15' → '15 Okt 2026' */
export const formatTanggal = (tanggal: string | null) =>
  tanggal ? new Date(`${tanggal}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
