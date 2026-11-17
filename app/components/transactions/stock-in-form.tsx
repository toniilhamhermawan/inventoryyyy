"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";

import {
  createStockInAction,
  type StockTransactionActionState,
} from "@/app/actions/stock-transactions";
import { SubmitButton } from "@/app/components/auth/submit-button";
import { formatNumber } from "@/lib/format";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  purchasePrice: string;
};

const inputClassName =
  "block w-full rounded-xl border border-[#C8D4DF] bg-white px-3.5 py-2.5 text-sm text-[#293746] shadow-sm outline-none transition placeholder:text-[#9AA6B2] focus:border-[#527C9E] focus:ring-4 focus:ring-[#527C9E]/15";

const initialState: StockTransactionActionState = {};

function nowLocalInputValue() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function StockInForm({ products }: { products: ProductOption[] }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction] = useActionState(createStockInAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ product: string; qty: string; date: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.ok) return;
    const timeoutId = window.setTimeout(() => {
      setConfirmOpen(false);
      formRef.current?.reset();
      router.refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [state.ok, router]);

  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  function handleRequestSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const productId = String(data.get("productId") || "");
    const qty = Number(String(data.get("quantity") || "0"));
    const date = String(data.get("date") || "");
    const product = productsById.get(productId);

    if (!product) {
      setClientError("Pilih barang yang valid.");
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      setClientError("Jumlah barang masuk harus lebih dari 0.");
      return;
    }
    if (!date) {
      setClientError("Tanggal transaksi wajib diisi.");
      return;
    }

    setSummary({
      product: `${product.name} (${product.sku})`,
      qty: `${formatNumber(qty)} ${product.unit}`,
      date: new Date(date).toLocaleString("id-ID"),
    });
    setConfirmOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setClientError(null);
        }}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white shadow-sm shadow-[#527C9E]/15 transition-colors hover:bg-[#466b87] sm:w-auto"
      >
        <Plus className="size-4" aria-hidden />
        Tambah barang masuk
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => !confirmOpen && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-in-title"
            className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-[#E5EBF0] bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="stock-in-title" className="text-lg font-semibold text-[#293746]">
                  Tambah barang masuk
                </h2>
                <p className="mt-1 text-sm text-[#7C8996]">
                  Nomor transaksi dibuat otomatis. Stok akan bertambah setelah disimpan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#9AA6B2] hover:bg-[#EDF2F6] hover:text-[#293746]"
                aria-label="Tutup"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form ref={formRef} action={formAction} onSubmit={handleRequestSubmit} className="mt-5 space-y-4">
              {(clientError || state.error) ? (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>{clientError || state.error}</p>
                </div>
              ) : null}
              {state.ok && state.message ? (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>{state.message}</p>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="stockin-product" className="block text-sm font-medium text-[#293746]">Barang</label>
                  <select id="stockin-product" name="productId" required className={inputClassName} defaultValue="">
                    <option value="">Pilih barang</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — stok {p.stock} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stockin-qty" className="block text-sm font-medium text-[#293746]">Jumlah barang masuk</label>
                  <input id="stockin-qty" name="quantity" type="number" min="1" step="1" required className={inputClassName} placeholder="0" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stockin-date" className="block text-sm font-medium text-[#293746]">Tanggal transaksi</label>
                  <input id="stockin-date" name="date" type="datetime-local" required defaultValue={nowLocalInputValue()} className={inputClassName} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stockin-price" className="block text-sm font-medium text-[#293746]">Harga beli per unit <span className="font-normal text-[#9AA6B2]">(opsional)</span></label>
                  <input id="stockin-price" name="purchasePrice" type="number" min="0" step="0.01" className={inputClassName} placeholder="Gunakan harga beli produk" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stockin-supplier" className="block text-sm font-medium text-[#293746]">Supplier <span className="font-normal text-[#9AA6B2]">(opsional)</span></label>
                  <input id="stockin-supplier" name="supplier" type="text" maxLength={120} className={inputClassName} placeholder="Nama supplier" />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="stockin-note" className="block text-sm font-medium text-[#293746]">Catatan <span className="font-normal text-[#9AA6B2]">(opsional)</span></label>
                  <textarea id="stockin-note" name="note" rows={3} maxLength={500} className={inputClassName} placeholder="Catatan tambahan" />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]">
                  Batal
                </button>
                <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#527C9E] px-4 text-sm font-semibold text-white hover:bg-[#466b87]">
                  Simpan transaksi
                </button>
              </div>

              {confirmOpen && summary ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-950/40" aria-hidden />
                  <div role="dialog" aria-modal="true" aria-labelledby="confirm-stockin-title" className="relative z-10 w-full max-w-md rounded-2xl border border-[#E5EBF0] bg-white p-5 shadow-xl">
                    <h3 id="confirm-stockin-title" className="text-base font-semibold text-[#293746]">Konfirmasi barang masuk</h3>
                    <p className="mt-1 text-sm text-[#7C8996]">Pastikan data sudah benar sebelum disimpan. Stok akan bertambah otomatis.</p>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-[#7C8996]">Barang</dt><dd className="text-right font-medium text-[#293746]">{summary.product}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-[#7C8996]">Jumlah masuk</dt><dd className="font-semibold text-[#527C9E]">+{summary.qty}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-[#7C8996]">Tanggal</dt><dd className="text-right text-[#293746]">{summary.date}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-[#7C8996]">Nomor transaksi</dt><dd className="text-[#293746]">Dibuat otomatis</dd></div>
                    </dl>
                    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={() => setConfirmOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#C8D4DF] px-4 text-sm font-semibold text-[#293746] hover:bg-[#F4F7FA]">
                        Periksa kembali
                      </button>
                      <div className="sm:w-44">
                        <SubmitButton pendingText="Menyimpan...">Ya, simpan</SubmitButton>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
