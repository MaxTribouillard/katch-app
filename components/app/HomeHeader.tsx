import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Scissor01Icon,
  MapPinIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

export default function HomeHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6 lg:px-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-katch-purple">
          <HugeiconsIcon
            icon={Scissor01Icon}
            size={15}
            strokeWidth={2}
            className="text-white"
          />
        </span>
        <span className="font-display text-sm uppercase tracking-widest text-white">
          Katch
        </span>
      </Link>

      {/* Nav centrale */}
      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/map"
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 font-mono text-xs text-white/70 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white"
        >
          <HugeiconsIcon icon={MapPinIcon} size={12} strokeWidth={1.75} />
          Voir sur la carte
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-white/60 transition-colors hover:text-white sm:flex"
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
