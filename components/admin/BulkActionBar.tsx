import { Button } from "@/components/ui/button";

export function BulkActionBar() {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm">
      <span>已選取項目</span>
      <div className="flex gap-2"><Button size="sm" variant="outline">上架</Button><Button size="sm" variant="outline">下架</Button></div>
    </div>
  );
}
