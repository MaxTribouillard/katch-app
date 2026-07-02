import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Scissor01Icon,
  Search01Icon,
  MapPinIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

export default function AppHeader() {
  return (
    <header className="z-50 flex h-14 shrink-0 items-center gap-4 border-b border-white/5 bg-katch-bg px-4">
      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-katch-purple">
          <HugeiconsIcon
            icon={Scissor01Icon}
            size={15}
            strokeWidth={2}
            className="text-white"
          />
        </span>
        <span className="font-display text-sm uppercase tracking-widest text-katch-text">
          Katch
        </span>
      </Link>

      {/* Barre de recherche centrale */}
      <div className="mx-auto flex w-full max-w-md items-center gap-2 rounded-xl border border-white/8 bg-katch-surface px-3 py-2 focus-within:border-katch-purple/50 focus-within:ring-1 focus-within:ring-katch-purple/20 transition-all">
        <HugeiconsIcon
          icon={MapPinIcon}
          size={15}
          strokeWidth={1.75}
          className="shrink-0 text-katch-muted"
        />
        <input
          type="text"
          placeholder="Ville, quartier ou code postal…"
          className="w-full bg-transparent font-mono text-sm text-katch-text placeholder:text-katch-muted focus:outline-none"
        />
        <button
          type="button"
          aria-label="Rechercher"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-katch-purple text-white transition-opacity hover:opacity-80"
        >
          <HugeiconsIcon icon={Search01Icon} size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-xs text-katch-muted transition-colors hover:border-white/20 hover:text-katch-text sm:flex"
        >
          <HugeiconsIcon icon={UserCircleIcon} size={14} strokeWidth={1.75} />
          Se connecter
        </button>
        <button
          type="button"
          className="rounded-lg bg-katch-lime px-3 py-1.5 font-display text-xs uppercase tracking-wider text-katch-bg transition-opacity hover:opacity-90"
        >
          S&apos;inscrire
        </button>
      </div>
    </header>
  );
}
