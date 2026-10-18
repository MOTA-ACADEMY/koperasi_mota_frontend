<template>
  <div class="flex flex-col gap-4 p-4 sm:p-6" :class="{ 'lg:h-[calc(100dvh-4rem)] lg:min-h-[560px]': sesi }">
    <div v-if="memuat" class="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>

    <!-- Gagal memuat sesi -->
    <div v-else-if="galatMuat" class="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
      <TriangleAlert class="mx-auto h-10 w-10 text-amber-500" />
      <p class="mt-3 font-medium text-foreground">Gagal memuat data kasir</p>
      <p class="mt-1 text-sm text-muted-foreground">{{ galatMuat }}</p>
      <button type="button" class="tombol-aksi mx-auto mt-4 px-4" @click="muatSesi()">
        <RotateCcw class="h-4 w-4" /> Coba lagi
      </button>
    </div>

    <!-- ================= KASIR BELUM DIBUKA ================= -->
    <template v-else-if="!sesi">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Kasir</h1>
        <p class="mt-1 text-sm text-muted-foreground">Buka kasir dulu sebelum mulai melayani pembeli.</p>
      </div>

      <form class="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-5 sm:p-6" @submit.prevent="bukaKasir">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            <Store class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-foreground">Buka Kasir</h2>
            <p class="truncate text-sm text-muted-foreground">{{ userStore.user?.name }} · {{ userStore.koperasi?.nama }}</p>
          </div>
        </div>

        <div class="mt-5">
          <label for="modal-awal" class="mb-1 block text-sm font-medium text-foreground">Modal awal di laci</label>
          <InputRupiah id="modal-awal" ref="inputModalRef" v-model="modalAwal" besar @enter="bukaKasir" />
          <div class="mt-2 grid grid-cols-4 gap-2">
            <button
              v-for="n in MODAL_CEPAT"
              :key="n"
              type="button"
              class="tombol-pilihan"
              :class="{ aktif: modalAwal === n }"
              @click="modalAwal = n"
            >
              {{ n === 0 ? 'Tanpa' : formatAngka(n) }}
            </button>
          </div>
        </div>

        <div class="mt-4">
          <label for="catatan-buka" class="mb-1 block text-sm font-medium text-foreground">Catatan <span class="font-normal text-muted-foreground">(opsional)</span></label>
          <textarea
            id="catatan-buka"
            v-model="catatanBuka"
            rows="2"
            maxlength="255"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            placeholder="Mis. shift pagi"
          />
        </div>

        <p class="mt-4 flex gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
          <Info class="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Modal awal adalah uang receh untuk kembalian. Hitung uang di laci, lalu isi jumlahnya — sistem mencatat jurnal pemindahan
            <b class="font-medium text-foreground">Kas → Kas Kasir</b> sebesar modal ini.
          </span>
        </p>

        <button type="submit" class="tombol-utama mt-5 h-11 w-full" :disabled="modalAwal === null || membuka">
          <Loader2 v-if="membuka" class="h-4 w-4 animate-spin" />
          <Store v-else class="h-4 w-4" />
          Buka Kasir<template v-if="modalAwal !== null"> · {{ formatRupiah(modalAwal) }}</template>
        </button>

        <RouterLink to="/kasir/riwayat" class="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <History class="h-4 w-4" /> Lihat riwayat kasir
        </RouterLink>
      </form>
    </template>

    <!-- ================= LAYAR KASIR ================= -->
    <template v-else>
      <!-- Bilah sesi -->
      <div class="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-card px-4 py-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2 shrink-0">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:hidden" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <h1 class="truncate text-base font-semibold text-foreground">Kasir {{ sesi.nomor }}</h1>
          </div>
          <p class="truncate text-xs text-muted-foreground">Dibuka {{ formatWaktu(sesi.dibuka_at) }} · {{ sesi.kasir || userStore.user?.name }}</p>
        </div>

        <dl class="order-last grid w-full grid-cols-3 gap-2 sm:order-none sm:w-auto">
          <div class="ringkas">
            <dt>Transaksi</dt>
            <dd>{{ formatAngka(ringkasan?.jumlah_transaksi ?? 0) }}</dd>
          </div>
          <div class="ringkas">
            <dt>Tunai</dt>
            <dd :title="formatRupiah(ringkasan?.total_tunai ?? 0)">
              <span class="sm:hidden">{{ formatRupiahRingkas(ringkasan?.total_tunai ?? 0) }}</span>
              <span class="hidden sm:inline">{{ formatRupiah(ringkasan?.total_tunai ?? 0) }}</span>
            </dd>
          </div>
          <div class="ringkas">
            <dt>QRIS</dt>
            <dd :title="formatRupiah(ringkasan?.total_qris ?? 0)">
              <span class="sm:hidden">{{ formatRupiahRingkas(ringkasan?.total_qris ?? 0) }}</span>
              <span class="hidden sm:inline">{{ formatRupiah(ringkasan?.total_qris ?? 0) }}</span>
            </dd>
          </div>
        </dl>

        <div class="flex shrink-0 gap-2">
          <button type="button" class="tombol-aksi px-3" aria-label="Transaksi sesi ini" @click="bukaTransaksi">
            <ReceiptText class="h-4 w-4" />
            <span class="hidden sm:inline">Transaksi</span>
          </button>
          <button
            type="button"
            class="tombol-aksi border-red-200 px-3 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            @click="bukaTutup"
          >
            <Lock class="h-4 w-4" /> Tutup Kasir
          </button>
        </div>
      </div>

      <div class="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <!-- Kiri: cari barang / jasa -->
        <section class="flex min-h-0 flex-col rounded-xl border border-border bg-card">
          <div class="space-y-3 border-b border-border p-3 sm:p-4">
            <div class="relative">
              <ScanBarcode class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref="inputCariRef"
                v-model="kataKunci"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                placeholder="Scan barcode atau cari nama/kode…"
                aria-label="Scan barcode atau cari barang"
                class="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
                @keydown.enter.prevent="onEnterCari"
                @keydown.down.prevent="geserSorot(1)"
                @keydown.up.prevent="geserSorot(-1)"
                @keydown.esc="kataKunci = ''"
              />
              <Loader2 v-if="mencari" class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            </div>

            <div class="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
              <button
                v-for="t in TABS"
                :key="t.kode"
                type="button"
                role="tab"
                :aria-selected="tab === t.kode"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 font-medium transition-colors"
                :class="tab === t.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                @click="gantiTab(t.kode)"
              >
                <component :is="t.ikon" class="h-4 w-4" /> {{ t.label }}
              </button>
            </div>
          </div>

          <div class="min-h-0 flex-1 p-3 sm:p-4 lg:overflow-y-auto">
            <!-- Tab barang -->
            <template v-if="tab === 'barang'">
              <ul v-if="hasil.length" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                <li v-for="(r, i) in hasil" :key="r.id">
                  <button
                    :id="`hasil-${i}`"
                    type="button"
                    :disabled="r.stok <= 0"
                    class="flex h-full w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
                    :class="[
                      sorot === i ? 'border-green-600 ring-2 ring-green-600/20' : 'border-border',
                      r.stok <= 0 ? 'cursor-not-allowed bg-muted/40 opacity-60' : 'hover:border-green-600/60 hover:bg-muted/40'
                    ]"
                    @click="pilihHasil(r)"
                  >
                    <span class="min-w-0 flex-1">
                      <span class="line-clamp-2 block text-sm font-medium text-foreground">{{ r.nama }}</span>
                      <span class="block truncate text-xs text-muted-foreground">
                        {{ r.satuan || '—' }} · {{ r.kode }}<template v-if="r.merk"> · {{ r.merk }}</template>
                      </span>
                      <span v-if="qtyDiKeranjang(r.id)" class="mt-1 inline-block rounded-full bg-green-100 px-1.5 py-0.5 text-[11px] font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        {{ formatQty(qtyDiKeranjang(r.id)) }} di keranjang
                      </span>
                    </span>
                    <span class="shrink-0 text-right">
                      <span class="block text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(r.harga_jual) }}</span>
                      <span class="block text-[11px] tabular-nums" :class="kelasStok(r)">
                        {{ r.stok <= 0 ? 'Stok habis' : `Stok ${formatQty(r.stok)}` }}
                      </span>
                    </span>
                  </button>
                </li>
              </ul>

              <div v-else-if="sudahCari && kataKunci.trim().length >= 2 && !mencari" class="py-12 text-center">
                <Package class="mx-auto h-10 w-10 text-muted-foreground" />
                <p class="mt-3 font-medium text-foreground">Barang tidak ditemukan</p>
                <p class="mt-1 text-sm text-muted-foreground">Coba kata lain, kode barang, atau scan ulang barcodenya.</p>
              </div>

              <div v-else-if="!mencari" class="py-12 text-center">
                <ScanBarcode class="mx-auto h-10 w-10 text-muted-foreground" />
                <p class="mt-3 font-medium text-foreground">Scan barcode atau ketik nama barang</p>
                <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Ketik minimal 2 huruf untuk mencari. Barang yang barcodenya cocok langsung masuk keranjang.
                </p>
                <p class="mt-4 hidden flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground lg:flex">
                  <span><kbd>F2</kbd> Cari</span>
                  <span><kbd>↑</kbd><kbd>↓</kbd> Pilih hasil</span>
                  <span><kbd>Enter</kbd> Tambah</span>
                  <span><kbd>F9</kbd> Bayar</span>
                </p>
              </div>
            </template>

            <!-- Tab jasa -->
            <template v-else>
              <div v-if="memuatJasa" class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 class="h-4 w-4 animate-spin" /> Memuat jasa...
              </div>
              <div v-else-if="!daftarJasa.length" class="py-12 text-center">
                <Wrench class="mx-auto h-10 w-10 text-muted-foreground" />
                <p class="mt-3 font-medium text-foreground">Belum ada jasa aktif</p>
                <p class="mt-1 text-sm text-muted-foreground">Tambahkan jasa (token listrik, tagihan PDAM, top up game, dll.) di menu Master Jasa.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-if="daftarJasa.length > 8" class="relative">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    v-model="saringJasa"
                    type="search"
                    placeholder="Saring jasa…"
                    aria-label="Saring jasa"
                    class="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
                  />
                </div>
                <section v-for="g in grupJasa" :key="g.kode">
                  <h3 class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <component :is="IKON_KATEGORI[g.kode]" class="h-3.5 w-3.5" /> {{ g.label }}
                  </h3>
                  <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                    <li v-for="j in g.items" :key="j.id">
                      <button
                        type="button"
                        class="flex h-full w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-green-600/60 hover:bg-muted/40"
                        @click="bukaFormJasa(j)"
                      >
                        <span class="min-w-0 flex-1">
                          <span class="block text-sm font-medium text-foreground">{{ j.nama }}</span>
                          <span class="block truncate text-xs text-muted-foreground">
                            {{ j.kode }}<template v-if="j.butuh_no_pelanggan"> · perlu no. pelanggan</template>
                          </span>
                        </span>
                        <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                          <template v-if="j.nominal_bebas">
                            <span class="block text-xs font-medium text-muted-foreground">Nominal bebas</span>
                            <span v-if="j.biaya_admin" class="block text-[11px] font-normal text-muted-foreground">+ admin {{ formatRupiah(j.biaya_admin) }}</span>
                          </template>
                          <template v-else>{{ formatRupiah(j.harga_jual) }}</template>
                        </span>
                      </button>
                    </li>
                  </ul>
                </section>
                <p v-if="!grupJasa.length" class="py-8 text-center text-sm text-muted-foreground">Tidak ada jasa yang cocok.</p>
              </div>
            </template>
          </div>
        </section>

        <!-- Kanan: keranjang -->
        <section id="keranjang" class="flex min-h-0 flex-col rounded-xl border border-border bg-card">
          <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 class="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShoppingCart class="h-4 w-4" /> Keranjang
              <span v-if="keranjang.length" class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{{ formatQty(jumlahItem) }} item</span>
            </h2>
            <button
              v-if="keranjang.length"
              type="button"
              class="text-xs font-medium transition-colors"
              :class="konfirmKosong ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground hover:text-foreground'"
              @click="kosongkan"
            >
              {{ konfirmKosong ? 'Yakin kosongkan?' : 'Kosongkan' }}
            </button>
          </header>

          <ul v-if="keranjang.length" class="min-h-0 flex-1 divide-y divide-border lg:overflow-y-auto">
            <li
              v-for="b in keranjang"
              :id="`baris-${b.kunci}`"
              :key="b.kunci"
              class="px-4 py-3 transition-colors duration-500"
              :class="{ 'bg-green-50 dark:bg-green-950/30': sorotKeranjang === b.kunci, 'bg-red-50/60 dark:bg-red-950/20': galatBaris[b.kunci] }"
            >
              <div class="flex items-start gap-2">
                <div class="min-w-0 flex-1">
                  <p class="break-words text-sm font-medium text-foreground">{{ b.nama }}</p>
                  <p class="text-xs text-muted-foreground tabular-nums">
                    <template v-if="b.jenis === 'barang'">{{ b.satuan || '—' }} · {{ formatRupiah(b.harga) }}</template>
                    <template v-else>
                      <template v-if="b.no_pelanggan">No. {{ b.no_pelanggan }} · </template>
                      <template v-if="b.nominal_bebas">{{ formatRupiah(b.nominal ?? 0) }}<template v-if="b.biaya_admin"> + admin {{ formatRupiah(b.biaya_admin) }}</template></template>
                      <template v-else>{{ formatRupiah(b.harga) }}</template>
                    </template>
                  </p>
                  <p v-if="b.keterangan" class="truncate text-xs text-muted-foreground">{{ b.keterangan }}</p>
                </div>
                <button
                  v-if="b.jenis === 'jasa' && jasaById(b.jasa_id)"
                  type="button"
                  class="ikon-kecil"
                  :aria-label="`Ubah ${b.nama}`"
                  @click="ubahBarisJasa(b)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="ikon-kecil hover:text-red-600 dark:hover:text-red-400" :aria-label="`Hapus ${b.nama}`" @click="hapusBaris(b.kunci)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <div class="mt-2 flex items-center justify-between gap-3">
                <div class="inline-flex items-center rounded-lg border border-border">
                  <button type="button" class="stepper" :disabled="b.qty <= 1" aria-label="Kurangi" @click="ubahQty(b, b.qty - 1)">
                    <Minus class="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    inputmode="numeric"
                    min="1"
                    :value="b.qty"
                    :aria-label="`Jumlah ${b.nama}`"
                    class="h-8 w-12 border-x border-border bg-transparent text-center text-sm tabular-nums text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @change="onQtyInput(b, $event)"
                    @focus="($event.target as HTMLInputElement).select()"
                  />
                  <button type="button" class="stepper" aria-label="Tambah" @click="ubahQty(b, b.qty + 1)">
                    <Plus class="h-3.5 w-3.5" />
                  </button>
                </div>
                <span class="text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(b.harga * b.qty) }}</span>
              </div>

              <p v-if="b.jenis === 'barang' && b.stok !== null && b.stok !== undefined && b.qty >= b.stok" class="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                {{ b.qty > b.stok ? 'Melebihi' : 'Sudah semua' }} stok tersedia ({{ formatQty(b.stok) }}).
              </p>
              <p v-if="galatBaris[b.kunci]" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ galatBaris[b.kunci] }}</p>
            </li>
          </ul>

          <div v-else class="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <ShoppingCart class="h-10 w-10 text-muted-foreground/60" />
            <p class="mt-3 text-sm font-medium text-foreground">Keranjang masih kosong</p>
            <p class="mt-1 text-xs text-muted-foreground">Scan barang atau pilih jasa untuk memulai transaksi.</p>
          </div>

          <footer class="space-y-3 border-t border-border px-4 py-3">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-sm text-muted-foreground">Total</span>
              <span class="text-2xl font-bold tabular-nums text-foreground">{{ formatRupiah(total) }}</span>
            </div>
            <button type="button" class="tombol-utama hidden h-12 w-full text-base lg:inline-flex" :disabled="!keranjang.length" @click="bukaBayar">
              <Wallet class="h-5 w-5" /> Bayar
              <kbd class="ml-1 border-white/40 bg-white/10 text-white">F9</kbd>
            </button>
          </footer>
        </section>
      </div>

      <!-- Bilah bayar (ponsel/tablet) -->
      <div
        v-if="keranjang.length"
        class="sticky bottom-0 z-30 -mx-4 -mb-4 border-t border-border bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 lg:hidden"
      >
        <div class="flex items-center gap-3">
          <a href="#keranjang" class="min-w-0 flex-1">
            <span class="block text-xs text-muted-foreground">{{ formatQty(jumlahItem) }} item · lihat keranjang</span>
            <span class="block truncate text-lg font-bold tabular-nums text-foreground">{{ formatRupiah(total) }}</span>
          </a>
          <button type="button" class="tombol-utama h-11 px-6 text-base" @click="bukaBayar">
            <Wallet class="h-5 w-5" /> Bayar
          </button>
        </div>
      </div>
    </template>

    <!-- ================= FORM JASA ================= -->
    <PanelSheet
      :open="formJasa !== null"
      :title="formJasa?.jasa.nama || 'Jasa'"
      :subtitle="formJasa ? LABEL_KATEGORI_JASA[formJasa.jasa.kategori] : ''"
      @close="formJasa = null"
    >
      <form v-if="formJasa" id="form-jasa" class="space-y-4" @submit.prevent="simpanJasa">
        <p v-if="formJasa.jasa.keterangan" class="text-sm text-muted-foreground">{{ formJasa.jasa.keterangan }}</p>

        <div v-if="formJasa.jasa.butuh_no_pelanggan">
          <label for="no-pelanggan" class="mb-1 block text-sm font-medium text-foreground">{{ LABEL_NO_PELANGGAN[formJasa.jasa.kategori] }}</label>
          <input
            id="no-pelanggan"
            v-model="formJasa.no_pelanggan"
            type="text"
            :inputmode="formJasa.jasa.kategori === 'game' ? 'text' : 'numeric'"
            autocomplete="off"
            maxlength="100"
            class="h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-base tracking-wide text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            :placeholder="formJasa.jasa.kategori === 'game' ? 'Mis. 12345678 (1234)' : 'Mis. 532110987654'"
          />
        </div>

        <div v-if="formJasa.jasa.nominal_bebas">
          <label for="nominal-jasa" class="mb-1 block text-sm font-medium text-foreground">{{ LABEL_NOMINAL[formJasa.jasa.kategori] }}</label>
          <InputRupiah id="nominal-jasa" v-model="formJasa.nominal" besar @enter="simpanJasa" />
          <div v-if="NOMINAL_CEPAT[formJasa.jasa.kategori]" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            <button
              v-for="n in NOMINAL_CEPAT[formJasa.jasa.kategori]"
              :key="n"
              type="button"
              class="tombol-pilihan"
              :class="{ aktif: formJasa.nominal === n }"
              @click="formJasa.nominal = n"
            >
              {{ formatAngka(n) }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-[7rem_1fr] gap-3">
          <div>
            <label for="qty-jasa" class="mb-1 block text-sm font-medium text-foreground">Jumlah</label>
            <input
              id="qty-jasa"
              v-model.number="formJasa.qty"
              type="number"
              inputmode="numeric"
              min="1"
              max="999"
              class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            />
          </div>
          <div>
            <label for="ket-jasa" class="mb-1 block text-sm font-medium text-foreground">Keterangan <span class="font-normal text-muted-foreground">(opsional)</span></label>
            <input
              id="ket-jasa"
              v-model="formJasa.keterangan"
              type="text"
              maxlength="255"
              class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
              placeholder="Mis. atas nama pelanggan"
            />
          </div>
        </div>

        <dl class="space-y-1 rounded-xl bg-muted/60 p-4 text-sm tabular-nums">
          <template v-if="formJasa.jasa.nominal_bebas">
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">{{ LABEL_NOMINAL[formJasa.jasa.kategori] }}</dt><dd class="text-foreground">{{ formatRupiah(formJasa.nominal ?? 0) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted-foreground">Biaya admin</dt><dd class="text-foreground">{{ formatRupiah(formJasa.jasa.biaya_admin) }}</dd></div>
          </template>
          <div v-else class="flex justify-between gap-3"><dt class="text-muted-foreground">Harga</dt><dd class="text-foreground">{{ formatRupiah(formJasa.jasa.harga_jual) }}</dd></div>
          <div v-if="(formJasa.qty || 1) > 1" class="flex justify-between gap-3"><dt class="text-muted-foreground">Jumlah</dt><dd class="text-foreground">× {{ formJasa.qty }}</dd></div>
          <div class="flex justify-between gap-3 border-t border-border pt-2 text-base font-semibold">
            <dt class="text-foreground">Ditagih ke pembeli</dt>
            <dd class="text-foreground">{{ formatRupiah(hargaFormJasa * (formJasa.qty || 1)) }}</dd>
          </div>
        </dl>

        <p class="flex gap-2 text-xs text-muted-foreground">
          <Info class="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Jasa hanya dicatat di sistem ini. Proses pembayaran/top up di aplikasi atau loket penyedia (PLN, PDAM, dll.) secara terpisah.
        </p>
      </form>

      <template v-if="formJasa" #footer>
        <button type="submit" form="form-jasa" class="tombol-utama h-11 w-full" :disabled="!formJasaValid">
          <Plus class="h-4 w-4" /> {{ formJasa.kunciEdit ? 'Simpan perubahan' : 'Tambah ke keranjang' }}
        </button>
      </template>
    </PanelSheet>

    <!-- ================= PEMBAYARAN & STRUK ================= -->
    <PanelSheet
      :open="panelBayar"
      :title="struk ? 'Transaksi berhasil' : 'Pembayaran'"
      :subtitle="struk ? struk.nomor : `${formatQty(jumlahItem)} item`"
      @close="tutupBayar"
    >
      <!-- Struk -->
      <div v-if="struk" class="space-y-4">
        <div class="rounded-xl bg-green-50 p-4 text-center text-green-800 dark:bg-green-950/40 dark:text-green-300">
          <CircleCheck class="mx-auto h-8 w-8" />
          <template v-if="struk.metode === 'tunai'">
            <p class="mt-1 text-sm">Kembalian</p>
            <p class="text-3xl font-bold tabular-nums">{{ formatRupiah(struk.kembalian) }}</p>
          </template>
          <p v-else class="mt-1 text-sm font-medium">Pembayaran QRIS {{ formatRupiah(struk.total) }} tercatat</p>
        </div>
        <div class="rounded-lg border border-border bg-background p-4">
          <StrukPenjualan :penjualan="struk" :nama-koperasi="userStore.koperasi?.nama" :alamat="alamatKoperasi" :kasir="userStore.user?.name" />
        </div>
      </div>

      <!-- Form bayar -->
      <form v-else id="form-bayar" class="space-y-5" @submit.prevent="bayar">
        <div class="rounded-xl bg-muted/60 p-4 text-center">
          <p class="text-sm text-muted-foreground">Total belanja</p>
          <p class="mt-1 text-4xl font-bold tabular-nums text-foreground">{{ formatRupiah(total) }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Metode pembayaran">
          <button
            v-for="m in METODE"
            :key="m.kode"
            type="button"
            role="radio"
            :aria-checked="metode === m.kode"
            class="flex h-14 items-center justify-center gap-2 rounded-lg border-2 text-sm font-semibold transition-colors"
            :class="metode === m.kode ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'border-border text-foreground hover:bg-muted'"
            @click="pilihMetode(m.kode)"
          >
            <component :is="m.ikon" class="h-5 w-5" /> {{ m.label }}
          </button>
        </div>

        <template v-if="metode === 'tunai'">
          <div>
            <label for="uang-diterima" class="mb-1 block text-sm font-medium text-foreground">Uang diterima</label>
            <InputRupiah id="uang-diterima" ref="inputDibayarRef" v-model="dibayar" besar :invalid="dibayar !== null && kembalian < 0" @enter="bayar" />
            <div class="mt-2 grid grid-cols-3 gap-2">
              <button type="button" class="tombol-pilihan" :class="{ aktif: dibayar === total }" @click="dibayar = total">Uang pas</button>
              <button
                v-for="n in pecahanCepat"
                :key="n"
                type="button"
                class="tombol-pilihan tabular-nums"
                :class="{ aktif: dibayar === n }"
                @click="dibayar = n"
              >
                {{ formatAngka(n) }}
              </button>
            </div>
          </div>

          <div
            class="flex items-baseline justify-between gap-3 rounded-xl px-4 py-3"
            :class="dibayar === null ? 'bg-muted/60' : kembalian < 0 ? 'bg-red-50 dark:bg-red-950/40' : 'bg-green-50 dark:bg-green-950/40'"
          >
            <span class="text-sm" :class="dibayar === null ? 'text-muted-foreground' : kembalian < 0 ? 'text-red-700 dark:text-red-300' : 'text-green-800 dark:text-green-300'">
              {{ dibayar !== null && kembalian < 0 ? 'Uang kurang' : 'Kembalian' }}
            </span>
            <span
              class="text-2xl font-bold tabular-nums"
              :class="dibayar === null ? 'text-muted-foreground' : kembalian < 0 ? 'text-red-700 dark:text-red-300' : 'text-green-800 dark:text-green-300'"
            >
              {{ dibayar === null ? '—' : formatRupiah(Math.abs(kembalian)) }}
            </span>
          </div>
        </template>

        <template v-else>
          <p class="flex gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            <QrCode class="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Minta pembeli memindai QRIS koperasi. Pastikan notifikasi pembayaran <b class="tabular-nums">{{ formatRupiah(total) }}</b> sudah masuk
              sebelum menekan tombol konfirmasi.
            </span>
          </p>
          <div>
            <label for="ref-qris" class="mb-1 block text-sm font-medium text-foreground">No. referensi QRIS <span class="font-normal text-muted-foreground">(opsional)</span></label>
            <input
              id="ref-qris"
              v-model="refQris"
              type="text"
              maxlength="100"
              autocomplete="off"
              class="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
              placeholder="Mis. 4 digit terakhir ID transaksi"
            />
          </div>
        </template>

        <p v-if="galatBayar" class="flex gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
          <span>{{ galatBayar }}<template v-if="adaGalatBaris"> Periksa baris yang ditandai di keranjang.</template></span>
        </p>
      </form>

      <template #footer>
        <div v-if="struk" class="grid grid-cols-2 gap-2">
          <button type="button" class="tombol-aksi" @click="cetak(struk)">
            <Printer class="h-4 w-4" /> Cetak
          </button>
          <button ref="tombolBaruRef" type="button" class="tombol-utama" @click="transaksiBaru">
            Transaksi baru <ArrowRight class="h-4 w-4" />
          </button>
        </div>
        <button v-else type="submit" form="form-bayar" class="tombol-utama h-12 w-full text-base" :disabled="!bisaBayar || membayar">
          <Loader2 v-if="membayar" class="h-5 w-5 animate-spin" />
          <template v-if="metode === 'tunai'">Simpan pembayaran</template>
          <template v-else>QRIS sudah diterima</template>
        </button>
      </template>
    </PanelSheet>

    <!-- ================= TRANSAKSI SESI ================= -->
    <PanelSheet
      :open="panelTransaksi"
      title="Transaksi sesi ini"
      :subtitle="sesi ? `${sesi.nomor} · ${formatAngka(ringkasan?.jumlah_transaksi ?? 0)} transaksi` : ''"
      @close="panelTransaksi = false"
    >
      <div v-if="memuatPenjualan && !daftarPenjualan.length" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>
      <template v-else>
        <p v-if="ringkasan?.jumlah_batal" class="mb-3 text-xs text-muted-foreground">{{ ringkasan.jumlah_batal }} transaksi dibatalkan.</p>
        <DaftarPenjualan
          v-if="daftarPenjualan.length"
          :penjualan="daftarPenjualan"
          bisa-batal
          bisa-cetak
          :memproses-id="membatalkanId"
          @batal="batalkan"
          @cetak="cetak"
        />
        <p v-else class="py-14 text-center text-sm text-muted-foreground">Belum ada transaksi di sesi ini.</p>
      </template>

      <template #footer>
        <RouterLink to="/kasir/riwayat" class="tombol-aksi w-full">
          <History class="h-4 w-4" /> Riwayat kasir
        </RouterLink>
      </template>
    </PanelSheet>

    <!-- ================= TUTUP KASIR ================= -->
    <PanelSheet
      :open="panelTutup"
      :title="hasilTutup ? 'Kasir ditutup' : 'Tutup Kasir'"
      :subtitle="(hasilTutup?.sesi.nomor || sesi?.nomor) ?? ''"
      @close="selesaiTutup"
    >
      <div v-if="memuatTutup" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat ringkasan...
      </div>

      <!-- Hasil penutupan -->
      <div v-else-if="hasilTutup" class="space-y-4">
        <div class="rounded-xl p-5 text-center" :class="kotakSelisih(hasilTutup.ringkasan.selisih ?? 0)">
          <p class="text-sm">Selisih kas</p>
          <p class="mt-1 text-3xl font-bold tabular-nums">{{ teksSelisih(hasilTutup.ringkasan.selisih ?? 0) }}</p>
        </div>
        <dl class="space-y-1.5 text-sm">
          <div class="baris"><dt>Uang seharusnya</dt><dd>{{ formatRupiah(hasilTutup.ringkasan.uang_seharusnya) }}</dd></div>
          <div class="baris"><dt>Uang fisik di laci</dt><dd>{{ formatRupiah(hasilTutup.ringkasan.uang_fisik ?? 0) }}</dd></div>
          <div class="baris"><dt>Penjualan tunai</dt><dd>{{ formatRupiah(hasilTutup.ringkasan.total_tunai) }}</dd></div>
          <div class="baris"><dt>Penjualan QRIS</dt><dd>{{ formatRupiah(hasilTutup.ringkasan.total_qris) }}</dd></div>
          <div class="baris"><dt>Transaksi</dt><dd>{{ formatAngka(hasilTutup.ringkasan.jumlah_transaksi) }}<template v-if="hasilTutup.ringkasan.jumlah_batal"> ({{ hasilTutup.ringkasan.jumlah_batal }} batal)</template></dd></div>
        </dl>
        <div v-for="(p, i) in hasilTutup.peringatan" :key="i" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" /> {{ p }}
        </div>
        <p class="text-xs text-muted-foreground">Serahkan uang di laci ke bendahara sesuai prosedur koperasi.</p>
      </div>

      <!-- Form penutupan -->
      <form v-else-if="ringkasan" id="form-tutup" class="space-y-5" @submit.prevent="konfirmasiTutup">
        <dl class="space-y-1.5 text-sm">
          <div class="baris"><dt>Modal awal</dt><dd>{{ formatRupiah(ringkasan.modal_awal) }}</dd></div>
          <div class="baris"><dt>Penjualan tunai</dt><dd>+ {{ formatRupiah(ringkasan.total_tunai) }}</dd></div>
          <div class="flex items-baseline justify-between gap-3 border-t border-border pt-2">
            <dt class="font-medium text-foreground">Uang yang seharusnya ada di laci</dt>
            <dd class="text-lg font-bold tabular-nums text-foreground">{{ formatRupiah(ringkasan.uang_seharusnya) }}</dd>
          </div>
        </dl>
        <dl class="space-y-1.5 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
          <div class="baris"><dt>Penjualan QRIS <span class="text-xs">(tidak di laci)</span></dt><dd>{{ formatRupiah(ringkasan.total_qris) }}</dd></div>
          <div class="baris"><dt>Jumlah transaksi</dt><dd>{{ formatAngka(ringkasan.jumlah_transaksi) }}</dd></div>
          <div class="baris"><dt>Dibatalkan</dt><dd>{{ formatAngka(ringkasan.jumlah_batal) }}</dd></div>
        </dl>

        <p v-if="keranjang.length" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
          Keranjang masih berisi {{ formatQty(jumlahItem) }} item yang belum dibayar — isinya akan dikosongkan.
        </p>

        <div>
          <label for="uang-fisik" class="mb-1 block text-sm font-medium text-foreground">Uang fisik di laci</label>
          <InputRupiah id="uang-fisik" ref="inputFisikRef" v-model="uangFisik" besar placeholder="Hitung lalu isi" />
          <div
            v-if="selisihLive !== null"
            class="mt-2 flex items-baseline justify-between gap-3 rounded-lg px-3 py-2"
            :class="kotakSelisih(selisihLive)"
          >
            <span class="text-sm">Selisih</span>
            <span class="text-lg font-bold tabular-nums">{{ teksSelisih(selisihLive) }}</span>
          </div>
        </div>

        <div>
          <label for="catatan-tutup" class="mb-1 block text-sm font-medium text-foreground">
            Catatan <span class="font-normal text-muted-foreground">{{ selisihLive ? '(jelaskan penyebab selisih)' : '(opsional)' }}</span>
          </label>
          <textarea
            id="catatan-tutup"
            v-model="catatanTutup"
            rows="2"
            maxlength="500"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
            placeholder="Mis. kembalian kurang Rp 500 ke pembeli"
          />
        </div>
      </form>

      <template #footer>
        <button v-if="hasilTutup" type="button" class="tombol-utama h-11 w-full" @click="selesaiTutup">Selesai</button>
        <button v-else-if="!memuatTutup" type="submit" form="form-tutup" class="tombol-utama h-11 w-full" :disabled="uangFisik === null || menutup">
          <Loader2 v-if="menutup" class="h-4 w-4 animate-spin" />
          <Lock v-else class="h-4 w-4" />
          Tutup Kasir
        </button>
      </template>
    </PanelSheet>

    <!-- Salinan struk khusus cetak (hanya tampil saat window.print) -->
    <Teleport to="body">
      <div v-if="strukCetak" id="struk-cetak">
        <StrukPenjualan :penjualan="strukCetak" :nama-koperasi="userStore.koperasi?.nama" :alamat="alamatKoperasi" :kasir="userStore.user?.name" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  Banknote,
  CircleCheck,
  Droplets,
  Gamepad2,
  History,
  Info,
  Loader2,
  Lock,
  Minus,
  Package,
  Pencil,
  Plus,
  PlugZap,
  Printer,
  QrCode,
  Receipt,
  ReceiptText,
  RotateCcw,
  ScanBarcode,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  TriangleAlert,
  Wallet,
  Wrench,
  Zap
} from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import InputRupiah from '@/components/kasir/InputRupiah.vue'
import StrukPenjualan from '@/components/kasir/StrukPenjualan.vue'
import DaftarPenjualan from '@/components/kasir/DaftarPenjualan.vue'
import { teksSelisih } from '@/components/kasir/kasir'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatAngka, formatRupiah, formatRupiahRingkas } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { kasirService, type ItemKeranjangPayload, type Penjualan, type RingkasanSesi, type SesiKasir } from '@/services/kasirService'
import {
  barangService,
  formatQty,
  jasaService,
  LABEL_KATEGORI_JASA,
  pesanGalat,
  type BarangSatuanCari,
  type Jasa,
  type KategoriJasa
} from '@/services/tokoService'

