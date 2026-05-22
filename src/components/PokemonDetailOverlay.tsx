"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { TypeBadge } from "@/components/TypeBadge";
import type { ApiEvolutionChain, ApiPokemon, ApiSpecies } from "@/lib/pokeapi";
import {
  findEvolutionNeighbors,
  flattenEvolutionChain,
  mapToSummary,
  officialArtworkUrl,
  type PokemonSummary,
} from "@/lib/pokeapi";
import {
  getCachedPokemonDetail,
  loadPokemonDetail,
  prefetchPokemonDetail,
} from "@/lib/pokemonDetailCache";
import { UI_FAST, UI_SPRING_PANEL } from "@/lib/motionPresets";
import { typePrimaryHex } from "@/lib/typeColors";

const STAT_PT: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Atq. especial",
  "special-defense": "Def. especial",
  speed: "Velocidade",
};

const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

const STAT_CAP = 255;

function formatName(name: string) {
  return name.replace(/-/g, " ");
}

function chainArtUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

type Props = {
  id: number | null;
  preview: PokemonSummary | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
};

export function PokemonDetailOverlay({ id, preview, onClose, onNavigate }: Props) {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pokemon, setPokemon] = useState<ApiPokemon | null>(null);
  const [species, setSpecies] = useState<ApiSpecies | null>(null);
  const [chain, setChain] = useState<ApiEvolutionChain | null>(null);

  useEffect(() => {
    if (id == null) {
      setPokemon(null);
      setSpecies(null);
      setChain(null);
      setError(null);
      setLoading(false);
      return;
    }

    prefetchPokemonDetail(id);
    const cached = getCachedPokemonDetail(id);
    if (cached) {
      setPokemon(cached.pokemon);
      setSpecies(cached.species);
      setChain(cached.chain);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadPokemonDetail(id)
      .then((bundle) => {
        if (cancelled) return;
        setPokemon(bundle.pokemon);
        setSpecies(bundle.species);
        setChain(bundle.chain);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar os dados.");
        setPokemon(null);
        setSpecies(null);
        setChain(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (id == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [id, onClose]);

  const shell = preview ?? (pokemon ? mapToSummary(pokemon) : null);
  const showFull =
    !error && pokemon != null && species != null && chain != null;

  return (
    <AnimatePresence>
      {id != null && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduce ? 0.01 : UI_FAST.duration,
            ease: UI_FAST.ease,
          }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="poke-detail-title"
            initial={{ y: reduce ? 0 : "28%", opacity: reduce ? 1 : 0.92 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : "18%", opacity: reduce ? 1 : 0.9 }}
            transition={reduce ? { duration: 0.01 } : UI_SPRING_PANEL}
            className="glass-panel-frosted-dark relative z-[1] flex max-h-[min(94vh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl"
            style={
              pokemon
                ? {
                    boxShadow: `0 0 60px ${typePrimaryHex(mapToSummary(pokemon).types[0] ?? "normal")}33, 0 24px 80px rgba(0,0,0,0.35)`,
                  }
                : undefined
            }
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-[2] rounded-full border border-white/15 bg-black/40 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {error && !loading && (
              <p className="px-6 py-20 text-center font-medium text-red-300">
                {error}
              </p>
            )}

            {loading && !shell ? (
              <div className="flex flex-col items-center gap-3 px-6 py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
                <p className="text-sm text-white/50">Carregando ficha…</p>
              </div>
            ) : null}

            {loading && shell && !showFull ? (
              <DetailPreviewShell summary={shell} />
            ) : null}

            {showFull && (
              <DetailBody
                pokemon={pokemon}
                species={species}
                chain={chain}
                reduceMotion={reduce}
                onNavigate={onNavigate}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailPreviewShell({ summary }: { summary: PokemonSummary }) {
  const hex = typePrimaryHex(summary.types[0] ?? "normal");
  return (
    <div
      className="px-6 pb-8 pt-10 sm:px-10 sm:pt-12"
      style={{
        background: `linear-gradient(180deg, ${hex}28 0%, transparent 42%)`,
      }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative mx-auto aspect-square w-full max-w-[220px] shrink-0 sm:mx-0">
          <Image
            src={summary.sprite}
            alt={formatName(summary.name)}
            fill
            className="object-contain"
            priority
            unoptimized
            sizes="220px"
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:pt-2 sm:text-left">
          <p className="mb-1 font-display text-xs font-semibold tracking-[0.25em] text-white/40">
            #{String(summary.id).padStart(3, "0")}
          </p>
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            {formatName(summary.name)}
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {summary.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <p className="mt-8 text-sm text-white/45">
            Carregando stats e evolução…
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailBody({
  pokemon,
  species,
  chain,
  reduceMotion,
  onNavigate,
}: {
  pokemon: ApiPokemon;
  species: ApiSpecies;
  chain: ApiEvolutionChain;
  reduceMotion: boolean | null;
  onNavigate: (id: number) => void;
}) {
  const summary = mapToSummary(pokemon);
  const primary = summary.types[0] ?? "normal";
  const hex = typePrimaryHex(primary);
  const neighbors = findEvolutionNeighbors(chain.chain, species.id);
  const fullLine = flattenEvolutionChain(chain.chain);
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);
  const orderList = STAT_ORDER as unknown as string[];
  const stats = [...pokemon.stats]
    .filter((s) => orderList.includes(s.stat.name))
    .sort(
      (a, b) =>
        STAT_ORDER.indexOf(a.stat.name as (typeof STAT_ORDER)[number]) -
        STAT_ORDER.indexOf(b.stat.name as (typeof STAT_ORDER)[number])
    );

  return (
    <div className="no-scrollbar overflow-y-auto overflow-x-hidden overscroll-contain">
      <div
        className="px-6 pb-8 pt-10 sm:px-10 sm:pt-12"
        style={{
          background: `linear-gradient(180deg, ${hex}28 0%, transparent 42%)`,
        }}
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="mx-auto flex w-full max-w-[240px] shrink-0 flex-col items-center sm:mx-0">
            <div className="relative aspect-square w-full max-w-[220px]">
              <Image
                src={officialArtworkUrl(pokemon)}
                alt={formatName(pokemon.name)}
                fill
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
                priority
                unoptimized
                sizes="220px"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1 text-center sm:pt-2 sm:text-left">
            <p className="mb-1 font-display text-xs font-semibold tracking-[0.25em] text-white/40">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
            <h2
              id="poke-detail-title"
              className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl"
            >
              {formatName(pokemon.name)}
            </h2>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {summary.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <dl className="mt-6 flex flex-wrap justify-center gap-8 text-sm sm:justify-start">
              <div>
                <dt className="text-white/45">Altura</dt>
                <dd className="font-semibold text-white">{heightM} m</dd>
              </div>
              <div>
                <dt className="text-white/45">Peso</dt>
                <dd className="font-semibold text-white">{weightKg} kg</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08] px-6 py-8 sm:px-10">
        <h3 className="mb-5 font-display text-xs font-bold uppercase tracking-[0.35em] text-white/40">
          Base stats
        </h3>
        <ul className="space-y-4">
          {stats.map((s, i) => {
            const key = s.stat.name;
            const label = STAT_PT[key] ?? key;
            const pct = Math.min(
              100,
              Math.round((s.base_stat / STAT_CAP) * 100)
            );
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: reduceMotion ? 0 : i * 0.02,
                  duration: reduceMotion ? 0.01 : 0.2,
                  ease: UI_FAST.ease,
                }}
              >
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium text-white/70">{label}</span>
                  <span className="tabular-nums text-white/45">
                    {s.base_stat}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.28,
                      delay: reduceMotion ? 0 : 0.04 + i * 0.02,
                      ease: UI_FAST.ease,
                    }}
                    style={{
                      background: `linear-gradient(90deg, ${hex}, ${hex}99)`,
                    }}
                  />
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/[0.08] px-6 py-8 sm:px-10">
        <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.35em] text-white/40">
          Linha de evolução
        </h3>
        <p className="mb-6 text-sm text-white/45">
          Antes, depois e cadeia completa.
        </p>
        <div className="mb-8 flex flex-wrap gap-4 text-sm text-white/70">
          <div>
            <span className="text-white/40">Evolui de: </span>
            {neighbors.prev ? (
              <button
                type="button"
                onClick={() => neighbors.prev && onNavigate(neighbors.prev.id)}
                className="font-semibold capitalize text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline"
              >
                {formatName(neighbors.prev.name)}
              </button>
            ) : (
              <span className="text-white/35">— base</span>
            )}
          </div>
          <div>
            <span className="text-white/40">Evolui para: </span>
            {neighbors.next.length ? (
              <span className="inline-flex flex-wrap gap-2">
                {neighbors.next.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onNavigate(n.id)}
                    className="font-semibold capitalize text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline"
                  >
                    {formatName(n.name)}
                  </button>
                ))}
              </span>
            ) : (
              <span className="text-white/35">— final</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2 sm:justify-start">
          {fullLine.map((node, i) => (
            <Fragment key={node.id}>
              {i > 0 && (
                <span className="shrink-0 px-0.5 text-white/25" aria-hidden>
                  →
                </span>
              )}
              <button
                type="button"
                disabled={node.id === pokemon.id}
                onClick={() => node.id !== pokemon.id && onNavigate(node.id)}
                className={`flex shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition ${
                  node.id === pokemon.id
                    ? "border-amber-400/50 bg-amber-400/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="relative h-14 w-14">
                  <Image
                    src={chainArtUrl(node.id)}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="56px"
                  />
                </div>
                <span className="mt-1 max-w-[88px] truncate text-center text-[10px] font-semibold capitalize text-white/80">
                  {formatName(node.name)}
                </span>
              </button>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
