import { AdminRankingManager } from "@/components/admin/AdminRankingManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminRankingConfigsData } from "@/lib/data/admin";
import { restaurants } from "@/lib/data/mock";
import { buildRankingGroups } from "@/lib/rankings";

export default async function AdminRankingsPage() {
  const initialConfigs = await getAdminRankingConfigsData();

  return (
    <section>
      <AdminPageHeader
        title="排行榜類型管理"
        description="新增、編輯、移除前台要顯示的排行榜類型，可設定榜單來源、城市、菜系、語系、Sponsored 規則與排序。"
      />
      <AdminRankingManager initialGroups={buildRankingGroups(restaurants)} initialConfigs={initialConfigs} />
    </section>
  );
}
