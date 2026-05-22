import { audioFileExists } from "@/lib/audio/checkAudioFile";

/** Prefere ficheiro em public/; senão tenta remotes (CDN) em ordem. */
export async function resolveBgmUrl(
  local: string,
  remote: string | readonly string[]
): Promise<string> {
  if (await audioFileExists(local)) return local;
  const list = Array.isArray(remote) ? remote : [remote];
  return list[0] ?? local;
}
