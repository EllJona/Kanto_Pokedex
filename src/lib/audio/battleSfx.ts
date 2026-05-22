import { SHOWDOWN_AUDIO_BASE } from "@/lib/audio/pokemonBgmSources";
import { FRLG_SFX } from "@/lib/audio/pokemonFrlgSfx";

export type BattleSfxCue =
  | "attack-neutral"
  | "attack-electric"
  | "attack-grass"
  | "attack-fire"
  | "attack-poison"
  | "collision"
  | "hit"
  | "hit-special"
  | "hit-crit"
  | "faint"
  | "cry"
  | "send-out"
  | "victory"
  | "defeat"
  | "ineffective"
  | "effective"
  | "super-effective";

function cryUrl(slug: string): string {
  return `${SHOWDOWN_AUDIO_BASE}/cries/${slug}.ogg`;
}

const sampleCache = new Map<string, HTMLAudioElement>();
const cryCache = new Map<string, HTMLAudioElement>();
let primed = false;

function getSample(src: string): HTMLAudioElement {
  let el = sampleCache.get(src);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    sampleCache.set(src, el);
  }
  return el;
}

function playSample(src: string, volume: number, playbackRate = 1): void {
  const el = getSample(src).cloneNode() as HTMLAudioElement;
  el.volume = Math.min(1, volume);
  el.playbackRate = playbackRate;
  el.currentTime = 0;
  void el.play().catch(() => {});
}

function playCry(slug: string, volume = 0.55): void {
  if (!slug) return;
  let el = cryCache.get(slug);
  if (!el) {
    el = new Audio(cryUrl(slug));
    el.preload = "auto";
    cryCache.set(slug, el);
  }
  const play = el.cloneNode() as HTMLAudioElement;
  play.volume = volume;
  play.currentTime = 0;
  void play.play().catch(() => {});
}

/** Chamar no clique do jogador — desbloqueia reprodução no browser. */
export function primeBattleSfxFromGesture(): void {
  if (typeof window === "undefined") return;
  primed = true;
  for (const src of Object.values(FRLG_SFX)) {
    const el = getSample(src);
    el.volume = 0.001;
    void el
      .play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = 1;
      })
      .catch(() => {});
  }
}

export function unlockBattleSfx(): void {
  primeBattleSfxFromGesture();
}

function playCue(cue: BattleSfxCue, opts?: { speciesSlug?: string }) {
  switch (cue) {
    case "collision":
    case "hit":
      playSample(FRLG_SFX.hitPhysical, 0.92);
      break;
    case "hit-special":
      playSample(FRLG_SFX.hitSpecial, 0.88);
      break;
    case "hit-crit":
      playSample(FRLG_SFX.hitPhysical, 1);
      window.setTimeout(() => playSample(FRLG_SFX.hitPhysical, 0.75, 1.05), 55);
      break;
    case "faint":
      playSample(FRLG_SFX.faint, 0.95);
      if (opts?.speciesSlug) {
        const slug = opts.speciesSlug;
        window.setTimeout(() => playCry(slug, 0.58), 200);
      }
      break;
    case "cry":
    case "send-out":
      if (opts?.speciesSlug) {
        playCry(opts.speciesSlug, cue === "send-out" ? 0.48 : 0.55);
      }
      break;
    case "ineffective":
      playSample(FRLG_SFX.notEffective, 0.85);
      break;
    case "effective":
      playSample(FRLG_SFX.effective, 0.88);
      break;
    case "super-effective":
      playSample(FRLG_SFX.superEffective, 0.9);
      break;
    case "victory":
      playSample(FRLG_SFX.effective, 0.7);
      window.setTimeout(() => playSample(FRLG_SFX.superEffective, 0.65), 280);
      break;
    case "defeat":
      playSample(FRLG_SFX.notEffective, 0.75);
      window.setTimeout(() => playSample(FRLG_SFX.faint, 0.5, 0.9), 200);
      break;
    default:
      if (cue.startsWith("attack-")) {
        playSample(FRLG_SFX.hitSpecial, 0.55, 1.1);
      }
      break;
  }
}

export function playBattleSfx(
  cue: BattleSfxCue,
  opts?: { speciesSlug?: string; muted?: boolean }
) {
  if (opts?.muted) return;
  if (!primed) primeBattleSfxFromGesture();
  playCue(cue, opts);
}
