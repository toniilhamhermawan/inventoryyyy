import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDF2F6] text-[#7C8996] ring-1 ring-[#E5EBF0]">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#293746]">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[#7C8996]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
