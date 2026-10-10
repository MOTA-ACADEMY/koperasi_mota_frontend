<template>
  <div class="space-y-4 p-4 sm:p-6">
    <!-- Kepala halaman -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">Penagihan Lapangan</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          <template v-if="modePantau">Memantau wilayah dan tagihan kolektor.</template>
          <template v-else>Tagih simpanan pokok & wajib anggota di wilayah Anda.</template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <select
          v-if="konteks?.bisa_memantau && pilihanKolektor.length"
          v-model="kolektorDipilih"
          class="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
          aria-label="Pilih kolektor"
        >
          <option v-if="konteks?.kolektor" :value="null">Wilayah saya</option>
          <option v-for="k in pilihanKolektor" :key="k.id" :value="k.id">{{ k.nama || `Kolektor #${k.id}` }}</option>
        </select>

        <span
          v-if="konteks?.kolektor && !modePantau"
          class="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium"
          :class="gpsChip.kelas"
          :title="gpsChip.bantuan"
        >
          <span class="relative flex h-2 w-2">
            <span v-if="gps.status.value === 'aktif'" class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {{ gpsChip.label }}
        </span>
      </div>
    </div>

    <div v-if="memuat" class="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>

    <!-- Bukan kolektor & tidak bisa memantau -->
    <div v-else-if="!konteks?.kolektor && !konteks?.bisa_memantau" class="rounded-xl border border-border bg-card p-10 text-center">
      <MapPinOff class="mx-auto h-10 w-10 text-muted-foreground" />
      <p class="mt-3 font-medium text-foreground">Akun Anda belum terdaftar sebagai kolektor</p>
      <p class="mt-1 text-sm text-muted-foreground">Minta admin koperasi menambahkan Anda di menu Master Kolektor beserta wilayah tugasnya.</p>
    </div>

    <div v-else-if="konteks?.bisa_memantau && !konteks.kolektor && !pilihanKolektor.length" class="rounded-xl border border-border bg-card p-10 text-center">
      <Users class="mx-auto h-10 w-10 text-muted-foreground" />
      <p class="mt-3 font-medium text-foreground">Belum ada kolektor aktif</p>
      <p class="mt-1 text-sm text-muted-foreground">Tambahkan kolektor dan gambar wilayahnya di menu Master Kolektor.</p>
    </div>

    <template v-else>
      <!-- Tab (hanya untuk kolektor) -->
      <div v-if="!modePantau" class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
        <button
          v-for="t in TABS"
          :key="t.kode"
          type="button"
          role="tab"
          :aria-selected="tab === t.kode"
          class="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="tab === t.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="gantiTab(t.kode)"
        >
          <component :is="t.ikon" class="h-4 w-4 shrink-0" />
          <span class="sm:hidden">{{ t.pendek }}</span>
          <span class="hidden sm:inline">{{ t.label }}</span>
          <span
            v-if="t.kode === 'uang' && uangDipegang.jumlah"
            class="rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
          >{{ uangDipegang.jumlah }}</span>
        </button>
      </div>

      <!-- ================= PETA ================= -->
      <!-- Layar lebar: peta + daftar pas satu layar (navbar, judul, dan tab ±16rem) -->
      <div v-show="tab === 'peta' || modePantau" class="grid gap-4 lg:h-[calc(100vh-16rem)] lg:min-h-[480px] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div class="h-[52vh] min-h-[320px] lg:h-auto lg:min-h-0 lg:flex-1">
            <PetaPenagihan
              v-if="wilayah"
              ref="petaRef"
              :wilayah="wilayah.kolektor.wilayah"
              :anggota="wilayah.anggota"
              :terpilih-id="terpilihId"
              :posisi-saya="modePantau ? null : gps.posisi.value"
              :posisi-kolektor="posisiKolektorDipantau"
              @pilih="bukaAnggota"
            />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span v-for="(label, kode) in LABEL_STATUS_TITIK" :key="kode" class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-card" :style="{ background: WARNA_STATUS[kode] }" />
              {{ label }}
            </span>
            <span v-if="!modePantau" class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-card" /> Posisi Anda
            </span>
            <span v-else-if="posisiKolektorDipantau" class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-blue-600" /> Posisi terakhir kolektor
            </span>
          </div>
        </div>

        <!-- Daftar anggota di wilayah -->
        <div class="flex min-h-0 flex-col rounded-xl border border-border bg-card">
          <div class="border-b border-border p-3">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="text-lg font-semibold tabular-nums text-foreground">{{ ringkasan.anggota }}</p>
                <p class="text-[11px] text-muted-foreground">Anggota</p>
              </div>
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="text-lg font-semibold tabular-nums text-foreground">{{ ringkasan.menunggak }}</p>
                <p class="text-[11px] text-muted-foreground">Punya tagihan</p>
              </div>
              <div class="rounded-lg bg-muted/60 px-2 py-2">
                <p class="truncate text-lg font-semibold tabular-nums text-foreground" :title="formatRupiah(ringkasan.sisa)">{{ formatRupiahRingkas(ringkasan.sisa) }}</p>
                <p class="text-[11px] text-muted-foreground">Sisa tagihan</p>
              </div>
            </div>
            <div class="relative mt-3">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="cari"
                type="search"
                placeholder="Cari nama, kode, alamat…"
                class="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
              />
            </div>
            <label class="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input v-model="hanyaMenunggak" type="checkbox" class="h-3.5 w-3.5 accent-green-600" />
              Hanya yang punya tagihan
            </label>
          </div>

          <ul class="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            <li v-for="a in daftarAnggota" :key="a.id">
              <button
                type="button"
                class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                :class="{ 'bg-green-50/70 dark:bg-green-950/30': a.id === terpilihId }"
                @click="bukaAnggota(a.id, true)"
              >
                <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: WARNA_STATUS[statusTitik(a)] }" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-foreground">{{ a.nama }}</span>
                  <span class="block truncate text-xs text-muted-foreground">{{ a.kode }} · {{ a.alamat || 'Tanpa alamat' }}</span>
                </span>
                <span class="shrink-0 text-right">
                  <span v-if="a.tunggakan.sisa > 0" class="block text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(a.tunggakan.sisa) }}</span>
                  <span v-else-if="a.tunggakan.menunggu_setoran > 0" class="block text-xs font-medium text-violet-700 dark:text-violet-400">Menunggu setoran</span>
                  <span v-else class="block text-xs text-muted-foreground">Lunas</span>
                  <span v-if="jarakKe(a)" class="block text-[11px] text-muted-foreground">{{ jarakKe(a) }}</span>
                </span>
              </button>
            </li>
            <li v-if="!daftarAnggota.length" class="px-4 py-10 text-center text-sm text-muted-foreground">
              {{ wilayah?.anggota.length ? 'Tidak ada anggota yang cocok.' : 'Belum ada anggota berkoordinat di dalam wilayah ini.' }}
            </li>
          </ul>
        </div>
      </div>

      <!-- ================= UANG DIPEGANG ================= -->
      <div v-if="tab === 'uang' && !modePantau" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
          <div>
            <p class="text-sm text-muted-foreground">Uang tagihan yang masih Anda pegang</p>
            <p class="mt-1 text-3xl font-bold tabular-nums text-foreground">{{ formatRupiah(uangDipegang.total) }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ uangDipegang.jumlah }} kwitansi · tagihan anggota baru lunas setelah setoran diverifikasi bendahara</p>
          </div>
          <button
            type="button"
            class="tombol-utama"
            :disabled="!uangDipegang.jumlah"
            @click="setorOpen = true"
          >
            <HandCoins class="h-4 w-4" /> Setor ke bendahara
          </button>
        </div>

        <div class="overflow-hidden rounded-xl border border-border bg-card">
          <div v-if="memuatPembayaran" class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
          </div>
          <ul v-else class="divide-y divide-border">
            <li v-for="p in pembayaranSaya" :key="p.id" class="flex flex-wrap items-start gap-3 px-4 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-foreground">{{ p.member?.nama }}</p>
                <p class="text-xs text-muted-foreground">{{ p.nomor }} · {{ formatWaktu(p.dibayar_at) }}</p>
                <p class="mt-1 text-xs text-muted-foreground">{{ ringkasAlokasi(p) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(p.total) }}</span>
                <button type="button" class="tombol-kecil" @click="lihatKwitansi(p)">Kwitansi</button>
                <button type="button" class="tombol-kecil text-red-600 dark:text-red-400" @click="mintaBatal(p)">Batalkan</button>
              </div>
            </li>
            <li v-if="!pembayaranSaya.length" class="px-4 py-12 text-center text-sm text-muted-foreground">
              Tidak ada uang yang sedang Anda pegang.
            </li>
          </ul>
        </div>
      </div>

      <!-- ================= RIWAYAT SETORAN ================= -->
      <div v-if="tab === 'setoran' && !modePantau" class="overflow-hidden rounded-xl border border-border bg-card">
        <div v-if="memuatSetoran" class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
        </div>
        <ul v-else class="divide-y divide-border">
          <li v-for="s in setoranSaya" :key="s.id" class="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground">{{ s.nomor }}</p>
              <p class="text-xs text-muted-foreground">{{ formatWaktu(s.diajukan_at) }} · {{ s.jumlah_pembayaran }} kwitansi</p>
              <p v-if="s.status === 'ditolak' && s.catatan_verifikasi" class="mt-1 text-xs text-red-600 dark:text-red-400">
                Ditolak: {{ s.catatan_verifikasi }} — kwitansinya kembali ke "Uang dipegang" untuk disetor ulang.
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(s.total) }}</p>
              <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="KELAS_STATUS_SETORAN[s.status]">
                {{ LABEL_STATUS_SETORAN[s.status] }}
              </span>
            </div>
          </li>
          <li v-if="!setoranSaya.length" class="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada setoran.</li>
        </ul>
      </div>
    </template>

    <!-- ================= PANEL ANGGOTA: detail → tagih → kwitansi ================= -->
    <PanelSheet
      :open="panel !== null"
      :title="judulPanel.title"
      :subtitle="judulPanel.subtitle"
      :back="panel === 'tagih'"
      @close="tutupPanel"
      @back="panel = 'detail'"
    >
      <div v-if="memuatDetail" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <!-- Detail anggota -->
      <div v-else-if="panel === 'detail' && detail" class="space-y-5">
        <div class="flex items-center gap-3">
          <img v-if="detail.anggota.foto" :src="detail.anggota.foto" alt="" class="h-14 w-14 rounded-full object-cover" />
          <span v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
            {{ inisial(detail.anggota.nama) }}
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-foreground">{{ detail.anggota.nama }}</p>
            <p class="text-sm text-muted-foreground">{{ detail.anggota.kode }}</p>
            <p v-if="jarakDetail" class="text-xs text-muted-foreground">{{ jarakDetail }} dari posisi Anda</p>
          </div>
        </div>

        <p class="flex gap-2 text-sm text-foreground">
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          {{ detail.anggota.alamat || 'Alamat belum diisi' }}
        </p>

        <div class="grid grid-cols-3 gap-2">
          <a
            :href="detail.anggota.telepon ? `tel:${detail.anggota.telepon}` : undefined"
            class="tombol-aksi"
            :class="{ 'pointer-events-none opacity-40': !detail.anggota.telepon }"
          >
            <Phone class="h-4 w-4" /> Telepon
          </a>
          <a
            :href="nomorWaAnggota ? `https://wa.me/${nomorWa(nomorWaAnggota)}` : undefined"
            target="_blank"
            rel="noopener"
            class="tombol-aksi"
            :class="{ 'pointer-events-none opacity-40': !nomorWaAnggota }"
          >
            <MessageCircle class="h-4 w-4" /> WhatsApp
          </a>
          <a
            :href="`https://www.google.com/maps/dir/?api=1&destination=${detail.anggota.latitude},${detail.anggota.longitude}`"
            target="_blank"
            rel="noopener"
            class="tombol-aksi"
          >
            <Navigation class="h-4 w-4" /> Rute
          </a>
        </div>

        <section>
          <div class="mb-2 flex items-baseline justify-between">
            <h3 class="text-sm font-semibold text-foreground">Tagihan belum lunas</h3>
            <span class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(totalSisaDetail) }}</span>
          </div>
          <ul v-if="detail.tagihan.length" class="divide-y divide-border rounded-lg border border-border">
            <li v-for="t in detail.tagihan" :key="t.id" class="flex items-start justify-between gap-3 px-3 py-2.5">
              <div class="min-w-0">
                <p class="text-sm font-medium text-foreground">{{ LABEL_JENIS[t.jenis] }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatPeriode(t.periode) }} · jatuh tempo {{ formatTanggal(t.jatuh_tempo) }}
                </p>
                <p v-if="t.terbayar > 0" class="text-xs text-muted-foreground">Sudah masuk kas {{ formatRupiah(t.terbayar) }} dari {{ formatRupiah(t.nominal) }}</p>
                <p v-if="t.menunggu_setoran > 0" class="text-xs text-violet-700 dark:text-violet-400">{{ formatRupiah(t.menunggu_setoran) }} sudah dibayar, menunggu setoran</p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(t.sisa) }}</p>
                <span v-if="t.lewat_jatuh_tempo && t.sisa > 0" class="text-[11px] font-medium text-red-600 dark:text-red-400">Lewat jatuh tempo</span>
              </div>
            </li>
          </ul>
          <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            Tidak ada tagihan simpanan pokok/wajib yang belum lunas.
          </p>
        </section>

        <section v-if="detail.pembayaran_menunggu.length">
          <h3 class="mb-2 text-sm font-semibold text-foreground">Pembayaran belum diverifikasi</h3>
          <ul class="space-y-2">
            <li v-for="p in detail.pembayaran_menunggu" :key="p.id" class="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <span class="font-medium text-foreground">{{ p.nomor }}</span> · {{ formatWaktu(p.dibayar_at) }} ·
              {{ formatRupiah(p.total) }} · {{ LABEL_STATUS_PEMBAYARAN[p.status] }}
            </li>
          </ul>
        </section>

        <p v-if="modePantau" class="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Mode pantau — pembayaran hanya bisa dicatat oleh kolektor di lapangan.
        </p>
      </div>

      <!-- Pilih tagihan yang dibayar -->
      <div v-else-if="panel === 'tagih' && detail" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">Pilih tagihan yang dibayar. Nominal bisa diubah untuk bayar sebagian.</p>
          <button type="button" class="shrink-0 text-sm font-medium text-green-700 hover:underline dark:text-green-400" @click="pilihSemua">
            {{ semuaTerpilih ? 'Kosongkan' : 'Pilih semua' }}
          </button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="t in tagihanBisaDibayar"
            :key="t.id"
            class="rounded-lg border p-3 transition-colors"
            :class="isian[t.id]?.dipilih ? 'border-green-600 bg-green-50/60 dark:bg-green-950/30' : 'border-border'"
          >
            <label class="flex cursor-pointer items-start gap-3">
              <input v-model="isian[t.id].dipilih" type="checkbox" class="mt-1 h-4 w-4 accent-green-600" />
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium text-foreground">{{ LABEL_JENIS[t.jenis] }} · {{ formatPeriode(t.periode) }}</span>
                <span class="block text-xs text-muted-foreground">
                  Sisa {{ formatRupiah(t.sisa) }}<template v-if="t.lewat_jatuh_tempo"> · <span class="text-red-600 dark:text-red-400">lewat jatuh tempo</span></template>
                </span>
              </span>
            </label>
            <div v-if="isian[t.id]?.dipilih" class="mt-2 pl-7">
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <input
                  v-model.number="isian[t.id].nominal"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  :max="t.sisa"
                  class="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
                  :class="nominalSalah(t) ? 'border-red-500' : 'border-border'"
                  :aria-label="`Nominal ${LABEL_JENIS[t.jenis]} ${formatPeriode(t.periode)}`"
                />
              </div>
              <p v-if="nominalSalah(t)" class="mt-1 text-xs text-red-600 dark:text-red-400">Isi antara Rp 1 dan {{ formatRupiah(t.sisa) }}.</p>
              <p v-else-if="isian[t.id].nominal < t.sisa" class="mt-1 text-xs text-muted-foreground">
                Bayar sebagian — sisa {{ formatRupiah(t.sisa - isian[t.id].nominal) }} tetap tertagih.
              </p>
            </div>
          </li>
        </ul>

        <div>
          <label for="catatan-bayar" class="mb-1 block text-sm font-medium text-foreground">Catatan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea
            id="catatan-bayar"
            v-model="catatanBayar"
            rows="2"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            placeholder="Mis. dibayar oleh istri"
          />
        </div>

        <p v-if="gps.status.value !== 'aktif'" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <TriangleAlert class="h-4 w-4 shrink-0" />
          Lokasi GPS belum aktif — pembayaran tetap bisa dicatat, tapi tanpa titik lokasi.
        </p>
      </div>

      <!-- Kwitansi -->
      <div v-else-if="panel === 'kwitansi' && kwitansi" class="space-y-4">
        <div v-if="kwitansiBaru" class="flex items-center gap-3 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
          <CircleCheck class="h-5 w-5 shrink-0" />
          Pembayaran tercatat. Simpan uangnya untuk disetor ke bendahara.
        </div>

        <div class="rounded-xl border border-border p-4">
          <div class="flex items-start justify-between gap-3 border-b border-dashed border-border pb-3">
            <div>
              <p class="text-xs uppercase tracking-wider text-muted-foreground">Kwitansi</p>
              <p class="font-semibold text-foreground">{{ kwitansi.nomor }}</p>
            </div>
            <p class="text-right text-xs text-muted-foreground">{{ formatWaktu(kwitansi.dibayar_at) }}</p>
          </div>
          <dl class="space-y-1 py-3 text-sm">
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Koperasi</dt><dd class="text-right text-foreground">{{ userStore.koperasi?.nama }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Anggota</dt><dd class="text-right text-foreground">{{ kwitansi.member?.nama }} ({{ kwitansi.member?.kode }})</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Kolektor</dt><dd class="text-right text-foreground">{{ kwitansi.kolektor?.nama || userStore.user?.name }}</dd></div>
          </dl>
          <ul class="space-y-1 border-t border-dashed border-border py-3 text-sm">
            <li v-for="a in kwitansi.alokasi" :key="a.billing_id" class="flex justify-between gap-3">
              <span class="text-foreground">{{ LABEL_JENIS[a.jenis || ''] }} {{ a.periode ? formatPeriode(a.periode) : '' }}</span>
              <span class="tabular-nums text-foreground">{{ formatRupiah(a.nominal) }}</span>
            </li>
          </ul>
          <div class="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
            <span>Total</span>
            <span class="tabular-nums">{{ formatRupiah(kwitansi.total) }}</span>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">
            Status: {{ LABEL_STATUS_PEMBAYARAN[kwitansi.status] }}. Tagihan tercatat lunas setelah uang diterima bendahara koperasi.
          </p>
        </div>
      </div>

      <template #footer>
        <button
          v-if="panel === 'detail' && detail && !modePantau"
          type="button"
          class="tombol-utama w-full"
          :disabled="!tagihanBisaDibayar.length"
          @click="mulaiTagih"
        >
          <Wallet class="h-4 w-4" />
          {{ tagihanBisaDibayar.length ? 'Tagih' : 'Tidak ada sisa tagihan' }}
        </button>

        <div v-else-if="panel === 'tagih'" class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs text-muted-foreground">{{ alokasiDipilih.length }} tagihan</p>
            <p class="text-lg font-bold tabular-nums text-foreground">{{ formatRupiah(totalBayar) }}</p>
          </div>
          <button type="button" class="tombol-utama" :disabled="!bisaSimpanBayar || menyimpan" @click="simpanBayar">
            <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
            Terima pembayaran
          </button>
        </div>

        <div v-else-if="panel === 'kwitansi' && kwitansi" class="grid grid-cols-2 gap-2">
          <a :href="tautanWaKwitansi" target="_blank" rel="noopener" class="tombol-aksi">
            <MessageCircle class="h-4 w-4" /> Kirim ke WA
          </a>
          <button type="button" class="tombol-utama" @click="tutupPanel">Selesai</button>
        </div>
      </template>
    </PanelSheet>

    <!-- Setor ke bendahara -->
    <PanelSheet :open="setorOpen" title="Setor ke bendahara" :subtitle="`${uangDipegang.jumlah} kwitansi`" @close="setorOpen = false">
      <div class="space-y-4">
        <div class="rounded-xl bg-muted/60 p-4 text-center">
          <p class="text-sm text-muted-foreground">Total uang yang diserahkan</p>
          <p class="mt-1 text-3xl font-bold tabular-nums text-foreground">{{ formatRupiah(uangDipegang.total) }}</p>
        </div>
        <p class="text-sm text-muted-foreground">
          Serahkan uang tunai sejumlah ini ke bendahara. Setelah bendahara memverifikasi, tagihan anggota tercatat lunas.
        </p>
        <div>
          <label for="catatan-setor" class="mb-1 block text-sm font-medium text-foreground">Catatan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea
            id="catatan-setor"
            v-model="catatanSetor"
            rows="2"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
          />
        </div>
      </div>
      <template #footer>
        <button type="button" class="tombol-utama w-full" :disabled="menyimpan" @click="ajukanSetoran">
          <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
          Ajukan setoran {{ formatRupiah(uangDipegang.total) }}
        </button>
      </template>
    </PanelSheet>

    <!-- Batalkan kwitansi -->
    <PanelSheet :open="batalTarget !== null" title="Batalkan pembayaran" :subtitle="batalTarget?.nomor" @close="batalTarget = null">
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          Gunakan bila pembayaran salah dicatat. Uang {{ formatRupiah(batalTarget?.total || 0) }} harus dikembalikan ke anggota,
          dan tagihannya kembali bisa ditagih.
        </p>
        <label for="alasan-batal" class="block text-sm font-medium text-foreground">Alasan</label>
        <input
          id="alasan-batal"
          v-model="alasanBatal"
          type="text"
          maxlength="255"
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
          placeholder="Mis. salah pilih anggota"
        />
      </div>
      <template #footer>
        <button
          type="button"
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          :disabled="!alasanBatal.trim() || menyimpan"
          @click="batalkan"
        >
          Batalkan pembayaran
        </button>
      </template>
    </PanelSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  CircleCheck,
  HandCoins,
  History,
  Loader2,
  Map as IkonPeta,
  MapPin,
  MapPinOff,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  TriangleAlert,
  Users,
  Wallet
} from 'lucide-vue-next'
import PanelSheet from '@/components/penagihan/PanelSheet.vue'
import PetaPenagihan from '@/components/penagihan/PetaPenagihan.vue'
import { useGpsKolektor, jarakMeter, formatJarak } from '@/composables/useGpsKolektor'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatPeriode, formatRupiah, formatRupiahRingkas, formatTanggal } from '@/lib/format'
import { LABEL_STATUS_TITIK, WARNA_STATUS, formatWaktu, nomorWa, statusTitik } from '@/lib/penagihan'
import {
  LABEL_JENIS,
  LABEL_STATUS_PEMBAYARAN,
  LABEL_STATUS_SETORAN,
  penagihanService,
  type AnggotaPeta,
  type DetailAnggota,
  type KolektorRingkas,
  type KonteksPenagihan,
  type Pembayaran,
  type Setoran,
  type StatusSetoran,
  type Tagihan
} from '@/services/penagihanService'

