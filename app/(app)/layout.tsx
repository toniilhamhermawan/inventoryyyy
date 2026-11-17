import { Suspense } from "react";

import { AppShell } from "@/app/components/shell/app-shell";
import {
  HeaderSession,
  HeaderSessionSkeleton,
} from "@/app/components/shell/header-session";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7FA]" />}>
      <AppShell
        header={
          <Suspense fallback={<HeaderSessionSkeleton />}>
            <HeaderSession />
          </Suspense>
        }
      >
        {children}
      </AppShell>
    </Suspense>
  );
}
