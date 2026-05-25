import { cn } from "@/lib/utils/cn";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground", className)}>{children}</span>;
}
