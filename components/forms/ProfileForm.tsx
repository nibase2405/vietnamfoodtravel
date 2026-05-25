"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

export function ProfileForm({ profile }: { profile?: Record<string, any> | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Failed to save profile");
            window.alert("Profile saved");
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="full_name" placeholder="Name" defaultValue={profile?.full_name ?? ""} />
      <Input name="phone" placeholder="Phone" defaultValue={profile?.phone ?? ""} />
      <Input name="preferred_language" placeholder="Preferred language" defaultValue={profile?.preferred_language ?? "zh-TW"} />
      <Input name="nationality" placeholder="Nationality" defaultValue={profile?.user_profiles?.[0]?.nationality ?? ""} />
      <Input name="birthday" type="date" defaultValue={profile?.user_profiles?.[0]?.birthday ?? ""} />
      <Input name="emergency_contact_name" placeholder="Emergency contact" defaultValue={profile?.user_profiles?.[0]?.emergency_contact_name ?? ""} />
      <Input name="emergency_contact_phone" placeholder="Emergency phone" defaultValue={profile?.user_profiles?.[0]?.emergency_contact_phone ?? ""} />
      <ImageUploadField name="avatar_url" bucket="avatars" />
      <Button disabled={isPending}>Save profile</Button>
    </form>
  );
}
