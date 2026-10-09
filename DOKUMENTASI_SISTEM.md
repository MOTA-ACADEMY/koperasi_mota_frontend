# Dokumentasi Sistem — Koperasi Mota (Frontend)

> Hasil pembelajaran ulang kode frontend. Detail API, skema database, dan aturan bisnis
> lengkap ada di repo backend (`koperasi_mota_backend/DOKUMENTASI_SISTEM.md`).

## 1. Gambaran Umum

Frontend adalah **SPA Vue 3** yang berbicara ke backend Laravel lewat REST API.

```
Browser (Vue SPA, :5173) ──axios + Bearer token──▶ Laravel API (:8000/api) ──▶ MySQL
```

- Base URL API: `import.meta.env.VITE_API_BASE_URL`, fallback `http://localhost:8000/api`
  (`src/lib/api.ts`). Belum ada file `.env.example` di repo ini.
- Backend mengizinkan origin `http://localhost:5173` secara default (CORS).
- Backend & MySQL dijalankan sendiri oleh pemilik proyek (jangan dijalankan oleh agent).

## 2. Tech Stack

| Komponen | Detail |
|---|---|
| Framework | Vue `^3.4` (Composition API, `<script setup lang="ts">`) |
| Build | Vite 5, `vue-tsc` untuk type-check |
| Routing | vue-router 4 (`createWebHistory`) |
| State | Pinia 3 (gabungan gaya setup store & options store) |
| HTTP | axios (instance + `apiService` wrapper) |
| Styling | Tailwind CSS **v4** via `@tailwindcss/vite` + `tw-animate-css`; token warna shadcn (CSS variable HSL) di `src/assets/main.css`; dark mode berbasis class `.dark` |
| UI | Komponen buatan sendiri ala **shadcn/ui** di `src/components/ui` |
| Ikon | `lucide-vue-next` |
| Peta | Leaflet + OpenStreetMap (`src/lib/leaflet-setup.ts`, default center Indonesia) |
| Lainnya | `date-fns`, `@vueform/multiselect`, `class-variance-authority`, `clsx`, `tailwind-merge` |

Alias import: `@` → `src/` (di `vite.config.ts` & `tsconfig.json`).

## 3. Struktur Folder

```
src/
├── main.ts                # createApp + Pinia + Router, userStore.hydrate()
├── App.vue                # <RouterView/> + <Toaster/>, init dark mode
├── lib/
│   ├── api.ts             # axios instance + interceptor + apiService (get/post/put/patch/delete/upload)
│   ├── leaflet-setup.ts   # fix ikon marker Leaflet untuk Vite, konstanta tile OSM
│   └── utils.ts           # cn() (clsx + tailwind-merge)
├── router/index.ts        # semua route + guard auth
├── services/              # 1 file per resource API (lapisan pemanggil HTTP)
│   ├── authService.ts, memberService.ts, kolektorService.ts, simpananService.ts
│   ├── akuntansi/         # bukuPeriode, tipeAkun, kategoriAkun, masterAkun,
│   │                      # saldoAwal, jurnalMemorial, jurnalUmum
│   └── dashboardService.ts, userService.ts   # ⚠ endpoint-nya belum ada di backend
├── stores/                # Pinia: user, members, simpanan, navigation, sidebar,
│                          # darkMode, toast, dashboard (mock), account (mock)
├── composables/           # useToast, useGlobalDialog, useDialogManager, useDashboard
├── components/
│   ├── layout/            # DashboardLayout, Navbar, Sidebar, BottomBar
│   ├── ui/                # Button, Card, Dialog, DataTable, Select, SearchableSelect, ...
│   ├── form/              # AddMemberForm, ContactField, IdCardField
│   ├── map/               # LocationPicker (titik anggota), PolygonAreaPicker (wilayah kolektor)
│   └── member-detail/     # IdentityTab, AccountHistoryTab
└── views/
    ├── LoginView.vue, DashboardView.vue, SettingsView.vue, HomeView.vue
    ├── master-data/members/  (index, add, detail)
    ├── master-data/kolektor/ (index, form)
    ├── simpanan/{pokok,wajib,sukarela}/index.vue
    ├── akuntansi/{buku-periode,tipe-akun,kategori-akun,master-akun,
    │              saldo-awal,jurnal-memorial,jurnal-umum}/index.vue
    └── *Demo.vue, ApiExamples.vue, CustomRowExample.vue, ...  # halaman demo/template
```

