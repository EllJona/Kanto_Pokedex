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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
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
