import { audioFileExists } from "@/lib/audio/checkAudioFile";

/** Prefere ficheiro em public/; senão usa CDN do Showdown. */
export async function resolveBgmUrl(
  local: string,
  remote: string
): Promise<string> {
  if (await audioFileExists(local)) return local;
  return remote;
}
