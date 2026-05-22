/**
 * BGM estilo Game Boy (composição original, loop).
 * Usado quando não há MP3 em public/audio/.
 */

type BgmVariant = "dex" | "battle";

const F = {
  C3: 130.81,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
} as const;

/** 16 passos — pentatónica maior, vibe “rota” Gen I. */
const DEX_LEAD = [
  F.E4, 0, F.G4, F.E4, F.C4, 0, F.D4, F.E4,
  F.G4, 0, F.A4, F.G4, F.E4, F.D4, F.C4, 0,
] as const;

const BATTLE_LEAD = [
  F.E4, F.E4, F.G4, F.A4, F.G4, F.E4, F.C5, F.G4,
  F.E4, F.G4, F.A4, F.A4, F.G4, F.E4, F.D4, F.C4,
] as const;

const DEX_BASS = [F.C3, F.C3, F.G3, F.G3, F.A3, F.A3, F.G3, F.G3] as const;
const BATTLE_BASS = [F.C3, F.G3, F.A3, F.G3, F.C3, F.G3, F.A3, F.E3] as const;

export class ProceduralBgm {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private step = 0;
  private variant: BgmVariant = "dex";
  private volume = 0.14;
  private running = false;

  start(variant: BgmVariant, volume: number) {
    this.stop();
    if (typeof window === "undefined") return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    this.variant = variant;
    this.volume = volume;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.running = true;
    this.step = 0;
    void this.ctx.resume();
    this.fadeTo(volume, 600);
    this.tick();
  }

  setVariant(variant: BgmVariant) {
    this.variant = variant;
  }

  setVolume(volume: number, fadeMs = 400) {
    this.volume = volume;
    if (this.running) this.fadeTo(volume, fadeMs);
  }

  stop(fadeMs = 400) {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.master || !this.ctx) {
      this.dispose();
      return;
    }
    const m = this.master;
    const c = this.ctx;
    const from = m.gain.value;
    const start = performance.now();
    const fade = (now: number) => {
      const t = Math.min(1, (now - start) / fadeMs);
      m.gain.value = from * (1 - t);
      if (t < 1) requestAnimationFrame(fade);
      else {
        void c.close();
        this.dispose();
      }
    };
    requestAnimationFrame(fade);
  }

  private dispose() {
    this.ctx = null;
    this.master = null;
  }

  private fadeTo(target: number, ms: number) {
    if (!this.master) return;
    const from = this.master.gain.value;
    const start = performance.now();
    const run = (now: number) => {
      if (!this.master || !this.running) return;
      const t = Math.min(1, (now - start) / ms);
      this.master.gain.value = from + (target - from) * t;
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  private tick() {
    if (!this.running || !this.ctx || !this.master) return;
    const bpm = this.variant === "battle" ? 128 : 104;
    const beat = 60 / bpm / 2;
    const lead = this.variant === "battle" ? BATTLE_LEAD : DEX_LEAD;
    const bass = this.variant === "battle" ? BATTLE_BASS : DEX_BASS;
    const i = this.step % 16;
    const bassIdx = Math.floor(i / 2) % 8;

    const freq = lead[i];
    if (freq > 0) this.blip(freq, 0.09, "triangle", 0.22);
    this.blip(bass[bassIdx], beat * 1.8, "square", 0.1);

    this.step += 1;
    this.timer = setTimeout(() => this.tick(), beat * 1000);
  }

  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    gainPeak: number
  ) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gainPeak * this.volume, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}
