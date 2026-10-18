import {
  BadgeCheck,
  BookOpen,
  BookText,
  Circle,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FolderTree,
  HandCoins,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Navigation,
  Network,
  Package,
  PackageCheck,
  PiggyBank,
  ReceiptText,
  Ruler,
  Scale,
  ScanBarcode,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  Tags,
  Truck,
  Undo2,
  UserCog,
  Users,
  Zap,
  type LucideIcon
} from 'lucide-vue-next'

/**
 * Ikon menu disimpan di DB sebagai nama (rbac_menu.icon). Daftar ini sengaja eksplisit —
 * mengimpor seluruh lucide akan membengkakkan bundel. Tambahkan di sini bila menambah
 * menu baru di MenuCatalog backend dengan ikon lain.
 */
const ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  BookOpen,
  BookText,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FolderTree,
  HandCoins,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Navigation,
  Network,
  Package,
  PackageCheck,
  PiggyBank,
  ReceiptText,
  Ruler,
  Scale,
  ScanBarcode,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  Tags,
  Truck,
  Undo2,
  UserCog,
  Users,
  Zap
}

export function menuIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Circle
}
