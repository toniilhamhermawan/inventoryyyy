"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/app/actions/products";
import { SubmitButton } from "@/app/components/auth/submit-button";

type CategoryOption = { id: string; name: string };

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15";

const initialState: ProductActionState = {};

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

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  labelledBy: string;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-[#E5EBF0] bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={labelledBy} className="text-lg font-semibold text-[#293746]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-[#7C8996]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#9AA6B2] hover:bg-[#EDF2F6] hover:text-[#293746]"
            aria-label="Tutup"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function CreateProductDialog({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createProductAction, initialState);
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
        Tambah produk
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah produk"
        description="Masukkan informasi produk. SKU harus unik dalam satu usaha."
        labelledBy="create-product-title"
      >
        <form ref={formRef} action={formAction} className="space-y-4">
          <FieldError error={state.error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-name" className="block text-sm font-medium text-[#293746]">
                Nama produk
              </label>
              <input id="create-name" name="name" required minLength={2} maxLength={120} className={inputClassName} placeholder="Contoh: Kopi Arabika 250g" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-sku" className="block text-sm font-medium text-[#293746]">
                SKU / Kode barang
              </label>
              <input id="create-sku" name="sku" required minLength={2} maxLength={50} className={inputClassName} placeholder="Contoh: KOPI-001" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-category" className="block text-sm font-medium text-[#293746]">
                Kategori
              </label>
              <select id="create-category" name="categoryId" className={inputClassName} defaultValue="">
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-purchase" className="block text-sm font-medium text-[#293746]">
                Harga beli (Rp)
              </label>
              <input id="create-purchase" name="purchasePrice" type="number" inputMode="decimal" min="0" step="0.01" required className={inputClassName} placeholder="0" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-selling" className="block text-sm font-medium text-[#293746]">
                Harga jual (Rp)
              </label>
              <input id="create-selling" name="sellingPrice" type="number" inputMode="decimal" min="0" step="0.01" required className={inputClassName} placeholder="0" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-stock" className="block text-sm font-medium text-[#293746]">
                Stok awal
              </label>
              <input id="create-stock" name="stock" type="number" inputMode="numeric" min="0" step="1" required defaultValue="0" className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-minStock" className="block text-sm font-medium text-[#293746]">
                Stok minimum
              </label>
              <input id="create-minStock" name="minStock" type="number" inputMode="numeric" min="0" step="1" required defaultValue="0" className={inputClassName} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-unit" className="block text-sm font-medium text-[#293746]">
                Satuan barang
              </label>
              <input id="create-unit" name="unit" required minLength={1} maxLength={30} className={inputClassName} placeholder="Contoh: pcs, box, kg, liter" />
            </div>
          </div>

          <p className="text-xs leading-5 text-[#7C8996]">
            Harga dan stok tidak boleh bernilai negatif. Produk hanya dapat diakses oleh usaha Anda.
          </p>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]">
              Batal
            </button>
            <div className="sm:w-44">
              <SubmitButton pendingText="Menyimpan...">Simpan produk</SubmitButton>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function EditProductDialog({
  product,
  categories,
}: {
  product: {
    id: string;
    name: string;
    sku: string;
    categoryId: string | null;
    purchasePrice: string;
    sellingPrice: string;
    minStock: number;
    unit: string;
  };
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateProductAction, initialState);
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
        aria-label={`Edit produk ${product.name}`}
      >
        <Pencil className="size-4" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit produk"
        description="Perbarui informasi produk. Stok saat ini tidak diubah dari form ini."
        labelledBy={`edit-product-title-${product.id}`}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <FieldError error={state.error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor={`edit-name-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Nama produk
              </label>
              <input id={`edit-name-${product.id}`} name="name" required minLength={2} maxLength={120} defaultValue={product.name} className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-sku-${product.id}`} className="block text-sm font-medium text-[#293746]">
                SKU / Kode barang
              </label>
              <input id={`edit-sku-${product.id}`} name="sku" required minLength={2} maxLength={50} defaultValue={product.sku} className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-category-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Kategori
              </label>
              <select id={`edit-category-${product.id}`} name="categoryId" className={inputClassName} defaultValue={product.categoryId ?? ""}>
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-purchase-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Harga beli (Rp)
              </label>
              <input id={`edit-purchase-${product.id}`} name="purchasePrice" type="number" inputMode="decimal" min="0" step="0.01" required defaultValue={product.purchasePrice} className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-selling-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Harga jual (Rp)
              </label>
              <input id={`edit-selling-${product.id}`} name="sellingPrice" type="number" inputMode="decimal" min="0" step="0.01" required defaultValue={product.sellingPrice} className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-minStock-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Stok minimum
              </label>
              <input id={`edit-minStock-${product.id}`} name="minStock" type="number" inputMode="numeric" min="0" step="1" required defaultValue={product.minStock} className={inputClassName} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`edit-unit-${product.id}`} className="block text-sm font-medium text-[#293746]">
                Satuan barang
              </label>
              <input id={`edit-unit-${product.id}`} name="unit" required minLength={1} maxLength={30} defaultValue={product.unit} className={inputClassName} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]">
              Batal
            </button>
            <div className="sm:w-44">
              <SubmitButton pendingText="Menyimpan...">Simpan perubahan</SubmitButton>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function DeleteProductDialog({
  product,
}: {
  product: { id: string; name: string; sku: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteProductAction, initialState);
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
        className="inline-flex size-9 items-center justify-center rounded-lg text-[#7C8996] transition-colors hover:bg-red-50 hover:text-red-700"
        aria-label={`Hapus produk ${product.name}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hapus produk"
        description="Produk yang sudah memiliki riwayat transaksi tidak dapat dihapus."
        labelledBy={`delete-product-title-${product.id}`}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <p className="text-sm leading-6 text-[#7C8996]">
            Anda yakin ingin menghapus produk{" "}
            <span className="font-semibold text-[#293746]">{product.name}</span>{" "}
            <span className="font-mono text-xs text-[#7C8996]">({product.sku})</span>?
          </p>
          <FieldError error={state.error} />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]">
              Batal
            </button>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
              <Trash2 className="size-4" aria-hidden />
              Hapus produk
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ProductRowActions({
  product,
  categories,
}: {
  product: {
    id: string;
    name: string;
    sku: string;
    categoryId: string | null;
    purchasePrice: string;
    sellingPrice: string;
    minStock: number;
    unit: string;
  };
  categories: CategoryOption[];
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/products/${product.id}`}
        className="inline-flex size-9 items-center justify-center rounded-lg text-[#7C8996] transition-colors hover:bg-[#EDF2F6] hover:text-[#293746]"
        aria-label={`Detail produk ${product.name}`}
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <EditProductDialog product={product} categories={categories} />
      <DeleteProductDialog product={{ id: product.id, name: product.name, sku: product.sku }} />
    </div>
  );
}
