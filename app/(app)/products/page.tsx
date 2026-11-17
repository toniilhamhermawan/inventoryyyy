import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Package, Search } from "lucide-react";
import { Prisma } from "@prisma/client";

import { CreateProductDialog, ProductRowActions } from "@/app/components/products/product-dialogs";
import { StockBadge } from "@/app/components/products/stock-badge";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatCurrency, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Data Barang",
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  status?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const PAGE_SIZE = 10;

function getString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function buildPageLink(
  base: Record<string, string>,
  page: number,
) {
  const params = new URLSearchParams(base);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsContent({ searchParams }: PageProps) {
  const { business } = await requireBusiness();
  const params = await searchParams;

  const q = getString(params.q).trim().slice(0, 100);
  const category = getString(params.category).trim();
  const status = getString(params.status).trim();
  const sort = getString(params.sort).trim() || "newest";
  const pageRaw = Number.parseInt(getString(params.page) || "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const where: Prisma.ProductWhereInput = { businessId: business.id };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (status === "available") {
    where.stock = { gt: prisma.product.fields.minStock };
  } else if (status === "low") {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { stock: { gt: 0 } },
      { stock: { lte: prisma.product.fields.minStock } },
    ];
  } else if (status === "out") {
    where.stock = { lte: 0 };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case "name_asc":
        return [{ name: "asc" }];
      case "name_desc":
        return [{ name: "desc" }];
      case "stock_asc":
        return [{ stock: "asc" }, { name: "asc" }];
      case "stock_desc":
        return [{ stock: "desc" }, { name: "asc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      case "newest":
      default:
        return [{ createdAt: "desc" }];
    }
  })();

  const [total, products, categories, totalAll] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({
      where: { businessId: business.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where: { businessId: business.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const baseParams: Record<string, string> = {};
  if (q) baseParams.q = q;
  if (category) baseParams.category = category;
  if (status) baseParams.status = status;
  if (sort && sort !== "newest") baseParams.sort = sort;

  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Manajemen
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Data Barang
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Kelola produk usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>.
            Total {formatNumber(totalAll)} produk.
          </p>
        </div>
        <CreateProductDialog categories={categories} />
      </header>

      <section className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <form
          action="/products"
          method="get"
          className="grid gap-3 border-b border-[#E5EBF0] p-4 lg:grid-cols-[1fr_180px_180px_180px_auto]"
        >
          <div className="relative lg:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA6B2]"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau SKU..."
              aria-label="Cari produk"
              className="h-10 w-full rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 pl-9 pr-3 text-sm text-[#293746] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </div>

          <select
            name="category"
            defaultValue={category}
            aria-label="Filter kategori"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status}
            aria-label="Filter status stok"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          >
            <option value="">Semua status stok</option>
            <option value="available">Tersedia</option>
            <option value="low">Menipis</option>
            <option value="out">Habis</option>
          </select>

          <select
            name="sort"
            defaultValue={sort}
            aria-label="Urutkan"
            className="h-10 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 px-3 text-sm text-[#293746] outline-none focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name_asc">Nama A–Z</option>
            <option value="name_desc">Nama Z–A</option>
            <option value="stock_desc">Stok tertinggi</option>
            <option value="stock_asc">Stok terendah</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] lg:flex-none"
            >
              Terapkan
            </button>
            {(q || category || status || sort !== "newest") ? (
              <Link
                href="/products"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={totalAll === 0 ? "Belum ada produk" : "Produk tidak ditemukan"}
            description={
              totalAll === 0
                ? "Tambahkan produk pertama untuk mulai mengelola stok dan persediaan usaha Anda."
                : "Tidak ada produk yang cocok dengan pencarian atau filter saat ini. Coba ubah kata kunci atau reset filter."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                    <th scope="col" className="px-5 py-3 font-semibold">Produk</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Kategori</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Harga beli</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Harga jual</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Stok</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF0]">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-[#F4F7FA]/70">
                      <td className="px-5 py-3.5">
                        <Link href={`/products/${product.id}`} className="group block">
                          <p className="max-w-[260px] truncate font-medium text-[#293746] group-hover:text-[#527C9E]">
                            {product.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">{product.sku}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#7C8996]">
                        {product.category?.name ?? <span className="text-[#9AA6B2]">—</span>}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-[#293746]">
                        {formatCurrency(Number(product.purchasePrice))}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums font-medium text-[#293746]">
                        {formatCurrency(Number(product.sellingPrice))}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#293746] tabular-nums">
                          {formatNumber(product.stock)}{" "}
                          <span className="text-xs font-normal text-[#9AA6B2]">{product.unit}</span>
                        </p>
                        <p className="text-[11px] text-[#9AA6B2]">Min. {formatNumber(product.minStock)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StockBadge stock={product.stock} minStock={product.minStock} />
                      </td>
                      <td className="px-5 py-3.5">
                        <ProductRowActions
                          product={{
                            id: product.id,
                            name: product.name,
                            sku: product.sku,
                            categoryId: product.categoryId,
                            purchasePrice: String(product.purchasePrice),
                            sellingPrice: String(product.sellingPrice),
                            minStock: product.minStock,
                            unit: product.unit,
                          }}
                          categories={categories}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E5EBF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#7C8996]">
                Menampilkan {formatNumber(from)}–{formatNumber(to)} dari {formatNumber(total)} produk
                {total !== totalAll ? ` (difilter dari ${formatNumber(totalAll)})` : ""}.
              </p>
              {totalPages > 1 ? (
                <nav aria-label="Pagination produk" className="flex items-center gap-2">
                  <Link
                    href={buildPageLink(baseParams, Math.max(1, safePage - 1))}
                    aria-disabled={safePage <= 1}
                    className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium ${
                      safePage <= 1
                        ? "pointer-events-none border-[#E5EBF0] text-slate-300"
                        : "border-[#C8D4DF] text-[#293746] hover:bg-[#F4F7FA]"
                    }`}
                  >
                    Sebelumnya
                  </Link>
                  <span className="text-xs font-medium text-[#7C8996]">
                    Halaman {formatNumber(safePage)} / {formatNumber(totalPages)}
                  </span>
                  <Link
                    href={buildPageLink(baseParams, Math.min(totalPages, safePage + 1))}
                    aria-disabled={safePage >= totalPages}
                    className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium ${
                      safePage >= totalPages
                        ? "pointer-events-none border-[#E5EBF0] text-slate-300"
                        : "border-[#C8D4DF] text-[#293746] hover:bg-[#F4F7FA]"
                    }`}
                  >
                    Berikutnya
                  </Link>
                </nav>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
