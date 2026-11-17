import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, Package, Tag } from "lucide-react";

import {
  DeleteProductDialog,
  EditProductDialog,
} from "@/app/components/products/product-dialogs";
import { StockBadge } from "@/app/components/products/stock-badge";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Detail Produk",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({ params }: PageProps) {
  const { business } = await requireBusiness();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, businessId: business.id },
      include: {
        category: { select: { id: true, name: true } },
        _count: {
          select: { stockIns: true, stockOuts: true, stockMovements: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { businessId: business.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const hasHistory =
    product._count.stockMovements > 0 ||
    product._count.stockIns > 0 ||
    product._count.stockOuts > 0;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C8996] transition-colors hover:text-[#293746]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke Data Barang
        </Link>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Detail Produk
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
              {product.name}
            </h1>
            <StockBadge stock={product.stock} minStock={product.minStock} />
          </div>
          <p className="mt-2 font-mono text-sm text-[#7C8996]">{product.sku}</p>
        </div>

        <div className="flex items-center gap-2">
          <EditProductDialog
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
          <DeleteProductDialog
            product={{ id: product.id, name: product.name, sku: product.sku }}
          />
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-[#293746]">
            Informasi produk
          </h2>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                Nama
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#293746]">
                {product.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                SKU
              </dt>
              <dd className="mt-1 font-mono text-sm text-[#293746]">
                {product.sku}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                Kategori
              </dt>
              <dd className="mt-1 text-sm text-[#293746]">
                {product.category ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="size-3.5 text-[#9AA6B2]" aria-hidden />
                    {product.category.name}
                  </span>
                ) : (
                  <span className="text-[#9AA6B2]">Tanpa kategori</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                Satuan
              </dt>
              <dd className="mt-1 text-sm text-[#293746]">{product.unit}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                Harga beli
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-[#293746]">
                {formatCurrency(Number(product.purchasePrice))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9AA6B2]">
                Harga jual
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-[#293746]">
                {formatCurrency(Number(product.sellingPrice))}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-[#293746]">
              Stok & persediaan
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
                <Package className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-[#293746] tabular-nums">
                  {formatNumber(product.stock)}{" "}
                  <span className="text-sm font-medium text-[#7C8996]">
                    {product.unit}
                  </span>
                </p>
                <p className="text-xs text-[#7C8996]">
                  Stok minimum: {formatNumber(product.minStock)} {product.unit}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#F4F7FA] p-3 text-xs leading-5 text-[#7C8996]">
              {hasHistory ? (
                <p>
                  Produk ini memiliki riwayat transaksi (
                  {formatNumber(product._count.stockMovements)} pergerakan) dan
                  tidak dapat dihapus agar riwayat tetap terjaga.
                </p>
              ) : (
                <p>Produk ini belum memiliki riwayat transaksi.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-[#293746]">
              Informasi lainnya
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-[#7C8996]">
                <CalendarDays
                  className="mt-0.5 size-4 text-[#9AA6B2]"
                  aria-hidden
                />
                <div>
                  <dt className="text-xs text-[#9AA6B2]">Dibuat</dt>
                  <dd className="font-medium text-[#293746]">
                    {formatDateTime(product.createdAt)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-[#7C8996]">
                <CalendarDays
                  className="mt-0.5 size-4 text-[#9AA6B2]"
                  aria-hidden
                />
                <div>
                  <dt className="text-xs text-[#9AA6B2]">Diperbarui</dt>
                  <dd className="font-medium text-[#293746]">
                    {formatDateTime(product.updatedAt)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
