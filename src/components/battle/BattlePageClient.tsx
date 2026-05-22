"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Swords } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FloatingNav } from "@/components/FloatingNav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BATTLE_LEVEL, buildBattlePokemon } from "@/lib/battle/buildMon";
import { filterOpponentPool, rollOpponentTeam } from "@/lib/battle/opponentPool";
import type { BattlePokemon } from "@/lib/battle/types";
import { fetchPokemonClient, type PokemonSummary } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/lib/typeColors";
import { useAudio } from "@/components/providers/AudioProvider";
import { primeBattleSfxFromGesture } from "@/lib/audio/battleSfx";
import { POKEMON_BGM } from "@/lib/audio/pokemonBgmSources";
import { resolveBgmUrl } from "@/lib/audio/resolveBgmUrl";
import { BattleIntroSequence } from "./BattleIntroSequence";
import { GBABattleScene } from "./GBABattleScene";
import { TacticalDashboard } from "./TacticalDashboard";
import { useBattleSimulation } from "./useBattleSimulation";
import { useTeamStats } from "./useTeamStats";

type Phase = "select" | "loading" | "intro" | "fight" | "over";

type Props = {
  initialSummaries: PokemonSummary[];
  loadError: string | null;
};

const EMPTY = (): (PokemonSummary | null)[] => [
  null,
  null,
  null,
  null,
  null,
];

