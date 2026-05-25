export function ErrorState({ message = "載入失敗" }: { message?: string }) {
  return <div className="rounded-lg border border-destructive/30 bg-white p-6 text-sm text-destructive">{message}</div>;
}
