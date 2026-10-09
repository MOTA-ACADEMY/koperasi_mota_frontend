import { defineStore } from 'pinia'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PieChart,
  FileText,
  Settings,
  Wallet,
  TrendingUp,
  Building,
  UserCheck,
  Calculator,
  ShoppingCart,
  Archive,
  Bell,
  Mail,
  Calendar,
  Globe,
  Shield,
  Database,
  BarChart,
  DollarSign,
  Package,
  Truck,
  Clock,
  Target,
  Award,
  Bookmark,
  Palette,
  Code,
  MessageSquare,
  Table,
  Layout,
  Square,
  PiggyBank,
  BookOpen,
  Tags,
  FolderTree,
  Network,
  Scale,
  FileStack,
  BookText,
  MapPinned,
  Landmark,
  UserCog
} from 'lucide-vue-next'

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
    navigationItems: [
      { id: 'overview', name: 'Overview', type: 'header' },
      { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'New' },
      { id: 'analytics', name: 'Analytics', path: '/analytics', icon: PieChart },
      { id: 'reports', name: 'Reports', path: '/reports', icon: FileText },
      { id: 'components', name: 'Components', path: '/components', icon: FileText },

      { id: 'koperasi', name: 'Koperasi', type: 'header' },
      { id: 'koperasi-profil', name: 'Profil Koperasi', path: '/koperasi/profil', icon: Landmark },
      { id: 'koperasi-pengguna', name: 'Pengguna', path: '/koperasi/pengguna', icon: UserCog },
      { id: 'management', name: 'Management', type: 'header' },
      { id: 'members', name: 'Anggota', path: '/members', icon: Users, badge: '2.1K' },
      { id: 'kolektor', name: 'Master Kolektor', path: '/kolektor', icon: MapPinned },
      { id: 'simpanan-pokok', name: 'Simpanan Pokok', path: '/simpanan/pokok', icon: PiggyBank },
      { id: 'simpanan-wajib', name: 'Simpanan Wajib', path: '/simpanan/wajib', icon: PiggyBank },
      { id: 'simpanan-sukarela', name: 'Simpanan Sukarela', path: '/simpanan/sukarela', icon: PiggyBank },
      { id: 'accounts', name: 'Accounts', path: '/accounts', icon: CreditCard },
      { id: 'loans', name: 'Loans', path: '/loans', icon: Wallet, badge: '45' },
      { id: 'transactions', name: 'Transactions', path: '/transactions', icon: TrendingUp },

      { id: 'akuntansi', name: 'Akuntansi', type: 'header' },
      { id: 'akuntansi-buku-periode', name: 'Buku Periode', path: '/akuntansi/buku-periode', icon: BookOpen },
      { id: 'akuntansi-tipe-akun', name: 'Tipe Akun', path: '/akuntansi/tipe-akun', icon: Tags },
      { id: 'akuntansi-kategori-akun', name: 'Kategori Akun', path: '/akuntansi/kategori-akun', icon: FolderTree },
      { id: 'akuntansi-master-akun', name: 'Master Akun', path: '/akuntansi/master-akun', icon: Network },
      { id: 'akuntansi-saldo-awal', name: 'Saldo Awal', path: '/akuntansi/saldo-awal', icon: Scale },
      { id: 'akuntansi-jurnal-memorial', name: 'Jurnal Memorial', path: '/akuntansi/jurnal-memorial', icon: FileStack },
      { id: 'akuntansi-jurnal-umum', name: 'Jurnal Umum', path: '/akuntansi/jurnal-umum', icon: BookText },

      { id: 'operations', name: 'Operations', type: 'header' },
      { id: 'branches', name: 'Branches', path: '/branches', icon: Building },
      { id: 'staff', name: 'Staff', path: '/staff', icon: UserCheck },
      { id: 'calculator', name: 'Calculator', path: '/calculator', icon: Calculator },
      { id: 'inventory', name: 'Inventory', path: '/inventory', icon: Package },
      { id: 'shipping', name: 'Shipping', path: '/shipping', icon: Truck },
      
      { id: 'finance', name: 'Finance', type: 'header' },
      { id: 'revenue', name: 'Revenue', path: '/revenue', icon: DollarSign },
      { id: 'expenses', name: 'Expenses', path: '/expenses', icon: ShoppingCart },
      { id: 'budgets', name: 'Budgets', path: '/budgets', icon: Target },
      { id: 'investments', name: 'Investments', path: '/investments', icon: BarChart },
      
      { id: 'communication', name: 'Communication', type: 'header' },
      { id: 'messages', name: 'Messages', path: '/messages', icon: Mail, badge: '12' },
      { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, badge: '5' },
      { id: 'calendar', name: 'Calendar', path: '/calendar', icon: Calendar },
      { id: 'announcements', name: 'Announcements', path: '/announcements', icon: Globe },
      
      { id: 'tools', name: 'Tools & Utilities', type: 'header' },
      { id: 'backup', name: 'Backup', path: '/backup', icon: Archive },
      { id: 'security', name: 'Security', path: '/security', icon: Shield },
      { id: 'database', name: 'Database', path: '/database', icon: Database },
      { id: 'scheduler', name: 'Scheduler', path: '/scheduler', icon: Clock },
      { id: 'achievements', name: 'Achievements', path: '/achievements', icon: Award },
      { id: 'bookmarks', name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
      
      { id: 'system', name: 'System', type: 'header' },
      { id: 'components', name: 'Components', path: '/components', icon: Palette, badge: 'Demo' },
      { id: 'datatable-demo', name: 'DataTable Demo', path: '/datatable-demo', icon: Table, badge: 'New' },
      { id: 'custom-row-example', name: 'Custom Rows', path: '/custom-row-example', icon: Layout, badge: 'Demo' },
      { id: 'lazy-datatable', name: 'Lazy Loading', path: '/lazy-datatable', icon: Database, badge: 'Performance' },
      { id: 'dialog-demo', name: 'Dialog Demo', path: '/dialog-demo', icon: Square, badge: 'Interactive' },
      { id: 'api-examples', name: 'API Examples', path: '/api-examples', icon: Code, badge: 'New' },
      { id: 'toast-demo', name: 'Toast Demo', path: '/toast-demo', icon: MessageSquare, badge: 'Vue' },
      { id: 'settings', name: 'Settings', path: '/settings', icon: Settings }
    ] as NavigationItem[]
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
