/** Curvas estilo editorial / experiência imersiva (suave, lenta). */
export const easeEditorial = [0.22, 1, 0.36, 1] as const;
export const easeReveal = [0.16, 1, 0.3, 1] as const;

export const revealTransition = {
  duration: 0.9,
  ease: easeReveal,
} as const;

export const staggerReveal = {
  staggerChildren: 0.12,
  delayChildren: 0.08,
} as const;
