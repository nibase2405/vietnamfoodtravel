"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const RestaurantForm = dynamic(
  () => import("@/components/forms/RestaurantForm").then((mod) => mod.RestaurantForm),
  {
    ssr: false,
    loading: () => <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">載入餐廳表單...</div>
  }
);

export function AdminRestaurantCreatePanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-lg border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">新增餐廳 / 匯入 Google 商家資料</h2>
          <p className="mt-1 text-sm text-muted-foreground">可從 Google Maps 分享連結帶入基本資料，再補上照片、營業時間、菜單與 SEO 欄位。</p>
        </div>
        <Button type="button" onClick={() => setOpen((current) => !current)}>
          <Plus className="h-4 w-4" />
          {open ? "收合表單" : "新增餐廳"}
        </Button>
      </div>
      {open ? (
        <div className="mt-5">
          <RestaurantForm allowAdminImports />
        </div>
      ) : null}
    </div>
  );
}
