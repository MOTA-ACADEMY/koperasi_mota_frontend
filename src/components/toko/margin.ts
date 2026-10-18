/** Batas margin "tipis" (%) — di bawah ini ditandai kuning, di bawah 0 merah. */
export const MARGIN_TIPIS = 5

const persen = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

/** 12.57 → "12,6%" */
export const formatPersen = (n: number) => `${persen.format(n || 0)}%`

export type TingkatMargin = 'rugi' | 'tipis' | 'sehat'

export const tingkatMargin = (margin: number): TingkatMargin =>
  margin < 0 ? 'rugi' : margin < MARGIN_TIPIS ? 'tipis' : 'sehat'

/** Chip margin di daftar barang. */
export const KELAS_CHIP_MARGIN: Record<TingkatMargin, string> = {
  rugi: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  tipis: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  sehat: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
}

/** Warna teks keterangan margin di form. */
export const kelasTeksMargin = (margin: number) =>
  ({
    rugi: 'font-medium text-red-600 dark:text-red-400',
    tipis: 'font-medium text-amber-700 dark:text-amber-400',
    sehat: 'text-muted-foreground'
  })[tingkatMargin(margin)]
