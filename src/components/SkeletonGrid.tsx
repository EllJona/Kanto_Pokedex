export function SkeletonGrid({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse min-h-[248px] overflow-hidden rounded-3xl border border-white/20 bg-black/40 p-4 sm:min-h-[260px]"
        >
          <div className="mb-3 h-3 w-12 rounded bg-white/15" />
          <div className="mx-auto h-[132px] max-w-[168px] rounded-2xl bg-white/10 sm:h-[148px]" />
          <div className="mx-auto mt-3 h-4 w-24 rounded bg-white/15" />
        </div>
      ))}
    </div>
  );
}
