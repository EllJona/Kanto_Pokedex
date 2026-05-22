"use client";

import { AudioProvider } from "./AudioProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
