"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  playBattleSfx as playBattleSfxRaw,
  primeBattleSfxFromGesture,
  type BattleSfxCue,
} from "@/lib/audio/battleSfx";
import { playMechanicalClick } from "@/lib/audio/clickSfx";
import { POKEMON_BGM } from "@/lib/audio/pokemonBgmSources";
import { ProceduralBgm } from "@/lib/audio/proceduralBgm";
import { resolveBgmUrl } from "@/lib/audio/resolveBgmUrl";

type BgmMode = "dex" | "battle" | "silent";

type AudioCtx = {
  muted: boolean;
  toggleMuted: () => void;
  playClick: () => void;
  playBattleSfx: (
    cue: BattleSfxCue,
    opts?: { speciesSlug?: string }
  ) => void;
  setBgmMode: (mode: BgmMode) => void;
};

const AudioContext = createContext<AudioCtx | null>(null);

const DEX_VOL = 0.28;
const BATTLE_VOL = 0.35;

function readMutedPreference(): boolean {
  try {
    const s = localStorage.getItem("kanto-audio-muted");
    if (s === null) return false;
    return s === "1";
  } catch {
    return false;
  }
}

function clampVolume(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function fadeVolume(
  el: HTMLAudioElement,
  to: number,
  ms: number,
  onDone?: () => void
) {
  const target = clampVolume(to);
  const from = clampVolume(el.volume);
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    el.volume = clampVolume(from + (target - from) * t);
    if (t < 1) requestAnimationFrame(tick);
    else {
      el.volume = target;
      onDone?.();
    }
  };
  requestAnimationFrame(tick);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [muted, setMuted] = useState(readMutedPreference);
  const mutedRef = useRef(muted);
  const dexRef = useRef<HTMLAudioElement | null>(null);
  const battleRef = useRef<HTMLAudioElement | null>(null);
  const modeRef = useRef<BgmMode>("dex");
  const unlockedRef = useRef(false);
  const proceduralRef = useRef<ProceduralBgm | null>(null);
  const dexFileOkRef = useRef(false);
  const battleFileOkRef = useRef(false);
  const [dexSrc, setDexSrc] = useState<string>(POKEMON_BGM.dex.local);
  const [battleSrc, setBattleSrc] = useState<string>(POKEMON_BGM.battleMenu.local);
  const [bgmReady, setBgmReady] = useState(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    void (async () => {
      const [dexUrl, battleUrl] = await Promise.all([
        resolveBgmUrl(POKEMON_BGM.dex.local, POKEMON_BGM.dex.remote),
        resolveBgmUrl(
          POKEMON_BGM.battleMenu.local,
          POKEMON_BGM.battleMenu.remote
        ),
      ]);
      setDexSrc(dexUrl);
      setBattleSrc(battleUrl);
      dexFileOkRef.current = true;
      battleFileOkRef.current = true;
      setBgmReady(true);
    })();
  }, []);

  const stopProcedural = useCallback((fadeMs = 400) => {
    proceduralRef.current?.stop(fadeMs);
    proceduralRef.current = null;
  }, []);

  const startProcedural = useCallback(
    (mode: "dex" | "battle") => {
      if (muted) return;
      stopProcedural(0);
      const bgm = new ProceduralBgm();
      proceduralRef.current = bgm;
      bgm.start(mode, mode === "battle" ? BATTLE_VOL * 0.85 : DEX_VOL * 0.9);
    },
    [muted, stopProcedural]
  );

  const playMp3 = useCallback(
    (el: HTMLAudioElement, vol: number) => {
      el.volume = 0;
      void el.play().catch(() => {});
      fadeVolume(el, vol, 800);
    },
    []
  );

  const applyBgm = useCallback(
    (mode: BgmMode) => {
      modeRef.current = mode;
      const dex = dexRef.current;
      const battle = battleRef.current;

      if (muted || mode === "silent") {
        if (dex) fadeVolume(dex, 0, 400, () => dex.pause());
        if (battle) fadeVolume(battle, 0, 400, () => battle.pause());
        stopProcedural();
        return;
      }

      const onBattle = mode === "battle";
      const dexOk = dexFileOkRef.current;
      const battleOk = battleFileOkRef.current;

      if (!dexOk && !battleOk) {
        if (dex) dex.pause();
        if (battle) battle.pause();
        const proc = proceduralRef.current;
        if (proc) {
          proc.setVariant(onBattle ? "battle" : "dex");
          proc.setVolume(onBattle ? BATTLE_VOL * 0.85 : DEX_VOL * 0.9, 500);
        } else {
          startProcedural(onBattle ? "battle" : "dex");
        }
        return;
      }

      stopProcedural(300);

      if (!dex || !battle) return;

      if (onBattle && battleOk) {
        fadeVolume(dex, 0, 500, () => {
          dex.pause();
          battle.volume = 0;
          playMp3(battle, BATTLE_VOL);
        });
      } else if (dexOk) {
        fadeVolume(battle, 0, 500, () => {
          battle.pause();
          if (!dex.paused && dex.volume > 0.05) {
            fadeVolume(dex, DEX_VOL, 600);
          } else {
            dex.volume = 0;
            playMp3(dex, DEX_VOL);
          }
        });
      } else if (onBattle && battleOk) {
        playMp3(battle, BATTLE_VOL);
      } else {
        startProcedural(onBattle ? "battle" : "dex");
      }
    },
    [muted, playMp3, startProcedural, stopProcedural]
  );

  const unlockAndPlay = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    primeBattleSfxFromGesture();
    try {
      localStorage.setItem("kanto-audio-muted", muted ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (!muted) applyBgm(modeRef.current);
  }, [applyBgm, muted]);

  const playBattleSfx = useCallback(
    (cue: BattleSfxCue, opts?: { speciesSlug?: string }) => {
      if (!unlockedRef.current) unlockAndPlay();
      else primeBattleSfxFromGesture();
      playBattleSfxRaw(cue, { ...opts, muted: mutedRef.current });
    },
    [unlockAndPlay]
  );

  useEffect(() => {
    const onPointer = () => unlockAndPlay();
    document.addEventListener("pointerdown", onPointer, { once: true });
    document.addEventListener("keydown", onPointer, { once: true });
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onPointer);
    };
  }, [unlockAndPlay]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem("kanto-audio-muted", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (dexRef.current) dexRef.current.muted = next;
      if (battleRef.current) battleRef.current.muted = next;
      if (!next && unlockedRef.current) {
        setTimeout(() => applyBgm(modeRef.current), 0);
      } else if (next) {
        applyBgm("silent");
      }
      return next;
    });
  }, [applyBgm]);

  const playClick = useCallback(() => {
    if (!unlockedRef.current) unlockAndPlay();
    else primeBattleSfxFromGesture();
    playMechanicalClick(muted);
  }, [muted, unlockAndPlay]);

  const setBgmMode = useCallback(
    (mode: BgmMode) => {
      applyBgm(mode);
    },
    [applyBgm]
  );

  useEffect(() => {
    if (!bgmReady) return;
    if (unlockedRef.current && !muted) applyBgm(modeRef.current);
  }, [bgmReady, applyBgm, muted]);

  useEffect(() => {
    if (!bgmReady) return;
    const onBattleRoute = pathname.startsWith("/battle");
    applyBgm(onBattleRoute ? "battle" : "dex");
  }, [pathname, applyBgm, muted, bgmReady]);

  useEffect(() => {
    if (dexRef.current) dexRef.current.muted = muted;
    if (battleRef.current) battleRef.current.muted = muted;
    if (unlockedRef.current) applyBgm(modeRef.current);
  }, [muted, applyBgm]);

  useEffect(() => {
    return () => stopProcedural(0);
  }, [stopProcedural]);

  return (
    <AudioContext.Provider
      value={{ muted, toggleMuted, playClick, playBattleSfx, setBgmMode }}
    >
      <audio
        key={dexSrc}
        ref={dexRef}
        src={dexSrc}
        loop
        preload="auto"
        className="hidden"
        onError={() => {
          dexFileOkRef.current = false;
          if (!battleFileOkRef.current && unlockedRef.current && !muted) {
            startProcedural(
              modeRef.current === "battle" ? "battle" : "dex"
            );
          }
        }}
      />
      <audio
        key={battleSrc}
        ref={battleRef}
        src={battleSrc}
        loop
        preload="auto"
        className="hidden"
        onError={() => {
          battleFileOkRef.current = false;
          if (!dexFileOkRef.current && unlockedRef.current && !muted) {
            startProcedural(
              modeRef.current === "battle" ? "battle" : "dex"
            );
          }
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    return {
      muted: true,
      toggleMuted: () => {},
      playClick: () => {},
      playBattleSfx: () => {},
      setBgmMode: () => {},
    };
  }
  return ctx;
}
