import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  Boxes,
  LayoutDashboard,
  PackageSearch,
} from "lucide-react";

const highlights = [
  {
    icon: PackageSearch,
    title: "Produk rapi",
    description:
      "SKU, harga, satuan, dan stok minimum tersimpan dalam satu tempat.",
  },
  {
    icon: ArrowLeftRight,
    title: "Stok selalu akurat",
    description:
      "Barang masuk dan keluar tercatat otomatis lewat transaksi database.",
  },
  {
    icon: LayoutDashboard,
    title: "Pantau dari dashboard",
    description:
      "Lihat ringkasan stok dan produk yang perlu segera ditambah.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-white lg:flex-row">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-slate-100 lg:flex lg:w-[46%] lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#527C9E]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-[#EEF4F8]0/10 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#527C9E] text-white">
            <Boxes className="size-5" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Smart Inventory
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Stok usaha Anda,
            <span className="text-[#A9C6D8]"> dalam kendali.</span>
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#9AA6B2]">
            Catat produk, transaksi, dan pergerakan stok tanpa spreadsheet.
            Semua data tersimpan aman dan terpisah untuk usaha Anda.
          </p>

          <ul className="mt-9 space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#A9C6D8] ring-1 ring-white/10">
                  <item.icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#9AA6B2]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#7C8996]">
          Next.js · Prisma · Supabase
        </p>
      </aside>

      <main className="flex flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 lg:hidden"
            aria-label="Smart Inventory"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#527C9E] text-white">
              <Boxes className="size-4.5" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#293746]">
              Smart Inventory
            </span>
          </Link>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#7C8996] transition-colors hover:bg-[#EDF2F6] hover:text-[#293746]"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
