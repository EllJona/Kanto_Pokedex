"use client";

import type { ReactNode } from "react";
import { ExperienceGrain } from "./ExperienceGrain";
import { ScrollProgress } from "./ScrollProgress";
import { SmoothScroll } from "../SmoothScroll";

/** Scroll suave, grão e barra de progresso em todas as páginas. */
export function ExperienceShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <ExperienceGrain />
      {children}
    </SmoothScroll>
  );
}