/** Satu baris keranjang (disimpan di sessionStorage). Harga hanya tampilan — backend memakai harga master. */
interface BarisKeranjang {
  kunci: string
  jenis: 'barang' | 'jasa'
  barang_satuan_id?: number
  jasa_id?: number
  nama: string
  satuan: string | null
  /** Harga per unit (jasa nominal bebas: nominal + biaya admin). */
  harga: number
  qty: number
  /** Stok terakhir yang diketahui (barang). */
  stok?: number | null
  nominal_bebas?: boolean
  nominal?: number | null
  biaya_admin?: number
  no_pelanggan?: string | null
  keterangan?: string | null
}

const MODAL_CEPAT = [0, 100000, 200000, 500000]

const TABS: { kode: 'barang' | 'jasa'; label: string; ikon: Component }[] = [
  { kode: 'barang', label: 'Barang', ikon: Package },
  { kode: 'jasa', label: 'Jasa', ikon: Zap }
]

const METODE: { kode: 'tunai' | 'qris'; label: string; ikon: Component }[] = [
  { kode: 'tunai', label: 'Tunai', ikon: Banknote },
  { kode: 'qris', label: 'QRIS', ikon: QrCode }
]

const IKON_KATEGORI: Record<KategoriJasa, Component> = {
  listrik: Zap,
  token_listrik: PlugZap,
  air: Droplets,
  game: Gamepad2,
  tagihan: Receipt,
  lainnya: Wrench
}

