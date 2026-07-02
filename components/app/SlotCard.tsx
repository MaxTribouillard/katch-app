import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Scissor01Icon, MapPinIcon } from "@hugeicons/core-free-icons";
import type { CreneauSlot } from "@/types/slot";

interface SlotCardProps {
  slot: CreneauSlot;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEndTime(iso: string, dureeMinutes: number): string {
  const end = new Date(new Date(iso).getTime() + dureeMinutes * 60_000);
  return end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function minutesUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
}

// Prix Katch = -35% sur le prix Planity d'origine
// TODO: remplacer par c.prixBrade quand le champ sera ajouté au schéma Creneau
function katchPrice(original: number): number {
  return Math.round(original * 0.65);
}

export default function SlotCard({ slot }: SlotCardProps) {
  const { salonNom, prestation, dateHeure, salonId } = slot;
  const mins = minutesUntil(dateHeure);
  const isUrgent = mins <= 60;

  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border border-white/6 bg-katch-surface p-4 transition-all hover:border-katch-purple/40 hover:bg-katch-surface-2">
      {/* Urgence badge */}
      {isUrgent && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-katch-red/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-katch-red">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-katch-red" />
          Dans {mins} min
        </span>
      )}

      {/* Salon */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-katch-purple/15 text-katch-purple">
            <HugeiconsIcon icon={Scissor01Icon} size={15} strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-sm uppercase tracking-tight text-katch-text">
              {salonNom}
            </p>
            <p className="flex items-center gap-1 font-mono text-[11px] text-katch-muted">
              <HugeiconsIcon icon={MapPinIcon} size={11} strokeWidth={1.5} />
              À proximité
            </p>
          </div>
        </div>
      </div>

      {/* Prestation */}
      {prestation ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-katch-text">
              {prestation.nom}
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-katch-muted">
              <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={1.5} />
              {formatTime(dateHeure)} → {formatEndTime(dateHeure, prestation.duree)}&nbsp;·&nbsp;{prestation.duree} min
            </p>
          </div>

          {/* Prix */}
          <div className="shrink-0 text-right">
            <p className="font-display text-xl text-katch-lime">
              {katchPrice(prestation.prix)} €
            </p>
            <p className="font-mono text-xs text-katch-muted line-through">
              {prestation.prix} €
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm text-katch-muted">
            {formatTime(dateHeure)} · Prestation à définir
          </p>
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/salons/${salonId}`}
        className="mt-1 flex w-full items-center justify-center rounded-lg bg-katch-purple/15 py-2 font-mono text-sm font-bold text-katch-purple ring-1 ring-inset ring-katch-purple/30 transition-all hover:bg-katch-purple hover:text-white"
      >
        Réserver ce créneau →
      </Link>
    </article>
  );
}
