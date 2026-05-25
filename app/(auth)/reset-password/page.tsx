import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4"><div className="w-full rounded-lg border bg-white p-6"><h1 className="text-2xl font-semibold">重設密碼</h1><div className="mt-5"><ResetPasswordForm /></div></div></main>;
}
