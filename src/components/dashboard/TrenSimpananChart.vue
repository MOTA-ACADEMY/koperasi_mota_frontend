<template>
  <section
    class="flex h-full flex-col rounded-xl border border-border bg-card p-5 [--viz-axis:#c3c2b7] [--viz-grid:#eeeeec] [--viz-lunas:#16a34a] [--viz-sisa:#c4c4c8] dark:[--viz-axis:#3a3d44] dark:[--viz-grid:#23262c] dark:[--viz-sisa:#4b4f58]"
    aria-labelledby="tren-judul"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="tren-judul" class="text-base font-semibold text-foreground">Tagihan simpanan</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">{{ BULAN_TREN }} bulan terakhir, per periode tagihan</p>
      </div>
      <div class="flex rounded-lg border border-border p-0.5 text-xs font-medium" role="group" aria-label="Tampilan">
        <button
          v-for="opsi in (['grafik', 'tabel'] as const)"
          :key="opsi"
          type="button"
          class="rounded-md px-2.5 py-1 capitalize transition-colors"
          :class="tampilan === opsi ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'"
          :aria-pressed="tampilan === opsi"
          @click="tampilan = opsi"
        >
          {{ opsi }}
        </button>
      </div>
    </header>

    <!-- Legenda: identitas tidak hanya dari warna (ada label + total) -->
    <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <div class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-sm" style="background: var(--viz-lunas)" />
        <span class="text-muted-foreground">Terkumpul</span>
        <span class="font-semibold text-foreground">{{ formatRupiahRingkas(totalLunas) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-sm" style="background: var(--viz-sisa)" />
        <span class="text-muted-foreground">Belum lunas</span>
        <span class="font-semibold text-foreground">{{ formatRupiahRingkas(totalBelum) }}</span>
      </div>
    </div>

    <div v-if="kosong" class="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
      <ChartColumn class="h-8 w-8 text-muted-foreground/60" />
      <p class="text-sm text-muted-foreground">Belum ada tagihan simpanan dalam {{ BULAN_TREN }} bulan terakhir.</p>
    </div>

    <!-- Grafik -->
    <div v-else-if="tampilan === 'grafik'" class="mt-7 flex flex-1 gap-3">
      <!-- Sumbu Y -->
      <div class="relative h-56 w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        <span
          v-for="tick in ticks"
          :key="tick"
          class="absolute right-0 -translate-y-1/2 leading-none"
          :style="{ bottom: `${(tick / skalaMaks) * 100}%` }"
        >
          {{ formatRupiahRingkas(tick) }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="relative h-56">
          <!-- Gridline hairline; baseline sedikit lebih tegas -->
          <div
            v-for="tick in ticks"
            :key="`g-${tick}`"
            class="absolute inset-x-0 h-px"
            :class="tick === 0 ? 'bg-[var(--viz-axis)]' : 'bg-[var(--viz-grid)]'"
            :style="{ bottom: `${(tick / skalaMaks) * 100}%` }"
          />

          <div class="absolute inset-0 flex">
            <div
              v-for="(bulan, i) in tren"
              :key="bulan.periode"
              class="group relative flex flex-1 cursor-default items-end justify-center outline-none"
              tabindex="0"
              :aria-label="`${formatPeriode(bulan.periode)}: terkumpul ${formatRupiah(bulan.lunas)}, belum lunas ${formatRupiah(bulan.belum_lunas)}`"
              @mouseenter="aktif = i"
              @mouseleave="aktif = null"
              @focus="aktif = i"
              @blur="aktif = null"
            >
              <!-- Sorotan kolom saat hover/fokus (area hit selebar slot) -->
              <div class="absolute inset-x-1 inset-y-0 rounded-md transition-colors" :class="aktif === i ? 'bg-muted/60' : ''" />

              <div class="relative flex w-5 flex-col-reverse sm:w-6" :style="{ height: `${persen(bulan.lunas + bulan.belum_lunas)}%` }">
                <div
                  v-if="bulan.lunas > 0"
                  class="w-full"
                  :class="bulan.belum_lunas > 0 ? '' : 'rounded-t'"
                  :style="{ height: `${porsi(bulan.lunas, bulan)}%`, background: 'var(--viz-lunas)' }"
                />
                <!-- Celah 2px warna permukaan di antara segmen -->
                <div v-if="bulan.lunas > 0 && bulan.belum_lunas > 0" class="h-0.5 w-full shrink-0" />
                <div
                  v-if="bulan.belum_lunas > 0"
                  class="w-full rounded-t"
                  :style="{ height: `${porsi(bulan.belum_lunas, bulan)}%`, background: 'var(--viz-sisa)' }"
                />
              </div>

              <!-- Tooltip -->
              <div
                v-if="aktif === i"
                class="pointer-events-none absolute z-10 mb-2 w-56 whitespace-nowrap rounded-lg border border-border bg-card p-3 text-xs shadow-lg"
                :class="i === 0 ? 'left-0' : i === tren.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'"
                :style="{ bottom: `${Math.min(persen(bulan.lunas + bulan.belum_lunas), 72)}%` }"
              >
                <p class="mb-2 font-semibold text-foreground">{{ formatPeriode(bulan.periode) }}</p>
                <p class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-1.5 text-muted-foreground">
                    <span class="h-2 w-2 rounded-sm" style="background: var(--viz-lunas)" /> Terkumpul
                  </span>
                  <span class="font-medium tabular-nums text-foreground">{{ formatRupiah(bulan.lunas) }}</span>
                </p>
                <p class="mt-1 flex items-center justify-between gap-2">
                  <span class="flex items-center gap-1.5 text-muted-foreground">
                    <span class="h-2 w-2 rounded-sm" style="background: var(--viz-sisa)" /> Belum lunas
                  </span>
                  <span class="font-medium tabular-nums text-foreground">{{ formatRupiah(bulan.belum_lunas) }}</span>
                </p>
                <p class="mt-2 border-t border-border pt-2 text-muted-foreground">
                  {{ rasio(bulan) }}% dari {{ formatRupiah(bulan.lunas + bulan.belum_lunas) }} terkumpul
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sumbu X -->
        <div class="mt-2 flex text-[11px] text-muted-foreground">
          <span
            v-for="bulan in tren"
            :key="`x-${bulan.periode}`"
            class="flex-1 text-center"
            :class="{ 'font-semibold text-foreground': bulan.periode === periodeIni }"
          >
            {{ formatPeriode(bulan.periode, true) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabel: padanan grafik untuk aksesibilitas -->
    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left text-xs text-muted-foreground">
            <th class="py-2 pr-3 font-medium">Periode</th>
            <th class="py-2 pr-3 text-right font-medium">Terkumpul</th>
            <th class="py-2 pr-3 text-right font-medium">Belum lunas</th>
            <th class="py-2 text-right font-medium">Terkumpul (%)</th>
          </tr>
        </thead>
        <tbody class="tabular-nums">
          <tr v-for="bulan in tren" :key="`t-${bulan.periode}`" class="border-b border-border/60 last:border-0">
            <td class="py-2 pr-3 text-foreground">{{ formatPeriode(bulan.periode) }}</td>
            <td class="py-2 pr-3 text-right text-foreground">{{ formatRupiah(bulan.lunas) }}</td>
            <td class="py-2 pr-3 text-right text-foreground">{{ formatRupiah(bulan.belum_lunas) }}</td>
            <td class="py-2 text-right text-muted-foreground">{{ bulan.lunas + bulan.belum_lunas ? `${rasio(bulan)}%` : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<!--
  Palet grafik divalidasi dengan validator dataviz terhadap permukaan kartu aplikasi:
  terkumpul = aksen hijau brand (#16a34a, kedua mode); belum lunas = abu-abu de-emphasis
  (bentuk "emphasis"). Abu-abu < 3:1 terhadap permukaan → relief: legenda berlabel + tampilan tabel.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChartColumn } from 'lucide-vue-next'
import { formatPeriode, formatRupiah, formatRupiahRingkas } from '@/lib/format'

type Bulan = { periode: string; lunas: number; belum_lunas: number }

const props = defineProps<{
  tren: Bulan[]
  periodeIni: string
}>()

const BULAN_TREN = computed(() => props.tren.length)
const tampilan = ref<'grafik' | 'tabel'>('grafik')
const aktif = ref<number | null>(null)

const totalLunas = computed(() => props.tren.reduce((n, b) => n + b.lunas, 0))
const totalBelum = computed(() => props.tren.reduce((n, b) => n + b.belum_lunas, 0))
const kosong = computed(() => totalLunas.value + totalBelum.value === 0)

const nilaiMaks = computed(() => Math.max(...props.tren.map((b) => b.lunas + b.belum_lunas), 0))

/** Langkah sumbu yang "bulat" (1/2/2,5/5 × 10^n), target ±5 garis, supaya batang mengisi plot. */
const langkah = computed(() => {
  if (nilaiMaks.value <= 0) return 1
  const kasar = nilaiMaks.value / 5
  const pangkat = 10 ** Math.floor(Math.log10(kasar))
  const pengali = [1, 2, 2.5, 5, 10].find((p) => p * pangkat >= kasar) ?? 10
  return pengali * pangkat
})
const jumlahLangkah = computed(() => Math.max(1, Math.ceil(nilaiMaks.value / langkah.value)))
const skalaMaks = computed(() => langkah.value * jumlahLangkah.value)
const ticks = computed(() => Array.from({ length: jumlahLangkah.value + 1 }, (_, i) => i * langkah.value))

const persen = (nilai: number) => (nilai / skalaMaks.value) * 100
/** Tinggi segmen relatif terhadap tinggi kolom (bukan terhadap sumbu). */
const porsi = (nilai: number, bulan: Bulan) => (nilai / (bulan.lunas + bulan.belum_lunas)) * 100
const rasio = (bulan: Bulan) => {
  const total = bulan.lunas + bulan.belum_lunas
  return total ? Math.round((bulan.lunas / total) * 100) : 0
}
</script>
