"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RestaurantClaimForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid max-w-xl gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/restaurant-claims", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Failed to submit claim");
            window.alert("Claim submitted");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="restaurant_id" placeholder="Restaurant ID" />
      <Input name="contact_name" placeholder="Contact name" />
      <Input name="contact_phone" placeholder="Contact phone" />
      <Input name="business_license_url" placeholder="Business license URL" />
      <Button disabled={isPending}>Submit claim</Button>
    </form>
  );
}