type Tab = 'peta' | 'uang' | 'setoran'
const TABS = [
  { kode: 'peta' as Tab, label: 'Peta', pendek: 'Peta', ikon: IkonPeta },
  { kode: 'uang' as Tab, label: 'Uang dipegang', pendek: 'Uang', ikon: Wallet },
  { kode: 'setoran' as Tab, label: 'Riwayat setoran', pendek: 'Setoran', ikon: History }
]

const KELAS_STATUS_SETORAN: Record<StatusSetoran, string> = {
  menunggu: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  diverifikasi: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  ditolak: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
}

const { success, error: toastError } = useToast()
const userStore = useUserStore()
const gps = useGpsKolektor()

const memuat = ref(true)
const konteks = ref<KonteksPenagihan | null>(null)
const kolektorDipilih = ref<number | null>(null)
const wilayah = ref<{ kolektor: KolektorRingkas; anggota: AnggotaPeta[] } | null>(null)
const tab = ref<Tab>('peta')
const cari = ref('')
const hanyaMenunggak = ref(false)
const petaRef = ref<InstanceType<typeof PetaPenagihan> | null>(null)

const uangDipegang = ref({ jumlah: 0, total: 0 })
const pembayaranSaya = ref<Pembayaran[]>([])
const memuatPembayaran = ref(false)
const setoranSaya = ref<Setoran[]>([])
const memuatSetoran = ref(false)

