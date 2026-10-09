<template>
  <div class="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0">
        <p class="text-sm text-muted-foreground">{{ hariIni }}</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {{ salam }}, {{ namaDepan }}
        </h1>
        <p class="mt-1 truncate text-sm text-muted-foreground">
          Ringkasan {{ userStore.koperasi?.nama || 'koperasi' }}
          <template v-if="data?.akuntansi?.periode_aktif"> · Buku periode {{ data.akuntansi.periode_aktif.tahun }}</template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <RouterLink v-for="aksi in aksiCepat" :key="aksi.to" :to="aksi.to" class="btn-sekunder">
          <component :is="aksi.icon" class="h-4 w-4" />
          {{ aksi.label }}
        </RouterLink>
        <button
          type="button"
          class="btn-sekunder px-2.5"
          :disabled="memuat"
          aria-label="Muat ulang data"
          title="Muat ulang"
          @click="muat"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': memuat }" />
        </button>
      </div>
    </div>

    <!-- Gagal memuat -->
    <div
      v-if="galat && !data"
      class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      role="alert"
    >
      <CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p class="font-medium">Ringkasan tidak dapat dimuat.</p>
        <p class="mt-0.5 opacity-90">{{ galat }}</p>
      </div>
    </div>

    <!-- Kerangka saat pertama kali memuat -->
    <template v-else-if="!data">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-[132px] animate-pulse rounded-xl border border-border bg-card" />
      </div>
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div class="h-96 animate-pulse rounded-xl border border-border bg-card xl:col-span-2" />
        <div class="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </template>

    <!-- Konten (saat refresh, tampilan lama ditahan redup — tanpa lompatan layout) -->
    <div v-else class="space-y-6 transition-opacity duration-200" :class="{ 'opacity-60': memuat }">
      <div
        v-if="!data.anggota && !data.simpanan && !data.akuntansi"
        class="rounded-xl border border-dashed border-border p-10 text-center"
      >
        <LayoutDashboard class="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p class="mt-3 text-sm font-medium text-foreground">Belum ada ringkasan untuk ditampilkan</p>
        <p class="mt-1 text-sm text-muted-foreground">Role Anda belum memiliki akses ke modul anggota, simpanan, atau akuntansi.</p>
      </div>

      <!-- Statistik utama -->
      <div v-if="tiles.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2" :class="KOLOM_TILE[tiles.length] ?? 'xl:grid-cols-4'">
        <StatTile v-for="tile in tiles" :key="tile.label" :label="tile.label" :value="tile.value" :icon="tile.icon" :to="tile.to">
          <component :is="tile.subIcon" v-if="tile.subIcon" class="h-3.5 w-3.5 shrink-0" :class="tile.subClass" />
          <span :class="tile.subClass">{{ tile.sub }}</span>
        </StatTile>
      </div>

      <!-- Grafik + per jenis -->
      <div v-if="data.simpanan" class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <TrenSimpananChart :tren="data.simpanan.tren" :periode-ini="data.periode" />
        </div>

        <section class="rounded-xl border border-border bg-card p-5" aria-labelledby="jenis-judul">
          <h2 id="jenis-judul" class="text-base font-semibold text-foreground">Simpanan {{ formatPeriode(data.periode) }}</h2>
          <p class="mt-0.5 text-sm text-muted-foreground">Terkumpul dari total tagihan per jenis</p>

          <ul class="mt-5 space-y-5">
            <li v-for="jenis in data.simpanan.per_jenis" :key="jenis.jenis">
              <RouterLink :to="`/simpanan/${jenis.jenis}`" class="group block rounded-lg">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="text-sm font-medium text-foreground group-hover:text-green-700 dark:group-hover:text-green-400">
                    Simpanan {{ jenis.jenis }}
                  </span>
                  <span class="text-sm font-semibold text-foreground">{{ persenJenis(jenis) }}%</span>
                </div>
                <!-- Meter: isian aksen, lintasan dari ramp yang sama (lebih terang) -->
                <div
                  class="mt-2 h-2 overflow-hidden rounded-full bg-green-100 dark:bg-green-950"
                  role="meter"
                  :aria-valuenow="persenJenis(jenis)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="`Simpanan ${jenis.jenis} terkumpul`"
                >
                  <div class="h-full rounded-full bg-green-600 transition-[width] duration-500" :style="{ width: `${persenJenis(jenis)}%` }" />
                </div>
                <p class="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>{{ formatRupiah(jenis.terkumpul) }} / {{ formatRupiah(jenis.ditagih) }}</span>
                  <span>{{ jenis.jumlah_lunas }}/{{ jenis.jumlah_tagihan }} lunas</span>
                </p>
              </RouterLink>
            </li>
          </ul>
          <p v-if="data.simpanan.per_jenis.every((j) => j.jumlah_tagihan === 0)" class="mt-4 text-xs text-muted-foreground">
            Belum ada tagihan untuk periode ini.
          </p>
        </section>
      </div>

      <!-- Daftar -->
      <div v-if="data.simpanan || data.anggota" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section v-if="data.simpanan" class="rounded-xl border border-border bg-card" aria-labelledby="tunggakan-judul">
          <header class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 id="tunggakan-judul" class="text-base font-semibold text-foreground">Tagihan belum lunas terlama</h2>
              <p class="mt-0.5 text-sm text-muted-foreground">Diurutkan dari jatuh tempo paling awal</p>
            </div>
          </header>
          <ul v-if="data.simpanan.tagihan_terlama.length" class="divide-y divide-border">
            <li v-for="t in data.simpanan.tagihan_terlama" :key="t.id">
              <RouterLink :to="`/simpanan/${t.jenis}`" class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-foreground">{{ t.anggota || 'Anggota tidak ditemukan' }}</p>
                  <p class="mt-0.5 text-xs capitalize text-muted-foreground">Simpanan {{ t.jenis }} · {{ formatPeriode(t.periode) }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-sm font-medium tabular-nums text-foreground">{{ formatRupiah(t.nominal) }}</p>
                  <p
                    class="mt-0.5 flex items-center justify-end gap-1 text-xs"
                    :class="t.lewat_jatuh_tempo ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'"
                  >
                    <TriangleAlert v-if="t.lewat_jatuh_tempo" class="h-3 w-3 shrink-0" />
                    <span class="whitespace-nowrap">{{ t.lewat_jatuh_tempo ? 'Terlambat' : 'Tempo' }} · {{ formatTanggal(t.jatuh_tempo) }}</span>
                  </p>
                </div>
              </RouterLink>
            </li>
          </ul>
          <div v-else class="flex items-center gap-3 px-5 py-8 text-sm text-muted-foreground">
            <CircleCheck class="h-5 w-5 text-green-600" />
            Semua tagihan sudah lunas.
          </div>
        </section>

        <section v-if="data.anggota" class="rounded-xl border border-border bg-card" aria-labelledby="anggota-judul">
          <header class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 id="anggota-judul" class="text-base font-semibold text-foreground">Anggota terbaru</h2>
              <p class="mt-0.5 text-sm text-muted-foreground">{{ formatAngka(data.anggota.total) }} anggota terdaftar</p>
            </div>
            <RouterLink to="/members" class="text-sm font-medium text-green-700 hover:underline dark:text-green-400">Lihat semua</RouterLink>
          </header>
          <ul v-if="data.anggota.terbaru.length" class="divide-y divide-border">
            <li v-for="a in data.anggota.terbaru" :key="a.id">
              <RouterLink :to="`/members/${a.id}`" class="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  {{ inisial(a.nama) }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-foreground">{{ a.nama }}</p>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ a.kode }} · bergabung {{ formatTanggal(a.tanggal_bergabung) }}</p>
                </div>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="a.status === 'aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'"
                >
                  {{ a.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </RouterLink>
            </li>
          </ul>
          <div v-else class="px-5 py-8 text-sm text-muted-foreground">Belum ada anggota.</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookText,
  CircleAlert,
  CircleCheck,
  FileClock,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  RefreshCw,
  TriangleAlert,
  UserPlus,
  Users,
  Wallet
} from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { ringkasanService, type RingkasanDashboard } from '@/services/dashboardService'
import { formatAngka, formatPeriode, formatRupiah, formatRupiahRingkas, formatTanggal } from '@/lib/format'
import StatTile from '@/components/dashboard/StatTile.vue'
import TrenSimpananChart from '@/components/dashboard/TrenSimpananChart.vue'

const userStore = useUserStore()

const data = ref<RingkasanDashboard | null>(null)
const memuat = ref(false)
const galat = ref<string | null>(null)

const sekarang = new Date()
const hariIni = sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const salam = (() => {
  const jam = sekarang.getHours()
  if (jam < 11) return 'Selamat pagi'
  if (jam < 15) return 'Selamat siang'
  if (jam < 18) return 'Selamat sore'
  return 'Selamat malam'
})()
const namaDepan = computed(() => userStore.user.name.split(/\s+/)[0] || 'Pengguna')

const inisial = (nama: string) =>
  nama.split(/\s+/).filter(Boolean).slice(0, 2).map((k) => k[0]?.toUpperCase()).join('')

const persenJenis = (j: { ditagih: number; terkumpul: number }) =>
  j.ditagih > 0 ? Math.round((j.terkumpul / j.ditagih) * 100) : 0

// Aksi cepat hanya untuk menu yang boleh diakses user.
const aksiCepat = computed(() => {
  const simpananPertama = (['pokok', 'wajib', 'sukarela'] as const).find((j) => userStore.can(`simpanan.${j}`))
  return [
    userStore.can('anggota') && { to: '/members/add', label: 'Tambah anggota', icon: UserPlus },
    simpananPertama && { to: `/simpanan/${simpananPertama}`, label: 'Buat tagihan', icon: ReceiptText },
    userStore.can('akuntansi.jurnal-umum') && { to: '/akuntansi/jurnal-umum', label: 'Jurnal umum', icon: BookText }
  ].filter(Boolean) as { to: string; label: string; icon: Component }[]
})

// Kelas ditulis utuh (bukan disusun dinamis) supaya terdeteksi Tailwind saat build.
const KOLOM_TILE: Record<number, string> = { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4' }

type Tile = { label: string; value: string; icon: Component; to?: string; sub: string; subIcon?: Component; subClass?: string }

const tiles = computed<Tile[]>(() => {
  const d = data.value
  if (!d) return []
  const hasil: Tile[] = []

  if (d.anggota) {
    hasil.push({
      label: 'Anggota aktif',
      value: formatAngka(d.anggota.aktif),
      icon: Users,
      to: '/members',
      sub: `${formatAngka(d.anggota.baru_bulan_ini)} bergabung bulan ini · ${formatAngka(d.anggota.total)} total`
    })
  }

  if (d.simpanan) {
    const ditagih = d.simpanan.per_jenis.reduce((n, j) => n + j.ditagih, 0)
    const terkumpul = d.simpanan.per_jenis.reduce((n, j) => n + j.terkumpul, 0)
    hasil.push({
      label: 'Simpanan terkumpul',
      value: formatRupiahRingkas(terkumpul),
      icon: PiggyBank,
      sub: ditagih > 0
        ? `${Math.round((terkumpul / ditagih) * 100)}% dari ${formatRupiahRingkas(ditagih)} · ${formatPeriode(d.periode)}`
        : `Belum ada tagihan ${formatPeriode(d.periode)}`
    })

    const { jumlah, nominal, jatuh_tempo } = d.simpanan.belum_lunas
    hasil.push({
      label: 'Tagihan belum lunas',
      value: formatRupiahRingkas(nominal),
      icon: Wallet,
      sub: jatuh_tempo > 0
        ? `${formatAngka(jatuh_tempo)} lewat jatuh tempo · ${formatAngka(jumlah)} tagihan`
        : `${formatAngka(jumlah)} tagihan · tidak ada yang lewat jatuh tempo`,
      // Status selalu disertai ikon + label, tidak hanya warna.
      subIcon: jatuh_tempo > 0 ? TriangleAlert : undefined,
      subClass: jatuh_tempo > 0 ? 'text-red-600 dark:text-red-400' : undefined
    })
  }

  if (d.akuntansi) {
    const a = d.akuntansi
    hasil.push({
      label: 'Jurnal belum diposting',
      value: a.periode_aktif ? formatAngka(a.jurnal_draft ?? 0) : '—',
      icon: FileClock,
      to: userStore.can('akuntansi.jurnal-umum') ? '/akuntansi/jurnal-umum' : undefined,
      sub: a.periode_aktif
        ? `${formatAngka(a.jurnal_terposting ?? 0)} terposting · saldo awal ${a.saldo_awal_terverifikasi ? 'terverifikasi' : 'belum diverifikasi'}`
        : 'Belum ada buku periode aktif'
    })
  }

  return hasil
})

const muat = async () => {
  memuat.value = true
  galat.value = null
  try {
    data.value = await ringkasanService.ringkasan()
  } catch (err: any) {
    galat.value = err?.message || 'Terjadi kesalahan'
  } finally {
    memuat.value = false
  }
}

onMounted(muat)
</script>

<style scoped>
@reference "../assets/main.css";

.btn-sekunder {
  @apply inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40 disabled:opacity-60;
}
</style>
