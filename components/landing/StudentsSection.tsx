import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  SaleTag02Icon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";

const points = [
  {
    icon: Notification03Icon,
    titre: "Tu es prévenu en premier",
    description:
      "Dès qu'un rendez-vous est annulé dans un salon partenaire, tu reçois une notification avant tout le monde.",
  },
  {
    icon: SaleTag02Icon,
    titre: "Jusqu'à 50% de réduction",
    description:
      "Les salons bradent ces créneaux pour ne pas les perdre. Tu profites du même service, moins cher.",
  },
  {
    icon: MapPinIcon,
    titre: "Près de chez toi",
    description:
      "Tu ne vois que les créneaux des salons proches de ton campus ou de ton logement.",
  },
];

export default function StudentsSection() {
  return (
    <section id="etudiants" className="bg-bayclic-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-bayclic-coral">
            Pour les étudiants
          </span>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-bayclic-ink sm:text-4xl">
            Te faire couper les cheveux ne devrait pas te ruiner
          </h2>
          <p className="mt-4 font-mono text-base text-bayclic-stone">
            Tu choisis tes critères une fois. On te prévient à chaque fois
            qu&apos;un créneau correspond, sans avoir à rafraîchir Planity
            toutes les heures.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.titre}
              className="rounded-2xl border border-bayclic-stone-light bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bayclic-coral-light text-bayclic-coral">
                <HugeiconsIcon icon={point.icon} size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 font-display text-base uppercase tracking-tight text-bayclic-ink">
                {point.titre}
              </h3>
              <p className="mt-2 font-mono text-sm leading-relaxed text-bayclic-stone">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
