import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartIncreaseIcon,
  Clock01Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const arguments_ = [
  {
    icon: Clock01Icon,
    chiffre: "0 min",
    titre: "perdue à rappeler ta liste d'attente",
    description: "Le créneau libre est proposé automatiquement, sans appel.",
  },
  {
    icon: MoneyBag02Icon,
    chiffre: "1 client",
    titre: "au fauteuil plutôt qu'un trou dans le planning",
    description: "Un créneau bradé rapporte toujours plus qu'un créneau vide.",
  },
  {
    icon: ChartIncreaseIcon,
    chiffre: "0€",
    titre: "de commission sur les rendez-vous classiques",
    description: "Bayclic ne touche qu'aux créneaux qu'il t'aide à remplir.",
  },
];

export default function SalonsSection() {
  return (
    <section
      id="salons"
      className="bg-bayclic-ink py-20 text-bayclic-cream sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-bayclic-green">
            Pour les salons
          </span>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-tight sm:text-4xl">
            Un fauteuil vide ne rapporte jamais rien
          </h2>
          <p className="mt-4 font-mono text-base text-bayclic-stone-light">
            Bayclic récupère automatiquement tes annulations sur Planity et les
            propose à des étudiants à proximité, à un tarif que tu fixes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {arguments_.map((arg) => (
            <div
              key={arg.titre}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bayclic-green/20 text-bayclic-green">
                <HugeiconsIcon icon={arg.icon} size={20} strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-display text-2xl tracking-tight">
                {arg.chiffre}
              </p>
              <h3 className="mt-1 font-mono text-sm font-bold text-bayclic-cream">
                {arg.titre}
              </h3>
              <p className="mt-2 font-mono text-sm leading-relaxed text-bayclic-stone-light">
                {arg.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg uppercase tracking-tight">
              Ton salon est déjà sur Planity ?
            </p>
            <p className="mt-1 font-mono text-sm text-bayclic-stone-light">
              Aucune intégration à faire. On se branche sur ton planning existant.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-bayclic-green text-white hover:bg-bayclic-green-dark"
          >
            Référencer mon salon
          </Button>
        </div>
      </div>
    </section>
  );
}
