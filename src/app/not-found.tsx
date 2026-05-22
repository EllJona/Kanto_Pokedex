import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-shadow-pokemon mb-2 text-2xl font-bold text-white">
        Não encontrado
      </h1>
      <p className="text-on-bg mb-6">
        Esse Pokémon não existe na Pokédex Kanto (apenas #001–#151).
      </p>
      <Link
        href="/"
        className="glass-panel rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:border-white/35"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
