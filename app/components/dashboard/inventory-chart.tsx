import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/app/components/ui/empty-state";
import type { DashboardData, DashboardPeriod } from "@/lib/dashboard";
import {
  formatCompactNumber,
  formatNumber,
} from "@/lib/format";

const WIDTH = 760;
const HEIGHT = 264;
const PADDING = { top: 16, right: 12, bottom: 38, left: 44 };

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

export function InventoryChart({ data }: { data: DashboardData["chart"] }) {
  const { points, period, totalIncoming, totalOutgoing } = data;
  const isEmpty = totalIncoming === 0 && totalOutgoing === 0;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.incoming, point.outgoing]),
    0,
  );
  const axisMax = maxValue <= 0 ? 4 : Math.max(4, Math.ceil(maxValue / 4) * 4);
  const ticks = [0, 1, 2, 3, 4].map((index) => (axisMax / 4) * index);
  const groupWidth = plotWidth / Math.max(points.length, 1);
  const barWidth = Math.min(14, Math.max(3, groupWidth * 0.28));
  const barGap = Math.min(4, Math.max(1.5, groupWidth * 0.08));
  const pairWidth = barWidth * 2 + barGap;
  const labelStep = points.length > 10 ? 5 : 1;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#E5EBF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#293746]">
            Aktivitas persediaan
          </h2>
          <p className="mt-0.5 text-xs text-[#7C8996]">
            Perbandingan barang masuk dan keluar.
          </p>
        </div>

        <nav
          aria-label="Filter periode grafik"
          className="inline-flex w-fit items-center rounded-xl bg-[#EDF2F6] p-1"
        >
          {PERIODS.map((item) => {
            const active = item.value === period;

            return (
              <Link
                key={item.value}
                href={`/dashboard?period=${item.value}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-white text-[#293746] shadow-sm"
                    : "text-[#7C8996] hover:text-[#293746]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pt-4 text-xs text-[#7C8996]">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#527C9E]" aria-hidden />
          Masuk
          <strong className="font-semibold text-[#293746] tabular-nums">
            {formatNumber(totalIncoming)}
          </strong>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#E8B978]" aria-hidden />
          Keluar
          <strong className="font-semibold text-[#293746] tabular-nums">
            {formatNumber(totalOutgoing)}
          </strong>
        </span>
        <span className="ml-auto hidden text-[11px] text-[#9AA6B2] sm:inline">
          {period === "monthly" ? "30 hari terakhir" : "7 hari terakhir"}
        </span>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Belum ada aktivitas stok"
          description="Grafik barang masuk dan keluar akan muncul setelah transaksi pertama dicatat."
          className="flex-1"
        />
      ) : (
        <div className="flex-1 px-2 pb-3 pt-1">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label="Grafik barang masuk dan keluar"
          >
            <title>Grafik barang masuk dan keluar</title>

            {ticks.map((tick) => {
              const y =
                PADDING.top + plotHeight - (tick / axisMax) * plotHeight;

              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={WIDTH - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="#E5EBF0"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#7C8996"
                    fontSize={10}
                  >
                    {formatCompactNumber(tick)}
                  </text>
                </g>
              );
            })}

            {points.map((point, index) => {
              const groupX = PADDING.left + index * groupWidth;
              const pairX = groupX + (groupWidth - pairWidth) / 2;
              const incomingHeight = (point.incoming / axisMax) * plotHeight;
              const outgoingHeight = (point.outgoing / axisMax) * plotHeight;
              const incomingY = PADDING.top + plotHeight - incomingHeight;
              const outgoingY = PADDING.top + plotHeight - outgoingHeight;
              const showLabel =
                index % labelStep === 0 || index === points.length - 1;

              return (
                <g key={point.key}>
                  {point.incoming > 0 ? (
                    <g>
                      <title>
                        {`${point.label}: ${formatNumber(point.incoming)} masuk`}
                      </title>
                      <rect
                        x={pairX}
                        y={incomingY}
                        width={barWidth}
                        height={incomingHeight}
                        rx={2}
                        fill="#527C9E"
                      />
                    </g>
                  ) : null}

                  {point.outgoing > 0 ? (
                    <g>
                      <title>
                        {`${point.label}: ${formatNumber(point.outgoing)} keluar`}
                      </title>
                      <rect
                        x={pairX + barWidth + barGap}
                        y={outgoingY}
                        width={barWidth}
                        height={outgoingHeight}
                        rx={2}
                        fill="#E8B978"
                      />
                    </g>
                  ) : null}

                  {showLabel ? (
                    <text
                      x={groupX + groupWidth / 2}
                      y={HEIGHT - 14}
                      textAnchor="middle"
                      fill="#7C8996"
                      fontSize={10}
                    >
                      {point.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