function SlotCard({
  mon,
  subtitle,
}: {
  mon: PokemonSummary;
  subtitle?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel flex items-center gap-3 rounded-2xl p-3"
    >
      <motion.div
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white/80"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mon.sprite}
          alt=""
          className="h-full w-full object-contain p-1 [image-rendering:pixelated]"
        />
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold capitalize text-slate-800">
          {mon.name.replace(/-/g, " ")}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-amber-200/90">
          Nv. {BATTLE_LEVEL}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {mon.types.map((t) => (
            <span
              key={t}
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-black/90"
              style={{ backgroundColor: TYPE_COLORS[t] ?? "#888" }}
            >
              {t}
            </span>
          ))}
        </div>
        {subtitle ? (
          <p className="mt-1 text-[10px] text-emerald-300/90">{subtitle}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

export function BattlePageClient({ initialSummaries, loadError }: Props) {
  const { playClick, setBgmMode } = useAudio();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [userTeam, setUserTeam] = useState<(PokemonSummary | null)[]>(EMPTY);
  const [oppTeam, setOppTeam] = useState<(PokemonSummary | null)[]>(EMPTY);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [err, setErr] = useState<string | null>(null);
  const [builtPlayer, setBuiltPlayer] = useState<BattlePokemon[] | null>(null);
  const [builtOpp, setBuiltOpp] = useState<BattlePokemon[] | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fightBgmSrc, setFightBgmSrc] = useState<string>(
    POKEMON_BGM.battleFight.local
  );

  useEffect(() => {
    void resolveBgmUrl(
      POKEMON_BGM.battleFight.local,
      POKEMON_BGM.battleFight.remote
    ).then(setFightBgmSrc);
  }, []);

  const opponentPool = useMemo(
    () => filterOpponentPool(initialSummaries),
    [initialSummaries]
  );

  const typesPresent = useMemo(() => {
    const s = new Set<string>();
    initialSummaries.forEach((p) => p.types.forEach((t) => s.add(t)));
    return ["all", ...Array.from(s).sort()];
  }, [initialSummaries]);

  const filteredDex = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialSummaries.filter((p) => {
      const matchQ =
        !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchT = typeFilter === "all" || p.types.includes(typeFilter);
      return matchQ && matchT;
    });
  }, [initialSummaries, query, typeFilter]);

  const userIds = useMemo(
    () => userTeam.filter(Boolean).map((p) => (p as PokemonSummary).id),
    [userTeam]
  );

  const addToUser = useCallback(
    (p: PokemonSummary) => {
      const idx = userTeam.findIndex((s) => s === null);
      if (idx < 0) return;
      if (userIds.includes(p.id)) return;
      const next = [...userTeam];
      next[idx] = p;
      setUserTeam(next);
    },
    [userTeam, userIds]
  );

  const clearUserSlot = useCallback((i: number) => {
    setUserTeam((prev) => {
      const n = [...prev];
      n[i] = null;
      return n;
    });
  }, []);

  const findOpponent = useCallback(() => {
    setErr(null);
    try {
      const rolled = rollOpponentTeam(opponentPool);
      setOppTeam(rolled);
    } catch {
      setErr("Não há Pokémon suficientes (Elétrico/Planta/Veneno) na lista.");
    }
  }, [opponentPool]);

  const userFull = userTeam.every(Boolean);
  const oppFull = oppTeam.every(Boolean);
  const canStart = userFull && oppFull && !loadError;

  const startBattle = useCallback(async () => {
    if (!canStart) return;
    setPhase("loading");
    setErr(null);
    try {
      const u = userTeam as PokemonSummary[];
      const o = oppTeam as PokemonSummary[];
      const ids = [...u.map((x) => x.id), ...o.map((x) => x.id)];
      const apis = await Promise.all(ids.map((id) => fetchPokemonClient(id)));
      const half = u.length;
      const pBuilt = apis.slice(0, half).map(buildBattlePokemon);
      const oBuilt = apis.slice(half).map(buildBattlePokemon);
      setBuiltPlayer(pBuilt);
      setBuiltOpp(oBuilt);
      setPhase("intro");
      setBgmMode("silent");
    } catch {
      setErr("Falha ao montar a batalha. Tente de novo.");
      setPhase("select");
    }
  }, [canStart, userTeam, oppTeam, setBgmMode]);

  const { stats: teamStats, loading: teamStatsLoading } =
    useTeamStats(userTeam);

  const { state: battleState, commitRound } = useBattleSimulation(
    phase === "fight" ? builtPlayer : null,
    phase === "fight" ? builtOpp : null
  );

  return (
    <SmoothScroll>
      <FloatingNav onLogoClick={() => router.push("/")} />
      {/* Coloque o rip da música de treinador FRLG em public/battle/trainer-battle.mp3 (uso pessoal / direitos reservados à Nintendo). */}
      <audio
        key={fightBgmSrc}
        ref={audioRef}
        src={fightBgmSrc}
        loop
        preload="auto"
        className="hidden"
      />

      <div className="relative min-h-screen pb-24 pt-24 text-slate-800">
        <div
          className={`mx-auto px-4 sm:px-8 ${
            phase === "fight" || phase === "intro"
              ? "max-w-[min(98vw,1440px)]"
              : "max-w-[min(98vw,1280px)]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400/80">
                Arena
              </p>
              <h1 className="text-shadow-pokemon font-display text-3xl font-bold text-white sm:text-4xl">
                Batalha 5×5
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#1e4a68]/85">
                Monte seu time Kanto, encontre um oponente e escolha os
                movimentos no visor GBA — o oponente reage automaticamente.
              </p>
            </div>
            <Link
              href="/"
              className="glass-panel inline-flex items-center justify-center rounded-2xl px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Voltar ao Grid
            </Link>
          </motion.div>

          {loadError ? (
            <p className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {loadError}
            </p>
          ) : null}
          {err ? (
            <p className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {err}
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            {phase === "select" || phase === "loading" ? (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="space-y-8"
              >
                <div className="grid gap-6 xl:grid-cols-12">
                  <section className="glass-panel rounded-3xl p-5 sm:p-6 xl:col-span-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Swords className="h-5 w-5 text-amber-300" />
                      <h2 className="font-display text-lg text-slate-800">
                        Seu time
                      </h2>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-1">
                      {userTeam.map((slot, i) => (
                        <div key={i}>
                          {slot ? (
                            <div className="relative">
                              <SlotCard mon={slot} />
                              <button
                                type="button"
                                onClick={() => clearUserSlot(i)}
                                className="absolute right-2 top-2 rounded-lg border border-slate-300 bg-white/90 px-2 py-1 text-[10px] uppercase text-slate-600 hover:text-slate-900"
                              >
                                Remover
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-[118px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 text-xs text-slate-500">
                              Slot {i + 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="glass-panel rounded-3xl p-5 sm:p-6 xl:col-span-4">
                    <h2 className="mb-4 font-display text-lg text-slate-800">
                      Oponente
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        findOpponent();
                      }}
                      className="mb-4 w-full rounded-2xl border border-amber-500/45 bg-amber-400/20 py-3 text-xs font-bold uppercase tracking-widest text-amber-900 transition hover:bg-amber-400/35"
                    >
                      Encontrar oponente
                    </button>
                    <div className="grid gap-2">
                      {oppTeam.map((slot, i) => (
                        <div key={i}>
                          {slot ? (
                            <SlotCard mon={slot} subtitle="Em pé" />
                          ) : (
                            <div className="flex h-[118px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 text-xs text-slate-500">
                              Slot {i + 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="xl:col-span-4">
                    <TacticalDashboard
                      teamStats={teamStats}
                      loading={teamStatsLoading}
                    />
                  </div>
                </div>

                <section className="glass-panel rounded-3xl p-6 sm:p-8">
                  <h3 className="mb-5 font-display text-base uppercase tracking-widest text-slate-700 sm:text-lg">
                    Escolha Pokémon (Gen I)
                  </h3>
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center">
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar nome ou número…"
                      className="w-full max-w-lg rounded-2xl border border-slate-300/80 bg-white/90 px-5 py-3.5 text-base text-slate-800 outline-none ring-amber-400/0 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-400/20"
                    />
                    <div className="flex flex-wrap gap-2">
                      {typesPresent.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTypeFilter(t)}
                          className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider sm:text-xs ${
                            typeFilter === t
                              ? "border-amber-500/55 bg-amber-400/25 text-amber-900"
                              : "border-slate-300/70 bg-white/50 text-slate-600"
                          }`}
                        >
                          {t === "all" ? "Todos" : t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-[min(70vh,560px)] min-h-[360px] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/50 p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                      {filteredDex.map((p) => {
                        const taken = userIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={taken || !userTeam.some((s) => s === null)}
                            onClick={() => {
                              playClick();
                              addToUser(p);
                            }}
                            className="flex min-h-[148px] flex-col rounded-2xl border border-slate-200/90 bg-white/70 p-3 text-left shadow-sm transition hover:border-amber-400/50 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-[168px] sm:p-4"
                          >
                            <div
                              className="mx-auto mb-3 aspect-square w-full max-w-[112px] flex-1 bg-contain bg-center bg-no-repeat sm:max-w-[128px] [image-rendering:pixelated]"
                              style={{ backgroundImage: `url(${p.sprite})` }}
                            />
                            <p className="truncate text-xs font-semibold capitalize text-slate-800 sm:text-sm">
                              {p.name.replace(/-/g, " ")}
                            </p>
                            <p className="text-[11px] text-slate-500 sm:text-xs">
                              #{String(p.id).padStart(3, "0")}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={!canStart || phase === "loading"}
                    onClick={() => {
                      playClick();
                      void startBattle();
                    }}
                    className="rounded-full border border-emerald-600/40 bg-emerald-500/25 px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-900 shadow-[0_8px_28px_rgba(34,120,72,0.2)] transition enabled:hover:bg-emerald-500/40 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-white/40 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {phase === "loading" ? "Preparando…" : "Iniciar batalha"}
                  </button>
                </div>
              </motion.div>
            ) : null}

            <AnimatePresence>
              {phase === "intro" && builtPlayer?.[0] && builtOpp?.[0] ? (
                <BattleIntroSequence
                  key="intro"
                  playerLead={builtPlayer[0]}
                  oppLead={builtOpp[0]}
                  onComplete={() => {
                    primeBattleSfxFromGesture();
                    setPhase("fight");
                    void audioRef.current?.play().catch(() => {});
                  }}
                />
              ) : null}
            </AnimatePresence>

            {phase === "fight" && builtPlayer && builtOpp ? (
              <motion.div
                key="fight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {battleState ? (
                  <GBABattleScene
                    sim={battleState}
                    onCommitRound={commitRound}
                    onExit={() => {
                      audioRef.current?.pause();
                      setBgmMode("battle");
                      setPhase("select");
                      setUserTeam(EMPTY());
                      setOppTeam(EMPTY());
                      setBuiltPlayer(null);
                      setBuiltOpp(null);
                    }}
                  />
                ) : (
                  <p className="py-16 text-center text-sm text-slate-600">
                    Preparando simulador…
                  </p>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </SmoothScroll>
  );
}
