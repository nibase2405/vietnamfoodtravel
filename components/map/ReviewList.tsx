import { Star } from "lucide-react";

export function ReviewList({ reviews = [] }: { reviews?: { title?: string; content?: string; rating?: number }[] }) {
  if (!reviews.length) return <div className="text-sm text-muted-foreground">尚無評論。</div>;
  return (
    <div className="grid gap-3">
      {reviews.map((review, index) => (
        <div key={index} className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 font-medium">
            <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            {review.rating ?? 5} · {review.title}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
        </div>
      ))}
    </div>
  );
}
