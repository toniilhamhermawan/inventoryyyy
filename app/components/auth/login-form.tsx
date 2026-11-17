"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";

import { loginAction, type AuthActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/app/components/auth/submit-button";

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15 disabled:cursor-not-allowed disabled:bg-[#F4F7FA]";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
          <LogIn className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#293746]">
          Masuk ke akun Anda
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7C8996]">
          Lanjutkan mengelola produk dan stok usaha Anda dengan aman.
        </p>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        {state.error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="leading-5">{state.error}</p>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#293746]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            inputMode="email"
            placeholder="nama@usaha.com"
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#293746]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Masukkan password"
              className={`${inputClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[#9AA6B2] transition-colors hover:text-[#293746] focus-visible:outline-none"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4.5" aria-hidden />
              ) : (
                <Eye className="size-4.5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#7C8996]">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="size-4 rounded border-[#C8D4DF] text-[#527C9E] focus:ring-[#527C9E]"
            />
            Ingat sesi login
          </label>
        </div>

        <SubmitButton pendingText="Sedang masuk...">Masuk</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[#7C8996]">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#527C9E] hover:text-[#466b87]"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