const panel = ref<'detail' | 'tagih' | 'kwitansi' | null>(null)
const terpilihId = ref<number | null>(null)
const memuatDetail = ref(false)
const detail = ref<DetailAnggota | null>(null)
const isian = reactive<Record<number, { dipilih: boolean; nominal: number }>>({})
const catatanBayar = ref('')
const menyimpan = ref(false)
const kwitansi = ref<Pembayaran | null>(null)
const kwitansiBaru = ref(false)

const setorOpen = ref(false)
const catatanSetor = ref('')
const batalTarget = ref<Pembayaran | null>(null)
const alasanBatal = ref('')

/** Pemantau yang membuka wilayah kolektor lain (atau tidak punya baris kolektor sendiri). */
const modePantau = computed(() => kolektorDipilih.value !== null || !konteks.value?.kolektor)

const pilihanKolektor = computed(() =>
  (konteks.value?.kolektor_list ?? []).filter((k) => k.id !== konteks.value?.kolektor?.id)
)

const posisiKolektorDipantau = computed(() => {
  const l = modePantau.value ? wilayah.value?.kolektor.lokasi_terakhir : null
  return l ? { lat: l.lat, lng: l.lng, label: `${wilayah.value?.kolektor.nama ?? 'Kolektor'} · ${formatWaktu(l.at)}` } : null
})

