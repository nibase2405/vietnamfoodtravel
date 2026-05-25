export function EmptyState({ title = "沒有資料", description }: { title?: string; description?: string }) {
  return <div className="rounded-lg border bg-white p-8 text-center"><div className="font-medium">{title}</div>{description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}</div>;
}
