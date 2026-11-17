export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="mt-2 h-8 w-72 max-w-full rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-[#EDF2F6]" />
        </div>
        <div className="h-8 w-48 rounded-full bg-[#EDF2F6]" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[132px] rounded-2xl border border-[#E5EBF0]/80 bg-white"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="h-[380px] rounded-2xl border border-[#E5EBF0]/80 bg-white" />
        <div className="h-[380px] rounded-2xl border border-[#E5EBF0]/80 bg-white" />
      </div>

      <div className="mt-6 h-64 rounded-2xl border border-[#E5EBF0]/80 bg-white" />
    </div>
  );
}
