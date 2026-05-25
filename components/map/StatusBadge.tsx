import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const tone = status === "published" || status === "approved" || status === "confirmed"
    ? "border border-primary/20 bg-primary/10 text-primary"
    : status === "pending" || status === "draft"
      ? "border border-accent/25 bg-accent/10 text-accent"
      : "border border-border bg-muted text-muted-foreground";
  return <Badge className={tone}>{status}</Badge>;
}
