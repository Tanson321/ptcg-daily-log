import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="min-w-0">
          <div className="text-sm font-semibold tracking-tight text-zinc-950">
            PTCG Thought Log
          </div>
          <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Luka PTCG Notes
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-sm text-zinc-600">
          <Link
            href="/"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            Home
          </Link>
          <Link
            href="/#latest"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            Latest
          </Link>
          <Link
            href="/#discover"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            Tags
          </Link>
        </nav>
      </div>
    </header>
  );
}
