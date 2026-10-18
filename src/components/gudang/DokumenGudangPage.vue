<template>
  <div class="space-y-5 p-4 sm:p-6">
    <!-- Kepala halaman -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground">{{ k.judul }}</h1>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">{{ k.deskripsi }}</p>
      </div>
      <button v-if="bolehTulis" type="button" class="tombol-utama" @click="bukaFormBaru()">
        <Plus class="h-4 w-4" /> {{ k.tombolBaru }}
      </button>
    </div>

    <!-- Filter -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 text-sm" role="tablist">
        <button
          v-for="t in tabStatus"
          :key="t.kode"
          type="button"
          role="tab"
          :aria-selected="status === t.kode"
          class="whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="status === t.kode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="gantiStatus(t.kode)"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="relative sm:ml-auto sm:w-64">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="cari"
          type="search"
          placeholder="Cari nomor dokumen…"
          class="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
        />
      </div>
    </div>

    <!-- Daftar -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div v-if="memuat" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>
      <template v-else>
        <table class="hidden w-full text-sm md:table">
          <thead class="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Nomor</th>
              <th class="px-4 py-3 font-medium">Tanggal</th>
              <th class="px-4 py-3 font-medium">{{ k.distributor ? 'Distributor' : jenis === 'adjustment' ? 'Jenis' : 'Keterangan' }}</th>
              <th class="px-4 py-3 text-right font-medium">Item</th>
              <th v-if="k.total" class="px-4 py-3 text-right font-medium">Total</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Dibuat oleh</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="d in daftar" :key="d.id" class="cursor-pointer transition-colors hover:bg-muted/40" @click="bukaDetail(d.id)">
              <td class="px-4 py-3 font-medium text-foreground">{{ d.nomor }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ formatTanggal(d.tanggal) }}</td>
              <td class="max-w-[16rem] truncate px-4 py-3 text-foreground">{{ ringkasBaris(d) }}</td>
              <td class="px-4 py-3 text-right tabular-nums text-foreground">{{ d.jumlah_item }}</td>
              <td v-if="k.total" class="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{{ formatRupiah(d.total || 0) }}</td>
              <td class="px-4 py-3"><span class="badge" :class="KELAS_STATUS_DOKUMEN[d.status]">{{ LABEL_STATUS_DOKUMEN[d.status] }}</span></td>
              <td class="px-4 py-3 text-muted-foreground">{{ d.pembuat || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <ul class="divide-y divide-border md:hidden">
          <li v-for="d in daftar" :key="d.id">
            <button type="button" class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40" @click="bukaDetail(d.id)">
              <span class="min-w-0">
                <span class="block text-sm font-medium text-foreground">{{ d.nomor }}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ formatTanggal(d.tanggal) }} · {{ ringkasBaris(d) }} · {{ d.jumlah_item }} item</span>
              </span>
              <span class="shrink-0 text-right">
                <span v-if="k.total" class="block text-sm font-semibold tabular-nums text-foreground">{{ formatRupiah(d.total || 0) }}</span>
                <span class="badge mt-1" :class="KELAS_STATUS_DOKUMEN[d.status]">{{ LABEL_STATUS_DOKUMEN[d.status] }}</span>
              </span>
            </button>
          </li>
        </ul>

        <div v-if="!daftar.length" class="px-4 py-14 text-center">
          <component :is="k.ikon" class="mx-auto h-9 w-9 text-muted-foreground/60" />
          <p class="mt-2 text-sm text-muted-foreground">{{ status === 'draft' ? 'Tidak ada dokumen yang menunggu persetujuan.' : 'Belum ada dokumen.' }}</p>
        </div>

        <div v-if="meta.last_page > 1" class="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span class="text-muted-foreground">Halaman {{ meta.current_page }} dari {{ meta.last_page }}</span>
          <div class="flex gap-2">
            <button type="button" class="tombol-kecil" :disabled="meta.current_page <= 1" @click="muat(meta.current_page - 1)">Sebelumnya</button>
            <button type="button" class="tombol-kecil" :disabled="meta.current_page >= meta.last_page" @click="muat(meta.current_page + 1)">Berikutnya</button>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= DETAIL ================= -->
    <PanelSheet :open="detailId !== null" :title="detail?.nomor || k.judul" :subtitle="detail ? formatTanggal(detail.tanggal) : ''" lebar="lebar" @close="tutupDetail">
      <div v-if="memuatDetail" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
      </div>

      <div v-else-if="detail" class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge" :class="KELAS_STATUS_DOKUMEN[detail.status]">{{ LABEL_STATUS_DOKUMEN[detail.status] }}</span>
          <span v-if="jenis === 'adjustment' && detail.jenis" class="badge bg-muted text-foreground">{{ LABEL_JENIS_ADJ[detail.jenis] }}</span>
        </div>

        <dl class="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          <div v-for="r in infoDetail" :key="r[0]" class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">{{ r[0] }}</dt>
            <dd class="text-right text-foreground sm:text-left">{{ r[1] }}</dd>
          </div>
        </dl>

        <!-- Status persetujuan -->
        <div
          v-if="detail.status !== 'draft' && detail.diproses_at"
          class="rounded-lg px-3 py-2 text-sm"
          :class="detail.status === 'ditolak' ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'"
        >
          {{ detail.status === 'ditolak' ? 'Ditolak' : 'Disetujui' }} oleh {{ detail.pemroses || '—' }} · {{ formatWaktu(detail.diproses_at) }}
          <span v-if="detail.catatan_proses" class="block">“{{ detail.catatan_proses }}”</span>
          <span v-if="detail.status === 'ditolak' && detail.bisa_diubah && bolehTulis" class="block text-xs opacity-80">Perbaiki dokumen lalu simpan untuk mengajukan ulang.</span>
        </div>
        <div v-else-if="detail.status === 'draft'" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Clock class="mt-0.5 h-4 w-4 shrink-0" />
          <span>Menunggu persetujuan. {{ k.efekSetujui }}</span>
        </div>

        <!-- Hasil persetujuan barusan -->
        <div v-if="hasil" class="space-y-2">
          <div v-if="detail.jurnal_id" class="flex gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
            <CircleCheck class="mt-0.5 h-4 w-4 shrink-0" /> Jurnal umum dibuat & diposting otomatis.
          </div>
          <div v-for="(p, i) in hasil.peringatan" :key="i" class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" /> {{ p }}
          </div>
          <div v-if="hasil.harga_berubah?.length" class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm dark:border-sky-900 dark:bg-sky-950/40">
            <p class="font-medium text-sky-900 dark:text-sky-200">Harga beli di master barang diperbarui</p>
            <ul class="mt-1 space-y-0.5 text-sky-800 dark:text-sky-300">
              <li v-for="h in hasil.harga_berubah" :key="h.barang_satuan_id" class="flex justify-between gap-3">
                <span class="truncate">{{ h.nama }}</span>
                <span class="shrink-0 tabular-nums">{{ formatRupiah(h.harga_lama) }} → {{ formatRupiah(h.harga_baru) }}</span>
              </li>
            </ul>
            <p class="mt-1 text-xs text-sky-700 dark:text-sky-400">Harga jual tidak diubah — periksa margin di master barang bila perlu.</p>
          </div>
        </div>

        <!-- Item -->
        <section>
          <h3 class="mb-2 text-sm font-semibold text-foreground">Barang ({{ detail.items?.length || 0 }})</h3>
          <div class="overflow-x-auto rounded-lg border border-border">
            <table class="w-full min-w-[520px] text-sm">
              <thead class="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th class="px-3 py-2 font-medium">Barang</th>
                  <th v-for="c in kolomDetail" :key="c.label" class="px-3 py-2 font-medium" :class="c.kanan ? 'text-right' : ''">{{ c.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="it in detail.items" :key="it.id">
                  <td class="px-3 py-2">
                    <span class="block font-medium text-foreground">{{ it.barang?.nama }}</span>
                    <span class="block text-xs text-muted-foreground">{{ it.barang?.satuan }} · {{ it.barang?.kode }}</span>
                  </td>
                  <td v-for="c in kolomDetail" :key="c.label" class="px-3 py-2" :class="c.kanan ? 'text-right tabular-nums' : ''">
                    <span :class="c.kelas?.(it)">{{ c.nilai(it) }}</span>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="k.total">
                <tr class="border-t border-border">
                  <td class="px-3 py-2 font-semibold text-foreground" :colspan="kolomDetail.length">Total</td>
                  <td class="px-3 py-2 text-right font-semibold tabular-nums text-foreground">{{ formatRupiah(detail.total || 0) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <!-- Persetujuan -->
        <div v-if="detail.status === 'draft' && bolehSetujui" class="space-y-2 rounded-lg border border-border p-3">
          <label for="catatan-proses" class="block text-sm font-medium text-foreground">
            Catatan persetujuan <span class="font-normal text-muted-foreground">(wajib bila menolak)</span>
          </label>
          <textarea
            id="catatan-proses"
            v-model="catatanProses"
            rows="2"
            maxlength="1000"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30"
          />
        </div>
      </div>

      <template v-if="detail && !memuatDetail" #footer>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <template v-if="detail.bisa_diubah && bolehTulis">
            <button type="button" class="tombol-garis text-red-600 dark:text-red-400" :disabled="memproses" @click="hapus">
              <Trash2 class="h-4 w-4" /> Hapus
            </button>
            <button type="button" class="tombol-garis" :disabled="memproses" @click="bukaFormUbah">
              <Pencil class="h-4 w-4" /> Ubah
            </button>
          </template>
          <RouterLink
            v-if="jenis === 'pre-order' && detail.status === 'disetujui' && userStore.can('gudang.purchase-order')"
            :to="{ path: '/gudang/purchase-order', query: { dari_pre: detail.id } }"
            class="tombol-utama"
          >
            <ShoppingCart class="h-4 w-4" /> Buat Purchase Order
          </RouterLink>
          <RouterLink
            v-if="jenis === 'purchase-order' && ['disetujui', 'sebagian'].includes(detail.status) && userStore.can('gudang.receiving')"
            :to="{ path: '/gudang/receiving', query: { dari_po: detail.id } }"
            class="tombol-utama"
          >
            <PackageCheck class="h-4 w-4" /> Terima barang (RO)
          </RouterLink>
          <template v-if="detail.status === 'draft' && bolehSetujui">
            <button type="button" class="tombol-garis text-red-600 dark:text-red-400" :disabled="memproses" @click="tolak">Tolak</button>
            <button type="button" class="tombol-utama" :disabled="memproses" @click="setujui">
              <Loader2 v-if="memproses" class="h-4 w-4 animate-spin" />
              <BadgeCheck v-else class="h-4 w-4" /> Setujui
            </button>
          </template>
        </div>
      </template>
    </PanelSheet>

    <!-- ================= FORM ================= -->
    <PanelSheet :open="formTerbuka" :title="editId ? `Ubah ${editNomor}` : k.tombolBaru" :subtitle="k.judul" lebar="penuh" @close="formTerbuka = false">
      <form id="form-dokumen" class="space-y-5" @submit.prevent="simpan">
        <!-- Header -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-if="jenis === 'adjustment'" class="sm:col-span-2 lg:col-span-3">
            <span class="mb-1 block text-sm font-medium text-foreground">Jenis adjustment</span>
            <div class="grid gap-2 sm:grid-cols-3">
              <button
                v-for="(label, kode) in LABEL_JENIS_ADJ"
                :key="kode"
                type="button"
                class="rounded-lg border p-3 text-left transition-colors"
                :class="form.jenis === kode ? 'border-green-600 bg-green-50/60 ring-2 ring-green-600/20 dark:bg-green-950/30' : 'border-border hover:bg-muted/50'"
                :disabled="baris.length > 0 && form.jenis !== kode && (form.jenis === 'konversi' || kode === 'konversi')"
                @click="form.jenis = kode"
              >
                <span class="block text-sm font-medium text-foreground">{{ label }}</span>
                <span class="mt-0.5 block text-xs text-muted-foreground">{{ PENJELASAN_ADJ[kode] }}</span>
              </button>
            </div>
            <p v-if="baris.length" class="mt-1 text-xs text-muted-foreground">Kosongkan daftar barang untuk berpindah ke/dari jenis konversi.</p>
          </div>

          <div v-if="jenis === 'purchase-order'" class="lg:col-span-1">
            <label class="label" for="f-pre">Dari Pre Order <span class="font-normal text-muted-foreground">(opsional)</span></label>
            <select id="f-pre" v-model="form.pre_order_id" class="masukan" @change="ambilPreOrder">
              <option :value="null">— Tanpa pre order —</option>
              <option v-for="p in opsiPreOrder" :key="p.id" :value="p.id">{{ p.nomor }} · {{ p.distributor || 'tanpa distributor' }}</option>
            </select>
          </div>

          <div v-if="jenis === 'receiving'">
            <label class="label" for="f-po">Dari Purchase Order <span class="font-normal text-muted-foreground">(opsional)</span></label>
            <select id="f-po" v-model="form.purchase_order_id" class="masukan" @change="ambilPo">
              <option :value="null">— Tanpa PO —</option>
              <option v-for="p in opsiPo" :key="p.id" :value="p.id">{{ p.nomor }} · {{ p.distributor }}{{ p.status === 'sebagian' ? ' (sebagian)' : '' }}</option>
            </select>
          </div>

          <div v-if="k.distributor">
            <label class="label" for="f-dist">Distributor<span v-if="k.distributor === 'wajib'" class="text-red-600"> *</span></label>
            <select id="f-dist" v-model="form.distributor_id" class="masukan" :disabled="jenis === 'receiving' && !!form.purchase_order_id">
              <option :value="null">{{ k.distributor === 'wajib' ? '— Pilih distributor —' : '— Belum ditentukan —' }}</option>
              <option v-for="d in opsiDistributor" :key="d.id" :value="d.id">{{ d.nama }}</option>
            </select>
            <p v-if="galat.distributor_id" class="galat">{{ galat.distributor_id }}</p>
          </div>

          <div>
            <label class="label" for="f-tgl">Tanggal</label>
            <input id="f-tgl" v-model="form.tanggal" type="date" class="masukan" required />
          </div>

          <template v-if="jenis === 'receiving'">
            <div>
              <label class="label" for="f-faktur">No. faktur / surat jalan</label>
              <input id="f-faktur" v-model="form.no_faktur" type="text" maxlength="50" class="masukan" />
            </div>
            <div>
              <span class="label">Pembayaran</span>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="p in ['tunai', 'tempo'] as const" :key="p" type="button" class="pilihan" :class="{ 'pilihan-aktif': form.pembayaran === p }" @click="form.pembayaran = p">
                  {{ p === 'tunai' ? 'Tunai' : 'Tempo (utang)' }}
                </button>
              </div>
            </div>
            <div v-if="form.pembayaran === 'tempo'">
              <label class="label" for="f-jt">Jatuh tempo</label>
              <input id="f-jt" v-model="form.jatuh_tempo" type="date" class="masukan" required />
            </div>
          </template>

          <div v-if="jenis === 'retur'">
            <span class="label">Pengembalian dari distributor</span>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="p in ['potong_utang', 'tunai'] as const" :key="p" type="button" class="pilihan" :class="{ 'pilihan-aktif': form.pengembalian === p }" @click="form.pengembalian = p">
                {{ p === 'tunai' ? 'Uang kembali' : 'Potong utang' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Item -->
        <section class="space-y-3">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <h3 class="text-sm font-semibold text-foreground">Barang</h3>
            <p v-if="galat.items" class="galat">{{ galat.items }}</p>
          </div>
          <BarangPicker :sudah-dipilih="baris.map((b) => b.barang.id)" @pilih="tambahBaris" />

          <div v-if="!baris.length" class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {{ jenis === 'receiving' ? 'Pilih PO di atas untuk mengisi barang otomatis, atau cari barang.' : 'Cari atau scan barang untuk menambahkannya.' }}
          </div>

          <ul v-else class="space-y-2">
            <li v-for="(b, i) in baris" :key="b.kunci" class="rounded-lg border border-border p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-foreground">{{ b.barang.nama }} <span class="font-normal text-muted-foreground">· {{ b.barang.satuan }}</span></p>
                  <p class="text-xs text-muted-foreground">
                    Stok {{ formatQty(b.barang.stok) }} · harga beli master {{ formatRupiah(b.barang.harga_beli) }}
                    <template v-if="b.sisa_po != null"> · sisa PO {{ formatQty(b.sisa_po) }}</template>
                  </p>
                </div>
                <button type="button" class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-red-600" :aria-label="`Hapus ${b.barang.nama}`" @click="baris.splice(i, 1)">
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <!-- Konversi: dari → ke -->
                <template v-if="jenis === 'adjustment' && form.jenis === 'konversi'">
                  <div>
                    <label class="label-kecil">Jumlah {{ b.barang.satuan }}</label>
                    <input v-model.number="b.qty" type="number" min="0" step="any" class="masukan" @input="hitungKonversi(b)" />
                  </div>
                  <div>
                    <label class="label-kecil">Jadi satuan</label>
                    <select v-model="b.ke_barang_satuan_id" class="masukan" @change="(b.qtyKeManual = false), hitungKonversi(b)">
                      <option :value="null" disabled>{{ b.opsiKe?.length ? 'Pilih satuan' : 'Tidak ada satuan lain' }}</option>
                      <option v-for="o in b.opsiKe" :key="o.id" :value="o.id">{{ o.satuan }} (isi {{ formatQty(o.isi) }})</option>
                    </select>
                  </div>
                  <div>
                    <label class="label-kecil">Hasil</label>
                    <input v-model.number="b.qty_ke" type="number" min="0" step="any" class="masukan" @input="b.qtyKeManual = true" />
                  </div>
                  <p class="col-span-2 self-end text-xs text-muted-foreground sm:col-span-1">{{ ringkasKonversi(b) }}</p>
                </template>

                <!-- Opname -->
                <template v-else-if="jenis === 'opname'">
                  <div>
                    <label class="label-kecil">Stok sistem</label>
                    <p class="flex h-10 items-center text-sm tabular-nums text-foreground">{{ formatQty(b.stok_sistem ?? b.barang.stok) }}</p>
                  </div>
                  <div>
                    <label class="label-kecil">Stok fisik</label>
                    <input v-model.number="b.stok_fisik" type="number" min="0" step="any" class="masukan" placeholder="Hasil hitung" />
                  </div>
                  <div>
                    <label class="label-kecil">Selisih</label>
                    <p class="flex h-10 items-center text-sm font-semibold tabular-nums" :class="kelasSelisih(selisihOpname(b))">{{ teksSelisih(selisihOpname(b)) }}</p>
                  </div>
                </template>

                <!-- Lainnya -->
                <template v-else>
                  <div>
                    <label class="label-kecil">{{ jenis === 'adjustment' && form.jenis === 'penyesuaian' ? 'Perubahan (+/−)' : 'Jumlah' }}</label>
                    <input v-model.number="b.qty" type="number" step="any" class="masukan" :min="jenis === 'adjustment' && form.jenis === 'penyesuaian' ? undefined : 0" />
                  </div>
                  <div v-if="k.harga">
                    <label class="label-kecil">Harga beli / {{ b.barang.satuan }}</label>
                    <input v-model.number="b.harga" type="number" min="0" step="any" class="masukan" />
                  </div>
                  <div v-if="k.harga">
                    <label class="label-kecil">Subtotal</label>
                    <p class="flex h-10 items-center text-sm font-medium tabular-nums text-foreground">{{ formatRupiah((b.qty || 0) * (b.harga || 0)) }}</p>
                  </div>
                  <div v-if="jenis === 'adjustment' && form.jenis === 'penyesuaian'">
                    <label class="label-kecil">Stok setelah</label>
                    <p class="flex h-10 items-center text-sm tabular-nums" :class="b.barang.stok + (b.qty || 0) < 0 ? 'text-red-600' : 'text-foreground'">{{ formatQty(b.barang.stok + (b.qty || 0)) }}</p>
                  </div>
                </template>
              </div>

              <!-- Perbedaan harga RO vs PO / master -->
              <p v-if="jenis === 'receiving' && catatanHarga(b)" class="mt-2 flex gap-1.5 text-xs text-sky-700 dark:text-sky-400">
                <Info class="mt-0.5 h-3.5 w-3.5 shrink-0" /> {{ catatanHarga(b) }}
              </p>

              <input
                v-model="b.keterangan"
                type="text"
                maxlength="255"
                class="masukan mt-2 h-9"
                :placeholder="jenis === 'retur' ? 'Alasan retur (mis. kemasan rusak, kedaluwarsa)' : 'Keterangan (opsional)'"
              />
              <p v-for="pesan in galatBaris(i)" :key="pesan" class="galat">{{ pesan }}</p>
            </li>
          </ul>
        </section>

        <div>
          <label class="label" for="f-catatan">Catatan</label>
          <textarea id="f-catatan" v-model="form.catatan" rows="2" maxlength="1000" class="masukan h-auto py-2" />
        </div>
      </form>

      <template #footer>
        <div class="flex items-center gap-3">
          <div v-if="k.total" class="min-w-0 flex-1">
            <p class="text-xs text-muted-foreground">{{ baris.length }} barang</p>
            <p class="text-lg font-bold tabular-nums text-foreground">{{ formatRupiah(totalForm) }}</p>
          </div>
          <p v-else class="min-w-0 flex-1 text-xs text-muted-foreground">Disimpan sebagai draft, berlaku setelah disetujui.</p>
          <button type="submit" form="form-dokumen" class="tombol-utama" :disabled="menyimpan || !baris.length">
            <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
            Simpan & ajukan
          </button>
        </div>
      </template>
    </PanelSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  BadgeCheck,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Info,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  Undo2,
  X
} from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'
import BarangPicker from '@/components/gudang/BarangPicker.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { formatRupiah, formatTanggal } from '@/lib/format'
import { formatWaktu } from '@/lib/penagihan'
import { barangService, formatQty, masterService, pesanGalat, type BarangSatuanCari, type Distributor } from '@/services/tokoService'
import {
  KELAS_STATUS_DOKUMEN,
  LABEL_STATUS_DOKUMEN,
  gudangService,
  type Dokumen,
  type HasilSetujui,
  type ItemDokumen,
  type JenisDokumen
} from '@/services/gudangService'

const props = defineProps<{ jenis: JenisDokumen }>()

interface Konfig {
  judul: string
  deskripsi: string
  tombolBaru: string
  menu: string
  ikon: Component
  distributor: 'wajib' | 'opsional' | null
  harga: boolean
  total: boolean
  status: string[]
  efekSetujui: string
}

const KONFIG: Record<JenisDokumen, Konfig> = {
  'pre-order': {
    judul: 'Pre Order',
    deskripsi: 'Daftar kebutuhan barang ke distributor sebelum dibuatkan Purchase Order. Setelah disetujui bisa langsung dijadikan PO.',
    tombolBaru: 'Buat Pre Order',
    menu: 'gudang.pre-order',
    ikon: ClipboardList,
    distributor: 'opsional',
    harga: false,
    total: false,
    status: ['semua', 'draft', 'disetujui', 'selesai', 'ditolak'],
    efekSetujui: 'Setelah disetujui, pre order bisa dibuatkan Purchase Order.'
  },
  'purchase-order': {
    judul: 'Purchase Order',
    deskripsi: 'Pesanan resmi ke distributor. Harga per barang bebas ditentukan — terisi otomatis dari harga beli di master barang.',
    tombolBaru: 'Buat Purchase Order',
    menu: 'gudang.purchase-order',
    ikon: ShoppingCart,
    distributor: 'wajib',
    harga: true,
    total: true,
    status: ['semua', 'draft', 'disetujui', 'sebagian', 'selesai', 'ditolak'],
    efekSetujui: 'Setelah disetujui, barang dari PO ini bisa diterima lewat Receiving Order.'
  },
  receiving: {
    judul: 'Receiving Order',
    deskripsi: 'Penerimaan barang dari distributor. Saat disetujui stok bertambah dan harga beli di master barang mengikuti harga yang diterima.',
    tombolBaru: 'Terima Barang',
    menu: 'gudang.receiving',
    ikon: PackageCheck,
    distributor: 'wajib',
    harga: true,
    total: true,
    status: ['semua', 'draft', 'disetujui', 'ditolak'],
    efekSetujui: 'Saat disetujui: stok bertambah, harga beli master diperbarui bila berbeda, dan jurnal Persediaan / Kas atau Utang diposting.'
  },
  retur: {
    judul: 'Retur ke Distributor',
    deskripsi: 'Pengembalian barang rusak, kedaluwarsa, atau salah kirim ke distributor.',
    tombolBaru: 'Buat Retur',
    menu: 'gudang.retur',
    ikon: Undo2,
    distributor: 'wajib',
    harga: true,
    total: true,
    status: ['semua', 'draft', 'disetujui', 'ditolak'],
    efekSetujui: 'Saat disetujui: stok berkurang dan jurnal Utang/Kas / Persediaan diposting.'
  },
  adjustment: {
    judul: 'Adjustment Stok',
    deskripsi: 'Penyesuaian stok (rusak, hilang, ditemukan), konversi antar satuan (mis. 1 dus → 24 pcs), atau pengisian stok awal.',
    tombolBaru: 'Buat Adjustment',
    menu: 'gudang.adjustment',
    ikon: SlidersHorizontal,
    distributor: null,
    harga: false,
    total: false,
    status: ['semua', 'draft', 'disetujui', 'ditolak'],
    efekSetujui: 'Saat disetujui stok berubah; selisih nilai dijurnal ke Selisih Persediaan (stok awal tidak dijurnal).'
  },
  opname: {
    judul: 'Stok Opname',
    deskripsi: 'Catat hasil hitung fisik. Stok sistem dicatat saat dokumen disimpan; yang diterapkan saat disetujui adalah selisihnya.',
    tombolBaru: 'Buat Stok Opname',
    menu: 'gudang.opname',
    ikon: ClipboardCheck,
    distributor: null,
    harga: false,
    total: false,
    status: ['semua', 'draft', 'disetujui', 'ditolak'],
    efekSetujui: 'Saat disetujui stok disesuaikan dengan selisih hitung dan nilainya dijurnal ke Selisih Persediaan.'
  }
}

const LABEL_TAB: Record<string, string> = {
  semua: 'Semua',
  draft: 'Menunggu',
  disetujui: 'Disetujui',
  sebagian: 'Sebagian',
  selesai: 'Selesai',
  ditolak: 'Ditolak'
}

const LABEL_JENIS_ADJ = { penyesuaian: 'Penyesuaian', konversi: 'Konversi satuan', stok_awal: 'Stok awal' } as const
type JenisAdj = keyof typeof LABEL_JENIS_ADJ
const PENJELASAN_ADJ: Record<JenisAdj, string> = {
  penyesuaian: 'Tambah / kurangi stok (rusak, hilang, ditemukan).',
  konversi: 'Pindahkan stok antar satuan, mis. 1 dus jadi 24 pcs.',
  stok_awal: 'Stok saat mulai memakai sistem. Tidak dijurnal (isi lewat Saldo Awal).'
}

interface BarisForm {
  kunci: number
  barang: BarangSatuanCari
  qty: number | null
  harga: number | null
  keterangan: string
  purchase_order_item_id: number | null
  harga_po: number | null
  sisa_po: number | null
  ke_barang_satuan_id: number | null
  qty_ke: number | null
  qtyKeManual: boolean
  opsiKe: BarangSatuanCari[]
  stok_fisik: number | null
  stok_sistem: number | null
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { success, warning, error: toastError } = useToast()

const k = computed(() => KONFIG[props.jenis])
const bolehTulis = computed(() => userStore.can(k.value.menu))
const bolehSetujui = computed(() => userStore.can('gudang.persetujuan'))
const tabStatus = computed(() => k.value.status.map((kode) => ({ kode, label: LABEL_TAB[kode] })))

// ---------------- Daftar ----------------
const status = ref('semua')
const cari = ref('')
const memuat = ref(true)
const daftar = ref<Dokumen[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
let timerCari: ReturnType<typeof setTimeout> | undefined

const muat = async (page = 1) => {
  memuat.value = true
  try {
    const res = await gudangService.list(props.jenis, { status: status.value, search: cari.value.trim() || undefined, page })
    daftar.value = res.data
    meta.value = res.meta
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat dokumen'))
  } finally {
    memuat.value = false
  }
}

const gantiStatus = (s: string) => {
  status.value = s
  muat()
}

watch(cari, () => {
  clearTimeout(timerCari)
  timerCari = setTimeout(() => muat(), 300)
})

const ringkasBaris = (d: Dokumen) => {
  if (props.jenis === 'adjustment') return d.jenis ? LABEL_JENIS_ADJ[d.jenis] : '—'
  if (k.value.distributor) return d.distributor || '—'
  return d.catatan || '—'
}

// ---------------- Detail ----------------
const detailId = ref<number | null>(null)
const detail = ref<Dokumen | null>(null)
const memuatDetail = ref(false)
const memproses = ref(false)
const catatanProses = ref('')
const hasil = ref<HasilSetujui | null>(null)

const bukaDetail = async (id: number) => {
  detailId.value = id
  detail.value = null
  hasil.value = null
  catatanProses.value = ''
  memuatDetail.value = true
  try {
    detail.value = await gudangService.get(props.jenis, id)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat dokumen'))
    detailId.value = null
  } finally {
    memuatDetail.value = false
  }
}

const tutupDetail = () => {
  detailId.value = null
}

const infoDetail = computed<[string, string][]>(() => {
  const d = detail.value
  if (!d) return []
  const r: [string, string][] = []
  if (k.value.distributor) r.push(['Distributor', d.distributor || '—'])
  if (d.pre_order_nomor) r.push(['Dari pre order', d.pre_order_nomor])
  if (d.purchase_order_nomor) r.push(['Dari PO', d.purchase_order_nomor])
  if (props.jenis === 'receiving') {
    r.push(['No. faktur', d.no_faktur || '—'])
    r.push(['Pembayaran', d.pembayaran === 'tempo' ? `Tempo, jatuh tempo ${formatTanggal(d.jatuh_tempo ?? null)}` : 'Tunai'])
  }
  if (props.jenis === 'retur') r.push(['Pengembalian', d.pengembalian === 'tunai' ? 'Uang kembali' : 'Potong utang'])
  r.push(['Dibuat oleh', d.pembuat || '—'])
  if (d.catatan) r.push(['Catatan', d.catatan])
  return r
})

interface KolomDetail {
  label: string
  kanan?: boolean
  nilai: (it: ItemDokumen) => string
  kelas?: (it: ItemDokumen) => string
}

const kolomDetail = computed<KolomDetail[]>(() => {
  const qty = (label = 'Jumlah'): KolomDetail => ({ label, kanan: true, nilai: (it) => formatQty(it.qty) })
  const ket: KolomDetail = { label: props.jenis === 'retur' ? 'Alasan' : 'Keterangan', nilai: (it) => it.alasan || it.keterangan || '—' }
  const harga: KolomDetail[] = [
    { label: 'Harga', kanan: true, nilai: (it) => formatRupiah(it.harga || 0) },
    { label: 'Subtotal', kanan: true, nilai: (it) => formatRupiah(it.subtotal || 0) }
  ]

  switch (props.jenis) {
    case 'pre-order':
      return [qty(), ket]
    case 'purchase-order':
      return [qty('Dipesan'), { label: 'Diterima', kanan: true, nilai: (it) => formatQty(it.qty_diterima || 0) }, ...harga]
    case 'receiving':
      return [
        qty(),
        {
          label: 'Harga PO',
          kanan: true,
          nilai: (it) => (it.harga_po != null ? formatRupiah(it.harga_po) : '—'),
          kelas: (it) => (it.harga_po != null && it.harga_po !== it.harga ? 'text-sky-700 dark:text-sky-400' : '')
        },
        ...harga
      ]
    case 'retur':
      return [qty(), ket, ...harga]
    case 'adjustment':
      if (detail.value?.jenis === 'konversi') {
        return [
          qty('Dari'),
          { label: 'Menjadi', kanan: true, nilai: (it) => `${formatQty(it.qty_ke || 0)} ${it.ke_barang?.satuan ?? ''}` },
          ket
        ]
      }
      return [{ label: 'Perubahan', kanan: true, nilai: (it) => teksSelisih(it.qty), kelas: (it) => kelasSelisih(it.qty) }, ket]
    case 'opname':
      return [
        { label: 'Stok sistem', kanan: true, nilai: (it) => formatQty(it.stok_sistem || 0) },
        { label: 'Stok fisik', kanan: true, nilai: (it) => formatQty(it.stok_fisik || 0) },
        { label: 'Selisih', kanan: true, nilai: (it) => teksSelisih(it.selisih || 0), kelas: (it) => kelasSelisih(it.selisih || 0) },
        ket
      ]
  }
  return []
})

const teksSelisih = (n: number) => (n > 0 ? `+${formatQty(n)}` : n < 0 ? `−${formatQty(-n)}` : '0')
const kelasSelisih = (n: number) => (n > 0 ? 'text-green-700 dark:text-green-400' : n < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')

const setujui = async () => {
  if (!detail.value) return
  memproses.value = true
  try {
    const res = await gudangService.setujui(props.jenis, detail.value.id, catatanProses.value.trim() || null)
    detail.value = res.data
    hasil.value = res
    if (res.peringatan.length) warning(`${detail.value.nomor} disetujui dengan catatan`, { description: res.peringatan[0] })
    else success(`${detail.value.nomor} disetujui`)
    muat(meta.value.current_page)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menyetujui dokumen'))
  } finally {
    memproses.value = false
  }
}

const tolak = async () => {
  if (!detail.value) return
  if (!catatanProses.value.trim()) {
    toastError('Isi catatan alasan penolakan terlebih dahulu')
    document.getElementById('catatan-proses')?.focus()
    return
  }
  memproses.value = true
  try {
    const res = await gudangService.tolak(props.jenis, detail.value.id, catatanProses.value.trim())
    detail.value = res.data
    success(`${res.data.nomor} ditolak`, { description: 'Pembuat dokumen bisa memperbaikinya lalu mengajukan ulang.' })
    muat(meta.value.current_page)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menolak dokumen'))
  } finally {
    memproses.value = false
  }
}

const hapus = async () => {
  if (!detail.value || !window.confirm(`Hapus ${detail.value.nomor}?`)) return
  memproses.value = true
  try {
    await gudangService.remove(props.jenis, detail.value.id)
    success(`${detail.value.nomor} dihapus`)
    tutupDetail()
    muat(meta.value.current_page)
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal menghapus dokumen'))
  } finally {
    memproses.value = false
  }
}

// ---------------- Form ----------------
const hariIni = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formTerbuka = ref(false)
const editId = ref<number | null>(null)
const editNomor = ref('')
const menyimpan = ref(false)
const galat = reactive<Record<string, string>>({})
const form = reactive({
  tanggal: hariIni(),
  distributor_id: null as number | null,
  catatan: '',
  pre_order_id: null as number | null,
  purchase_order_id: null as number | null,
  no_faktur: '',
  pembayaran: 'tunai' as 'tunai' | 'tempo',
  jatuh_tempo: '',
  pengembalian: 'potong_utang' as 'potong_utang' | 'tunai',
  jenis: 'penyesuaian' as JenisAdj
})
const baris = ref<BarisForm[]>([])
let kunci = 0

const opsiDistributor = ref<Distributor[]>([])
const opsiPreOrder = ref<Dokumen[]>([])
const opsiPo = ref<Dokumen[]>([])

const totalForm = computed(() => baris.value.reduce((n, b) => n + (b.qty || 0) * (b.harga || 0), 0))

const barisBaru = (barang: BarangSatuanCari, isi: Partial<BarisForm> = {}): BarisForm => ({
  kunci: ++kunci,
  barang,
  qty: props.jenis === 'opname' ? null : 1,
  harga: k.value.harga ? barang.harga_beli : null,
  keterangan: '',
  purchase_order_item_id: null,
  harga_po: null,
  sisa_po: null,
  ke_barang_satuan_id: null,
  qty_ke: null,
  qtyKeManual: false,
  opsiKe: [],
  stok_fisik: null,
  stok_sistem: null,
  ...isi
})

const muatOpsi = async () => {
  try {
    if (k.value.distributor && !opsiDistributor.value.length) {
      opsiDistributor.value = await masterService.list<Distributor>('distributor', { is_aktif: true })
    }
    if (props.jenis === 'purchase-order') {
      opsiPreOrder.value = (await gudangService.list('pre-order', { status: 'disetujui' })).data
    }
    if (props.jenis === 'receiving') {
      const [a, b] = await Promise.all([
        gudangService.list('purchase-order', { status: 'disetujui' }),
        gudangService.list('purchase-order', { status: 'sebagian' })
      ])
      opsiPo.value = [...a.data, ...b.data]
    }
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat pilihan'))
  }
}

const resetForm = () => {
  Object.keys(galat).forEach((x) => delete galat[x])
  Object.assign(form, {
    tanggal: hariIni(),
    distributor_id: null,
    catatan: '',
    pre_order_id: null,
    purchase_order_id: null,
    no_faktur: '',
    pembayaran: 'tunai',
    jatuh_tempo: '',
    pengembalian: 'potong_utang',
    jenis: 'penyesuaian'
  })
  baris.value = []
}

const bukaFormBaru = async () => {
  resetForm()
  editId.value = null
  formTerbuka.value = true
  await muatOpsi()
}

const bukaFormUbah = async () => {
  const d = detail.value
  if (!d) return
  resetForm()
  editId.value = d.id
  editNomor.value = d.nomor
  Object.assign(form, {
    tanggal: d.tanggal,
    distributor_id: d.distributor_id ?? null,
    catatan: d.catatan ?? '',
    pre_order_id: d.pre_order_id ?? null,
    purchase_order_id: d.purchase_order_id ?? null,
    no_faktur: d.no_faktur ?? '',
    pembayaran: d.pembayaran ?? 'tunai',
    jatuh_tempo: d.jatuh_tempo ?? '',
    pengembalian: d.pengembalian ?? 'potong_utang',
    jenis: d.jenis ?? 'penyesuaian'
  })
  baris.value = (d.items ?? [])
    .filter((it) => it.barang)
    .map((it) =>
      barisBaru(it.barang!, {
        qty: it.qty,
        harga: it.harga ?? null,
        keterangan: it.alasan ?? it.keterangan ?? '',
        purchase_order_item_id: it.purchase_order_item_id ?? null,
        harga_po: it.harga_po ?? null,
        ke_barang_satuan_id: it.ke_barang_satuan_id ?? null,
        qty_ke: it.qty_ke ?? null,
        qtyKeManual: true,
        stok_fisik: it.stok_fisik ?? null
      })
    )
  if (form.jenis === 'konversi') await Promise.all(baris.value.map(muatOpsiKe))
  detailId.value = null
  formTerbuka.value = true
  await muatOpsi()
  // Sisa PO terkini untuk baris RO (qty yang sedang diubah belum mengurangi sisa).
  if (props.jenis === 'receiving' && form.purchase_order_id) {
    const po = await gudangService.sisaPo(form.purchase_order_id).catch(() => null)
    baris.value.forEach((b) => {
      b.sisa_po = po?.items.find((x) => x.purchase_order_item_id === b.purchase_order_item_id)?.sisa ?? b.sisa_po
    })
  }
}

const tambahBaris = async (barang: BarangSatuanCari) => {
  const ada = baris.value.find((b) => b.barang.id === barang.id && !b.purchase_order_item_id)
  const bolehGanda = props.jenis === 'adjustment' && form.jenis === 'konversi'
  if (ada && !bolehGanda) {
    if (props.jenis === 'opname') {
      warning(`${barang.label} sudah ada di daftar`)
    } else {
      ada.qty = (ada.qty || 0) + 1
    }
    return
  }
  const b = barisBaru(barang)
  baris.value.push(b)
  if (props.jenis === 'adjustment' && form.jenis === 'konversi') await muatOpsiKe(baris.value[baris.value.length - 1])
}

/** Satuan lain dari barang yang sama sebagai tujuan konversi (default: satuan terkecil). */
const muatOpsiKe = async (b: BarisForm) => {
  try {
    const semua = await barangService.cari({ barang_id: b.barang.barang_id, limit: 20 })
    b.opsiKe = semua.filter((o) => o.id !== b.barang.id)
    if (!b.ke_barang_satuan_id && b.opsiKe.length) {
      b.ke_barang_satuan_id = [...b.opsiKe].sort((x, y) => x.isi - y.isi)[0].id
      hitungKonversi(b)
    }
  } catch {
    b.opsiKe = []
  }
}

const hitungKonversi = (b: BarisForm) => {
  const ke = b.opsiKe.find((o) => o.id === b.ke_barang_satuan_id)
  if (!ke || b.qtyKeManual) return
  b.qty_ke = Math.round(((b.qty || 0) * b.barang.isi) / ke.isi * 1000) / 1000
}

const ringkasKonversi = (b: BarisForm) => {
  const ke = b.opsiKe.find((o) => o.id === b.ke_barang_satuan_id)
  if (!ke) return ''
  return `${formatQty(b.qty || 0)} ${b.barang.satuan} → ${formatQty(b.qty_ke || 0)} ${ke.satuan}`
}

const selisihOpname = (b: BarisForm) => (b.stok_fisik == null ? 0 : b.stok_fisik - (b.stok_sistem ?? b.barang.stok))

const catatanHarga = (b: BarisForm) => {
  const h = b.harga ?? 0
  const bagian: string[] = []
  if (b.harga_po != null && Math.abs(h - b.harga_po) >= 0.01) bagian.push(`Berbeda dari harga PO (${formatRupiah(b.harga_po)}).`)
  if (Math.abs(h - b.barang.harga_beli) >= 0.01) bagian.push(`Harga beli master akan diperbarui ${formatRupiah(b.barang.harga_beli)} → ${formatRupiah(h)} saat disetujui.`)
  return bagian.join(' ')
}

/** Isi form PO dari pre order yang disetujui (harga awal = harga beli master). */
const ambilPreOrder = async () => {
  if (!form.pre_order_id) return
  try {
    const pre = await gudangService.get('pre-order', form.pre_order_id)
    if (pre.distributor_id) form.distributor_id = pre.distributor_id
    baris.value = (pre.items ?? []).filter((it) => it.barang).map((it) => barisBaru(it.barang!, { qty: it.qty }))
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat pre order'))
  }
}

/** Isi form RO dari sisa barang PO (jumlah = sisa, harga = harga PO). */
const ambilPo = async () => {
  if (!form.purchase_order_id) {
    baris.value = baris.value.filter((b) => !b.purchase_order_item_id)
    return
  }
  try {
    const po = await gudangService.sisaPo(form.purchase_order_id)
    form.distributor_id = po.distributor_id
    baris.value = po.items
      .filter((it) => it.barang)
      .map((it) =>
        barisBaru(it.barang!, {
          qty: it.sisa,
          harga: it.harga_po,
          harga_po: it.harga_po,
          sisa_po: it.sisa,
          purchase_order_item_id: it.purchase_order_item_id
        })
      )
  } catch (e: any) {
    toastError(pesanGalat(e, 'Gagal memuat PO'))
  }
}

const payload = () => {
  const items = baris.value.map((b) => {
    const dasar = { barang_satuan_id: b.barang.id }
    switch (props.jenis) {
      case 'pre-order':
        return { ...dasar, qty: b.qty, keterangan: b.keterangan || null }
      case 'purchase-order':
        return { ...dasar, qty: b.qty, harga: b.harga }
      case 'receiving':
        return { ...dasar, qty: b.qty, harga: b.harga, purchase_order_item_id: b.purchase_order_item_id }
      case 'retur':
        return { ...dasar, qty: b.qty, harga: b.harga, alasan: b.keterangan || null }
      case 'adjustment':
        return form.jenis === 'konversi'
          ? { ...dasar, qty: b.qty, ke_barang_satuan_id: b.ke_barang_satuan_id, qty_ke: b.qty_ke, keterangan: b.keterangan || null }
          : { ...dasar, qty: b.qty, keterangan: b.keterangan || null }
      case 'opname':
        return { ...dasar, stok_fisik: b.stok_fisik, keterangan: b.keterangan || null }
    }
  })

  const header: Record<string, any> = { tanggal: form.tanggal, catatan: form.catatan || null, items }
  if (k.value.distributor) header.distributor_id = form.distributor_id
  if (props.jenis === 'purchase-order') header.pre_order_id = form.pre_order_id
  if (props.jenis === 'receiving') {
    Object.assign(header, {
      purchase_order_id: form.purchase_order_id,
      no_faktur: form.no_faktur || null,
      pembayaran: form.pembayaran,
      jatuh_tempo: form.pembayaran === 'tempo' ? form.jatuh_tempo || null : null
    })
  }
  if (props.jenis === 'retur') header.pengembalian = form.pengembalian
  if (props.jenis === 'adjustment') header.jenis = form.jenis
  return header
}

const galatBaris = (i: number) =>
  Object.entries(galat)
    .filter(([kunciGalat]) => kunciGalat.startsWith(`items.${i}.`))
    .map(([, pesan]) => pesan)

const simpan = async () => {
  Object.keys(galat).forEach((x) => delete galat[x])
  menyimpan.value = true
  try {
    const dok = editId.value
      ? await gudangService.update(props.jenis, editId.value, payload())
      : await gudangService.create(props.jenis, payload())
    success(`${dok.nomor} disimpan`, { description: 'Menunggu persetujuan admin gudang.' })
    formTerbuka.value = false
    status.value = 'semua'
    await muat()
    bukaDetail(dok.id)
  } catch (e: any) {
    const errs = e?.data?.errors as Record<string, string[]> | undefined
    if (errs) Object.entries(errs).forEach(([kunciGalat, pesan]) => (galat[kunciGalat] = pesan[0]))
    toastError(pesanGalat(e, 'Gagal menyimpan dokumen'))
  } finally {
    menyimpan.value = false
  }
}

// ---------------- Tautan dari halaman lain ----------------
const prosesQuery = async () => {
  const q = route.query
  const ambil = (v: unknown) => (typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null)
  const buka = ambil(q.buka)
  const dariPo = ambil(q.dari_po)
  const dariPre = ambil(q.dari_pre)
  if (!buka && !dariPo && !dariPre) return

  router.replace({ query: {} })
  if (buka) return bukaDetail(buka)
  await bukaFormBaru()
  if (dariPo && props.jenis === 'receiving') {
    form.purchase_order_id = dariPo
    if (!opsiPo.value.some((p) => p.id === dariPo)) opsiPo.value.push({ id: dariPo, nomor: `PO #${dariPo}` } as Dokumen)
    await ambilPo()
  }
  if (dariPre && props.jenis === 'purchase-order') {
    form.pre_order_id = dariPre
    await ambilPreOrder()
  }
}

watch(() => route.query, prosesQuery)

onMounted(async () => {
  await muat()
  prosesQuery()
})
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-utama {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.tombol-garis {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50;
}

.tombol-kecil {
  @apply rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40;
}

.badge {
  @apply inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium;
}

.label {
  @apply mb-1 block text-sm font-medium text-foreground;
}

.label-kecil {
  @apply mb-1 block text-xs text-muted-foreground;
}

.masukan {
  @apply h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60;
}

.pilihan {
  @apply h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted;
}

.pilihan-aktif {
  @apply border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300;
}

.galat {
  @apply mt-1 text-xs text-red-600 dark:text-red-400;
}
</style>