const LABEL_NO_PELANGGAN: Record<KategoriJasa, string> = {
  listrik: 'ID pelanggan PLN',
  token_listrik: 'No. meter / ID pelanggan',
  air: 'No. pelanggan PDAM',
  game: 'User ID (dan Zone/Server ID)',
  tagihan: 'No. pelanggan / tagihan',
  lainnya: 'No. pelanggan'
}

const LABEL_NOMINAL: Record<KategoriJasa, string> = {
  listrik: 'Jumlah tagihan',
  token_listrik: 'Nominal token',
  air: 'Jumlah tagihan',
  game: 'Nominal top up',
  tagihan: 'Jumlah tagihan',
  lainnya: 'Nominal'
}

const NOMINAL_CEPAT: Partial<Record<KategoriJasa, number[]>> = {
  token_listrik: [20000, 50000, 100000, 200000, 500000],
  game: [10000, 20000, 50000, 100000, 200000]
}

const { success, warning, info, error: toastError } = useToast()
const userStore = useUserStore()

const alamatKoperasi = computed(() =>
  [userStore.koperasi?.desa_kelurahan, userStore.koperasi?.kabupaten_kota].filter(Boolean).join(', ') || null
)

// ---------- Sesi ----------
const memuat = ref(true)
const galatMuat = ref('')
const sesi = ref<SesiKasir | null>(null)
const ringkasan = ref<RingkasanSesi | null>(null)

