import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <div className="w-full rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-semibold">註冊</h1>
        <div className="mt-5">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
