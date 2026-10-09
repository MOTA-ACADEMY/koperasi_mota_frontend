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
          component: () => import('../views/koperasi/ProfilKoperasiView.vue')
        },
        {
          path: '/koperasi/pengguna',
          name: 'koperasi-pengguna',
          component: () => import('../views/koperasi/PenggunaKoperasiView.vue')
        },
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
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
              component: () => import('../views/master-data/members/index.vue') // Placeholder
            },
            {
              path: 'add',
              name: 'add-member',
              component: () => import('../views/master-data/members/add.vue')
            },
            {
              path: ':id',
              name: 'member-detail',
              component: () => import('../views/master-data/members/detail.vue')
            }
          ]
        },
        {
          path: '/kolektor',
          children: [
            {
              path: '',
              name: 'kolektor',
              component: () => import('../views/master-data/kolektor/index.vue')
            },
            {
              path: 'tambah',
              name: 'kolektor-tambah',
              component: () => import('../views/master-data/kolektor/form.vue')
            },
            {
              path: ':id/edit',
              name: 'kolektor-edit',
              component: () => import('../views/master-data/kolektor/form.vue')
            }
          ]
        },
        {
          path: '/akuntansi',
          children: [
            {
              path: 'buku-periode',
              name: 'akuntansi-buku-periode',
              component: () => import('../views/akuntansi/buku-periode/index.vue')
            },
            {
              path: 'tipe-akun',
              name: 'akuntansi-tipe-akun',
              component: () => import('../views/akuntansi/tipe-akun/index.vue')
            },
            {
              path: 'kategori-akun',
              name: 'akuntansi-kategori-akun',
              component: () => import('../views/akuntansi/kategori-akun/index.vue')
            },
            {
              path: 'master-akun',
              name: 'akuntansi-master-akun',
              component: () => import('../views/akuntansi/master-akun/index.vue')
            },
            {
              path: 'saldo-awal',
              name: 'akuntansi-saldo-awal',
              component: () => import('../views/akuntansi/saldo-awal/index.vue')
            },
            {
              path: 'jurnal-memorial',
              name: 'akuntansi-jurnal-memorial',
              component: () => import('../views/akuntansi/jurnal-memorial/index.vue')
            },
            {
              path: 'jurnal-umum',
              name: 'akuntansi-jurnal-umum',
              component: () => import('../views/akuntansi/jurnal-umum/index.vue')
            }
          ]
        },
        {
          path: '/simpanan',
          children: [
            {
              path: 'pokok',
              name: 'simpanan-pokok',
              component: () => import('../views/simpanan/pokok/index.vue')
            },
            {
              path: 'wajib',
              name: 'simpanan-wajib',
              component: () => import('../views/simpanan/wajib/index.vue')
            },
            {
              path: 'sukarela',
              name: 'simpanan-sukarela',
              component: () => import('../views/simpanan/sukarela/index.vue')
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
          component: () => import('../views/master-data/members/index.vue')
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

  return true
})

export default router
