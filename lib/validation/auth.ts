import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.")
  .max(254, "Email terlalu panjang.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi."),
  remember: z.enum(["on"]).optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(80, "Nama lengkap maksimal 80 karakter."),
    businessName: z
      .string()
      .trim()
      .min(2, "Nama usaha minimal 2 karakter.")
      .max(100, "Nama usaha maksimal 100 karakter."),
    email,
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama usaha minimal 2 karakter.")
    .max(100, "Nama usaha maksimal 100 karakter."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data yang dikirim tidak valid.";
}
