"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";

import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/app/components/auth/submit-button";

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15 disabled:cursor-not-allowed disabled:bg-[#F4F7FA]";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (state.message) {
    return (
      <div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#293746]">
          Konfirmasi email Anda
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7C8996]">{state.message}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/20 transition-colors hover:bg-[#466b87]"
        >
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
          <UserPlus className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#293746]">
          Buat akun baru
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7C8996]">
          Daftarkan akun dan usaha Anda. Satu akun terhubung dengan satu usaha.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
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
            htmlFor="name"
            className="block text-sm font-medium text-[#293746]"
          >
            Nama lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Nama pemilik usaha"
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="businessName"
            className="block text-sm font-medium text-[#293746]"
          >
            Nama usaha
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={100}
            placeholder="Contoh: Toko Berkah Jaya"
            className={inputClassName}
          />
        </div>

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
          <p className="text-xs text-[#7C8996]">Email harus unik dan valid.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Min. 8 karakter"
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

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#293746]"
            >
              Konfirmasi password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Ulangi password"
                className={`${inputClassName} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[#9AA6B2] transition-colors hover:text-[#293746] focus-visible:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Tampilkan konfirmasi password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4.5" aria-hidden />
                ) : (
                  <Eye className="size-4.5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs leading-5 text-[#7C8996]">
          Password disimpan secara aman (hash). Data akun dan usaha Anda akan
          terhubung otomatis.
        </p>

        <SubmitButton pendingText="Membuat akun...">Daftar</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[#7C8996]">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#527C9E] hover:text-[#466b87]"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
