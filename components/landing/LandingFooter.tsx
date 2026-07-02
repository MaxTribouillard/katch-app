import { HugeiconsIcon } from "@hugeicons/react";
import { Scissor01Icon } from "@hugeicons/core-free-icons";

export default function LandingFooter() {
  return (
    <footer className="border-t border-bayclic-stone-light bg-bayclic-cream py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 font-mono text-xs text-bayclic-stone sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-bayclic-ink text-bayclic-cream">
            <HugeiconsIcon icon={Scissor01Icon} size={12} strokeWidth={1.75} />
          </span>
          <span className="text-bayclic-ink">Bayclic</span>
        </div>
        <p>© {new Date().getFullYear()} Bayclic. Données issues de Planity.</p>
      </div>
    </footer>
  );
}
