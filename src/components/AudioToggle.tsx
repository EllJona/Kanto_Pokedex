"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/components/providers/AudioProvider";

export function AudioToggle() {
  const { muted, toggleMuted, playClick } = useAudio();

  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        toggleMuted();
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/80 bg-slate-100/80 text-slate-600 transition hover:border-slate-400 hover:bg-white hover:text-slate-900"
      aria-label={muted ? "Ativar música" : "Silenciar música"}
      title={
        muted
          ? "Ativar trilha sonora (clique em qualquer lugar do site)"
          : "Silenciar trilha sonora"
      }
    >
      {muted ? (
        <VolumeX className="h-4 w-4" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
