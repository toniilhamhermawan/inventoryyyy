import { Prisma, type MovementType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type DashboardPeriod = "weekly" | "monthly";

export type ChartPoint = {
  key: string;
  label: string;
  incoming: number;
  outgoing: number;
};

export type DashboardStats = {
  productCount: number;
  categoryCount: number;
  totalStock: number;
  inventoryValue: number;
};

export type StockStatus = {
  total: number;
  available: number;
  low: number;
  out: number;
};

export type StockProduct = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
};

export type RecentMovement = {
  id: string;
  type: MovementType;
  quantity: number;
  createdAt: Date;
  note: string | null;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
};

export type DashboardData = {
  stats: DashboardStats;
  stockStatus: StockStatus;
  lowStockProducts: StockProduct[];
  chart: {
    period: DashboardPeriod;
    points: ChartPoint[];
    totalIncoming: number;
    totalOutgoing: number;
  };
  recentMovements: RecentMovement[];
};

const DAY_MS = 86_400_000;
const JAKARTA_OFFSET = "+07:00";
const TIME_ZONE = "Asia/Jakarta";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
});

const dateLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

function getDatePart(date: Date, type: "year" | "month" | "day") {
  return (
    dayKeyFormatter
      .formatToParts(date)
      .find((part) => part.type === type)?.value ?? ""
  );
}

export function getJakartaDayKey(date: Date) {
  return `${getDatePart(date, "year")}-${getDatePart(date, "month")}-${getDatePart(date, "day")}`;
}

function getJakartaDayStart(date: Date) {
  return new Date(`${getJakartaDayKey(date)}T00:00:00${JAKARTA_OFFSET}`);
}

export function parseDashboardPeriod(
  value: string | string[] | undefined,
): DashboardPeriod {
  return value === "monthly" ? "monthly" : "weekly";
}

function buildChartPoints(period: DashboardPeriod) {
  const days = period === "monthly" ? 30 : 7;
  const now = new Date();
  const firstDate = new Date(now.getTime() - (days - 1) * DAY_MS);
  const points: ChartPoint[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date(firstDate.getTime() + index * DAY_MS);
    const label =
      days <= 7
        ? weekdayLabelFormatter.format(date)
        : dateLabelFormatter.format(date);

    points.push({
      key: getJakartaDayKey(date),
      label,
      incoming: 0,
      outgoing: 0,
    });
  }

  const rangeStart = getJakartaDayStart(firstDate);
  const rangeEnd = new Date(
    getJakartaDayStart(new Date()).getTime() + DAY_MS,
  );

  return { points, rangeStart, rangeEnd };
}

export async function getDashboardData(
  businessId: string,
  period: DashboardPeriod,
): Promise<DashboardData> {
  const { points, rangeStart, rangeEnd } = buildChartPoints(period);

  const [categoryCount, products, recentMovements, periodMovements] =
    await Promise.all([
      prisma.category.count({ where: { businessId } }),
      prisma.product.findMany({
        where: { businessId },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          minStock: true,
          unit: true,
          purchasePrice: true,
        },
        orderBy: [{ name: "asc" }],
      }),
      prisma.stockMovement.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          type: true,
          quantity: true,
          createdAt: true,
          note: true,
          product: {
            select: {
              name: true,
              sku: true,
              unit: true,
            },
          },
        },
      }),
      prisma.stockMovement.findMany({
        where: {
          businessId,
          createdAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        select: {
          type: true,
          quantity: true,
          createdAt: true,
        },
      }),
    ]);

  let totalStock = 0;
  let inventoryValue = new Prisma.Decimal(0);
  const stockStatus: StockStatus = {
    total: products.length,
    available: 0,
    low: 0,
    out: 0,
  };

  for (const product of products) {
    totalStock += product.stock;
    inventoryValue = inventoryValue.plus(
      product.purchasePrice.mul(product.stock),
    );

    if (product.stock <= 0) {
      stockStatus.out += 1;
    } else if (product.stock <= product.minStock) {
      stockStatus.low += 1;
    } else {
      stockStatus.available += 1;
    }
  }

  const lowStockProducts = products
    .filter((product) => product.stock <= product.minStock)
    .sort(
      (a, b) => a.stock - b.stock || a.name.localeCompare(b.name, "id-ID"),
    )
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
    }));

  const pointMap = new Map(points.map((point) => [point.key, point]));

  for (const movement of periodMovements) {
    const point = pointMap.get(getJakartaDayKey(movement.createdAt));

    if (!point) {
      continue;
    }

    if (movement.type === "IN") {
      point.incoming += movement.quantity;
    } else {
      point.outgoing += movement.quantity;
    }
  }

  return {
    stats: {
      productCount: products.length,
      categoryCount,
      totalStock,
      inventoryValue: inventoryValue.toNumber(),
    },
    stockStatus,
    lowStockProducts,
    chart: {
      period,
      points,
      totalIncoming: points.reduce(
        (total, point) => total + point.incoming,
        0,
      ),
      totalOutgoing: points.reduce(
        (total, point) => total + point.outgoing,
        0,
      ),
    },
    recentMovements,
  };
}

export function getStockAlerts(businessId: string): Promise<StockProduct[]> {
  return prisma.product.findMany({
    where: {
      businessId,
      stock: {
        lte: prisma.product.fields.minStock,
      },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minStock: true,
      unit: true,
    },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });
}

export function getStockAlertCount(businessId: string) {
  return prisma.product.count({
    where: {
      businessId,
      stock: {
        lte: prisma.product.fields.minStock,
      },
    },
  });
}
