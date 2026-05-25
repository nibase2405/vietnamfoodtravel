import Link from "next/link";

export function DashboardSidebar({ base = "/dashboard" }: { base?: "/dashboard" | "/guide-dashboard" | "/merchant-dashboard" }) {
  const labels = base === "/dashboard"
    ? [["總覽", ""], ["訂單", "/bookings"], ["收藏", "/favorites"], ["行程清單", "/trip-lists"], ["AI 行程", "/ai-plans"], ["客製報價", "/custom-trip-proposals"], ["客服", "/support"], ["個人資料", "/profile"]]
    : base === "/guide-dashboard"
      ? [["總覽", ""], ["資料", "/profile"], ["服務", "/services"], ["可預約", "/availability"], ["預約", "/bookings"], ["評價", "/reviews"]]
      : [["總覽", ""], ["餐廳", "/restaurants"], ["認領", "/claims"], ["廣告", "/ads"], ["分析", "/analytics"]];
  return (
    <aside className="w-full border-b bg-card p-3 md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-2 overflow-x-auto md:grid">
        {labels.map(([label, suffix]) => <Link key={suffix} href={`${base}${suffix}`} className="whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-muted">{label}</Link>)}
      </nav>
    </aside>
  );
}
