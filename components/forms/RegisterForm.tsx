"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/auth";
import { registerSchema } from "@/lib/validations/forms";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        const data = new FormData();
        data.set("full_name", values.full_name);
        data.set("email", values.email);
        data.set("password", values.password);
        startTransition(() => {
          void (async () => {
            const result = await signUp(data);
            if (result?.message) window.alert(result.message);
          })();
        });
      })}
      className="grid gap-3"
    >
      <Input {...form.register("full_name")} placeholder="Name" />
      {form.formState.errors.full_name ? <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p> : null}
      <Input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      <Input {...form.register("password")} type="password" placeholder="Password" />
      {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>Register</Button>
    </form>
  );
}
