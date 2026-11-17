import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertTriangle, Bell, PackageX } from "lucide-react";

import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { getStockAlerts } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Notifikasi",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}

async function NotificationsContent() {
  const { business } = await requireBusiness();
  const alerts = await getStockAlerts(business.id);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Smart Inventory
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Notifikasi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Peringatan stok dari usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>.
            Produk akan muncul di sini saat stok mencapai atau di bawah batas
            minimum.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E5EBF0] bg-white px-3 py-1.5 text-xs font-medium text-[#7C8996] shadow-sm">
          <Bell className="size-3.5 text-[#9AA6B2]" aria-hidden />
          {formatNumber(alerts.length)} peringatan
        </span>
      </header>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
          <EmptyState
            icon={Bell}
            title="Tidak ada notifikasi"
            description="Semua produk berada di atas batas stok minimum. Peringatan baru akan tampil otomatis saat stok menipis."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {alerts.map((product) => {
            const isOut = product.stock <= 0;
            const Icon = isOut ? PackageX : AlertTriangle;

            return (
              <li
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      isOut
                        ? "bg-red-50 text-red-700 ring-red-100"
                        : "bg-amber-50 text-amber-700 ring-amber-100"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#293746]">
                        {product.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                          isOut
                            ? "bg-red-50 text-red-700 ring-red-100"
                            : "bg-amber-50 text-amber-700 ring-amber-100"
                        }`}
                      >
                        {isOut ? "Stok habis" : "Stok menipis"}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">
                      {product.sku}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7C8996]">
                      Stok saat ini{" "}
                      <span className="font-semibold text-[#293746]">
                        {formatNumber(product.stock)} {product.unit}
                      </span>
                      , batas minimum{" "}
                      {formatNumber(product.minStock)} {product.unit}.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs text-[#7C8996]">
                  {isOut
                    ? "Segera lakukan pengisian stok."
                    : "Siapkan restock sebelum stok habis."}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
