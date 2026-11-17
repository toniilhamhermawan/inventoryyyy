import { z } from "zod";

const positiveIntString = z
  .string()
  .trim()
  .min(1, "Jumlah wajib diisi.")
  .refine((value) => /^\d+$/.test(value), "Jumlah harus berupa bilangan bulat.")
  .transform((value) => Number(value))
  .refine((value) => value > 0, "Jumlah harus lebih dari 0.")
  .refine((value) => value <= 2147483647, "Jumlah terlalu besar.");

const optionalDecimalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine(
    (value) => value === undefined || /^\d+(\.\d+)?$/.test(value),
    "Harga harus berupa angka yang valid.",
  )
  .refine(
    (value) => value === undefined || Number(value) >= 0,
    "Harga tidak boleh negatif.",
  );

const dateString = z
  .string()
  .trim()
  .min(1, "Tanggal transaksi wajib diisi.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Tanggal transaksi tidak valid.");

export const stockInSchema = z.object({
  productId: z.string().uuid("Barang tidak valid."),
  quantity: positiveIntString,
  date: dateString,
  purchasePrice: optionalDecimalString,
  supplier: z.string().trim().max(120, "Nama supplier maksimal 120 karakter.").optional().transform((v) => v?.trim() || ""),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional().transform((v) => v?.trim() || ""),
});

export const stockOutSchema = z.object({
  productId: z.string().uuid("Barang tidak valid."),
  quantity: positiveIntString,
  date: dateString,
  recipient: z.string().trim().max(120, "Tujuan/penerima maksimal 120 karakter.").optional().transform((v) => v?.trim() || ""),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional().transform((v) => v?.trim() || ""),
});

export function firstTransactionError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data transaksi tidak valid.";
}
