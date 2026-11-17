"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireBusiness } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import {
  createProductSchema,
  firstProductError,
  productIdSchema,
  updateProductSchema,
} from "@/lib/validation/product";

export type ProductActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

async function ensureCategoryOwned(businessId: string, categoryId: string | null) {
  if (!categoryId) {
    return null;
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, businessId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return category.id;
}

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { business } = await requireBusiness();
  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId") || undefined,
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
    stock: formData.get("stock"),
    minStock: formData.get("minStock"),
    unit: formData.get("unit"),
  });

  if (!parsed.success) {
    return { error: firstProductError(parsed.error) };
  }

  let categoryId: string | null = null;

  try {
    categoryId = await ensureCategoryOwned(business.id, parsed.data.categoryId);
  } catch {
    return { error: "Kategori tidak ditemukan pada usaha ini." };
  }

  try {
    await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId,
        name: parsed.data.name,
        sku: parsed.data.sku,
        purchasePrice: new Prisma.Decimal(parsed.data.purchasePrice),
        sellingPrice: new Prisma.Decimal(parsed.data.sellingPrice),
        stock: parsed.data.stock,
        minStock: parsed.data.minStock,
        unit: parsed.data.unit,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes("sku")) {
        return { error: "SKU sudah digunakan oleh produk lain pada usaha ini." };
      }
      return { error: "Data produk bentrok dengan data yang sudah ada." };
    }

    throw error;
  }

  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/dashboard");

  return { ok: true, message: "Produk berhasil ditambahkan." };
}

export async function updateProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { business } = await requireBusiness();
  const parsed = updateProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId") || undefined,
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
    minStock: formData.get("minStock"),
    unit: formData.get("unit"),
  });

  if (!parsed.success) {
    return { error: firstProductError(parsed.error) };
  }

  const existing = await prisma.product.findFirst({
    where: { id: parsed.data.id, businessId: business.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Produk tidak ditemukan." };
  }

  let categoryId: string | null = null;

  try {
    categoryId = await ensureCategoryOwned(business.id, parsed.data.categoryId);
  } catch {
    return { error: "Kategori tidak ditemukan pada usaha ini." };
  }

  try {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        categoryId,
        name: parsed.data.name,
        sku: parsed.data.sku,
        purchasePrice: new Prisma.Decimal(parsed.data.purchasePrice),
        sellingPrice: new Prisma.Decimal(parsed.data.sellingPrice),
        minStock: parsed.data.minStock,
        unit: parsed.data.unit,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes("sku")) {
        return { error: "SKU sudah digunakan oleh produk lain pada usaha ini." };
      }
      return { error: "Data produk bentrok dengan data yang sudah ada." };
    }

    throw error;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${existing.id}`);
  revalidatePath("/categories");
  revalidatePath("/dashboard");

  return { ok: true, message: "Produk berhasil diperbarui." };
}

export async function deleteProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { business } = await requireBusiness();
  const idParsed = productIdSchema.safeParse(formData.get("id"));

  if (!idParsed.success) {
    return { error: "Produk tidak valid." };
  }

  const product = await prisma.product.findFirst({
    where: { id: idParsed.data, businessId: business.id },
    select: { id: true },
  });

  if (!product) {
    return { error: "Produk tidak ditemukan." };
  }

  const [movementCount, stockInCount, stockOutCount] = await Promise.all([
    prisma.stockMovement.count({ where: { productId: product.id } }),
    prisma.stockIn.count({ where: { productId: product.id } }),
    prisma.stockOut.count({ where: { productId: product.id } }),
  ]);

  if (movementCount > 0 || stockInCount > 0 || stockOutCount > 0) {
    return {
      error:
        "Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi. Riwayat transaksi tidak boleh dihapus.",
    };
  }

  try {
    await prisma.product.delete({ where: { id: product.id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error:
          "Produk tidak dapat dihapus karena masih terhubung dengan data transaksi.",
      };
    }

    throw error;
  }

  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/dashboard");

  return { ok: true, message: "Produk berhasil dihapus." };
}
