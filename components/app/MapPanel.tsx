import dynamic from "next/dynamic";
import type { CreneauSlot } from "@/types/slot";
import type { SalonLocation } from "@/types/salon";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-katch-bg">
      <div className="flex flex-col items-center gap-3">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-katch-purple border-t-transparent" />
        <span className="font-mono text-xs text-katch-muted">
          Chargement de la carte…
        </span>
      </div>
    </div>
  ),
});

interface MapPanelProps {
  slots: CreneauSlot[];
  salonLocations: SalonLocation[];
}

export default function MapPanel({ slots, salonLocations }: MapPanelProps) {
  return (
    <section className="relative hidden flex-1 overflow-hidden lg:flex">
      <LeafletMap slots={slots} salonLocations={salonLocations} />
    </section>
  );
}