const gpsChip = computed(() => {
  const s = gps.status.value
  const peta: Record<string, { label: string; kelas: string; bantuan: string }> = {
    aktif: {
      label: gps.diWilayah.value === false ? 'GPS aktif · di luar wilayah' : 'GPS aktif',
      kelas: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400',
      bantuan: gps.posisi.value ? `Akurasi ±${gps.posisi.value.akurasi} m` : ''
    },
    mencari: { label: 'Mencari lokasi…', kelas: 'border-border bg-card text-muted-foreground', bantuan: '' },
    ditolak: {
      label: 'Izin lokasi ditolak',
      kelas: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
      bantuan: 'Izinkan akses lokasi untuk situs ini di pengaturan browser, lalu muat ulang halaman.'
    },
    tidak_aman: {
      label: 'GPS butuh HTTPS',
      kelas: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
      bantuan: 'Browser hanya memberi lokasi pada situs HTTPS (atau localhost).'
    },
    tidak_didukung: { label: 'GPS tidak didukung', kelas: 'border-border bg-card text-muted-foreground', bantuan: '' },
    galat: { label: 'Lokasi belum didapat', kelas: 'border-border bg-card text-muted-foreground', bantuan: 'Pastikan GPS perangkat menyala.' },
    mati: { label: 'GPS mati', kelas: 'border-border bg-card text-muted-foreground', bantuan: '' }
  }
  return peta[s]
})

