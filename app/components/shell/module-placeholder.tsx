import Link from "next/link";
import { ArrowRight, CircleDashed, type LucideIcon } from "lucide-react";

import { requireBusiness } from "@/lib/auth/dal";

export async function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  const { business } = await requireBusiness();

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
          Smart Inventory
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
          {description}
        </p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF2F6] px-2.5 py-1 text-[11px] font-semibold text-[#7C8996]">
              <CircleDashed className="size-3" aria-hidden />
              Dalam pengembangan
            </span>
            <h2 className="mt-2 text-lg font-semibold text-[#293746]">
              Modul {title} sedang disiapkan
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#7C8996]">
              Dashboard utama sudah memakai data langsung dari database untuk
              usaha <span className="font-medium text-[#293746]">{business.name}</span>.
              Modul ini akan tersedia pada tahap pengembangan berikutnya.
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-[#E5EBF0] bg-[#F4F7FA]/60 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7C8996]">
              Yang akan tersedia
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm text-[#7C8996] sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#EEF4F8]0"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C8D4DF] bg-white px-4 py-2.5 text-sm font-semibold text-[#293746] transition-colors hover:border-slate-400 hover:bg-[#F4F7FA] sm:w-fit"
          >
            Kembali ke dashboard
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
