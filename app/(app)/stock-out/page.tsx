import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpFromLine, Search } from "lucide-react";
import { Prisma } from "@prisma/client";

import { StockOutForm } from "@/app/components/transactions/stock-out-form";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatDateTime, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Barang Keluar",
};

type SearchParams = {
  q?: string | string[];
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

export default function StockOutPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StockOutContent searchParams={searchParams} />
    </Suspense>
  );
}

async function StockOutContent({ searchParams }: PageProps) {
  const { business } = await requireBusiness();
  const params = await searchParams;
  const q = getString(params.q).trim().slice(0, 100);
  const from = getString(params.from).trim();
  const to = getString(params.to).trim();
  const fromDate = parseDateStart(from);
  const toDate = parseDateEnd(to);

  const where: Prisma.StockOutWhereInput = { businessId: business.id };

  if (q) {
    where.OR = [
      { referenceNumber: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } },
      { product: { sku: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (fromDate || toDate) {
    where.createdAt = {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    };
  }

  const [transactions, products, totalAll] = await Promise.all([
    prisma.stockOut.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        stock: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.stockOut.count({ where: { businessId: business.id } }),
  ]);

  const hasFilter = Boolean(q || from || to);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Transaksi
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Barang Keluar
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Catat pengeluaran barang untuk usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>.
            Stok berkurang otomatis dan tervalidasi. Total{" "}
            {formatNumber(totalAll)} transaksi.
          </p>
        </div>
        <StockOutForm
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            unit: p.unit,
            stock: p.stock,
          }))}
        />
      </header>

      <section className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <form
          action="/stock-out"
          method="get"
          className="grid gap-3 border-b border-[#E5EBF0] p-4 lg:grid-cols-[1fr_180px_180px_auto]"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA6B2]"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari barang, SKU, atau nomor transaksi..."
              aria-label="Cari transaksi barang keluar"
              className="h-10 w-full rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 pl-9 pr-3 text-sm text-[#293746] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </div>
          <input
            type="date"
            name="from"
            defaultValue={from}
            aria-label="Dari tanggal"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          />
          <input
            type="date"
            name="to"
            defaultValue={to}
            aria-label="Sampai tanggal"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] lg:flex-none"
            >
              Terapkan
            </button>
            {hasFilter ? (
              <Link
                href="/stock-out"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        {transactions.length === 0 ? (
          <EmptyState
            icon={ArrowUpFromLine}
            title={hasFilter ? "Transaksi tidak ditemukan" : "Belum ada barang keluar"}
            description={
              hasFilter
                ? "Tidak ada transaksi yang cocok dengan pencarian atau filter tanggal. Coba ubah kriteria."
                : "Catat pengeluaran barang pertama. Stok akan berkurang otomatis jika mencukupi."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                  <th scope="col" className="px-5 py-3 font-semibold">No. transaksi</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Tanggal</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Barang</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Jumlah keluar</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Stok (sebelum → sesudah)</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-[#F4F7FA]/70">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-[#293746]">
                      {tx.referenceNumber || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#7C8996]">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="max-w-[220px] truncate font-medium text-[#293746]">{tx.product.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">{tx.product.sku}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-[#293746]">
                      -{formatNumber(tx.quantity)}{" "}
                      <span className="text-xs font-normal text-[#9AA6B2]">{tx.product.unit}</span>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-xs text-[#7C8996]">
                      {formatNumber(tx.stockBefore)} → {formatNumber(tx.stockAfter)}
                    </td>
                    <td className="max-w-[220px] px-5 py-3.5 text-xs text-[#7C8996]">
                      <p className="whitespace-pre-line line-clamp-2">{tx.note || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
