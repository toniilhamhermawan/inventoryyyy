"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";

import { requireBusiness } from "@/lib/auth/dal";
import {
  createStockIn,
  createStockOut,
  InventoryError,
} from "@/lib/services/inventory";
import {
  firstTransactionError,
  stockInSchema,
  stockOutSchema,
} from "@/lib/validation/transaction";

export type StockTransactionActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function generateReference(prefix: "BM" | "BK") {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(randomInt(0, 10000)).padStart(4, "0");
  return `${prefix}-${y}${m}${d}-${rand}`;
}

function composeNote(parts: Array<[string, string]>, extra: string) {
  const lines = parts
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  if (extra) lines.push(extra);
  return lines.join("\n") || null;
}

export async function createStockInAction(
  _previousState: StockTransactionActionState,
  formData: FormData,
): Promise<StockTransactionActionState> {
  const { user, business } = await requireBusiness();
  const parsed = stockInSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    purchasePrice: formData.get("purchasePrice") || undefined,
    supplier: formData.get("supplier") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: firstTransactionError(parsed.error) };
  }

  const createdAt = new Date(parsed.data.date);
  const referenceNumber = generateReference("BM");
  const note = composeNote([["Supplier", parsed.data.supplier]], parsed.data.note);

  try {
    await createStockIn({
      businessId: business.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      purchasePrice: parsed.data.purchasePrice,
      referenceNumber,
      note,
      createdById: user.id,
      createdAt,
    });
  } catch (error) {
    if (error instanceof InventoryError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/stock-in");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return { ok: true, message: `Transaksi barang masuk ${referenceNumber} berhasil disimpan.` };
}

export async function createStockOutAction(
  _previousState: StockTransactionActionState,
  formData: FormData,
): Promise<StockTransactionActionState> {
  const { user, business } = await requireBusiness();
  const parsed = stockOutSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    recipient: formData.get("recipient") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: firstTransactionError(parsed.error) };
  }

  const createdAt = new Date(parsed.data.date);
  const referenceNumber = generateReference("BK");
  const note = composeNote([["Tujuan/Penerima", parsed.data.recipient]], parsed.data.note);

  try {
    await createStockOut({
      businessId: business.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      referenceNumber,
      note,
      createdById: user.id,
      createdAt,
    });
  } catch (error) {
    if (error instanceof InventoryError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/stock-out");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return { ok: true, message: `Transaksi barang keluar ${referenceNumber} berhasil disimpan.` };
}
