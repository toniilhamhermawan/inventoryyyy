"use client";

import { useActionState } from "react";
import { AlertCircle, Building2 } from "lucide-react";

import {
  createBusinessAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { SubmitButton } from "@/app/components/auth/submit-button";

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15 disabled:cursor-not-allowed disabled:bg-[#F4F7FA]";

const initialState: AuthActionState = {};

export function OnboardingForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(
    createBusinessAction,
    initialState,
  );

  return (
    <div>
      <div className="mb-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#EEF4F8] text-[#527C9E] ring-1 ring-[#D7E3EC]">
          <Building2 className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#293746]">
          Daftarkan usaha Anda
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7C8996]">
          Masuk sebagai <span className="font-medium">{email}</span>. Beri nama
          usaha yang akan dikelola di Smart Inventory.
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
            htmlFor="name"
            className="block text-sm font-medium text-[#293746]"
          >
            Nama usaha
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={100}
            placeholder="Contoh: Toko Berkah Jaya"
            className={inputClassName}
          />
          <p className="text-xs leading-5 text-[#7C8996]">
            Nama ini akan tampil di dashboard. Satu akun hanya dapat memiliki
            satu usaha.
          </p>
        </div>

        <SubmitButton pendingText="Menyimpan usaha...">
          Simpan dan buka dashboard
        </SubmitButton>
      </form>
    </div>
  );
}
