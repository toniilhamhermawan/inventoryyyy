import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { ProfileMenu } from "@/app/components/shell/profile-menu";
import { requireBusiness } from "@/lib/auth/dal";
import { getStockAlertCount } from "@/lib/dashboard";

export async function HeaderSession() {
  const { user, business } = await requireBusiness();
  const alertCount = await getStockAlertCount(business.id);

  return (
    <>
      <form
        action="/search"
        method="get"
        role="search"
        className="relative mr-auto hidden w-full max-w-sm md:block"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA6B2]"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Cari produk atau SKU..."
          aria-label="Cari produk atau SKU"
          className="h-10 w-full rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 pl-9 pr-3 text-sm text-[#293746] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
        />
      </form>

      <Link
        href="/search"
        aria-label="Cari produk"
        className="flex size-10 items-center justify-center rounded-xl border border-[#E5EBF0] bg-white text-[#7C8996] shadow-sm transition-colors hover:bg-[#F4F7FA] hover:text-[#293746] md:hidden"
      >
        <Search className="size-5" aria-hidden />
      </Link>

      <Link
        href="/notifications"
        aria-label={
          alertCount > 0
            ? `Notifikasi, ${alertCount} produk perlu perhatian`
            : "Notifikasi"
        }
        className="relative flex size-10 items-center justify-center rounded-xl border border-[#E5EBF0] bg-white text-[#7C8996] shadow-sm transition-colors hover:bg-[#F4F7FA] hover:text-[#293746]"
      >
        <Bell className="size-5" aria-hidden />
        {alertCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {alertCount > 99 ? "99+" : alertCount}
          </span>
        ) : null}
      </Link>

      <span aria-hidden className="hidden h-6 w-px bg-slate-200 sm:block" />

      <ProfileMenu
        name={user.name}
        email={user.email}
        businessName={business.name}
      />
    </>
  );
}

export function HeaderSessionSkeleton() {
  return (
    <>
      <div className="mr-auto hidden h-10 w-full max-w-sm animate-pulse rounded-xl bg-[#EDF2F6] md:block" />
      <div className="size-10 animate-pulse rounded-xl bg-[#EDF2F6]" />
      <div className="size-10 animate-pulse rounded-xl bg-[#EDF2F6]" />
      <div className="flex items-center gap-2 rounded-xl p-1 pr-2">
        <div className="size-9 animate-pulse rounded-lg bg-slate-200" />
        <div className="hidden space-y-1.5 xl:block">
          <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-2 w-16 animate-pulse rounded bg-[#EDF2F6]" />
        </div>
      </div>
    </>
  );
}
