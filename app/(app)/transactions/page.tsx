import type { Metadata } from "next";
import { Suspense } from "react";
import { History } from "lucide-react";

import { ModulePlaceholder } from "@/app/components/shell/module-placeholder";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";

export const metadata: Metadata = {
  title: "Riwayat Transaksi",
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModulePlaceholder
        title="Riwayat Transaksi"
        description="Telusuri seluruh pergerakan stok beserta stok sebelum dan sesudah transaksi."
        icon={History}
        features={[
          "Riwayat barang masuk dan keluar",
          "Filter tanggal dan produk",
          "Detail stok sebelum dan sesudah",
          "Catatan transaksi",
        ]}
      />
    </Suspense>
  );
}
