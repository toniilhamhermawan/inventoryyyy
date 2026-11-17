"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/actions/categories";
import { SubmitButton } from "@/app/components/auth/submit-button";

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15";

const initialState: CategoryActionState = {};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{error}</p>
    </div>
  );
}

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createCategoryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.ok) return;
    const timeoutId = window.setTimeout(() => {
      setOpen(false);
      formRef.current?.reset();
      router.refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [state.ok, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] sm:w-auto"
      >
        <Plus className="size-4" aria-hidden />
        Tambah kategori
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E5EBF0] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="create-category-title" className="text-lg font-semibold text-[#293746]">
                  Tambah kategori
                </h2>
                <p className="mt-1 text-sm text-[#7C8996]">
                  Kelompokkan produk agar mudah dicari dan difilter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-[#9AA6B2] hover:bg-[#EDF2F6] hover:text-[#293746]"
                aria-label="Tutup"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5 space-y-4">
              <FieldError error={state.error} />

              <div className="space-y-1.5">
                <label htmlFor="create-category-name" className="block text-sm font-medium text-[#293746]">
                  Nama kategori
                </label>
                <input
                  id="create-category-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Contoh: Minuman"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-category-description" className="block text-sm font-medium text-[#293746]">
                  Deskripsi <span className="font-normal text-[#9AA6B2]">(opsional)</span>
                </label>
                <textarea
                  id="create-category-description"
                  name="description"
                  rows={3}
                  maxLength={255}
                  placeholder="Keterangan singkat kategori"
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
                >
                  Batal
                </button>
                <div className="sm:w-44">
                  <SubmitButton pendingText="Menyimpan...">Simpan kategori</SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function EditCategoryDialog({
  category,
}: {
  category: { id: string; name: string; description: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateCategoryAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.ok) return;
    const timeoutId = window.setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [state.ok, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-[#7C8996] transition-colors hover:bg-[#EDF2F6] hover:text-[#293746]"
        aria-label={`Edit kategori ${category.name}`}
      >
        <Pencil className="size-4" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-category-title-${category.id}`}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E5EBF0] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`edit-category-title-${category.id}`} className="text-lg font-semibold text-[#293746]">
                  Edit kategori
                </h2>
                <p className="mt-1 text-sm text-[#7C8996]">Perbarui informasi kategori.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-[#9AA6B2] hover:bg-[#EDF2F6] hover:text-[#293746]"
                aria-label="Tutup"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={category.id} />
              <FieldError error={state.error} />

              <div className="space-y-1.5">
                <label htmlFor={`edit-category-name-${category.id}`} className="block text-sm font-medium text-[#293746]">
                  Nama kategori
                </label>
                <input
                  id={`edit-category-name-${category.id}`}
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={category.name}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`edit-category-description-${category.id}`} className="block text-sm font-medium text-[#293746]">
                  Deskripsi <span className="font-normal text-[#9AA6B2]">(opsional)</span>
                </label>
                <textarea
                  id={`edit-category-description-${category.id}`}
                  name="description"
                  rows={3}
                  maxLength={255}
                  defaultValue={category.description ?? ""}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
                >
                  Batal
                </button>
                <div className="sm:w-44">
                  <SubmitButton pendingText="Menyimpan...">Simpan perubahan</SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DeleteCategoryDialog({
  category,
  productCount,
}: {
  category: { id: string; name: string };
  productCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteCategoryAction, initialState);
  const router = useRouter();
  const blocked = productCount > 0;

  useEffect(() => {
    if (!state.ok) return;
    const timeoutId = window.setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [state.ok, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-[#7C8996] transition-colors hover:bg-red-50 hover:text-red-700"
        aria-label={`Hapus kategori ${category.name}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-category-title-${category.id}`}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#E5EBF0] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`delete-category-title-${category.id}`} className="text-lg font-semibold text-[#293746]">
                  Hapus kategori
                </h2>
                <p className="mt-1 text-sm text-[#7C8996]">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-[#9AA6B2] hover:bg-[#EDF2F6] hover:text-[#293746]"
                aria-label="Tutup"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={category.id} />

              {blocked ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
                  Kategori <span className="font-semibold">{category.name}</span> masih memiliki{" "}
                  <span className="font-semibold">{productCount} produk</span> dan tidak dapat dihapus.
                  Pindahkan atau hapus produk terkait terlebih dahulu.
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#7C8996]">
                  Anda yakin ingin menghapus kategori{" "}
                  <span className="font-semibold text-[#293746]">{category.name}</span>?
                </p>
              )}

              <FieldError error={state.error} />

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]"
                >
                  {blocked ? "Tutup" : "Batal"}
                </button>
                {!blocked ? (
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Hapus
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
