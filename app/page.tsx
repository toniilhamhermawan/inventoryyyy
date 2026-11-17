import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  CheckCircle2,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: PackageSearch,
    title: "Produk & kategori",
    description:
      "Simpan SKU, harga beli, harga jual, satuan, dan batas stok minimum untuk setiap produk.",
  },
  {
    icon: ArrowLeftRight,
    title: "Barang masuk & keluar",
    description:
      "Setiap transaksi stok dicatat dalam satu transaksi database yang aman dan konsisten.",
  },
  {
    icon: LayoutDashboard,
    title: "Riwayat pergerakan",
    description:
      "Telusuri stok sebelum dan sesudah transaksi lewat catatan StockMovement yang lengkap.",
  },
];

const steps = [
  "Buat akun dengan email dan password.",
  "Daftarkan usaha Anda - satu akun, satu usaha.",
  "Kelola produk dan pantau stok dari dashboard.",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-[#E5EBF0]/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#527C9E] text-white shadow-sm shadow-[#527C9E]/20">
              <Boxes className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-[#293746]">
              Smart Inventory
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#7C8996] transition-colors hover:bg-[#EDF2F6] hover:text-[#293746]"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#527C9E] px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87]"
            >
              Daftar
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(37,99,235,0.16),transparent)]"
          />
          <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A9C6D8] bg-[#EEF4F8] px-3 py-1 text-xs font-semibold text-[#527C9E]">
                <ShieldCheck className="size-3.5" aria-hidden />
                Stok akurat, keputusan lebih cepat
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-[#293746] sm:text-6xl">
                Kendalikan stok usaha
                <span className="text-[#527C9E]"> tanpa ribet.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#7C8996] sm:text-lg">
                Smart Inventory membantu Anda mencatat produk, barang masuk,
                dan barang keluar dengan rapi. Tidak perlu spreadsheet, tidak
                perlu hitung ulang.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#527C9E] px-6 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/20 transition-colors hover:bg-[#466b87] sm:w-auto"
                >
                  Mulai gratis
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#C8D4DF] bg-white px-6 text-sm font-semibold text-[#293746] transition-colors hover:border-slate-400 hover:bg-[#F4F7FA] sm:w-auto"
                >
                  Saya sudah punya akun
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[#E5EBF0] bg-white p-6 shadow-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E]">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-[#293746]">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7C8996]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#E5EBF0] bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#293746] sm:text-3xl">
                Mulai dalam tiga langkah
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#7C8996]">
                Onboarding singkat, langsung bisa dipakai. Setiap akun hanya
                mengelola satu usaha agar data stok tetap terpisah dan aman.
              </p>
            </div>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-[#E5EBF0] bg-[#F4F7FA]/70 p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#527C9E] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="inline-flex items-center gap-2 pt-0.5 text-sm text-[#293746]">
                    <CheckCircle2
                      className="size-4 shrink-0 text-[#527C9E]"
                      aria-hidden
                    />
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5EBF0] bg-[#F4F7FA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-[#7C8996] sm:flex-row sm:px-6">
          <p>Smart Inventory - pencatatan stok yang sederhana.</p>
          <p>Dibangun dengan Next.js, Prisma, dan Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
