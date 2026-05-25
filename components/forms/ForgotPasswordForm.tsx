"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => {
          void (async () => {
            const result = await requestPasswordReset(data);
            window.alert(result.message);
          })();
        });
      }}
    >
      <Input name="email" type="email" placeholder="Email" />
      <Button disabled={isPending}>Send reset email</Button>
    </form>
  );
}
