import { formatNumber } from "@/lib/format";

export function getStockStatus(stock: number, minStock: number) {
  if (stock <= 0) {
    return {
      key: "out" as const,
      label: "Habis",
      className: "bg-red-50 text-red-700 ring-red-100",
    };
  }

  if (stock <= minStock) {
    return {
      key: "low" as const,
      label: "Menipis",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  return {
    key: "available" as const,
    label: "Tersedia",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
}

export function StockBadge({
  stock,
  minStock,
}: {
  stock: number;
  minStock: number;
}) {
  const status = getStockStatus(stock, minStock);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.className}`}
      title={`Stok ${formatNumber(stock)}, minimum ${formatNumber(minStock)}`}
    >
      {status.label}
    </span>
  );
}
