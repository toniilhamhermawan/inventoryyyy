import { z } from "zod";

const decimalString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), `${label} harus berupa angka yang valid.`)
    .refine((value) => Number(value) >= 0, `${label} tidak boleh negatif.`)
    .refine((value) => Number(value) <= 999999999999.99, `${label} terlalu besar.`);

const intString = (label: string, { min = 0 }: { min?: number } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .refine((value) => /^-?\d+$/.test(value), `${label} harus berupa bilangan bulat.`)
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value), `${label} harus berupa bilangan bulat.`)
    .refine((value) => value >= min, `${label} tidak boleh kurang dari ${min}.`)
    .refine((value) => value <= 2147483647, `${label} terlalu besar.`);

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(120, "Nama produk maksimal 120 karakter."),
  sku: z
    .string()
    .trim()
    .min(2, "SKU minimal 2 karakter.")
    .max(50, "SKU maksimal 50 karakter."),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      "Kategori tidak valid.",
    ),
  purchasePrice: decimalString("Harga beli"),
  sellingPrice: decimalString("Harga jual"),
  stock: intString("Stok awal", { min: 0 }),
  minStock: intString("Stok minimum", { min: 0 }),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(30, "Satuan maksimal 30 karakter."),
});

export const updateProductSchema = z.object({
  id: z.string().uuid("Produk tidak valid."),
  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(120, "Nama produk maksimal 120 karakter."),
  sku: z
    .string()
    .trim()
    .min(2, "SKU minimal 2 karakter.")
    .max(50, "SKU maksimal 50 karakter."),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine(
      (value) => value === null || z.string().uuid().safeParse(value).success,
      "Kategori tidak valid.",
    ),
  purchasePrice: decimalString("Harga beli"),
  sellingPrice: decimalString("Harga jual"),
  minStock: intString("Stok minimum", { min: 0 }),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(30, "Satuan maksimal 30 karakter."),
});

export const productIdSchema = z.string().uuid("Produk tidak valid.");

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export function firstProductError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data produk tidak valid.";
}
