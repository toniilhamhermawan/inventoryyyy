import { Prisma, type Business } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cache } from "react";
import { redirect } from "next/navigation";
import { io } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

const userSelect = {
  id: true,
  email: true,
  name: true,
} satisfies Prisma.UserSelect;

async function ensureBusinessFromMetadata(
  userId: string,
  metadata: Record<string, unknown> | null | undefined,
) {
  const rawName = metadata?.businessName;

  if (typeof rawName !== "string") {
    return;
  }

  const name = rawName.trim().slice(0, 100);

  if (name.length < 2) {
    return;
  }

  const existing = await prisma.business.findUnique({
    where: { ownerId: userId },
  });

  if (existing) {
    return;
  }

  try {
    await prisma.business.create({
      data: { name, ownerId: userId },
    });
  } catch (error) {
    if (
      !(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
    ) {
      throw error;
    }
  }
}

/**
 * Membaca user Supabase yang sedang login. `getUser()` memvalidasi token ke
 * Supabase Auth, sehingga tidak bisa dipalsukan lewat cookie di browser.
 */
export const getSupabaseUser = cache(async (): Promise<SupabaseUser | null> => {
  // Pastikan render menunggu request nyata sebelum Supabase membaca cookie.
  // Tanpa ini, pustaka auth dapat memanggil Date.now() saat prerender.
  await io();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
});

function normalizeName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim();
  return name ? name.slice(0, 80) : null;
}

/**
 * Menyelaraskan user Supabase Auth dengan tabel "User" milik aplikasi.
 * Data bisnis selalu memakai id dari tabel ini, bukan id dari client.
 */
async function syncUser(supabaseUser: SupabaseUser): Promise<CurrentUser | null> {
  const email = supabaseUser.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const name = normalizeName(supabaseUser.user_metadata?.name);
  const bySupabaseId = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: userSelect,
  });

  if (bySupabaseId) {
    if (bySupabaseId.email === email && (!name || bySupabaseId.name === name)) {
      return bySupabaseId;
    }

    return prisma.user.update({
      where: { id: bySupabaseId.id },
      data: {
        email,
        ...(name ? { name } : {}),
      },
      select: userSelect,
    });
  }

  // Bisa terjadi bila user pernah dibuat sebelum kolom supabaseId diisi.
  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        supabaseId: supabaseUser.id,
        ...(name ? { name } : {}),
      },
      select: userSelect,
    });
  }

  try {
    return await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        name,
      },
      select: userSelect,
    });
  } catch (error) {
    // Dua request pertama bisa berjalan bersamaan. Ambil baris yang menang.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ supabaseId: supabaseUser.id }, { email }],
        },
        select: userSelect,
      });

      if (existing) {
        return existing;
      }
    }

    throw error;
  }
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabaseUser = await getSupabaseUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await syncUser(supabaseUser);

  if (user) {
    await ensureBusinessFromMetadata(user.id, supabaseUser.user_metadata);
  }

  return user;
});

export const requireUser = cache(async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

export const getBusinessForUser = cache(
  async (userId: string): Promise<Business | null> =>
    prisma.business.findUnique({
      where: { ownerId: userId },
    }),
);

export const requireBusiness = cache(
  async (): Promise<{ user: CurrentUser; business: Business }> => {
    const user = await requireUser();
    const business = await getBusinessForUser(user.id);

    if (!business) {
      redirect("/onboarding");
    }

    return { user, business };
  },
);
