import { HugeiconsIcon } from "@hugeicons/react";
import {
  Scissor01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

interface ScheduleRowProps {
  heure: string;
  prestation: string;
  animated?: boolean;
}

function ScheduleRow({ heure, prestation, animated = false }: ScheduleRowProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="w-12 shrink-0 font-mono text-xs text-bayclic-stone sm:text-sm">
        {heure}
      </span>
      <div
        className={`relative flex h-12 flex-1 items-center justify-between overflow-hidden rounded-md border px-3 ${
          animated
            ? "animate-bayclic-slot"
            : "border-bayclic-stone-light bg-bayclic-cream-2"
        }`}
      >
        {animated ? (
          <>
            <span className="animate-bayclic-label-reserved absolute left-3 text-sm font-bold text-bayclic-stone">
              Réservé
            </span>
            <span className="animate-bayclic-label-cancelled absolute left-3 text-sm font-bold text-[#993C1D]">
              Annulé
            </span>
            <span className="animate-bayclic-label-available absolute left-3 flex items-center gap-2 text-sm font-bold text-bayclic-green-dark">
              <span className="animate-bayclic-dot h-1.5 w-1.5 rounded-full bg-bayclic-green" />
              Disponible
            </span>
            <span className="animate-bayclic-label-reserved absolute right-3 text-xs text-bayclic-stone">
              {prestation}
            </span>
            <span className="animate-bayclic-label-available absolute right-3 font-mono text-sm font-bold text-bayclic-green-dark">
              -40%
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-bayclic-stone">Réservé</span>
            <span className="text-xs text-bayclic-stone">{prestation}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function HeroSchedule() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-bayclic-stone-light bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-display text-sm uppercase tracking-wide text-bayclic-ink">
            Tim Barber
          </p>
          <p className="font-mono text-xs text-bayclic-stone">Aujourd&apos;hui · Caen</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bayclic-cream-2 text-bayclic-stone">
          <HugeiconsIcon icon={Scissor01Icon} size={18} strokeWidth={1.5} />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <ScheduleRow heure="14h00" prestation="Coupe homme" />
        <ScheduleRow heure="15h30" prestation="Coupe + barbe" animated />
        <ScheduleRow heure="17h00" prestation="Couleur" />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-bayclic-ink p-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bayclic-green/20 text-bayclic-green">
          <HugeiconsIcon icon={Notification03Icon} size={16} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-bold text-bayclic-cream">
            Créneau libéré chez Tim Barber
          </p>
          <p className="font-mono text-xs text-bayclic-stone-light">
            15h30 · Coupe + barbe · 15€ au lieu de 25€
          </p>
        </div>
      </div>
    </div>
  );
}
