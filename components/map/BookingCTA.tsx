import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingCTA({ href = "#booking" }: { href?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild><Link href={href}>立即預約</Link></Button>
      <Button variant="outline"><MessageCircle className="h-4 w-4" />LINE 諮詢</Button>
      <Button variant="outline">WhatsApp</Button>
      <Button variant="outline">Zalo</Button>
    </div>
  );
}
