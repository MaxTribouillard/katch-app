import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Scissor01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-bayclic-stone-light/60 bg-bayclic-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-bayclic-ink text-bayclic-cream">
            <HugeiconsIcon icon={Scissor01Icon} size={16} strokeWidth={1.75} />
          </span>
          <span className="font-display text-base uppercase tracking-tight text-bayclic-ink">
            Bayclic
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-sm text-bayclic-stone md:flex">
          <a href="#etudiants" className="hover:text-bayclic-ink">
            Étudiants
          </a>
          <a href="#salons" className="hover:text-bayclic-ink">
            Salons
          </a>
          <a href="#comment-ca-marche" className="hover:text-bayclic-ink">
            Comment ça marche
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Se connecter
          </Button>
          <Button
            size="sm"
            className="bg-bayclic-ink text-bayclic-cream hover:bg-bayclic-ink-2"
          >
            Trouver un créneau
          </Button>
        </div>
      </div>
    </header>
  );
}
