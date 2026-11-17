import { MovementType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_STOCK = 2_147_483_647;

type DecimalInput = Prisma.Decimal | string | number;

export type InventoryErrorCode =
  | "VALIDATION_ERROR"
  | "PRODUCT_NOT_FOUND"
  | "INSUFFICIENT_STOCK";

export class InventoryError extends Error {
  readonly code: InventoryErrorCode;

  constructor(code: InventoryErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "InventoryError";
  }
}

export type StockInInput = {
  businessId: string;
  productId: string;
  quantity: number;
  purchasePrice?: DecimalInput;
  referenceNumber?: string | null;
  note?: string | null;
  createdById?: string | null;
  createdAt?: Date;
};

export type StockOutInput = {
  businessId: string;
  productId: string;
  quantity: number;
  sellingPrice?: DecimalInput;
  referenceNumber?: string | null;
  note?: string | null;
  createdById?: string | null;
  createdAt?: Date;
};

function assertIdentifier(value: string, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InventoryError(
      "VALIDATION_ERROR",
      `${field} wajib diisi.`,
    );
  }
}

function assertQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InventoryError(
      "VALIDATION_ERROR",
      "Jumlah harus berupa bilangan bulat lebih dari 0.",
    );
  }

  if (quantity > MAX_STOCK) {
    throw new InventoryError(
      "VALIDATION_ERROR",
      "Jumlah melebihi batas maksimum stok.",
    );
  }
}

function parseNonNegativeDecimal(
  value: DecimalInput | undefined,
  field: string,
): Prisma.Decimal | undefined {
  if (value === undefined) {
    return undefined;
  }

  let decimal: Prisma.Decimal;

  try {
    decimal = new Prisma.Decimal(value);
  } catch {
    throw new InventoryError(
      "VALIDATION_ERROR",
      `${field} bukan angka yang valid.`,
    );
  }

  if (!decimal.isFinite() || decimal.isNegative()) {
    throw new InventoryError(
      "VALIDATION_ERROR",
      `${field} tidak boleh negatif.`,
    );
  }

  return decimal;
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/**
 * Mencatat barang masuk dan menambah stok produk dalam satu transaksi.
 * Stok, StockIn, dan StockMovement akan di-commit bersama atau dibatalkan semua.
 */
export async function createStockIn(input: StockInInput) {
  assertIdentifier(input.businessId, "businessId");
  assertIdentifier(input.productId, "productId");
  assertQuantity(input.quantity);

  const purchasePrice = parseNonNegativeDecimal(
    input.purchasePrice,
    "Harga beli",
  );

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        businessId: input.businessId,
      },
      select: {
        id: true,
        businessId: true,
        stock: true,
        purchasePrice: true,
      },
    });

    if (!product) {
      throw new InventoryError(
        "PRODUCT_NOT_FOUND",
        "Produk tidak ditemukan pada usaha ini.",
      );
    }

    if (product.stock > MAX_STOCK - input.quantity) {
      throw new InventoryError(
        "VALIDATION_ERROR",
        "Jumlah barang masuk akan melebihi batas maksimum stok.",
      );
    }

    const updatedProduct = await tx.product
      .update({
        where: { id: product.id },
        data: {
          stock: {
            increment: input.quantity,
          },
        },
        select: {
          stock: true,
        },
      })
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P2025" || error.code === "P2020")
        ) {
          throw new InventoryError(
            error.code === "P2025" ? "PRODUCT_NOT_FOUND" : "VALIDATION_ERROR",
            error.code === "P2025"
              ? "Produk tidak ditemukan pada usaha ini."
              : "Jumlah barang masuk akan melebihi batas maksimum stok.",
          );
        }

        throw error;
      });

    const stockAfter = updatedProduct.stock;
    const stockBefore = stockAfter - input.quantity;

    const createdAt = input.createdAt;

    const stockIn = await tx.stockIn.create({
      data: {
        businessId: product.businessId,
        productId: product.id,
        createdById: input.createdById ?? null,
        quantity: input.quantity,
        purchasePrice: purchasePrice ?? product.purchasePrice,
        referenceNumber: normalizeOptionalText(input.referenceNumber),
        note: normalizeOptionalText(input.note),
        stockBefore,
        stockAfter,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        businessId: product.businessId,
        productId: product.id,
        createdById: input.createdById ?? null,
        type: MovementType.IN,
        quantity: input.quantity,
        stockBefore,
        stockAfter,
        note: normalizeOptionalText(input.note),
        stockInId: stockIn.id,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    return {
      stockIn,
      movement,
      stockAfter,
    };
  });
}

/**
 * Mencatat barang keluar dan mengurangi stok produk dalam satu transaksi.
 * Update stok bersifat kondisional (stock >= quantity) sehingga stok tidak
 * pernah menjadi negatif walaupun ada transaksi bersamaan.
 */
export async function createStockOut(input: StockOutInput) {
  assertIdentifier(input.businessId, "businessId");
  assertIdentifier(input.productId, "productId");
  assertQuantity(input.quantity);

  const sellingPrice = parseNonNegativeDecimal(
    input.sellingPrice,
    "Harga jual",
  );

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        businessId: input.businessId,
      },
      select: {
        id: true,
        businessId: true,
        stock: true,
      },
    });

    if (!product) {
      throw new InventoryError(
        "PRODUCT_NOT_FOUND",
        "Produk tidak ditemukan pada usaha ini.",
      );
    }

    if (product.stock < input.quantity) {
      throw new InventoryError(
        "INSUFFICIENT_STOCK",
        `Stok tidak mencukupi. Stok tersedia: ${product.stock}.`,
      );
    }

    const updateResult = await tx.product.updateMany({
      where: {
        id: product.id,
        businessId: product.businessId,
        stock: {
          gte: input.quantity,
        },
      },
      data: {
        stock: {
          decrement: input.quantity,
        },
      },
    });

    if (updateResult.count !== 1) {
      throw new InventoryError(
        "INSUFFICIENT_STOCK",
        "Stok tidak mencukupi untuk menyelesaikan transaksi.",
      );
    }

    const updatedProduct = await tx.product.findUniqueOrThrow({
      where: { id: product.id },
      select: { stock: true },
    });

    const stockAfter = updatedProduct.stock;
    const stockBefore = stockAfter + input.quantity;

    const createdAt = input.createdAt;

    const stockOut = await tx.stockOut.create({
      data: {
        businessId: product.businessId,
        productId: product.id,
        createdById: input.createdById ?? null,
        quantity: input.quantity,
        sellingPrice: sellingPrice ?? null,
        referenceNumber: normalizeOptionalText(input.referenceNumber),
        note: normalizeOptionalText(input.note),
        stockBefore,
        stockAfter,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        businessId: product.businessId,
        productId: product.id,
        createdById: input.createdById ?? null,
        type: MovementType.OUT,
        quantity: input.quantity,
        stockBefore,
        stockAfter,
        note: normalizeOptionalText(input.note),
        stockOutId: stockOut.id,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    return {
      stockOut,
      movement,
      stockAfter,
    };
  });
}