Pola data yang dipakai: **View → (Store, opsional) → Service → `apiService` → axios**.
Modul akuntansi & kolektor memanggil service langsung dari view; members & simpanan lewat
Pinia store.

## 4. Autentikasi & Multi-Koperasi

Sistem bersifat SaaS: setiap koperasi adalah tenant terpisah, dan satu user bisa terdaftar di
banyak koperasi (role per koperasi: `admin` / `staf`). Token login terikat ke satu koperasi;
seluruh data yang tampil adalah data koperasi aktif.

1. `LoginView` → `userStore.login()` → `POST /auth/login` → `{ user, token, koperasi, koperasi_list }`.
   - `koperasi` terisi (user hanya punya 1 koperasi) → langsung ke dashboard.
   - `koperasi` null (user punya >1 koperasi) → ke **`/pilih-koperasi`**.
2. `/pilih-koperasi` → `userStore.pilihKoperasi(id)` → `POST /auth/pilih-koperasi` → token baru
   terikat koperasi, lalu halaman dimuat ulang penuh supaya tidak ada data koperasi lama tersisa.
   Klik nama koperasi di Navbar untuk pindah koperasi.
3. `/daftar` → `userStore.registerKoperasi()` → `POST /auth/register-koperasi` (koperasi baru + admin).
4. localStorage: `auth_token`, `user`, `koperasi` (aktif), `koperasi_list`. Dipulihkan saat boot
   oleh `useUserStore().hydrate()`; `userStore.refreshSession()` (`GET /auth/me`) menyinkronkan ulang.
5. Interceptor axios: **401** → hapus sesi, ke `/login`; **403 `code: koperasi_required`** →
   ke `/pilih-koperasi` (token belum terikat atau akses ke koperasi dicabut).
6. Router guard: `meta.requiresAuth` → harus login; `meta.requiresKoperasi` (semua anak
   `/dashboard`) → harus sudah memilih koperasi; `meta.guestOnly` (`/login`, `/daftar`) → hanya tamu.
7. `userStore.isAdmin` = role di koperasi aktif. Halaman Profil (edit) & Pengguna khusus admin
   (backend juga menolak staf dengan 403).
8. Token berlaku 24 jam (setting backend). `authService.refreshToken()` ada, tapi belum
   dipanggil otomatis.

Error dari `apiService` dinormalisasi menjadi `{ message, status, data }` — error validasi
Laravel ada di `err.data.errors.<field>[0]`.

## 5. Routing & Menu

Semua halaman aplikasi adalah anak dari `DashboardLayout` (`/dashboard`), tetapi path
anaknya ditulis absolut (`/members`, `/akuntansi/...`), jadi URL-nya tidak berawalan `/dashboard`.

