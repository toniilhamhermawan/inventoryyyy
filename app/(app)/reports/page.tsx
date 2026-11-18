import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  PackageX,
  Wallet,
} from "lucide-react";
import { MovementType, Prisma } from "@prisma/client";

import { StatCard } from "@/app/components/dashboard/stat-card";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Laporan",
};

type SearchParams = {
  from?: string | string[];
  to?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

function getString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function parseDateStart(value: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatDateInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function ReportsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ReportsContent({ searchParams }: PageProps) {
  const { business } = await requireBusiness();
  const params = await searchParams;

  const fromParam = getString(params.from).trim();
  const toParam = getString(params.to).trim();

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 29);

  const fromDate = parseDateStart(fromParam) ?? parseDateStart(formatDateInput(defaultFrom))!;
  const toDate = parseDateEnd(toParam) ?? parseDateEnd(formatDateInput(now))!;
  const fromValue = fromParam || formatDateInput(fromDate);
  const toValue = toParam || formatDateInput(toDate);

  const movementWhere: Prisma.StockMovementWhereInput = {
    businessId: business.id,
    createdAt: { gte: fromDate, lte: toDate },
  };

  const [products, categoryCount, movementAgg, recentMovements, outAgg] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        unit: true,
        purchasePrice: true,
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.category.count({ where: { businessId: business.id } }),
    prisma.stockMovement.groupBy({
      by: ["type"],
      where: movementWhere,
      _count: { _all: true },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.findMany({
      where: movementWhere,
      include: {
        product: { select: { name: true, sku: true, unit: true } },
        stockIn: { select: { referenceNumber: true } },
        stockOut: { select: { referenceNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.stockMovement.groupBy({
      by: ["productId"],
      where: { ...movementWhere, type: MovementType.OUT },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  let totalStock = 0;
  let inventoryValue = new Prisma.Decimal(0);
  let outCount = 0;
  let lowCount = 0;

  for (const p of products) {
    totalStock += p.stock;
    inventoryValue = inventoryValue.plus(p.purchasePrice.mul(p.stock));
    if (p.stock <= 0) outCount += 1;
    else if (p.stock <= p.minStock) lowCount += 1;
  }

  const lowStockProducts = products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, "id-ID"))
    .slice(0, 10);

  const inAgg = movementAgg.find((m) => m.type === MovementType.IN);
  const outMoveAgg = movementAgg.find((m) => m.type === MovementType.OUT);
  const inTx = inAgg?._count._all ?? 0;
  const outTx = outMoveAgg?._count._all ?? 0;
  const inQty = inAgg?._sum.quantity ?? 0;
  const outQty = outMoveAgg?._sum.quantity ?? 0;

  const topOutIds = outAgg.map((o) => o.productId);
  const topOutProducts = topOutIds.length
    ? await prisma.product.findMany({
        where: { businessId: business.id, id: { in: topOutIds } },
        select: { id: true, name: true, sku: true, unit: true },
      })
    : [];
  const topOutNameMap = new Map(topOutProducts.map((p) => [p.id, p]));
  const topOut = outAgg
    .map((o) => {
      const prod = topOutNameMap.get(o.productId);
      if (!prod) return null;
      return { ...prod, quantity: o._sum.quantity ?? 0 };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const hasMovements = recentMovements.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Smart Inventory
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Laporan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Ringkasan persediaan dan pergerakan stok untuk usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>{" "}
            pada periode yang dipilih.
          </p>
        </div>
        <form action="/reports" method="get" className="flex w-full flex-col gap-2 sm:flex-row sm:items-end lg:w-auto">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="report-from" className="text-xs font-medium text-[#7C8996]">Dari tanggal</label>
            <input
              id="report-from"
              type="date"
              name="from"
              defaultValue={fromValue}
              className="h-10 rounded-xl border border-[#E5EBF0] bg-white px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="report-to" className="text-xs font-medium text-[#7C8996]">Sampai tanggal</label>
            <input
              id="report-to"
              type="date"
              name="to"
              defaultValue={toValue}
              className="h-10 rounded-xl border border-[#E5EBF0] bg-white px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] sm:flex-none"
            >
              Terapkan
            </button>
            {(fromParam || toParam) ? (
              <Link
                href="/reports"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </header>

      <section aria-label="Ringkasan persediaan" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nilai persediaan" value={formatCurrency(inventoryValue.toNumber())} icon={Wallet} tone="blue" hint="Stok × harga beli saat ini" />
        <StatCard label="Total produk" value={formatNumber(products.length)} icon={Boxes} tone="sky" hint={`${formatNumber(categoryCount)} kategori`} />
        <StatCard label="Total stok" value={formatNumber(totalStock)} icon={BarChart3} tone="navy" hint="Seluruh unit tersedia" />
        <StatCard label="Perlu perhatian" value={formatNumber(lowCount + outCount)} icon={AlertTriangle} tone="indigo" hint={`${formatNumber(lowCount)} menipis, ${formatNumber(outCount)} habis`} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-[#293746]">Rekap pergerakan stok</h2>
          <p className="mt-1 text-sm text-[#7C8996]">
            Periode {formatDateInput(fromDate)} s/d {formatDateInput(toDate)}
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/60 p-4">
              <dt className="flex items-center gap-2 text-sm font-medium text-[#7C8996]">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
                  <ArrowDownToLine className="size-4" aria-hidden />
                </span>
                Barang masuk
              </dt>
              <dd className="mt-3 text-2xl font-semibold tabular-nums text-[#293746]">{formatNumber(inQty)}</dd>
              <dd className="mt-1 text-xs text-[#7C8996]">{formatNumber(inTx)} transaksi</dd>
            </div>
            <div className="rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/60 p-4">
              <dt className="flex items-center gap-2 text-sm font-medium text-[#7C8996]">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#F7F1E6] text-[#8A6A3D] ring-1 ring-[#E8B978]/40">
                  <ArrowUpFromLine className="size-4" aria-hidden />
                </span>
                Barang keluar
              </dt>
              <dd className="mt-3 text-2xl font-semibold tabular-nums text-[#293746]">{formatNumber(outQty)}</dd>
              <dd className="mt-1 text-xs text-[#7C8996]">{formatNumber(outTx)} transaksi</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-xl border border-[#E5EBF0] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9AA6B2]">Produk keluar terbanyak (periode)</p>
            {topOut.length === 0 ? (
              <p className="mt-3 text-sm text-[#7C8996]">Belum ada barang keluar pada periode ini.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {topOut.map((item, idx) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-[#293746]">
                      <span className="mr-2 text-xs font-semibold text-[#9AA6B2]">{idx + 1}.</span>
                      {item.name} <span className="text-[#9AA6B2]">({item.sku})</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#293746]">
                      {formatNumber(item.quantity)} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5EBF0] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-[#293746]">Produk stok menipis & habis</h2>
              <p className="mt-0.5 text-sm text-[#7C8996]">Berdasarkan stok saat ini dan batas minimum.</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-[#527C9E] hover:text-[#466b87]">
              Lihat produk
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="Stok aman"
              description="Tidak ada produk yang habis atau di bawah batas minimum saat ini."
              className="py-10"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                    <th className="px-5 py-3 font-semibold">Produk</th>
                    <th className="px-5 py-3 font-semibold">Stok</th>
                    <th className="px-5 py-3 font-semibold">Minimum</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF0]">
                  {lowStockProducts.map((p) => {
                    const isOut = p.stock <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#F4F7FA]/70">
                        <td className="px-5 py-3.5">
                          <p className="max-w-[220px] truncate font-medium text-[#293746]">{p.name}</p>
                          <p className="font-mono text-[11px] text-[#9AA6B2]">{p.sku}</p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold tabular-nums text-[#293746]">{formatNumber(p.stock)} {p.unit}</td>
                        <td className="px-5 py-3.5 tabular-nums text-[#7C8996]">{formatNumber(p.minStock)} {p.unit}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isOut ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
                            {isOut ? <PackageX className="size-3" aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}
                            {isOut ? "Habis" : "Menipis"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[#E5EBF0] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-[#293746]">Pergerakan pada periode</h2>
            <p className="mt-0.5 text-sm text-[#7C8996]">Transaksi terbaru dalam rentang tanggal terpilih.</p>
          </div>
          <Link href="/transactions" className="text-sm font-medium text-[#527C9E] hover:text-[#466b87]">
            Lihat semua riwayat
          </Link>
        </div>
        {!hasMovements ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada pergerakan"
            description="Tidak ada transaksi barang masuk/keluar pada periode ini. Coba ubah rentang tanggal atau catat transaksi baru."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                  <th className="px-5 py-3 font-semibold">No. transaksi</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 font-semibold">Jenis</th>
                  <th className="px-5 py-3 font-semibold">Barang</th>
                  <th className="px-5 py-3 font-semibold">Jumlah</th>
                  <th className="px-5 py-3 font-semibold">Stok (sebelum → sesudah)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {recentMovements.map((m) => {
                  const isIn = m.type === MovementType.IN;
                  const ref = m.stockIn?.referenceNumber || m.stockOut?.referenceNumber || "-";
                  return (
                    <tr key={m.id} className="hover:bg-[#F4F7FA]/70">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-[#293746]">{ref}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#7C8996]">{formatDateTime(m.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isIn ? "bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]" : "bg-[#F7F1E6] text-[#8A6A3D] ring-1 ring-[#E8B978]/40"}`}>
                          {isIn ? <ArrowDownToLine className="size-3" aria-hidden /> : <ArrowUpFromLine className="size-3" aria-hidden />}
                          {isIn ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="max-w-[220px] truncate font-medium text-[#293746]">{m.product.name}</p>
                        <p className="font-mono text-[11px] text-[#9AA6B2]">{m.product.sku}</p>
                      </td>
                      <td className={`px-5 py-3.5 font-semibold tabular-nums ${isIn ? "text-[#527C9E]" : "text-[#293746]"}`}>
                        {isIn ? "+" : "-"}{formatNumber(m.quantity)} <span className="text-xs font-normal text-[#9AA6B2]">{m.product.unit}</span>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-xs text-[#7C8996]">{formatNumber(m.stockBefore)} → {formatNumber(m.stockAfter)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