// --- Daftar anggota ---
const ringkasan = computed(() => {
  const a = wilayah.value?.anggota ?? []
  return {
    anggota: a.length,
    menunggak: a.filter((x) => x.tunggakan.sisa > 0).length,
    sisa: a.reduce((n, x) => n + x.tunggakan.sisa, 0)
  }
})

const URUTAN_STATUS = { lewat: 0, tunggak: 1, menunggu: 2, bersih: 3 }

const daftarAnggota = computed(() => {
  const q = cari.value.trim().toLowerCase()
  return (wilayah.value?.anggota ?? [])
    .filter((a) => !hanyaMenunggak.value || a.tunggakan.sisa > 0)
    .filter((a) => !q || [a.nama, a.kode, a.alamat ?? ''].some((v) => v.toLowerCase().includes(q)))
    .slice()
    .sort((x, y) => {
      const s = URUTAN_STATUS[statusTitik(x)] - URUTAN_STATUS[statusTitik(y)]
      if (s !== 0) return s
      // Kolektor di lapangan: yang terdekat dulu; pemantau: tunggakan terbesar dulu.
      const p = gps.posisi.value
      if (p && !modePantau.value) return jarakMeter(p, { lat: x.latitude, lng: x.longitude }) - jarakMeter(p, { lat: y.latitude, lng: y.longitude })
      return y.tunggakan.sisa - x.tunggakan.sisa
    })
})

