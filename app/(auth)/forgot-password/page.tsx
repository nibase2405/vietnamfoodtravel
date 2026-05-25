import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <div className="w-full rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-semibold">忘記密碼</h1>
        <div className="mt-5">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
