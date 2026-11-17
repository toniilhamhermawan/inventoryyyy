"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireBusiness } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import {
  categoryIdSchema,
  categorySchema,
  firstCategoryError,
} from "@/lib/validation/category";

export type CategoryActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { business } = await requireBusiness();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: firstCategoryError(parsed.error) };
  }

  try {
    await prisma.category.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        description: parsed.data.description,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Nama kategori sudah digunakan pada usaha ini." };
    }

    throw error;
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/dashboard");

  return { ok: true, message: "Kategori berhasil ditambahkan." };
}

export async function updateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { business } = await requireBusiness();
  const id = formData.get("id");
  const idParsed = categoryIdSchema.safeParse(id);

  if (!idParsed.success) {
    return { error: "Kategori tidak valid." };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: firstCategoryError(parsed.error) };
  }

  const existing = await prisma.category.findFirst({
    where: { id: idParsed.data, businessId: business.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Kategori tidak ditemukan." };
  }

  try {
    await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Nama kategori sudah digunakan pada usaha ini." };
    }

    throw error;
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/dashboard");

  return { ok: true, message: "Kategori berhasil diperbarui." };
}

export async function deleteCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { business } = await requireBusiness();
  const idParsed = categoryIdSchema.safeParse(formData.get("id"));

  if (!idParsed.success) {
    return { error: "Kategori tidak valid." };
  }

  const category = await prisma.category.findFirst({
    where: { id: idParsed.data, businessId: business.id },
    select: {
      id: true,
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    return { error: "Kategori tidak ditemukan." };
  }

  if (category._count.products > 0) {
    return {
      error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${category._count.products} produk.`,
    };
  }

  await prisma.category.delete({ where: { id: category.id } });

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/dashboard");

  return { ok: true, message: "Kategori berhasil dihapus." };
}