const jarakKe = (a: AnggotaPeta) => {
  const p = gps.posisi.value
  return p && !modePantau.value ? formatJarak(jarakMeter(p, { lat: a.latitude, lng: a.longitude })) : ''
}

// --- Detail & tagih ---
const judulPanel = computed(() => {
  if (panel.value === 'tagih') return { title: 'Tagih', subtitle: detail.value?.anggota.nama }
  if (panel.value === 'kwitansi') return { title: 'Kwitansi', subtitle: kwitansi.value?.member?.nama ?? '' }
  return { title: 'Detail anggota', subtitle: modePantau.value ? wilayah.value?.kolektor.nama ?? undefined : undefined }
})

const nomorWaAnggota = computed(() => detail.value?.anggota.whatsapp || detail.value?.anggota.telepon || null)

const jarakDetail = computed(() => {
  const p = gps.posisi.value
  const a = detail.value?.anggota
  return p && a && !modePantau.value ? formatJarak(jarakMeter(p, { lat: a.latitude, lng: a.longitude })) : ''
})

const totalSisaDetail = computed(() => (detail.value?.tagihan ?? []).reduce((n, t) => n + t.sisa, 0))
const tagihanBisaDibayar = computed(() => (detail.value?.tagihan ?? []).filter((t) => t.sisa > 0))
const alokasiDipilih = computed(() => tagihanBisaDibayar.value.filter((t) => isian[t.id]?.dipilih))
const totalBayar = computed(() => alokasiDipilih.value.reduce((n, t) => n + (Number(isian[t.id].nominal) || 0), 0))
const semuaTerpilih = computed(() => tagihanBisaDibayar.value.length > 0 && alokasiDipilih.value.length === tagihanBisaDibayar.value.length)

