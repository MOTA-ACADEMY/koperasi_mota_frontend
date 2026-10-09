import {
  BookOpen,
  BookText,
  Circle,
  FileStack,
  FolderTree,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Network,
  PiggyBank,
  Scale,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  type LucideIcon
} from 'lucide-vue-next'

/**
 * Ikon menu disimpan di DB sebagai nama (rbac_menu.icon). Daftar ini sengaja eksplisit —
 * mengimpor seluruh lucide akan membengkakkan bundel. Tambahkan di sini bila menambah
 * menu baru di MenuCatalog backend dengan ikon lain.
 */
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  BookText,
  FileStack,
  FolderTree,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Network,
  PiggyBank,
  Scale,
  ShieldCheck,
  Tags,
  UserCog,
  Users
}

export function menuIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Circle
}
