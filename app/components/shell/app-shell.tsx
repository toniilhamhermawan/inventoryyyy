"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  History,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Tags,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Data Barang", icon: Package },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/stock-in", label: "Barang Masuk", icon: ArrowDownToLine },
  { href: "/stock-out", label: "Barang Keluar", icon: ArrowUpFromLine },
  { href: "/transactions", label: "Riwayat Transaksi", icon: History },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  header,
}: {
  children: ReactNode;
  header: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#293746]">
      <div
        aria-hidden
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#527C9E] transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
              <Boxes className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">
                Smart Inventory
              </span>
              <span className="block truncate text-[11px] text-white/70">
                Kelola stok usaha
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-4 pb-2">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Menu utama
          </p>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="flex-1 space-y-1 overflow-y-auto px-3 pb-4"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-white text-[#527C9E] shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`size-[18px] shrink-0 transition-colors ${
                    active
                      ? "text-[#527C9E]"
                      : "text-white/70 group-hover:text-white"
                  }`}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
                {active ? (
                  <span
                    aria-hidden
                    className="ml-auto size-1.5 rounded-full bg-[#E8B978]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/15 p-4">
          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
            <p className="text-xs font-medium text-white">
              Smart Inventory
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-white/70">
              Pencatatan stok sederhana untuk UMKM Indonesia.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#E5EBF0]/70 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E5EBF0] bg-white text-[#7C8996] shadow-sm transition-colors hover:bg-[#F4F7FA] hover:text-[#293746] lg:hidden"
              aria-label="Buka menu"
              aria-controls="app-sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 lg:hidden"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#527C9E] text-white">
                <Boxes className="size-4" aria-hidden />
              </span>
              <span className="hidden truncate text-sm font-semibold tracking-tight sm:inline">
                Smart Inventory
              </span>
            </Link>

            <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
              {header}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
