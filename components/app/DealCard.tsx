import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapPinIcon } from "@hugeicons/core-free-icons";
import type { CreneauSlot } from "@/types/slot";

interface DealCardProps {
  slot: CreneauSlot;
}

// ── Formatage date / heure ─────────────────────────────────────────────────

interface SlotDateTime {
  prefix: "Aujourd'hui" | "Demain" | null;
  date: string;   // "2 juillet"
  time: string;   // "14h30"
}

function formatSlotDateTime(iso: string): SlotDateTime {
  const d = new Date(iso);
  const now = new Date();

  // Comparaison à minuit pour ignorer l'heure
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const slotStart  = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const msPerDay   = 86_400_000;

  const hh   = String(d.getHours()).padStart(2, "0");
  const mm   = String(d.getMinutes()).padStart(2, "0");
  const time = `${hh}h${mm}`;

  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  if (slotStart === todayStart) {
    return { prefix: "Aujourd'hui", date, time };
  }
  if (slotStart === todayStart + msPerDay) {
    return { prefix: "Demain", date, time };
  }
  return { prefix: null, date, time };
}

// ── Composant ──────────────────────────────────────────────────────────────

export default function DealCard({ slot }: DealCardProps) {
  const { salonNom, prestation, dateHeure, salonId, reduction } = slot;

  const prixOriginal = prestation?.prix ?? 0;
  const prixKatch    = Math.round(prixOriginal * (1 - reduction / 100));

  const { prefix, date, time } = formatSlotDateTime(dateHeure);

  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(salonNom)}/800/500`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      {/* ── Image + badge réduction ───────────────────────────── */}
      <div className="relative h-48 overflow-hidden bg-[#F3F4F6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Salon ${salonNom}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge réduction */}
        <span className="absolute right-3 top-3 rounded-full bg-katch-lime px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider text-katch-bg shadow-sm">
          -{reduction}%
        </span>

        {/* Badge Aujourd'hui / Demain */}
        {prefix && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
              prefix === "Aujourd'hui"
                ? "bg-katch-purple text-white"
                : "bg-katch-surface-2 text-katch-lime"
            }`}
          >
            {prefix}
          </span>
        )}
      </div>

      {/* ── Contenu ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Salon */}
        <div>
          <p className="font-display text-base uppercase tracking-tight text-[#1A1A1A]">
            {salonNom}
          </p>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-[#9CA3AF]">
            <HugeiconsIcon icon={MapPinIcon} size={11} strokeWidth={1.5} />
            À proximité
          </p>
        </div>

        {/* Prestation + prix */}
        {prestation && (
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-sm text-[#57534E]">{prestation.nom}</p>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg text-katch-purple">{prixKatch} €</p>
              <p className="font-mono text-xs text-[#9CA3AF] line-through">{prixOriginal} €</p>
            </div>
          </div>
        )}

        {/* Date / heure — format intelligent */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#9CA3AF]">
              {prefix ? `${prefix} — ${date}` : date}
            </p>
            <p className="font-display text-2xl leading-tight text-[#1A1A1A]">
              {time}
            </p>
            {prestation && (
              <p className="font-mono text-[11px] text-[#9CA3AF]">
                {prestation.duree} min
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/salons/${salonId}`}
          className="mt-auto flex w-full items-center justify-center rounded-xl bg-katch-purple/10 py-2.5 font-mono text-sm font-bold text-katch-purple ring-1 ring-inset ring-katch-purple/20 transition-all hover:bg-katch-purple hover:text-white"
        >
          Réserver →
        </Link>
      </div>
    </article>
  );
}
