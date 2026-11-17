"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";

export function ProfileMenu({
  name,
  email,
  businessName,
}: {
  name: string | null;
  email: string;
  businessName: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = name?.trim() || email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition-colors hover:border-[#E5EBF0] hover:bg-[#F4F7FA]"
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#527C9E] text-sm font-bold text-white shadow-sm"
        >
          {initial}
        </span>
        <span className="hidden min-w-0 text-left xl:block">
          <span className="block max-w-[130px] truncate text-xs font-semibold text-[#293746]">
            {displayName}
          </span>
          <span className="block max-w-[130px] truncate text-[10px] text-[#7C8996]">
            {businessName}
          </span>
        </span>
        <ChevronDown
          className={`hidden size-4 text-[#9AA6B2] transition-transform xl:block ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-[#E5EBF0] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#293746]">
              {displayName}
            </p>
            <p className="truncate text-xs text-[#7C8996]">{email}</p>
            <p className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-[11px] text-[#9AA6B2]">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{businessName}</span>
            </p>
          </div>

          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#293746] transition-colors hover:bg-[#F4F7FA]"
            >
              <Settings className="size-4 text-[#9AA6B2]" aria-hidden />
              Pengaturan
            </Link>
          </div>

          <div className="border-t border-[#E5EBF0] p-1.5">
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="size-4" aria-hidden />
                Keluar
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