/** Ringkasan cadangan bila respons sesi tidak menyertakan `ringkasan`. */
const ringkasanDariSesi = (s: SesiKasir): RingkasanSesi =>
  s.ringkasan ?? {
    jumlah_transaksi: s.jumlah_transaksi ?? 0,
    jumlah_batal: 0,
    total_tunai: s.total_tunai ?? 0,
    total_qris: s.total_qris ?? 0,
    penjualan_barang: 0,
    hpp_barang: 0,
    penjualan_jasa: 0,
    modal_jasa: 0,
    modal_awal: s.modal_awal ?? 0,
    uang_seharusnya: (s.modal_awal ?? 0) + (s.total_tunai ?? 0)
  }

const setSesi = (s: SesiKasir | null) => {
  sesi.value = s
  ringkasan.value = s ? ringkasanDariSesi(s) : null
}

const muatSesi = async (diam = false) => {
  if (!diam) memuat.value = true
  galatMuat.value = ''
  try {
    setSesi(await kasirService.sesiAktif())
    if (sesi.value) siapkanPos()
    else fokusModal()
  } catch (e: any) {
    if (!diam) galatMuat.value = pesanGalat(e, 'Periksa koneksi lalu coba lagi.')
  } finally {
    memuat.value = false
  }
}

// ---------- Buka kasir ----------
const modalAwal = ref<number | null>(null)
const catatanBuka = ref('')
const membuka = ref(false)
const inputModalRef = ref<InstanceType<typeof InputRupiah> | null>(null)

