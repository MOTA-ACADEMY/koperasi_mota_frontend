<template>
  <div class="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <!-- Panel brand (hanya layar lebar) -->
    <aside
      class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-900 p-12 text-white"
    >
      <!-- Dekorasi: grid halus + lingkaran cahaya -->
      <svg class="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
      <div class="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-green-400/25 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-300/15 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Handshake class="h-6 w-6" />
        </span>
        <span class="text-xl font-semibold tracking-tight">Koperasi Mota</span>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-4xl font-bold leading-tight tracking-tight">
          Kelola koperasi lebih rapi, transparan, dan mudah.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-green-50/85">
          Dari keanggotaan, simpanan, sampai pembukuan — satu tempat untuk seluruh kegiatan koperasi Anda.
        </p>

        <ul class="mt-10 space-y-5">
          <li v-for="fitur in fiturs" :key="fitur.judul" class="flex items-start gap-4">
            <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <component :is="fitur.ikon" class="h-5 w-5" />
            </span>
            <div>
              <p class="font-medium">{{ fitur.judul }}</p>
              <p class="text-sm text-green-50/75">{{ fitur.deskripsi }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p class="relative flex items-center gap-2 text-sm text-green-50/70">
        <ShieldCheck class="h-4 w-4" />
        Data tiap koperasi terpisah dan terlindungi
      </p>
    </aside>

    <!-- Panel form -->
    <main class="relative flex min-h-screen flex-col px-6 py-10 sm:px-10 lg:min-h-0">
      <!-- Latar lembut untuk layar kecil (panel brand disembunyikan) -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-green-50 to-transparent dark:from-green-950/40 lg:hidden" />

      <div class="relative mb-8 flex items-center gap-2.5 lg:hidden">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
          <Handshake class="h-5 w-5" />
        </span>
        <span class="text-lg font-semibold tracking-tight text-green-800 dark:text-green-400">Koperasi Mota</span>
      </div>

      <div class="relative flex flex-1 items-center justify-center">
        <div class="w-full" :class="{ sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[ukuran]">
          <slot />
        </div>
      </div>

      <p class="relative mt-10 text-center text-xs text-muted-foreground">
        © {{ new Date().getFullYear() }} Koperasi Mota. Seluruh hak dilindungi.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Handshake, ShieldCheck, Users, PiggyBank, Scale } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    /** Lebar konten: sm = form pendek (login), md = daftar pilihan, lg = form panjang (pendaftaran). */
    ukuran?: 'sm' | 'md' | 'lg'
  }>(),
  { ukuran: 'sm' }
)

const fiturs = [
  { ikon: Users, judul: 'Keanggotaan', deskripsi: 'Data anggota, identitas, dan wilayah kolektor terpusat.' },
  { ikon: PiggyBank, judul: 'Simpanan', deskripsi: 'Tagihan simpanan pokok, wajib, dan sukarela otomatis.' },
  { ikon: Scale, judul: 'Akuntansi', deskripsi: 'Jurnal, saldo awal, dan tutup buku sesuai periode.' }
]
</script>
