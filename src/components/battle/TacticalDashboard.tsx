"use client";

import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Shield, Zap } from "lucide-react";
import type { ApiPokemon } from "@/lib/pokeapi";
import { analyzeTeamSynergy } from "@/lib/battle/teamSynergy";
import { TYPE_COLORS } from "@/lib/typeColors";

type Props = {
  teamStats: ApiPokemon[];
  loading?: boolean;
};

export function TacticalDashboard({ teamStats, loading }: Props) {
  const report = useMemo(
    () => analyzeTeamSynergy(teamStats),
    [teamStats]
  );

  const chartData = report.radar.map((r) => ({
    stat: r.stat,
    value: r.value,
  }));

  return (
    <section className="glass-panel flex h-full flex-col rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg text-slate-800">Sinergia tática</h2>
        <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold tabular-nums text-amber-900">
          {loading ? "…" : `${report.coverageScore}%`}
        </span>
      </div>

      <div className="relative mx-auto h-[220px] w-full max-w-[280px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Calculando stats…
          </div>
        ) : teamStats.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-500">
            Adicione Pokémon ao time para ver o radar e fraquezas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="rgba(26,51,72,0.15)" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "rgba(26,51,72,0.65)", fontSize: 9 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 255]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Média"
                dataKey="value"
                stroke="#f8d030"
                fill="#f8d030"
                fillOpacity={0.28}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-4 text-sm">
        <p className="text-xs leading-relaxed text-slate-600">{report.summary}</p>

        {report.weaknesses.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600">
              <Zap className="h-3 w-3" aria-hidden />
              Fraquezas
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {report.weaknesses.map((w) => (
                <li
                  key={w.type}
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-black/90"
                  style={{
                    backgroundColor: TYPE_COLORS[w.type] ?? "#888",
                    boxShadow: `0 0 12px ${TYPE_COLORS[w.type] ?? "#888"}66`,
                  }}
                >
                  {w.type} ×{w.score}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {report.resistances.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              <Shield className="h-3 w-3" aria-hidden />
              Resistências
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {report.resistances.map((r) => (
                <li
                  key={r.type}
                  className="rounded-full border border-slate-300/80 bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700"
                >
                  {r.type}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
