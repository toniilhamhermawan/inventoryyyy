import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";

import { LoginForm } from "@/app/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <LoginNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </>
  );
}

async function LoginNotice({
  searchParams,
}: {
  searchParams: LoginPageProps["searchParams"];
}) {
  const params = await searchParams;
  const message =
    typeof params.message === "string" ? params.message.trim() : "";

  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-800"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="leading-5">{message}</p>
    </div>
  );
}