const fokusModal = () => nextTick(() => inputModalRef.value?.focus())

const bukaKasir = async () => {
  if (modalAwal.value === null || membuka.value) return
  membuka.value = true
  try {
    const res = await kasirService.buka(modalAwal.value, catatanBuka.value.trim() || null)
    setSesi(res.data)
    if (res.peringatan?.length) warning('Kasir dibuka dengan catatan', { description: res.peringatan.join(' ') })
    else success('Kasir dibuka', { description: `Modal awal ${formatRupiah(res.data.modal_awal)} tercatat di Kas Kasir.` })
    modalAwal.value = null
    catatanBuka.value = ''
    siapkanPos()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal membuka kasir'))
    // Mungkin sesi sudah terbuka di tab/perangkat lain.
    if (e?.status === 409 || e?.status === 422) muatSesi(true)
  } finally {
    membuka.value = false
  }
}

const siapkanPos = () => {
  if (!jasaDimuat.value) muatJasa()
  fokusCari()
}

// ---------- Pencarian barang ----------
const tab = ref<'barang' | 'jasa'>('barang')
const inputCariRef = ref<HTMLInputElement | null>(null)
const kataKunci = ref('')
const hasil = ref<BarangSatuanCari[]>([])
const mencari = ref(false)
const sudahCari = ref(false)
const sorot = ref(-1)
let timerCari: number | undefined
let urutanCari = 0

