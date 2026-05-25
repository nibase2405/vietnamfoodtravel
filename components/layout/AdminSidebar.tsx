import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ConciergeBell,
  HeartPulse,
  Landmark,
  ListOrdered,
  Map,
  MapPinned,
  Megaphone,
  Settings,
  Sparkles,
  Star,
  Trophy,
  Users,
  type LucideIcon
} from "lucide-react";

const items: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "總覽", href: "/admin", Icon: BarChart3 },
  { label: "會員管理", href: "/admin/users", Icon: Users },
  { label: "城市管理", href: "/admin/destinations", Icon: Map },
  { label: "城市攻略", href: "/admin/city-guides", Icon: BookOpen },
  { label: "排行榜管理", href: "/admin/rankings", Icon: Trophy },
  { label: "KOL推薦", href: "/admin/kols", Icon: Sparkles },
  { label: "景點管理", href: "/admin/attractions", Icon: MapPinned },
  { label: "醫療資訊", href: "/admin/medical-clinics", Icon: HeartPulse },
  { label: "行程管理", href: "/admin/tours", Icon: CalendarCheck },
  { label: "服務管理", href: "/admin/services", Icon: ConciergeBell },
  { label: "客製需求", href: "/admin/custom-trip-requests", Icon: CalendarCheck },
  { label: "客製提案", href: "/admin/custom-trip-proposals", Icon: ListOrdered },
  { label: "餐廳管理", href: "/admin/restaurants", Icon: Landmark },
  { label: "文章管理", href: "/admin/blog", Icon: BookOpen },
  { label: "評論管理", href: "/admin/reviews", Icon: Star },
  { label: "廣告管理", href: "/admin/ads", Icon: Megaphone },
  { label: "網站設定", href: "/admin/settings", Icon: Settings }
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-card p-4 lg:block">
      <Link href="/admin" className="mb-6 block text-lg font-semibold">Admin</Link>
      <nav className="grid gap-1">
        {items.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
