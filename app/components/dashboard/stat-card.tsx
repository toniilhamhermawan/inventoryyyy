import type { LucideIcon } from "lucide-react";

const tones = {
  blue: "bg-[#EEF4F8] text-[#527C9E] ring-[#D7E3EC]",
  navy: "bg-[#527C9E] text-white ring-[#527C9E]/20",
  sky: "bg-[#EAF3F8] text-[#527C9E] ring-[#D7E3EC]",
  indigo: "bg-[#F3EBDD] text-[#8A6A3D] ring-[#E8B978]/40",
} as const;

export type StatTone = keyof typeof tones;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  title,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: StatTone;
  title?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#E5EBF0]/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-[#EDF2F6]/60 blur-2xl transition-opacity group-hover:opacity-80"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#7C8996]">{label}</p>
          <p
            className="mt-2 truncate text-3xl font-semibold tracking-tight text-[#293746] tabular-nums"
            title={title ?? value}
          >
            {value}
          </p>
        </div>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="relative mt-3 text-xs leading-5 text-[#7C8996]">{hint}</p>
    </article>
  );
}