const layarLebar = () => window.matchMedia('(min-width: 1024px)').matches

const fokusCari = (pilih = false) =>
  nextTick(() => {
    inputCariRef.value?.focus()
    if (pilih) inputCariRef.value?.select()
  })

watch(kataKunci, (v) => {
  window.clearTimeout(timerCari)
  sorot.value = -1
  const q = v.trim()
  if (q.length < 2) {
    urutanCari++
    hasil.value = []
    sudahCari.value = false
    mencari.value = false
    return
  }
  tab.value = 'barang'
  timerCari = window.setTimeout(() => cariBarang(q), 250)
})

const cariBarang = async (q: string) => {
  const ke = ++urutanCari
  mencari.value = true
  try {
    const r = await barangService.cari({ q, limit: 30 })
    if (ke !== urutanCari) return
    hasil.value = r
    sudahCari.value = true
  } catch (e: any) {
    if (ke === urutanCari) toastError(pesanGalat(e, 'Gagal mencari barang'))
  } finally {
    if (ke === urutanCari) mencari.value = false
  }
}

/** Enter: pilih hasil yang disorot, atau coba barcode persis lalu cari biasa. */
const onEnterCari = async () => {
  window.clearTimeout(timerCari)
  const terpilih = sorot.value >= 0 ? hasil.value[sorot.value] : undefined
  if (terpilih) {
    pilihHasil(terpilih)
    return
  }
  const nilai = kataKunci.value.trim()
  if (!nilai) return
  const ke = ++urutanCari
  mencari.value = true
  try {
    const cocok = await barangService.cari({ barcode: nilai, limit: 5 })
    if (ke !== urutanCari) return
    if (cocok.length === 1) {
      tambahBarang(cocok[0])
      kataKunci.value = ''
      return
    }
    const r = cocok.length > 1 ? cocok : await barangService.cari({ q: nilai, limit: 30 })
    if (ke !== urutanCari) return
    hasil.value = r
    sudahCari.value = true
    if (r.length === 1 && r[0].stok > 0) sorot.value = 0
  } catch (e: any) {
    if (ke === urutanCari) toastError(pesanGalat(e, 'Gagal mencari barang'))
  } finally {
    if (ke === urutanCari) mencari.value = false
  }
}

const geserSorot = (arah: 1 | -1) => {
  if (!hasil.value.length) return
  let i = sorot.value
  // Lewati barang yang stoknya habis.
  for (let n = 0; n < hasil.value.length; n++) {
    i = Math.min(Math.max(i + arah, -1), hasil.value.length - 1)
    if (i === -1 || hasil.value[i].stok > 0) break
  }
  sorot.value = i >= 0 && hasil.value[i].stok > 0 ? i : sorot.value === -1 ? -1 : i
  nextTick(() => document.getElementById(`hasil-${sorot.value}`)?.scrollIntoView({ block: 'nearest' }))
}

const pilihHasil = (r: BarangSatuanCari) => {
  tambahBarang(r)
  // Biarkan hasil tetap tampil (mis. pilih beberapa varian); ketikan berikutnya menimpa kata kunci.
  if (layarLebar()) fokusCari(true)
}

const kelasStok = (r: BarangSatuanCari) => {
  if (r.stok <= 0) return 'text-red-600 dark:text-red-400'
  if (r.stok_minimum && r.stok <= r.stok_minimum) return 'text-amber-700 dark:text-amber-400'
  return 'text-muted-foreground'
}

const gantiTab = (t: 'barang' | 'jasa') => {
  tab.value = t
  if (t === 'jasa' && !jasaDimuat.value) muatJasa()
}

// ---------- Jasa ----------
const daftarJasa = ref<Jasa[]>([])
const memuatJasa = ref(false)
const jasaDimuat = ref(false)
const saringJasa = ref('')

const muatJasa = async () => {
  memuatJasa.value = true
  try {
    daftarJasa.value = await jasaService.list({ is_aktif: true })
    jasaDimuat.value = true
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat daftar jasa'))
  } finally {
    memuatJasa.value = false
  }
}

const grupJasa = computed(() => {
  const q = saringJasa.value.trim().toLowerCase()
  const cocok = daftarJasa.value.filter((j) => !q || j.nama.toLowerCase().includes(q) || j.kode.toLowerCase().includes(q))
  return (Object.keys(LABEL_KATEGORI_JASA) as KategoriJasa[])
    .map((k) => ({ kode: k, label: LABEL_KATEGORI_JASA[k], items: cocok.filter((j) => j.kategori === k) }))
    .filter((g) => g.items.length)
})

const jasaById = (id?: number) => daftarJasa.value.find((j) => j.id === id)

const formJasa = ref<{
  jasa: Jasa
  kunciEdit: string | null
  no_pelanggan: string
  nominal: number | null
  qty: number
  keterangan: string
} | null>(null)

const hargaJasa = (j: Jasa, nominal: number | null | undefined) => (j.nominal_bebas ? (nominal ?? 0) + (j.biaya_admin || 0) : j.harga_jual)

const hargaFormJasa = computed(() => (formJasa.value ? hargaJasa(formJasa.value.jasa, formJasa.value.nominal) : 0))

const formJasaValid = computed(() => {
  const f = formJasa.value
  if (!f) return false
  if (f.jasa.butuh_no_pelanggan && !f.no_pelanggan.trim()) return false
  if (f.jasa.nominal_bebas && !(f.nominal && f.nominal > 0)) return false
  return Number.isInteger(f.qty) && f.qty >= 1 && f.qty <= 999
})

const fokusFormJasa = () =>
  nextTick(() => {
    const el = document.getElementById('no-pelanggan') ?? document.getElementById('nominal-jasa') ?? document.getElementById('qty-jasa')
    el?.focus()
  })

const bukaFormJasa = (j: Jasa) => {
  formJasa.value = { jasa: j, kunciEdit: null, no_pelanggan: '', nominal: null, qty: 1, keterangan: '' }
  fokusFormJasa()
}

const ubahBarisJasa = (b: BarisKeranjang) => {
  const j = jasaById(b.jasa_id)
  if (!j) return
  formJasa.value = {
    jasa: j,
    kunciEdit: b.kunci,
    no_pelanggan: b.no_pelanggan ?? '',
    nominal: b.nominal ?? null,
    qty: b.qty,
    keterangan: b.keterangan ?? ''
  }
  fokusFormJasa()
}

