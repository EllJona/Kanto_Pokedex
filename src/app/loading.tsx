import { PokeballSpinner } from "@/components/PokeballSpinner";
import { SkeletonGrid } from "@/components/SkeletonGrid";

export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <PokeballSpinner label="Sincronizando com a PokéAPI…" />
        <SkeletonGrid count={24} />
      </div>
    </div>
  );
}
