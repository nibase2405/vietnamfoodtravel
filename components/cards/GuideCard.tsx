import Link from "next/link";
import { Languages, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Guide } from "@/types";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-secondary font-semibold text-primary">
          {guide.display_name?.slice(0, 1) ?? "G"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{guide.display_name}</div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            {guide.rating_avg} ({guide.review_count})
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{guide.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.languages?.slice(0, 4).map((lang) => <Badge key={lang}>{lang}</Badge>)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Languages className="h-4 w-4" />
          {guide.currency} {guide.hourly_rate}/hr
        </span>
        <Button asChild size="sm">
          <Link href={`/guides/${guide.id}`}>查看嚮導</Link>
        </Button>
      </div>
    </Card>
  );
}
