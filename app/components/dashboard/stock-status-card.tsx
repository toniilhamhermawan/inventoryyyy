import {
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  PackageX,
} from "lucide-react";

import type { DashboardData } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";

const ROWS = [
  {
    key: "available",
    label: "Stok tersedia",
    description: "Di atas batas minimum",
    icon: PackageCheck,
    bar: "bg-emerald-500",
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    key: "low",
    label: "Stok menipis",
    description: "≤ batas minimum",
    icon: AlertTriangle,
    bar: "bg-amber-500",
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    key: "out",
    label: "Stok habis",
    description: "Perlu segera diisi",
    icon: PackageX,
    bar: "bg-red-500",
    iconClass: "bg-red-50 text-red-700 ring-red-100",
  },
] as const;

export function StockStatusCard({
  status,
  lowStockProducts,
}: {
  status: DashboardData["stockStatus"];
  lowStockProducts: DashboardData["lowStockProducts"];
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
      <div className="border-b border-[#E5EBF0] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#293746]">Status stok</h2>
        <p className="mt-0.5 text-xs text-[#7C8996]">
          Kondisi persediaan dari {formatNumber(status.total)} produk.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {ROWS.map((row) => {
          const value = status[row.key];
          const percent =
            status.total > 0 ? Math.round((value / status.total) * 100) : 0;
          const Icon = row.icon;

          return (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5 text-sm text-[#293746]">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${row.iconClass}`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {row.label}
                    </span>
                    <span className="block truncate text-[11px] text-[#9AA6B2]">
                      {row.description}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#293746] tabular-nums">
                  {formatNumber(value)}
                  <span className="ml-1 text-[11px] font-normal text-[#9AA6B2]">
                    ({percent}%)
                  </span>
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#EDF2F6]">
                <div
                  className={`h-full rounded-full ${row.bar} transition-[width]`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[#E5EBF0] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7C8996]">
            Perlu restock
          </h3>
          <span className="rounded-full bg-[#EDF2F6] px-2 py-0.5 text-[11px] font-semibold text-[#7C8996]">
            {formatNumber(status.low + status.out)}
          </span>
        </div>

        {status.total === 0 ? (
          <p className="mt-3 text-xs leading-5 text-[#7C8996]">
            Belum ada produk yang terdaftar pada usaha ini.
          </p>
        ) : lowStockProducts.length === 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="size-3.5" aria-hidden />
            Semua produk berada di atas stok minimum.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {lowStockProducts.slice(0, 3).map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#293746]">
                    {product.name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-[#9AA6B2]">
                    {product.sku}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    product.stock <= 0
                      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                  }`}
                >
                  {formatNumber(product.stock)} {product.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