const simpanJasa = () => {
  const f = formJasa.value
  if (!f || !formJasaValid.value) return
  const baris: BarisKeranjang = {
    kunci: f.kunciEdit ?? `j:${f.jasa.id}:${Date.now()}`,
    jenis: 'jasa',
    jasa_id: f.jasa.id,
    nama: f.jasa.nama,
    satuan: null,
    harga: hargaJasa(f.jasa, f.nominal),
    qty: f.qty,
    nominal_bebas: f.jasa.nominal_bebas,
    nominal: f.jasa.nominal_bebas ? f.nominal : null,
    biaya_admin: f.jasa.nominal_bebas ? f.jasa.biaya_admin || 0 : 0,
    no_pelanggan: f.jasa.butuh_no_pelanggan ? f.no_pelanggan.trim() : null,
    keterangan: f.keterangan.trim() || null
  }

  if (f.kunciEdit) {
    keranjang.value = keranjang.value.map((b) => (b.kunci === f.kunciEdit ? baris : b))
  } else {
    // Jasa yang sama tanpa no. pelanggan/nominal/keterangan → gabungkan jumlahnya.
    const sama = keranjang.value.find(
      (b) => b.jenis === 'jasa' && b.jasa_id === baris.jasa_id && !b.no_pelanggan && !baris.no_pelanggan && !b.keterangan && !baris.keterangan && (b.nominal ?? null) === (baris.nominal ?? null)
    )
    if (sama) {
      sama.qty = Math.min(999, sama.qty + baris.qty)
      kilaukan(sama.kunci)
    } else {
      keranjang.value.push(baris)
      kilaukan(baris.kunci)
    }
  }
  formJasa.value = null
  if (layarLebar()) fokusCari()
}

// ---------- Keranjang ----------
const keranjang = ref<BarisKeranjang[]>([])
const sorotKeranjang = ref<string | null>(null)
const galatBaris = ref<Record<string, string>>({})
const konfirmKosong = ref(false)
let timerKilau: number | undefined
let timerKosong: number | undefined

const total = computed(() => keranjang.value.reduce((s, b) => s + b.harga * b.qty, 0))
const jumlahItem = computed(() => keranjang.value.reduce((s, b) => s + b.qty, 0))
const adaGalatBaris = computed(() => Object.keys(galatBaris.value).length > 0)

const qtyDiKeranjang = (barangSatuanId: number) => keranjang.value.find((b) => b.kunci === `b:${barangSatuanId}`)?.qty ?? 0

const kilaukan = (kunci: string) => {
  sorotKeranjang.value = kunci
  window.clearTimeout(timerKilau)
  timerKilau = window.setTimeout(() => (sorotKeranjang.value = null), 900)
  if (layarLebar()) nextTick(() => document.getElementById(`baris-${kunci}`)?.scrollIntoView({ block: 'nearest' }))
}

const tambahBarang = (r: BarangSatuanCari) => {
  if (r.stok <= 0) {
    toastError(`Stok ${r.label} habis`)
    return
  }
  const kunci = `b:${r.id}`
  const ada = keranjang.value.find((b) => b.kunci === kunci)
  if (ada) {
    ada.stok = r.stok
    ada.harga = r.harga_jual
    if (ada.qty + 1 > r.stok) {
      warning(`Stok ${r.label} tinggal ${formatQty(r.stok)}`)
      return
    }
    ada.qty++
  } else {
    keranjang.value.push({
      kunci,
      jenis: 'barang',
      barang_satuan_id: r.id,
      nama: r.nama,
      satuan: r.satuan,
      harga: r.harga_jual,
      qty: 1,
      stok: r.stok
    })
  }
  kilaukan(kunci)
}

const ubahQty = (b: BarisKeranjang, qty: number) => {
  let n = Math.floor(Number(qty) || 0)
  if (n < 1) n = 1
  if (b.jenis === 'jasa') n = Math.min(n, 999)
  if (b.jenis === 'barang' && b.stok !== null && b.stok !== undefined && n > b.stok) {
    warning(`Stok ${b.nama} (${b.satuan || '—'}) tinggal ${formatQty(b.stok)}`)
    n = Math.max(1, Math.floor(b.stok))
  }
  b.qty = n
}

const onQtyInput = (b: BarisKeranjang, e: Event) => {
  const el = e.target as HTMLInputElement
  ubahQty(b, Number(el.value))
  el.value = String(b.qty)
}

const hapusBaris = (kunci: string) => {
  keranjang.value = keranjang.value.filter((b) => b.kunci !== kunci)
}

const kosongkan = () => {
  if (!konfirmKosong.value) {
    konfirmKosong.value = true
    window.clearTimeout(timerKosong)
    timerKosong = window.setTimeout(() => (konfirmKosong.value = false), 3000)
    return
  }
  konfirmKosong.value = false
  keranjang.value = []
  fokusCari()
}

// Simpan keranjang per koperasi agar tidak hilang saat halaman dimuat ulang.
const kunciSimpan = computed(() => `kasir:keranjang:${userStore.koperasi?.id ?? 0}`)

const bacaKeranjang = (): BarisKeranjang[] => {
  try {
    const raw = sessionStorage.getItem(kunciSimpan.value)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data)
      ? data.filter((b: any) => b && typeof b.kunci === 'string' && (b.jenis === 'barang' || b.jenis === 'jasa') && b.qty > 0 && typeof b.harga === 'number')
      : []
  } catch {
    return []
  }
}

watch(
  keranjang,
  (v) => {
    galatBaris.value = {}
    try {
      if (v.length) sessionStorage.setItem(kunciSimpan.value, JSON.stringify(v))
      else sessionStorage.removeItem(kunciSimpan.value)
    } catch {
      // Penyimpanan tidak tersedia (mode privat) — keranjang tetap jalan di memori.
    }
  },
  { deep: true }
)

// ---------- Pembayaran ----------
const panelBayar = ref(false)
const metode = ref<'tunai' | 'qris'>('tunai')
const dibayar = ref<number | null>(null)
const refQris = ref('')
const membayar = ref(false)
const galatBayar = ref('')
const struk = ref<Penjualan | null>(null)
const inputDibayarRef = ref<InstanceType<typeof InputRupiah> | null>(null)
const tombolBaruRef = ref<HTMLButtonElement | null>(null)

const kembalian = computed(() => (dibayar.value ?? 0) - total.value)
const bisaBayar = computed(() => keranjang.value.length > 0 && (metode.value === 'qris' || (dibayar.value !== null && dibayar.value >= total.value)))

/** Pecahan uang terdekat di atas total, mis. 37.500 → 38.000, 40.000, 50.000, 100.000. */
const pecahanCepat = computed(() => {
  const t = total.value
  const set = new Set<number>()
  for (const p of [1000, 5000, 10000, 20000, 50000, 100000]) {
    const v = Math.ceil(t / p) * p
    if (v > t) set.add(v)
  }
  if (set.size < 2) {
    set.add((Math.floor(t / 50000) + 1) * 50000)
    set.add((Math.floor(t / 100000) + 1) * 100000)
  }
  return Array.from(set)
    .sort((a, b) => a - b)
    .slice(0, 5)
})

const bukaBayar = () => {
  if (!keranjang.value.length) return
  struk.value = null
  metode.value = 'tunai'
  dibayar.value = null
  refQris.value = ''
  galatBayar.value = ''
  panelBayar.value = true
  nextTick(() => inputDibayarRef.value?.focus())
}

const pilihMetode = (m: 'tunai' | 'qris') => {
  metode.value = m
  galatBayar.value = ''
  nextTick(() => (m === 'tunai' ? inputDibayarRef.value?.focus() : document.getElementById('ref-qris')?.focus()))
}

