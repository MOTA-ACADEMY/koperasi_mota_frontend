import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'
import { authService } from '../services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/daftar',
      name: 'daftar-koperasi',
      component: () => import('../views/auth/RegisterKoperasiView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/pilih-koperasi',
      name: 'pilih-koperasi',
      component: () => import('../views/auth/PilihKoperasiView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      // Semua halaman aplikasi butuh login DAN koperasi aktif (data per koperasi).
      meta: { requiresAuth: true, requiresKoperasi: true },
      children: [
        {
          path: '/koperasi/profil',
          name: 'koperasi-profil',
          component: () => import('../views/koperasi/ProfilKoperasiView.vue'),
          meta: { menu: 'koperasi.profil' }
        },
        {
          path: '/koperasi/role',
          name: 'koperasi-role',
          component: () => import('../views/koperasi/RoleKoperasiView.vue'),
          meta: { menu: 'koperasi.role' }
        },
        {
          path: '/tidak-diizinkan',
          name: 'tidak-diizinkan',
          component: () => import('../views/TidakDiizinkanView.vue')
        },
        {
          path: '/koperasi/pengguna',
          name: 'koperasi-pengguna',
          component: () => import('../views/koperasi/PenggunaKoperasiView.vue'),
          meta: { menu: 'koperasi.pengguna' }
        },
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { menu: 'dashboard' }
        },
        {
          path: '/analytics',
          name: 'analytics',
          component: () => import('../views/HelloWorld.vue') // Placeholder
        },
        {
          path: '/members',
          children:[
            {
              path: '',
              name: 'members',
              component: () => import('../views/master-data/members/index.vue'),
              meta: { menu: 'anggota' }
            },
            {
              path: 'add',
              name: 'add-member',
              component: () => import('../views/master-data/members/add.vue'),
              meta: { menu: 'anggota' }
            },
            {
              path: ':id',
              name: 'member-detail',
              component: () => import('../views/master-data/members/detail.vue'),
              meta: { menu: 'anggota' }
            }
          ]
        },
        {
          path: '/kolektor',
          children: [
            {
              path: '',
              name: 'kolektor',
              component: () => import('../views/master-data/kolektor/index.vue'),
              meta: { menu: 'kolektor' }
            },
            {
              path: 'tambah',
              name: 'kolektor-tambah',
              component: () => import('../views/master-data/kolektor/form.vue'),
              meta: { menu: 'kolektor' }
            },
            {
              path: ':id/edit',
              name: 'kolektor-edit',
              component: () => import('../views/master-data/kolektor/form.vue'),
              meta: { menu: 'kolektor' }
            }
          ]
        },
        {
          path: '/akuntansi',
          children: [
            {
              path: 'buku-periode',
              name: 'akuntansi-buku-periode',
              component: () => import('../views/akuntansi/buku-periode/index.vue'),
              meta: { menu: 'akuntansi.buku-periode' }
            },
            {
              path: 'tipe-akun',
              name: 'akuntansi-tipe-akun',
              component: () => import('../views/akuntansi/tipe-akun/index.vue'),
              meta: { menu: 'akuntansi.tipe-akun' }
            },
            {
              path: 'kategori-akun',
              name: 'akuntansi-kategori-akun',
              component: () => import('../views/akuntansi/kategori-akun/index.vue'),
              meta: { menu: 'akuntansi.kategori-akun' }
            },
            {
              path: 'master-akun',
              name: 'akuntansi-master-akun',
              component: () => import('../views/akuntansi/master-akun/index.vue'),
              meta: { menu: 'akuntansi.master-akun' }
            },
            {
              path: 'saldo-awal',
              name: 'akuntansi-saldo-awal',
              component: () => import('../views/akuntansi/saldo-awal/index.vue'),
              meta: { menu: 'akuntansi.saldo-awal' }
            },
            {
              path: 'jurnal-memorial',
              name: 'akuntansi-jurnal-memorial',
              component: () => import('../views/akuntansi/jurnal-memorial/index.vue'),
              meta: { menu: 'akuntansi.jurnal-memorial' }
            },
            {
              path: 'jurnal-umum',
              name: 'akuntansi-jurnal-umum',
              component: () => import('../views/akuntansi/jurnal-umum/index.vue'),
              meta: { menu: 'akuntansi.jurnal-umum' }
            }
          ]
        },
        {
          path: '/simpanan',
          children: [
            {
              path: 'pokok',
              name: 'simpanan-pokok',
              component: () => import('../views/simpanan/pokok/index.vue'),
              meta: { menu: 'simpanan.pokok' }
            },
            {
              path: 'wajib',
              name: 'simpanan-wajib',
              component: () => import('../views/simpanan/wajib/index.vue'),
              meta: { menu: 'simpanan.wajib' }
            },
            {
              path: 'sukarela',
              name: 'simpanan-sukarela',
              component: () => import('../views/simpanan/sukarela/index.vue'),
              meta: { menu: 'simpanan.sukarela' }
            }
          ]
        },
        {
          path: '/components',
          name: 'components',
          component: () => import('../views/ComponentsDemo.vue') // Placeholder
        },
        {
          path: '/accounts',
          name: 'accounts',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/loans',
          name: 'loans',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/transactions',
          name: 'transactions',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/reports',
          name: 'reports',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/members',
          name: 'members',
          component: () => import('../views/master-data/members/index.vue'),
          meta: { menu: 'anggota' }
        },
        {
          path: '/branches',
          name: 'branches',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/staff',
          name: 'staff',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/calculator',
          name: 'calculator',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: '/components',
          name: 'components',
          component: () => import('../views/ComponentsDemo.vue')
        },
        {
          path: '/api-examples',
          name: 'api-examples',
          component: () => import('../views/ApiExamples.vue')
        },
        {
          path: '/toast-demo',
          name: 'toast-demo',
          component: () => import('../views/ToastDemo.vue')
        },
        {
          path: '/datatable-demo',
          name: 'datatable-demo',
          component: () => import('../views/DataTableDemo.vue')
        },
        {
          path: '/custom-row-example',
          name: 'custom-row-example',
          component: () => import('../views/CustomRowExample.vue')
        },
        {
          path: '/lazy-datatable',
          name: 'lazy-datatable',
          component: () => import('../views/LazyDataTableDemo.vue')
        },
        {
          path: '/dialog-demo',
          name: 'dialog-demo',
          component: () => import('../views/DialogDemo.vue')
        },
        {
          path: '/datepicker-demo',
          name: 'datepicker-demo',
          component: () => import('../views/DatePickerDemo.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const isAuthenticated = authService.isAuthenticated()
  const hasKoperasi = !!authService.getKoperasi()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresKoperasi = to.matched.some((record) => record.meta.requiresKoperasi)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

  if (requiresAuth && !isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (requiresKoperasi && !hasKoperasi) {
    return { path: '/pilih-koperasi', query: { redirect: to.fullPath } }
  }

  if (guestOnly && isAuthenticated) {
    return { path: hasKoperasi ? '/dashboard' : '/pilih-koperasi' }
  }

  // RBAC: halaman yang terikat menu hanya boleh dibuka bila menu itu ada di hak akses user.
  const menu = to.meta.menu as string | undefined
  if (menu && hasKoperasi && !bolehAkses(menu)) {
    // Mis. user tanpa menu Dashboard yang baru login → arahkan ke menu pertama miliknya.
    const pertama = authService.getMenu()[0]?.children?.[0]?.path
    if (to.name === 'dashboard' && pertama && pertama !== to.path) {
      return { path: pertama }
    }
    return { name: 'tidak-diizinkan', query: { dari: to.fullPath } }
  }

  return true
})

function bolehAkses(menu: string): boolean {
  return !!authService.getKoperasi()?.akses_penuh || authService.getAkses().includes(menu)
}

export default router
