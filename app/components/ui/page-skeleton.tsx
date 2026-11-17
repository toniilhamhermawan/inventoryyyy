export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-pulse">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-2 h-8 w-64 max-w-full rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-[#EDF2F6]" />
      <div className="mt-6 h-72 rounded-2xl border border-[#E5EBF0]/80 bg-white" />
    </div>
  );
}
