"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MenuItem = {
  name: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  image_url: string;
};

const blankItem: MenuItem = { name: "", description: "", price: "", currency: "VND", category: "招牌菜", image_url: "" };

export function RestaurantMenuEditor({ name = "restaurant_menu_items" }: { name?: string }) {
  const [items, setItems] = useState<MenuItem[]>([blankItem]);
  const value = useMemo(() => JSON.stringify(items.filter((item) => item.name.trim()).map((item) => ({ ...item, price: Number(item.price || 0), is_active: true }))), [items]);

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">菜品資料</div>
          <p className="text-xs text-muted-foreground">輸入菜名、分類、價格與介紹，前台餐廳頁會顯示在菜單區塊。</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => [...current, blankItem])}>
          <Plus className="h-4 w-4" />
          新增
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-lg border p-3">
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_120px_100px_auto]">
            <Input value={item.name} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, name: event.target.value } : row))} placeholder="菜名" />
            <Input value={item.category} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, category: event.target.value } : row))} placeholder="分類" />
            <Input value={item.price} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, price: event.target.value } : row))} placeholder="價格" type="number" />
            <Input value={item.currency} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, currency: event.target.value } : row))} placeholder="VND" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input value={item.description} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, description: event.target.value } : row))} placeholder="菜品介紹" />
          <Input value={item.image_url} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, image_url: event.target.value } : row))} placeholder="菜品圖片網址" />
        </div>
      ))}
    </div>
  );
}