const nominalSalah = (t: Tagihan) => {
  const n = Number(isian[t.id]?.nominal)
  return !Number.isFinite(n) || n < 1 || n > t.sisa
}

const bisaSimpanBayar = computed(() => alokasiDipilih.value.length > 0 && alokasiDipilih.value.every((t) => !nominalSalah(t)))

const inisial = (nama: string) =>
  nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? '')
    .join('')

const ringkasAlokasi = (p: Pembayaran) =>
  (p.alokasi ?? [])
    .map((a) => `${a.jenis === 'pokok' ? 'Pokok' : 'Wajib'} ${a.periode ? formatPeriode(a.periode, true) + ' ' + a.periode.slice(0, 4) : ''}`)
    .join(', ')

const tautanWaKwitansi = computed(() => {
  const k = kwitansi.value
  if (!k) return '#'
  const baris = [
    `*Kwitansi ${k.nomor}*`,
    userStore.koperasi?.nama ?? '',
    `Anggota: ${k.member?.nama} (${k.member?.kode})`,
    `Tanggal: ${formatWaktu(k.dibayar_at)}`,
    '',
    ...(k.alokasi ?? []).map((a) => `- ${LABEL_JENIS[a.jenis || '']} ${a.periode ? formatPeriode(a.periode) : ''}: ${formatRupiah(a.nominal)}`),
    '',
    `*Total: ${formatRupiah(k.total)}*`,
    `Diterima oleh: ${k.kolektor?.nama || userStore.user?.name || 'kolektor'}`
  ]
  const tujuan = k.member?.id === detail.value?.anggota.id && nomorWaAnggota.value ? nomorWa(nomorWaAnggota.value) : ''
  return `https://wa.me/${tujuan}?text=${encodeURIComponent(baris.join('\n'))}`
})

const pesanGalat = (e: any, cadangan: string) => {
  const errs = e?.data?.errors
  const pertama = errs ? (Object.values(errs)[0] as string[] | undefined)?.[0] : null
  return pertama || e?.message || cadangan
}

const muatWilayah = async () => {
  wilayah.value = await penagihanService.wilayah(kolektorDipilih.value)
}

const muatKonteks = async () => {
  konteks.value = await penagihanService.konteks()
  if (konteks.value.uang_dipegang) uangDipegang.value = konteks.value.uang_dipegang
  if (!konteks.value.kolektor && konteks.value.bisa_memantau) {
    kolektorDipilih.value = konteks.value.kolektor_list[0]?.id ?? null
  }
}

const bukaAnggota = async (id: number, dariDaftar = false) => {
  terpilihId.value = id
  if (dariDaftar) {
    const a = wilayah.value?.anggota.find((x) => x.id === id)
    if (a) petaRef.value?.fokus(a.latitude, a.longitude)
  }
  panel.value = 'detail'
  memuatDetail.value = true
  detail.value = null
  try {
    detail.value = await penagihanService.anggota(id, kolektorDipilih.value)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat data anggota'))
    panel.value = null
  } finally {
    memuatDetail.value = false
  }
}

