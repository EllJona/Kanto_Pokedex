import { TYPE_COLORS } from "@/lib/typeColors";

export function TypeBadge({ type }: { type: string }) {
  const bg = TYPE_COLORS[type] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm"
      style={{ backgroundColor: bg }}
    >
      {type}
    </span>
  );
}
