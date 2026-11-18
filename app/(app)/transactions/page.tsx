import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDownToLine, ArrowUpFromLine, History, Search } from "lucide-react";
import { MovementType, Prisma } from "@prisma/client";

import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatDateTime, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Riwayat Transaksi",
};

type SearchParams = {
  q?: string | string[];
  from?: string | string[];
  to?: string | string[];
  type?: string | string[];
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

function parseType(value: string): MovementType | undefined {
  if (value === "IN" || value === "OUT") return value;
  return undefined;
}

export default function TransactionsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TransactionsContent({ searchParams }: PageProps) {
  const { business } = await requireBusiness();
  const params = await searchParams;
  const q = getString(params.q).trim().slice(0, 100);
  const from = getString(params.from).trim();
  const to = getString(params.to).trim();
  const typeParam = getString(params.type).trim().toUpperCase();
  const movementType = parseType(typeParam);
  const fromDate = parseDateStart(from);
  const toDate = parseDateEnd(to);

  const where: Prisma.StockMovementWhereInput = { businessId: business.id };

  if (movementType) {
    where.type = movementType;
  }

  if (q) {
    where.OR = [
      { product: { name: { contains: q, mode: "insensitive" } } },
      { product: { sku: { contains: q, mode: "insensitive" } } },
      { stockIn: { referenceNumber: { contains: q, mode: "insensitive" } } },
      { stockOut: { referenceNumber: { contains: q, mode: "insensitive" } } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }

  if (fromDate || toDate) {
    where.createdAt = {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    };
  }

  const [movements, totalAll, totalIn, totalOut] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true, unit: true } },
        stockIn: { select: { referenceNumber: true, note: true } },
        stockOut: { select: { referenceNumber: true, note: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.stockMovement.count({ where: { businessId: business.id } }),
    prisma.stockMovement.count({
      where: { businessId: business.id, type: MovementType.IN },
    }),
    prisma.stockMovement.count({
      where: { businessId: business.id, type: MovementType.OUT },
    }),
  ]);

  const hasFilter = Boolean(q || from || to || movementType);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Smart Inventory
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Seluruh pergerakan stok untuk usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>.
            Total {formatNumber(totalAll)} transaksi ({formatNumber(totalIn)} masuk,{" "}
            {formatNumber(totalOut)} keluar).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/stock-in"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#C8D4DF] bg-white px-4 text-sm font-semibold text-[#293746] transition-colors hover:bg-[#EEF4F8]"
          >
            <ArrowDownToLine className="size-4 text-[#527C9E]" aria-hidden />
            Barang masuk
          </Link>
          <Link
            href="/stock-out"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#C8D4DF] bg-white px-4 text-sm font-semibold text-[#293746] transition-colors hover:bg-[#EEF4F8]"
          >
            <ArrowUpFromLine className="size-4 text-[#527C9E]" aria-hidden />
            Barang keluar
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <form
          action="/transactions"
          method="get"
          className="grid gap-3 border-b border-[#E5EBF0] p-4 lg:grid-cols-[1fr_160px_170px_170px_auto]"
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
              placeholder="Cari produk, SKU, no. transaksi, atau catatan..."
              aria-label="Cari riwayat transaksi"
              className="h-10 w-full rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 pl-9 pr-3 text-sm text-[#293746] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </div>
          <select
            name="type"
            defaultValue={movementType ?? ""}
            aria-label="Jenis transaksi"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          >
            <option value="">Semua jenis</option>
            <option value="IN">Barang masuk</option>
            <option value="OUT">Barang keluar</option>
          </select>
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
                href="/transactions"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        {movements.length === 0 ? (
          <EmptyState
            icon={History}
            title={hasFilter ? "Riwayat tidak ditemukan" : "Belum ada riwayat transaksi"}
            description={
              hasFilter
                ? "Tidak ada transaksi yang cocok dengan filter. Coba ubah pencarian, jenis, atau rentang tanggal."
                : "Catat barang masuk atau barang keluar untuk melihat riwayat pergerakan stok di sini."
            }
            action={
              !hasFilter ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href="/stock-in"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white hover:bg-[#466b87]"
                  >
                    Catat barang masuk
                  </Link>
                  <Link
                    href="/stock-out"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
                  >
                    Catat barang keluar
                  </Link>
                </div>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-[#E5EBF0] px-5 py-3 text-xs text-[#7C8996]">
              <p>
                Menampilkan <span className="font-semibold text-[#293746]">{formatNumber(movements.length)}</span> transaksi
                {hasFilter ? " (sesuai filter)" : " terbaru"}.
              </p>
              {movements.length === 200 ? <p>Maksimal 200 data ditampilkan.</p> : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                    <th scope="col" className="px-5 py-3 font-semibold">No. transaksi</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Tanggal</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Jenis</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Barang</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Jumlah</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Stok (sebelum → sesudah)</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF0]">
                  {movements.map((m) => {
                    const isIn = m.type === MovementType.IN;
                    const ref =
                      m.stockIn?.referenceNumber ||
                      m.stockOut?.referenceNumber ||
                      "-";
                    const note = m.stockIn?.note ?? m.stockOut?.note ?? m.note ?? "";
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-[#F4F7FA]/70">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-[#293746]">
                          {ref}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#7C8996]">
                          {formatDateTime(m.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              isIn
                                ? "bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]"
                                : "bg-[#F7F1E6] text-[#8A6A3D] ring-1 ring-[#E8B978]/40"
                            }`}
                          >
                            {isIn ? (
                              <ArrowDownToLine className="size-3" aria-hidden />
                            ) : (
                              <ArrowUpFromLine className="size-3" aria-hidden />
                            )}
                            {isIn ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-[220px] truncate font-medium text-[#293746]">
                            {m.product.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">
                            {m.product.sku}
                          </p>
                        </td>
                        <td
                          className={`px-5 py-3.5 font-semibold tabular-nums ${
                            isIn ? "text-[#527C9E]" : "text-[#293746]"
                          }`}
                        >
                          {isIn ? "+" : "-"}
                          {formatNumber(m.quantity)}{" "}
                          <span className="text-xs font-normal text-[#9AA6B2]">
                            {m.product.unit}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 tabular-nums text-xs text-[#7C8996]">
                          {formatNumber(m.stockBefore)} → {formatNumber(m.stockAfter)}
                        </td>
                        <td className="max-w-[260px] px-5 py-3.5 text-xs text-[#7C8996]">
                          <p className="whitespace-pre-line line-clamp-2">
                            {note || "-"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
