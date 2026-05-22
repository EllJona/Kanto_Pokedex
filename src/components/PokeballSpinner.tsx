export function PokeballSpinner({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="mb-10 flex flex-col items-center justify-center gap-4">
      <div
        className="relative h-14 w-14 animate-spin rounded-full border-4 border-slate-300/80"
        style={{
          background: "linear-gradient(180deg, #ef4444 50%, #fafafa 50%)",
          boxShadow: "inset 0 0 0 3px #1a3348",
        }}
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
