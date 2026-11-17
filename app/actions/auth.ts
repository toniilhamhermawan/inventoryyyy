"use server";

import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getBusinessForUser,
  getCurrentUser,
  requireUser,
} from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  businessSchema,
  firstValidationError,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";

async function ensureBusinessForUser(
  userId: string,
  businessName: string | null | undefined,
) {
  const name = businessName?.trim();

  if (!name) {
    return null;
  }

  const existing = await prisma.business.findUnique({
    where: { ownerId: userId },
  });

  if (existing) {
    return existing;
  }

  try {
    return await prisma.business.create({
      data: {
        name: name.slice(0, 100),
        ownerId: userId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return prisma.business.findUnique({ where: { ownerId: userId } });
    }

    throw error;
  }
}

export type AuthActionState = {
  error?: string;
  message?: string;
};

async function getOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (origin) {
    return origin;
  }

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email atau password salah. Jika belum memiliki akun, silakan daftar terlebih dahulu.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Silakan cek kotak masuk Anda.";
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists")
  ) {
    return "Email sudah terdaftar. Silakan masuk menggunakan email tersebut.";
  }

  if (normalized.includes("password should be at least")) {
    return "Password terlalu pendek. Gunakan minimal 8 karakter.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
  }

  if (normalized.includes("signups not allowed")) {
    return "Pendaftaran akun baru sedang dinonaktifkan.";
  }

  if (normalized.includes("user not found")) {
    return "Akun dengan email tersebut tidak ditemukan. Silakan daftar terlebih dahulu.";
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: firstValidationError(parsed.error) };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        businessName: parsed.data.businessName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.session) {
    return {
      message:
        "Pendaftaran berhasil. Akun dan data usaha akan disiapkan setelah Anda mengonfirmasi email. Silakan cek kotak masuk, lalu masuk untuk melanjutkan.",
    };
  }

  const user = await getCurrentUser();

  if (user) {
    await ensureBusinessForUser(user.id, parsed.data.businessName);
  }

  redirect("/dashboard");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") || undefined,
  });

  if (!parsed.success) {
    return { error: firstValidationError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // "Ingat sesi login": sesi dipertahankan aman via cookie Supabase (refresh token).
  // Preferensi dikirim untuk kebutuhan UI; sesi tetap tervalidasi server-side.

  const user = await getCurrentUser();

  if (!user) {
    redirect("/dashboard");
  }

  const business = await getBusinessForUser(user.id);
  redirect(business ? "/dashboard" : "/onboarding");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createBusinessAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const user = await requireUser();

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: firstValidationError(parsed.error) };
  }

  const existingBusiness = await getBusinessForUser(user.id);

  if (existingBusiness) {
    redirect("/dashboard");
  }

  try {
    await prisma.business.create({
      data: {
        name: parsed.data.name,
        ownerId: user.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Akun ini sudah memiliki usaha." };
    }

    throw error;
  }

  redirect("/dashboard");
}
