import { HugeiconsIcon } from "@hugeicons/react";
import { Scissor01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import SlotCard from "@/components/app/SlotCard";
import type { CreneauSlot } from "@/types/slot";

interface SlotListProps {
  slots: CreneauSlot[];
}

function groupByPeriod(slots: CreneauSlot[]): Record<string, CreneauSlot[]> {
  const groups: Record<string, CreneauSlot[]> = {};
  const now = new Date();

  for (const slot of slots) {
    const dt = new Date(slot.dateHeure);
    const diffH = (dt.getTime() - now.getTime()) / 3_600_000;
    let label: string;

    if (diffH < 0) {
      label = "Tout à l'heure";
    } else if (diffH < 1) {
      label = "Dans moins d'une heure 🔥";
    } else if (diffH < 3) {
      label = "Dans les 3 prochaines heures";
    } else if (dt.getHours() < 14) {
      label = "Ce matin";
    } else if (dt.getHours() < 18) {
      label = "Cet après-midi";
    } else {
      label = "Ce soir";
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(slot);
  }

  return groups;
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-katch-surface-2 text-katch-muted">
        <HugeiconsIcon icon={Scissor01Icon} size={24} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-sm uppercase tracking-wide text-katch-text">
          Pas de créneaux pour l&apos;instant
        </p>
        <p className="mt-1 font-mono text-xs text-katch-muted">
          Le scraper tourne toutes les 5 min.
          <br />
          Reviens vite !
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-white/8 px-3 py-1.5 font-mono text-xs text-katch-muted">
        <HugeiconsIcon icon={Clock01Icon} size={12} strokeWidth={1.75} />
        Mis à jour toutes les 5 minutes
      </div>
    </div>
  );
}

export default function SlotList({ slots }: SlotListProps) {
  const groups = groupByPeriod(slots);
  const hasSlots = slots.length > 0;

  return (
    <aside className="flex w-full flex-col overflow-hidden border-r border-white/5 lg:w-[420px] lg:shrink-0">
      {/* En-tête du panneau */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <h2 className="font-display text-xs uppercase tracking-widest text-katch-muted">
          Créneaux du jour
        </h2>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-katch-lime/15 px-1.5 font-mono text-[10px] font-bold text-katch-lime">
          {slots.length}
        </span>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!hasSlots ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6 p-4">
            {Object.entries(groups).map(([period, periodSlots]) => (
              <section key={period}>
                <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-katch-muted">
                  {period}
                </p>
                <div className="flex flex-col gap-3">
                  {periodSlots.map((slot) => (
                    <SlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
