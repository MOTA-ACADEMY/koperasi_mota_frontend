import { defineStore } from 'pinia'
import type { MenuNode } from '@/services/authService'
import { menuIcon } from '@/lib/menuIcons'

export interface NavigationItem {
  id: string
  name: string
  path?: string
  icon?: any
  badge?: string
  type?: 'header' | 'link'
  children?: NavigationItem[]
}

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    // Diisi dari menu sesi (rbac_menu sesuai hak akses user) lewat setFromMenu().
    navigationItems: [] as NavigationItem[]
  }),

  getters: {
    getNavigationItems: (state) => state.navigationItems,
    
    getItemById: (state) => (id: string) => {
      return state.navigationItems.find(item => item.id === id)
    },
    
    getHeaderItems: (state) => {
      return state.navigationItems.filter(item => item.type === 'header')
    },
    
    getLinkItems: (state) => {
      return state.navigationItems.filter(item => item.type !== 'header')
    }
  },

  actions: {
    /** Ubah pohon menu backend (grup → menu) menjadi daftar header + link untuk Sidebar. */
    setFromMenu(menu: MenuNode[]) {
      this.navigationItems = menu.flatMap((grup) => [
        { id: grup.kode, name: grup.nama, type: 'header' as const },
        ...(grup.children ?? []).map((item) => ({
          id: item.kode,
          name: item.nama,
          path: item.path ?? undefined,
          icon: menuIcon(item.icon),
          type: 'link' as const
        }))
      ])
    },

    addNavigationItem(item: NavigationItem) {
      this.navigationItems.push(item)
    },

    removeNavigationItem(id: string) {
      const index = this.navigationItems.findIndex(item => item.id === id)
      if (index > -1) {
        this.navigationItems.splice(index, 1)
      }
    },

    updateNavigationItem(id: string, updates: Partial<NavigationItem>) {
      const item = this.navigationItems.find(item => item.id === id)
      if (item) {
        Object.assign(item, updates)
      }
    },

    updateBadge(id: string, badge: string | undefined) {
      const item = this.navigationItems.find(item => item.id === id)
      if (item) {
        item.badge = badge
      }
    },

    reorderNavigationItems(newOrder: NavigationItem[]) {
      this.navigationItems = newOrder
    }
  }
})
