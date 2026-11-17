import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { OnboardingForm } from "@/app/components/auth/onboarding-form";
import { getBusinessForUser, requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Daftarkan Usaha",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingGate />
    </Suspense>
  );
}

async function OnboardingGate() {
  const user = await requireUser();
  const business = await getBusinessForUser(user.id);

  if (business) {
    redirect("/dashboard");
  }

  return (
    <div>
      <ol className="mb-7 flex items-center gap-2 text-xs font-medium">
        <li className="flex items-center gap-1.5 text-[#527C9E]">
          <CheckCircle2 className="size-4" aria-hidden />
          Akun dibuat
        </li>
        <li aria-hidden className="h-px flex-1 bg-slate-200" />
        <li className="flex items-center gap-1.5 text-[#293746]">
          <span className="flex size-4 items-center justify-center rounded-full bg-[#527C9E] text-[10px] font-bold text-white">
            2
          </span>
          Data usaha
        </li>
      </ol>

      <OnboardingForm email={user.email} />

      <form action={logoutAction} className="mt-8 text-center">
        <button
          type="submit"
          className="text-xs font-medium text-[#7C8996] underline-offset-4 transition-colors hover:text-[#293746] hover:underline"
        >
          Keluar dari akun ini
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-[#9AA6B2]">
        Butuh bantuan?{" "}
        <Link href="/" className="underline-offset-4 hover:underline">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-7 h-5 w-56 rounded-full bg-slate-200" />
      <div className="size-11 rounded-xl bg-slate-200" />
      <div className="mt-5 h-7 w-64 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-full rounded bg-[#EDF2F6]" />
      <div className="mt-8 h-4 w-28 rounded bg-slate-200" />
      <div className="mt-2 h-11 w-full rounded-xl bg-[#EDF2F6]" />
      <div className="mt-5 h-11 w-full rounded-xl bg-slate-200" />
    </div>
  );
}
