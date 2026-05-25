"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SupportTicketForm() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/support-tickets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to create support ticket");
            window.alert("Support ticket created");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="subject" placeholder="Subject" />
      <Input name="priority" placeholder="low / medium / high" defaultValue="medium" />
      <Textarea name="message" placeholder="How can we help?" />
      <Button disabled={isPending}>Create ticket</Button>
    </form>
  );
}
