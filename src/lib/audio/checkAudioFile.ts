/** Verifica se um MP3 existe em public/ antes de tentar <audio>. */
export async function audioFileExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    return res.ok && (type.includes("audio") || type.includes("octet-stream"));
  } catch {
    return false;
  }
}
