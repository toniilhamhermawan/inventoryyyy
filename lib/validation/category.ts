import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(80, "Nama kategori maksimal 80 karakter."),
  description: z
    .string()
    .trim()
    .max(255, "Deskripsi maksimal 255 karakter.")
    .optional()
    .transform((value) => (value ? value : null)),
});

export const categoryIdSchema = z.string().uuid("Kategori tidak valid.");

export type CategoryInput = z.infer<typeof categorySchema>;

export function firstCategoryError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data kategori tidak valid.";
}
