import { ProfileForm } from "@/components/forms/ProfileForm";
import { getMyProfileData } from "@/lib/data/dashboard";

export default async function DashboardProfilePage() {
  const profile = await getMyProfileData();
  return <section className="max-w-2xl"><h1 className="mb-6 text-2xl font-semibold">個人資料</h1><ProfileForm profile={profile} /></section>;
}
