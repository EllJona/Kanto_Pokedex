import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">Não encontrado</h1>
      <p className="mb-6 text-zinc-600">
        Esse Pokémon não existe na Pokédex Kanto (apenas #001–#151).
      </p>
      <Link
        href="/"
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
