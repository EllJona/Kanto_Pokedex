"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import { prefetchPokemonDetail } from "@/lib/pokemonDetailCache";
import type { PokemonSummary } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/lib/typeColors";
import { BentoPokemonCard } from "./BentoPokemonCard";
import { CinematicHero } from "./CinematicHero";
import { FloatingNav } from "./FloatingNav";
import { PokemonDetailOverlay } from "./PokemonDetailOverlay";
import { useAudio } from "@/components/providers/AudioProvider";
import { SmoothScroll } from "./SmoothScroll";

type Props = {
  initialPokemon: PokemonSummary[];
  loadError?: string | null;
};

function PokedexInner({ initialPokemon, loadError }: Props) {
  const { playClick } = useAudio();
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("p");
  const parsed = raw ? parseInt(raw, 10) : NaN;
  const selectedId =
    !Number.isNaN(parsed) && parsed >= 1 && parsed <= 151 ? parsed : null;

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [, startTransition] = useTransition();

  const preview =
    selectedId != null
      ? initialPokemon.find((p) => p.id === selectedId) ?? null
      : null;

  const typesPresent = useMemo(() => {
    const s = new Set<string>();
    initialPokemon.forEach((p) => p.types.forEach((t) => s.add(t)));
    return ["all", ...Array.from(s).sort()];
  }, [initialPokemon]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialPokemon.filter((p) => {
      const matchQ =
        !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchT = typeFilter === "all" || p.types.includes(typeFilter);
      return matchQ && matchT;
    });
  }, [initialPokemon, query, typeFilter]);

  const open = useCallback(
    (id: number) => {
      playClick();
      prefetchPokemonDetail(id);
      startTransition(() => {
        router.push(`/?p=${id}`, { scroll: false });
      });
    },
    [router, playClick, startTransition]
  );

  const close = useCallback(() => {
    startTransition(() => {
      router.push("/", { scroll: false });
    });
  }, [router, startTransition]);

  const goHome = useCallback(() => {
    startTransition(() => {
      router.push("/", { scroll: false });
    });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [router, startTransition]);

  const navigatePokemon = useCallback(
    (id: number) => {
      prefetchPokemonDetail(id);
      startTransition(() => {
        router.push(`/?p=${id}`, { scroll: false });
      });
    },
    [router, startTransition]
  );

  return (
      <SmoothScroll>
        <FloatingNav onLogoClick={goHome} />
        <div className="relative min-h-screen">
          {loadError ? (
            <div className="relative z-[2] mx-auto max-w-3xl px-4 pt-24 sm:px-8">
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-50/95 sm:text-base">
                <p>{loadError}</p>
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-100 transition hover:bg-amber-400/25"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : null}
          <CinematicHero />

          <section className="relative z-[1] mx-auto max-w-7xl px-4 pb-6 sm:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.03, delayChildren: 0.02 },
                },
              }}
              className="glass-panel mb-8 rounded-3xl p-5 sm:p-6"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <label className="relative block w-full max-w-md flex-1">
                  <span className="sr-only">Buscar</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nome ou número…"
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/90 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none ring-amber-400/0 transition placeholder:text-slate-400 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-400/20"
                  />
                </label>
                <p className="shrink-0 text-xs text-slate-600 sm:text-sm">
                  <span className="font-semibold text-slate-800">{filtered.length}</span>
                  {" / "}
                  {initialPokemon.length}
                </p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="mt-5 flex flex-wrap gap-2"
              >
                {typesPresent.map((t) => {
                  const glow =
                    t !== "all" ? (TYPE_COLORS[t] ?? "#64748b") : undefined;
                  return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      playClick();
                      setTypeFilter(t);
                    }}
                    style={
                      typeFilter === t && glow
                        ? ({ "--type-glow": `${glow}88` } as React.CSSProperties)
                        : undefined
                    }
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition sm:text-xs ${
                      typeFilter === t
                        ? `border-amber-500/50 bg-amber-100/80 text-amber-900 ${glow ? "type-filter-glow" : ""}`
                        : "border-slate-300/70 bg-white/50 text-slate-600 hover:border-slate-400 hover:bg-white/80 hover:text-slate-800"
                    }`}
                  >
                    {t !== "all" && (
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: TYPE_COLORS[t] ?? "#64748b" }}
                        aria-hidden
                      />
                    )}
                    {t === "all" ? "Todos" : t}
                  </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {initialPokemon.length === 0 && loadError ? (
              <p className="py-12 text-center text-sm text-slate-600">
                Assim que a conexão voltar, use o botão acima ou recarregue a
                página.
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-slate-600">
                Nenhum resultado para esses filtros.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                {filtered.map((p, i) => (
                  <BentoPokemonCard
                    key={p.id}
                    pokemon={p}
                    index={i}
                    onOpen={open}
                    selected={selectedId === p.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
        <PokemonDetailOverlay
          id={selectedId}
          preview={preview}
          onClose={close}
          onNavigate={navigatePokemon}
        />
      </SmoothScroll>
  );
}

export function PokedexExperience(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          Carregando…
        </div>
      }
    >
      <PokedexInner {...props} />
    </Suspense>
  );
}
