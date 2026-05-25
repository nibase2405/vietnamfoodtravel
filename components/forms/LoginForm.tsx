"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/actions/auth";
import { loginSchema } from "@/lib/validations/forms";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        const data = new FormData();
        data.set("email", values.email);
        data.set("password", values.password);
        data.set("next", nextPath);
        startTransition(() => void signIn(data));
      })}
      className="grid gap-3"
    >
      <Input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      <Input {...form.register("password")} type="password" placeholder="Password" />
      {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>登入</Button>
    </form>
  );
}
