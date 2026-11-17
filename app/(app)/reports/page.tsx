import type { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3 } from "lucide-react";

import { ModulePlaceholder } from "@/app/components/shell/module-placeholder";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";

export const metadata: Metadata = {
  title: "Laporan",
};

export default function ReportsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModulePlaceholder
        title="Laporan"
        description="Dapatkan ringkasan nilai persediaan, produk terlaris, dan pergerakan stok dalam periode tertentu."
        icon={BarChart3}
        features={[
          "Laporan nilai persediaan",
          "Rekap barang masuk dan keluar",
          "Produk stok menipis",
          "Ekspor laporan",
        ]}
      />
    </Suspense>
  );
}