const mulaiTagih = () => {
  Object.keys(isian).forEach((k) => delete isian[Number(k)])
  tagihanBisaDibayar.value.forEach((t) => {
    isian[t.id] = { dipilih: false, nominal: t.sisa }
  })
  catatanBayar.value = ''
  panel.value = 'tagih'
}

const pilihSemua = () => {
  const nilai = !semuaTerpilih.value
  tagihanBisaDibayar.value.forEach((t) => (isian[t.id].dipilih = nilai))
}

const simpanBayar = async () => {
  if (!detail.value || !bisaSimpanBayar.value) return
  menyimpan.value = true
  const p = gps.posisi.value
  try {
    kwitansi.value = await penagihanService.bayar({
      member_id: detail.value.anggota.id,
      alokasi: alokasiDipilih.value.map((t) => ({ billing_id: t.id, nominal: Number(isian[t.id].nominal) })),
      latitude: p?.lat ?? null,
      longitude: p?.lng ?? null,
      akurasi: p?.akurasi ?? null,
      catatan: catatanBayar.value.trim() || null
    })
    kwitansiBaru.value = true
    panel.value = 'kwitansi'
    uangDipegang.value = {
      jumlah: uangDipegang.value.jumlah + 1,
      total: uangDipegang.value.total + kwitansi.value.total
    }
    muatWilayah().catch(() => {})
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal mencatat pembayaran'))
    // Sisa bisa berubah (mis. kolektor lain baru menagih) — segarkan tagihan.
    if (e?.status === 422 && terpilihId.value) {
      detail.value = await penagihanService.anggota(terpilihId.value, kolektorDipilih.value).catch(() => detail.value)
      mulaiTagih()
    }
  } finally {
    menyimpan.value = false
  }
}

const lihatKwitansi = (p: Pembayaran) => {
  kwitansi.value = p
  kwitansiBaru.value = false
  detail.value = null
  panel.value = 'kwitansi'
}

const tutupPanel = () => {
  panel.value = null
  terpilihId.value = null
}

// --- Uang dipegang & setoran ---
const muatPembayaran = async () => {
  memuatPembayaran.value = true
  try {
    const res = await penagihanService.pembayaranSaya('diterima_kolektor')
    pembayaranSaya.value = res.data
    uangDipegang.value = res.uang_dipegang
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat pembayaran'))
  } finally {
    memuatPembayaran.value = false
  }
}

const muatSetoran = async () => {
  memuatSetoran.value = true
  try {
    setoranSaya.value = await penagihanService.setoranSaya()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat setoran'))
  } finally {
    memuatSetoran.value = false
  }
}

const gantiTab = (t: Tab) => {
  tab.value = t
  if (t === 'uang') muatPembayaran()
  if (t === 'setoran') muatSetoran()
}

const ajukanSetoran = async () => {
  menyimpan.value = true
  try {
    const s = await penagihanService.ajukanSetoran({ catatan: catatanSetor.value.trim() || null })
    success(`Setoran ${s.nomor} diajukan`, { description: 'Serahkan uangnya ke bendahara untuk diverifikasi.' })
    setorOpen.value = false
    catatanSetor.value = ''
    await muatPembayaran()
    gantiTab('setoran')
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal mengajukan setoran'))
  } finally {
    menyimpan.value = false
  }
}

const mintaBatal = (p: Pembayaran) => {
  alasanBatal.value = ''
  batalTarget.value = p
}

const batalkan = async () => {
  if (!batalTarget.value) return
  menyimpan.value = true
  try {
    await penagihanService.batalkan(batalTarget.value.id, alasanBatal.value.trim())
    success('Pembayaran dibatalkan')
    batalTarget.value = null
    await muatPembayaran()
    muatWilayah().catch(() => {})
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal membatalkan pembayaran'))
  } finally {
    menyimpan.value = false
  }
}

watch(kolektorDipilih, async () => {
  tutupPanel()
  try {
    await muatWilayah()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat wilayah'))
  }
})

onMounted(async () => {
  try {
    await muatKonteks()
    // Pemantau tanpa baris kolektor: wilayah dimuat oleh watcher `kolektorDipilih`.
    if (konteks.value?.kolektor) await muatWilayah()
    // GPS hanya menyala selama halaman ini terbuka, dan hanya dilaporkan bila pengguna adalah kolektor.
    if (konteks.value?.kolektor) gps.mulai({ kirim: true })
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat data penagihan'))
  } finally {
    memuat.value = false
  }
})
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-utama {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.tombol-aksi {
  @apply inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted [&>svg]:shrink-0;
}

.tombol-kecil {
  @apply rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted;
}
</style>