const bayar = async () => {
  if (!bisaBayar.value || membayar.value) return
  membayar.value = true
  galatBayar.value = ''
  const baris = [...keranjang.value]
  const items: ItemKeranjangPayload[] = baris.map((b) =>
    b.jenis === 'barang'
      ? { jenis: 'barang', barang_satuan_id: b.barang_satuan_id, qty: b.qty }
      : {
          jenis: 'jasa',
          jasa_id: b.jasa_id,
          qty: b.qty,
          ...(b.nominal_bebas ? { nominal: b.nominal ?? 0 } : {}),
          no_pelanggan: b.no_pelanggan || null,
          keterangan: b.keterangan || null
        }
  )
  try {
    const res = await kasirService.jual({
      metode: metode.value,
      dibayar: metode.value === 'tunai' ? dibayar.value : null,
      ref_qris: metode.value === 'qris' ? refQris.value.trim() || null : null,
      items
    })
    struk.value = res.data
    if (res.ringkasan) ringkasan.value = res.ringkasan
    keranjang.value = []
    kataKunci.value = ''
    nextTick(() => tombolBaruRef.value?.focus())
  } catch (e: any) {
    const pesan = pesanGalat(e, 'Gagal menyimpan transaksi')
    galatBayar.value = pesan
    // Tandai baris keranjang yang bermasalah (items.N.*), mis. stok kurang / no. pelanggan kosong.
    const errs: Record<string, string[]> = e?.data?.errors ?? {}
    const tanda: Record<string, string> = {}
    for (const [k, v] of Object.entries(errs)) {
      const m = /^items\.(\d+)/.exec(k)
      const b = m ? baris[Number(m[1])] : undefined
      if (b && !tanda[b.kunci]) tanda[b.kunci] = Array.isArray(v) ? v[0] : String(v)
    }
    // Set setelah watcher keranjang (yang mengosongkan galat) tidak terpicu lagi.
    galatBaris.value = tanda
    toastError('Transaksi belum tersimpan', { description: pesan })
  } finally {
    membayar.value = false
  }
}

const transaksiBaru = () => {
  struk.value = null
  panelBayar.value = false
  keranjang.value = []
  kataKunci.value = ''
  hasil.value = []
  tab.value = 'barang'
  fokusCari()
}

const tutupBayar = () => {
  if (struk.value) transaksiBaru()
  else panelBayar.value = false
}

// ---------- Cetak struk ----------
const strukCetak = ref<Penjualan | null>(null)

const selesaiCetak = () => document.body.classList.remove('cetak-struk')

const cetak = async (p: Penjualan) => {
  strukCetak.value = p
  await nextTick()
  document.body.classList.add('cetak-struk')
  window.addEventListener('afterprint', selesaiCetak, { once: true })
  window.print()
}

// ---------- Transaksi sesi ----------
const panelTransaksi = ref(false)
const daftarPenjualan = ref<Penjualan[]>([])
const memuatPenjualan = ref(false)
const membatalkanId = ref<number | null>(null)

const muatPenjualan = async () => {
  memuatPenjualan.value = true
  try {
    daftarPenjualan.value = await kasirService.penjualan()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat transaksi'))
  } finally {
    memuatPenjualan.value = false
  }
}

const bukaTransaksi = () => {
  panelTransaksi.value = true
  daftarPenjualan.value = []
  muatPenjualan()
}

const batalkan = async ({ id, alasan }: { id: number; alasan: string }) => {
  membatalkanId.value = id
  try {
    const res = await kasirService.batal(id, alasan)
    if (res.ringkasan) ringkasan.value = res.ringkasan
    success('Transaksi dibatalkan', { description: 'Stok barang sudah dikembalikan.' })
    await muatPenjualan()
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal membatalkan transaksi'))
  } finally {
    membatalkanId.value = null
  }
}

// ---------- Tutup kasir ----------
const panelTutup = ref(false)
const memuatTutup = ref(false)
const uangFisik = ref<number | null>(null)
const catatanTutup = ref('')
const menutup = ref(false)
const hasilTutup = ref<{ sesi: SesiKasir; ringkasan: RingkasanSesi; peringatan: string[] } | null>(null)
const inputFisikRef = ref<InstanceType<typeof InputRupiah> | null>(null)

const selisihLive = computed(() => (uangFisik.value === null ? null : uangFisik.value - (ringkasan.value?.uang_seharusnya ?? 0)))

const kotakSelisih = (n: number) => {
  if (n === 0) return 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
  return n < 0 ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
}

const bukaTutup = async () => {
  panelTutup.value = true
  hasilTutup.value = null
  uangFisik.value = null
  catatanTutup.value = ''
  memuatTutup.value = true
  try {
    // Ambil ringkasan terbaru sebelum menghitung laci.
    const s = await kasirService.sesiAktif()
    if (!s) {
      panelTutup.value = false
      setSesi(null)
      info('Kasir sudah ditutup')
      return
    }
    setSesi(s)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat ringkasan kasir'))
  } finally {
    memuatTutup.value = false
    nextTick(() => inputFisikRef.value?.focus())
  }
}

const konfirmasiTutup = async () => {
  if (uangFisik.value === null || menutup.value) return
  menutup.value = true
  try {
    const res = await kasirService.tutup(uangFisik.value, catatanTutup.value.trim() || null)
    hasilTutup.value = { sesi: res.data, ringkasan: res.ringkasan, peringatan: res.peringatan ?? [] }
    keranjang.value = []
    if (res.peringatan?.length) warning('Kasir ditutup dengan catatan', { description: res.peringatan[0] })
    else success('Kasir ditutup', { description: `Selisih kas: ${teksSelisih(res.ringkasan.selisih ?? 0)}` })
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menutup kasir'))
  } finally {
    menutup.value = false
  }
}

const selesaiTutup = () => {
  panelTutup.value = false
  if (hasilTutup.value) {
    hasilTutup.value = null
    setSesi(null)
    kataKunci.value = ''
    hasil.value = []
    fokusModal()
  }
}

// ---------- Pintasan keyboard ----------
const onKeydown = (e: KeyboardEvent) => {
  if (!sesi.value) return
  const adaPanel = panelBayar.value || panelTransaksi.value || panelTutup.value || formJasa.value !== null
  if (e.key === 'F2') {
    e.preventDefault()
    if (!adaPanel) {
      tab.value = 'barang'
      fokusCari(true)
    }
  } else if (e.key === 'F9') {
    e.preventDefault()
    if (panelBayar.value && !struk.value) bayar()
    else if (!adaPanel && keranjang.value.length) bukaBayar()
  }
}

onMounted(() => {
  keranjang.value = bacaKeranjang()
  window.addEventListener('keydown', onKeydown)
  muatSesi()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('afterprint', selesaiCetak)
  window.clearTimeout(timerCari)
  window.clearTimeout(timerKilau)
  window.clearTimeout(timerKosong)
  selesaiCetak()
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

.tombol-pilihan {
  @apply h-9 truncate rounded-lg border border-border px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted;
}

.tombol-pilihan.aktif {
  @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
}

.ikon-kecil {
  @apply -m-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground;
}

.stepper {
  @apply flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40;
}

.ringkas {
  @apply min-w-0 rounded-lg bg-muted/60 px-3 py-1.5;
}

.ringkas dt {
  @apply text-[11px] text-muted-foreground;
}

.ringkas dd {
  @apply truncate text-sm font-semibold tabular-nums text-foreground;
}

.baris {
  @apply flex justify-between gap-3 text-muted-foreground;
}

.baris dd {
  @apply text-right tabular-nums text-foreground;
}

kbd {
  @apply inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[11px] font-medium text-foreground;
}
</style>

<style>
/* Cetak struk: hanya salinan #struk-cetak yang tampil, dan hanya saat dipicu dari layar kasir. */
#struk-cetak {
  display: none;
}

@media print {
  @page {
    margin: 4mm;
  }

  body.cetak-struk > *:not(#struk-cetak) {
    display: none !important;
  }

  body.cetak-struk {
    background: #fff !important;
  }

  body.cetak-struk #struk-cetak {
    display: block;
    width: 72mm;
    margin: 0 auto;
    font-size: 11px;
  }

  body.cetak-struk #struk-cetak,
  body.cetak-struk #struk-cetak * {
    color: #000 !important;
    background: transparent !important;
    border-color: #000 !important;
  }
}
</style>