| Path | View | Status |
|---|---|---|
| `/login` | LoginView | ✅ terhubung API |
| `/daftar` | auth/RegisterKoperasiView | ✅ daftar koperasi baru |
| `/pilih-koperasi` | auth/PilihKoperasiView | ✅ pilih / pindah koperasi |
| `/koperasi/profil`, `/koperasi/pengguna` | koperasi/* | ✅ profil & pengguna koperasi (admin) |
| `/dashboard` | DashboardView | ⚠ data mock (`stores/dashboard.ts`) |
| `/members`, `/members/add`, `/members/:id` | master-data/members | ✅ |
| `/kolektor`, `/kolektor/tambah`, `/kolektor/:id/edit` | master-data/kolektor | ✅ |
| `/simpanan/pokok`, `/simpanan/wajib`, `/simpanan/sukarela` | simpanan/* | ✅ |
| `/akuntansi/buku-periode` … `/akuntansi/jurnal-umum` (7 halaman) | akuntansi/* | ✅ |
| `/accounts`, `/loans`, `/transactions`, `/reports`, `/branches`, `/staff`, `/calculator` | placeholder → DashboardView | ❌ belum dibuat |
| `/components`, `/datatable-demo`, `/dialog-demo`, `/toast-demo`, `/api-examples`, dll. | demo | sisa template |

Menu sidebar didefinisikan di `src/stores/navigation.ts` (`navigationItems`). Banyak item
(Inventory, Revenue, Messages, Backup, dll.) belum punya route.

## 6. Fitur per Modul

### Anggota (`/members`)
- List memakai `DataTable` mode **lazy** (server-side paging/sort/search) via
  `stores/members.ts` → `GET /members` dengan `page`, `rows`, `sortField`, `sortOrder`,
  `globalFilter`, `status`.
- Tambah/Edit: `AddMemberForm` (nama, alamat, titik lokasi via `LocationPicker`, foto,
  daftar kontak, daftar kartu identitas + file scan). Dikirim sebagai **FormData**;
  `kontak` & `kartu_identitas` di-`JSON.stringify`, file scan di `kartu_identitas_files[i]`.
  Update memakai `POST /members/:id` + `_method=PUT`.
- Detail (`/members/:id`): tab identitas & riwayat akun; edit memakai form yang sama.

### Kolektor (`/kolektor`)
- Pilih user (dari `GET /kolektor/user-options`), no HP, keterangan, status aktif.
- **Wilayah** digambar sebagai polygon di `PolygonAreaPicker`, dengan titik anggota aktif
  (`GET /members/map-points`) sebagai referensi. Disimpan sebagai array `{lat,lng}`.

### Simpanan (`/simpanan/pokok|wajib|sukarela`)
- Tiga halaman hampir identik (beda tipe & nominal default, mis. pokok 50.000, wajib 25.000).
- List tagihan per tipe (filter tahun/bulan di sisi klien), ubah status lunas/belum lunas, hapus.
- Generate tagihan massal: pilih periode (tahun-bulan) + anggota aktif + nominal per anggota →
  `POST /simpanan/billings`. Tagihan yang sudah ada untuk periode tsb dilewati backend.

### Akuntansi (`/akuntansi/*`)
| Halaman | Fungsi |
|---|---|
| Buku Periode | CRUD periode, aktifkan, **tutup buku** (otomatis buat periode berikutnya + salin COA + saldo awal) |
| Tipe Akun | CRUD; `kategori` & `final` adalah bawaan sistem |
| Kategori Akun | CRUD; aktiva/kewajiban/ekuitas/pendapatan/beban bawaan sistem |
| Master Akun | COA berbentuk **pohon** (`TreeNode.vue` rekursif), bisa pilih buku periode |
| Saldo Awal | Input saldo bulan pertama per akun Final, verifikasi/buka verifikasi, tampilan matrix semua bulan, generate bulan berikutnya |
| Jurnal Memorial | Template jurnal (kode akun + sisi D/K) |
| Jurnal Umum | Buat jurnal (bisa dari template memorial), cek seimbang di klien (`totalDebit` vs `totalKredit`), posting/unposting, edit/hapus hanya saat draft |

Aturan bisnis detail (validasi seimbang, hanya akun Final, periode aktif, dsb.) ditegakkan di
backend; frontend menampilkan pesan error dari `err.data.errors`.

## 7. Komponen UI Penting

- **`DataTable.vue`** — props: `data`, `columns` (`{key,label,sortable}`), `actions`
  (`{key, icon, variant, disabled(item), handler(item)}`), `searchable`, `pageSize`,
  `lazy`, `totalRecords`, `lazyLoading`. Emit `lazy-load` (`{page, rows, sortField,
  sortOrder, globalFilter, filters}`) bila `lazy=true`. Kustomisasi sel lewat slot
  `#cell-<key>="{ item }"`.
- **Dialog** (`Dialog`, `DialogContent`, `DialogHeader`, …) untuk form tambah/edit & konfirmasi hapus.
- **Toast** — `useToast()` → `success/error/warning/info/loading/promise`, dirender oleh `Toaster.vue`.
- **`SearchableSelect`**, **`Select`**, **`VueSelect`** untuk dropdown.
- Format uang: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.

## 8. Menjalankan

```bash
npm install
# opsional: buat .env dengan VITE_API_BASE_URL=http://localhost:8000/api
npm run dev          # http://localhost:5173
npm run type-check   # vue-tsc --noEmit
npm run build        # vue-tsc && vite build → dist/
```

Backend (`php artisan serve`) dan MySQL harus sudah dinyalakan pemilik proyek agar API bisa diakses.

Akun demo (dari `php artisan db:seed --class=DemoSeeder` di backend), password `demo12345`:
`admin@demo.koperasi.test` (2 koperasi → diminta memilih) dan `staf@demo.koperasi.test` (1 koperasi).

## 9. Catatan Temuan / Hal yang Perlu Diperhatikan

Temuan saat membaca kode — **belum diubah**, hanya dicatat:

1. **Sisa template/demo masih banyak**: halaman demo, `stores/dashboard.ts` & `stores/account.ts`
   berisi data mock, `dashboardService`/`userService` dan beberapa fungsi `authService`
   (forgot/reset password, verify email) memanggil endpoint yang **tidak ada** di backend.
2. **Route ganda**: `/members` (name `members`) dan `/components` (name `components`) didefinisikan
   dua kali di `router/index.ts`. Di vue-router 4 nama yang sama akan menimpa route sebelumnya.
3. **Dependensi React** yang tidak terpakai di proyek Vue: `@radix-ui/react-popover`, `lucide-react`, `sonner`.
4. `tailwind.config.js` bergaya Tailwind v3, sementara proyek memakai Tailwind v4
   (konfigurasi utama sebenarnya ada di `main.css`). `postcss.config.js` kosong.
5. `env.d.ts` belum mendeklarasikan tipe `VITE_API_BASE_URL`; belum ada `.env.example`.
6. Folder `dist/` ikut ter-commit ke git.
7. Simpanan: daftar anggota untuk generate tagihan hanya mengambil **100 anggota aktif pertama**
   (`rows: 100`). Jurnal Umum hanya memuat 50 jurnal (`rows: 50`) tanpa paginasi server.
8. Tiga halaman simpanan adalah duplikasi kode (~580 baris masing-masing) — kandidat dijadikan satu komponen.
9. `AccountHistoryTab` membaca `simpanan_pokok/wajib/sukarela` dari data anggota, padahal
   `MemberResource` backend tidak mengirim field tersebut → tampil 0.
10. Menu sidebar belum disaring berdasarkan role (mis. menu Pengguna tetap tampil untuk staf, halaman menampilkan pesan "khusus admin").
11. `README.md` & `.github/copilot-instructions.md` sudah usang (masih deskripsi template awal).
12. **Komponen `Card` dan `Button` mengabaikan atribut `class`** (`class` dideklarasikan sebagai prop
    sehingga tidak ada di `$attrs`). Akibatnya `<Card class="p-8">` / `<Button class="w-full">` tidak
    berefek — mis. LoginView tanpa padding. Halaman baru memakai wrapper `<div>` sebagai gantinya.
    Memperbaiki komponennya akan mengubah tampilan semua halaman yang sudah ada, jadi perlu dicek bersama.
13. `vue-tsc` (bagian dari `npm run build`) masih gagal karena 26 error tipe lama (mis. halaman
    simpanan, AddMemberForm); `npx vite build` sendiri berhasil.
