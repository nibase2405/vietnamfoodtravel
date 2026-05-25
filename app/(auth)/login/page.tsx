import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <div className="w-full rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-semibold">登入</h1>
        <div className="mt-5">
          <LoginForm nextPath={next ?? "/dashboard"} />
        </div>
        <Link href="/forgot-password" className="mt-4 block text-sm text-primary">忘記密碼</Link>
      </div>
    </main>
  );
}
