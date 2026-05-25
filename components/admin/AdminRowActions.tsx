"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export type AdminRowAction = {
  label: string;
  endpoint?: string;
  href?: string;
  method?: "POST" | "PATCH" | "DELETE";
  payload?: Record<string, unknown>;
  confirm?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
};

export function AdminRowActions({ actions }: { actions: AdminRowAction[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        action.href ? (
          <Button key={action.href} asChild size="sm" variant={action.variant ?? "outline"}>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
        <Button
          key={`${action.method ?? "POST"}:${action.endpoint ?? action.href}:${action.label}`}
          size="sm"
          variant={action.variant ?? "outline"}
          disabled={isPending}
          onClick={() => {
            if (action.confirm && !window.confirm(action.confirm)) return;
            startTransition(() => {
              void (async () => {
                if (!action.endpoint) throw new Error("Missing action endpoint");
                const response = await fetch(action.endpoint, {
                  method: action.method ?? "POST",
                  headers: action.payload ? { "Content-Type": "application/json" } : undefined,
                  body: action.payload ? JSON.stringify(action.payload) : undefined
                });
                if (!response.ok) {
                  const body = await response.json().catch(() => ({}));
                  throw new Error(body.error ?? "Action failed");
                }
                router.refresh();
              })().catch((error) => window.alert(error.message));
            });
          }}
        >
          {action.label}
        </Button>
        )
      ))}
    </div>
  );
}
