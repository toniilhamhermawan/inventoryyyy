import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Building2,
  CalendarDays,
  Layers,
  Package,
  Sparkles,
  Tags,
  Wallet,
} from "lucide-react";

import { DashboardSkeleton } from "@/app/components/dashboard/dashboard-skeleton";
import { InventoryChart } from "@/app/components/dashboard/inventory-chart";
import { RecentActivity } from "@/app/components/dashboard/recent-activity";
import { StatCard } from "@/app/components/dashboard/stat-card";
import { StockStatusCard } from "@/app/components/dashboard/stock-status-card";
import { requireBusiness } from "@/lib/auth/dal";
import { getDashboardData, parseDashboardPeriod } from "@/lib/dashboard";
import {
  formatCurrency,
  formatLongDate,
  formatNumber,
  getGreeting,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardPageProps = {
  searchParams: Promise<{ period?: string | string[] }>;
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const period = parseDashboardPeriod(params.period);
  const { user, business } = await requireBusiness();
  const data = await getDashboardData(business.id, period);
  const now = new Date();
  const displayName = user.name?.trim() || user.email.split("@")[0];

  const stats = [
    {
      label: "Total produk",
      value: formatNumber(data.stats.productCount),
      hint: `${formatNumber(data.stats.categoryCount)} kategori terdaftar`,
      icon: Package,
      tone: "blue" as const,
    },
    {
      label: "Total kategori",
      value: formatNumber(data.stats.categoryCount),
      hint: "Pengelompokan produk usaha",
      icon: Tags,
      tone: "navy" as const,
    },
    {
      label: "Total stok barang",
      value: formatNumber(data.stats.totalStock),
      hint: "Unit tersedia di gudang",
      icon: Layers,
      tone: "sky" as const,
    },
    {
      label: "Nilai persediaan",
      value: formatCurrency(data.stats.inventoryValue),
      hint: "Dihitung dari harga beli",
      icon: Wallet,
      tone: "indigo" as const,
      title: formatCurrency(data.stats.inventoryValue),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#527C9E]">
            <Sparkles className="size-3.5" aria-hidden />
            {getGreeting(now)}, {displayName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Ringkasan persediaan
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#7C8996]">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4 text-[#9AA6B2]" aria-hidden />
              {business.name}
            </span>
            <span aria-hidden className="text-slate-300">
              •
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-[#9AA6B2]" aria-hidden />
              {formatLongDate(now)}
            </span>
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D7E3EC] bg-[#EEF4F8] px-3 py-1.5 text-xs font-medium text-[#527C9E]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#EEF4F8]0 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#527C9E]" />
          </span>
          Data langsung dari database
        </span>
      </section>

      <section
        aria-label="Statistik utama"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            tone={stat.tone}
            title={stat.title}
          />
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <InventoryChart data={data.chart} />
        <StockStatusCard
          status={data.stockStatus}
          lowStockProducts={data.lowStockProducts}
        />
      </div>

      <div className="mt-6">
        <RecentActivity movements={data.recentMovements} />
      </div>
    </div>
  );
}
