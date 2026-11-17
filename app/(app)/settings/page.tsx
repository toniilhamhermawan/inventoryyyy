import type { Metadata } from "next";
import { Suspense } from "react";
import { Settings } from "lucide-react";

import { ModulePlaceholder } from "@/app/components/shell/module-placeholder";
import { PageSkeleton } from "@/app/components/ui/page-skeleton";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModulePlaceholder
        title="Pengaturan"
        description="Kelola profil usaha, akun pengguna, dan preferensi aplikasi Smart Inventory."
        icon={Settings}
        features={[
          "Profil dan nama usaha",
          "Akun dan keamanan",
          "Preferensi notifikasi",
          "Pengaturan tampilan",
        ]}
      />
    </Suspense>
  );
}
