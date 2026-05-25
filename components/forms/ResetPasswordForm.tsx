"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = String(data.get("password") ?? "");
        const confirm = String(data.get("confirm_password") ?? "");
        if (password.length < 8) {
          window.alert("Password must be at least 8 characters");
          return;
        }
        if (password !== confirm) {
          window.alert("Passwords do not match");
          return;
        }
        startTransition(() => {
          void (async () => {
            const result = await updatePassword(data);
            window.alert(result.message);
          })();
        });
      }}
    >
      <Input name="password" type="password" placeholder="New password" />
      <Input name="confirm_password" type="password" placeholder="Confirm password" />
      <Button disabled={isPending}>Update password</Button>
    </form>
  );
}
