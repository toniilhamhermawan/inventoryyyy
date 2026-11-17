import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch, Search } from "lucide-react";

import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatCurrency, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Pencarian",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const { business } = await requireBusiness();

  const products = query
    ? await prisma.product.findMany({
        where: {
          businessId: business.id,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          minStock: true,
          unit: true,
          sellingPrice: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ name: "asc" }],
        take: 20,
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
          Smart Inventory
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
          Pencarian produk
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
          Cari produk berdasarkan nama atau SKU pada usaha{" "}
          <span className="font-medium text-[#293746]">{business.name}</span>.
        </p>
      </header>

      <form
        action="/search"
        method="get"
        role="search"
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9AA6B2]"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Nama produk atau SKU..."
            aria-label="Kata kunci pencarian"
            className="h-11 w-full rounded-xl border border-[#E5EBF0] bg-white pl-10 pr-3 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#527C9E] px-5 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#527C9E]"
        >
          <Search className="size-4" aria-hidden />
          Cari
        </button>
      </form>

      {!query ? (
        <div className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
          <EmptyState
            icon={PackageSearch}
            title="Mulai mencari produk"
            description="Masukkan nama produk atau SKU pada kolom pencarian untuk melihat stok dan harga."
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
          <EmptyState
            icon={PackageSearch}
            title="Produk tidak ditemukan"
            description={`Tidak ada produk yang cocok dengan “${query}”. Coba kata kunci atau SKU lain.`}
          />
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5EBF0] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#293746]">
                Hasil pencarian
              </h2>
              <p className="mt-0.5 text-xs text-[#7C8996]">
                {formatNumber(products.length)} produk cocok dengan “{query}”.
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[#E5EBF0]">
            {products.map((product) => {
              const status =
                product.stock <= 0
                  ? {
                      label: "Habis",
                      className: "bg-red-50 text-red-700 ring-red-100",
                    }
                  : product.stock <= product.minStock
                    ? {
                        label: "Menipis",
                        className:
                          "bg-amber-50 text-amber-700 ring-amber-100",
                      }
                    : {
                        label: "Tersedia",
                        className:
                          "bg-emerald-50 text-emerald-700 ring-emerald-100",
                      };

              return (
                <li
                  key={product.id}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#F4F7FA]/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#293746]">
                        {product.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">
                      {product.sku}
                      {product.category
                        ? ` · ${product.category.name}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 sm:shrink-0 sm:text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#9AA6B2]">
                        Stok
                      </p>
                      <p className="text-sm font-semibold text-[#293746] tabular-nums">
                        {formatNumber(product.stock)}{" "}
                        <span className="text-xs font-normal text-[#9AA6B2]">
                          {product.unit}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#9AA6B2]">
                        Harga jual
                      </p>
                      <p className="text-sm font-semibold text-[#293746] tabular-nums">
                        {formatCurrency(product.sellingPrice.toNumber())}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
