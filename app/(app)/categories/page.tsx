import type { Metadata } from "next";
import { Suspense } from "react";
import { Search, Tags } from "lucide-react";

import {
  CreateCategoryDialog,
  DeleteCategoryDialog,
  EditCategoryDialog,
} from "@/app/components/categories/category-dialogs";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";
import { requireBusiness } from "@/lib/auth/dal";
import { formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Kategori",
};

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function CategoriesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoriesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoriesContent({ searchParams }: PageProps) {
  const { business } = await requireBusiness();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const categories = await prisma.category.findMany({
    where: {
      businessId: business.id,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: [{ name: "asc" }],
  });

  const total = await prisma.category.count({
    where: { businessId: business.id },
  });

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#527C9E]">
            Manajemen
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
            Kategori
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7C8996]">
            Kelompokkan produk usaha{" "}
            <span className="font-medium text-[#293746]">{business.name}</span>.
            Total {formatNumber(total)} kategori.
          </p>
        </div>
        <CreateCategoryDialog />
      </header>

      <section className="mt-6 rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E5EBF0] p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            action="/categories"
            method="get"
            className="relative w-full sm:max-w-sm"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA6B2]"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau deskripsi kategori..."
              aria-label="Cari kategori"
              className="h-10 w-full rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/80 pl-9 pr-3 text-sm text-[#293746] outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:bg-white focus:ring-4 focus:ring-[#527C9E]/15"
            />
          </form>
          {q ? (
            <p className="text-xs text-[#7C8996]">
              Menampilkan {formatNumber(categories.length)} hasil untuk “{q}”.
            </p>
          ) : null}
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title={q ? "Kategori tidak ditemukan" : "Belum ada kategori"}
            description={
              q
                ? `Tidak ada kategori yang cocok dengan “${q}”. Coba kata kunci lain.`
                : "Tambahkan kategori pertama untuk mulai mengelompokkan produk Anda."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Nama kategori
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Jumlah produk
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-[#F4F7FA]/70"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#293746]">
                        {category.name}
                      </p>
                    </td>
                    <td className="max-w-[360px] px-5 py-3.5 text-[#7C8996]">
                      <p className="truncate">
                        {category.description || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-[#EDF2F6] px-2.5 py-1 text-xs font-semibold text-[#293746]">
                        {formatNumber(category._count.products)} produk
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <EditCategoryDialog
                          category={{
                            id: category.id,
                            name: category.name,
                            description: category.description,
                          }}
                        />
                        <DeleteCategoryDialog
                          category={{ id: category.id, name: category.name }}
                          productCount={category._count.products}
                        />
                      </div>
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
