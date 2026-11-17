import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  History,
} from "lucide-react";

import { EmptyState } from "@/app/components/ui/empty-state";
import type { RecentMovement } from "@/lib/dashboard";
import { formatNumber, formatShortDateTime } from "@/lib/format";

export function RecentActivity({
  movements,
}: {
  movements: RecentMovement[];
}) {
  return (
    <section className="rounded-2xl border border-[#E5EBF0]/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[#E5EBF0] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#293746]">
            Aktivitas terbaru
          </h2>
          <p className="mt-0.5 text-xs text-[#7C8996]">
            Pergerakan stok terakhir pada usaha Anda.
          </p>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#527C9E] transition-colors hover:bg-[#EEF4F8]"
        >
          Lihat semua
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {movements.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada transaksi"
          description="Aktivitas barang masuk dan keluar akan tampil di sini setelah transaksi pertama dicatat."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5EBF0] text-[11px] uppercase tracking-wider text-[#9AA6B2]">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Produk
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Jenis
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Jumlah
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {movements.map((movement) => {
                const isIncoming = movement.type === "IN";
                const Icon = isIncoming ? ArrowDownToLine : ArrowUpFromLine;

                return (
                  <tr
                    key={movement.id}
                    className="transition-colors hover:bg-[#F4F7FA]/70"
                  >
                    <td className="px-5 py-3.5">
                      <p className="max-w-[260px] truncate font-medium text-[#293746]">
                        {movement.product.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#9AA6B2]">
                        {movement.product.sku}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                          isIncoming
                            ? "bg-[#EEF4F8] text-[#527C9E] ring-[#D7E3EC]"
                            : "bg-[#EDF2F6] text-[#293746] ring-[#E5EBF0]"
                        }`}
                      >
                        <Icon className="size-3" aria-hidden />
                        {isIncoming ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3.5 font-semibold tabular-nums ${
                        isIncoming ? "text-[#527C9E]" : "text-[#293746]"
                      }`}
                    >
                      {isIncoming ? "+" : "−"}
                      {formatNumber(movement.quantity)}{" "}
                      <span className="text-xs font-normal text-[#9AA6B2]">
                        {movement.product.unit}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#7C8996]">
                      {formatShortDateTime(movement.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
