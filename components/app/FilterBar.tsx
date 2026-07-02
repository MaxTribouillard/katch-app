import { useState } from "react";

const TYPES = ["Tous", "Coupe", "Barbe", "Couleur", "Brushing", "Soins"];
const DISTANCES = ["< 500 m", "< 1 km", "< 2 km", "< 5 km"];
const PRIX = ["< 15 €", "< 25 €", "< 40 €"];

interface FilterBarProps {
  slotCount: number;
}

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
        active
          ? "border-katch-purple bg-katch-purple/15 text-katch-text"
          : "border-white/8 bg-transparent text-katch-muted hover:border-white/20 hover:text-katch-text"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterBar({ slotCount }: FilterBarProps) {
  const [activeType, setActiveType] = useState("Tous");
  const [activeDist, setActiveDist] = useState("< 2 km");
  const [activePrix, setActivePrix] = useState<string | null>(null);

  return (
    <div className="flex shrink-0 items-center gap-3 overflow-x-auto border-b border-white/5 bg-katch-bg px-4 py-2.5 scrollbar-none">
      {/* Compteur */}
      <span className="shrink-0 font-mono text-xs text-katch-muted">
        <span className="font-bold text-katch-lime">{slotCount}</span> créneau
        {slotCount !== 1 ? "x" : ""} aujourd&apos;hui
      </span>

      <span className="h-4 w-px shrink-0 bg-white/10" />

      {/* Type de prestation */}
      <div className="flex items-center gap-1.5">
        {TYPES.map((t) => (
          <Chip
            key={t}
            label={t}
            active={activeType === t}
            onClick={() => setActiveType(t)}
          />
        ))}
      </div>

      <span className="h-4 w-px shrink-0 bg-white/10" />

      {/* Distance */}
      <div className="flex items-center gap-1.5">
        {DISTANCES.map((d) => (
          <Chip
            key={d}
            label={d}
            active={activeDist === d}
            onClick={() => setActiveDist(d)}
          />
        ))}
      </div>

      <span className="h-4 w-px shrink-0 bg-white/10" />

      {/* Prix */}
      <div className="flex items-center gap-1.5">
        {PRIX.map((p) => (
          <Chip
            key={p}
            label={p}
            active={activePrix === p}
            onClick={() => setActivePrix(activePrix === p ? null : p)}
          />
        ))}
      </div>
    </div>
  );
}
