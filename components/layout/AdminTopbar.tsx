import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminTopbar() {
  return (
    <div className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="text-sm text-muted-foreground">管理員後台</div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <Home className="h-4 w-4" />
            返回首頁
          </Link>
        </Button>
        <div className="text-sm font-medium">Admin</div>
      </div>
    </div>
  );
}
