import { redirect } from "next/navigation";

export default async function PokemonRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?p=${encodeURIComponent(id)}`);
}
