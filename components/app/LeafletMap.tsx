// Ce composant est chargé uniquement côté client via next/dynamic({ ssr: false })
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { CreneauSlot } from "@/types/slot";
import type { SalonLocation } from "@/types/salon";

// ── Coordonnées de démo ────────────────────────────────────────────────────
// Utilisées comme fallback si le salon n'a pas encore de lat/lng en base.
// Seront retirées au fur et à mesure que les adresses seront géocodées.
const DEMO_COORDS: Record<string, [number, number]> = {
  "Tim Barber":                [48.857,  2.368],
  "Studio K":                  [48.862,  2.352],
  "Le Barbier du Temple":      [48.857,  2.353],
  "Chez Selma":                [48.849,  2.348],
  "Black & White Barbershop":  [48.877,  2.337],
};

const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

// ── Icône DivIcon custom ───────────────────────────────────────────────────
function createSalonIcon(slotCount: number, hasUrgent: boolean): L.DivIcon {
  const color = hasUrgent ? "#EF4444" : "#F59E0B";
  const label = slotCount > 9 ? "9+" : String(slotCount);

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
        <div class="katch-ring" style="
          position:absolute;inset:0;
          border-radius:50%;
          background:${color};
          opacity:0.35;
        "></div>
        <div style="
          position:relative;
          width:34px;height:34px;
          background:${color};
          border:2px solid #0A0A0A;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:#fff;
          font-size:12px;font-weight:700;
          font-family:monospace;
          box-shadow:0 2px 12px rgba(0,0,0,0.7);
        ">${label}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// ── Géolocalisation auto (useMap hook) ─────────────────────────────────────
function GeoControl({
  trigger,
  onFound,
}: {
  trigger: number;
  onFound: (pos: [number, number]) => void;
}) {
  const map = useMap();

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        onFound(coords);
        map.flyTo(coords, 15, { animate: true, duration: 1.2 });
      },
      () => {}
    );
  }, [map, onFound]);

  useEffect(() => {
    if (trigger > 0) locate();
  }, [trigger, locate]);

  return null;
}

// ── Groupement des slots par salon ─────────────────────────────────────────
interface SalonGroup {
  salonId:   string;
  salonNom:  string;
  slotCount: number;
  hasUrgent: boolean;
  firstSlot: CreneauSlot | null;
}

function groupBySalon(slots: CreneauSlot[]): SalonGroup[] {
  const map = new Map<string, SalonGroup>();
  const now  = Date.now();

  for (const slot of slots) {
    const mins     = (new Date(slot.dateHeure).getTime() - now) / 60_000;
    const isUrgent = mins < 60;
    const existing = map.get(slot.salonId);

    if (existing) {
      existing.slotCount++;
      if (isUrgent) existing.hasUrgent = true;
    } else {
      map.set(slot.salonId, {
        salonId:   slot.salonId,
        salonNom:  slot.salonNom,
        slotCount: 1,
        hasUrgent: isUrgent,
        firstSlot: slot,
      });
    }
  }

  return Array.from(map.values());
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Composant principal ────────────────────────────────────────────────────
interface LeafletMapProps {
  slots:          CreneauSlot[];
  salonLocations: SalonLocation[]; // Coordonnées réelles depuis la DB
}

export default function LeafletMap({ slots, salonLocations }: LeafletMapProps) {
  const [userPos, setUserPos]       = useState<[number, number] | null>(null);
  const [geoTrigger, setGeoTrigger] = useState(1); // 1 = auto-demander au montage

  const handlePositionFound = useCallback((pos: [number, number]) => {
    setUserPos(pos);
  }, []);

  const salonGroups = groupBySalon(slots);

  // Index rapide des coordonnées DB : salonId → [lat, lng]
  const dbCoords = new Map<string, [number, number]>(
    salonLocations.map((s) => [s.id, [s.lat, s.lng]])
  );

  // Résoudre les coordonnées : DB > démo > Paris centre
  function resolveCoords(salonId: string, salonNom: string): [number, number] {
    return (
      dbCoords.get(salonId) ??
      DEMO_COORDS[salonNom] ??
      PARIS_CENTER
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={PARIS_CENTER}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        {/* Fond sombre CartoDB — gratuit, sans clé API */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />

        <GeoControl trigger={geoTrigger} onFound={handlePositionFound} />

        {/* Markers salons */}
        {salonGroups.map(({ salonId, salonNom, slotCount, hasUrgent, firstSlot }) => {
          const coords = resolveCoords(salonId, salonNom);
          const icon   = createSalonIcon(slotCount, hasUrgent);
          const isFromDb = dbCoords.has(salonId);

          return (
            <Marker key={salonId} position={coords} icon={icon}>
              <Popup>
                <div>
                  <p style={{ fontWeight: "700", fontSize: "13px", marginBottom: "4px", color: "#F5F5F4" }}>
                    {salonNom}
                  </p>
                  <p style={{ fontSize: "11px", color: "#F59E0B", marginBottom: "4px" }}>
                    {slotCount} créneau{slotCount > 1 ? "x" : ""} disponible{slotCount > 1 ? "s" : ""}
                  </p>
                  {firstSlot?.prestation && (
                    <p style={{ fontSize: "11px", color: "#737373" }}>
                      {firstSlot.prestation.nom} · {formatTime(firstSlot.dateHeure)}
                    </p>
                  )}
                  {!isFromDb && (
                    <p style={{ fontSize: "10px", color: "#555", marginTop: "4px", fontStyle: "italic" }}>
                      Position approximative
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Position utilisateur */}
        {userPos && (
          <CircleMarker
            center={userPos}
            radius={9}
            pathOptions={{
              fillColor:   "#FFFFFF",
              fillOpacity: 1,
              color:       "#EF4444",
              weight:      2.5,
            }}
          />
        )}
      </MapContainer>

      {/* ── Overlay : bouton géolocalisation ─────────────────── */}
      <div
        style={{
          position:  "absolute",
          bottom:    16,
          left:      "50%",
          transform: "translateX(-50%)",
          zIndex:    1000,
        }}
      >
        <button
          type="button"
          onClick={() => setGeoTrigger((t) => t + 1)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-katch-surface/90 px-4 py-2.5 font-mono text-xs text-katch-muted backdrop-blur-md transition-colors hover:border-katch-purple/40 hover:text-katch-text"
        >
          <span
            style={{
              display:      "inline-block",
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   userPos ? "#EF4444" : "#737373",
            }}
          />
          {userPos ? "Recentrer" : "Ma position"}
        </button>
      </div>

      {/* ── Overlay : statut ────────────────────────────────── */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000 }}>
        <span className="rounded-lg border border-white/8 bg-katch-surface/90 px-2.5 py-1 font-mono text-[10px] text-katch-muted backdrop-blur-md">
          {slots.length} créneau{slots.length !== 1 ? "x" : ""} · {salonGroups.length} salon{salonGroups.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
