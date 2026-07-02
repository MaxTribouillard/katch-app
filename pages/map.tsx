import type { GetServerSideProps } from "next";
import Head from "next/head";
import { prisma } from "@/lib/prisma";
import { computeDisplayReduction } from "@/lib/reduction";
import AppHeader from "@/components/app/AppHeader";
import FilterBar from "@/components/app/FilterBar";
import SlotList from "@/components/app/SlotList";
import MapPanel from "@/components/app/MapPanel";
import type { CreneauSlot } from "@/types/slot";
import type { SalonLocation } from "@/types/salon";

interface MapPageProps {
  slots: CreneauSlot[];
  salonLocations: SalonLocation[];
}

export const getServerSideProps: GetServerSideProps<MapPageProps> = async () => {
  const now = new Date();
  // Fenêtre identique à la logique métier du scraper : 48h
  const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const [creneaux, appSettings] = await Promise.all([
    prisma.creneau.findMany({
      where: {
        disponible: true,
        dateHeure: { gte: now, lte: horizon },
      },
      include: { salon: true, prestation: true },
      orderBy: { dateHeure: "asc" },
    }),
    prisma.appSettings.upsert({
      where:  { id: "singleton" },
      update: {},
      create: { id: "singleton", reductionSameDay: 50, reductionNextDay: 35 },
    }),
  ]);

  const slots: CreneauSlot[] = creneaux.map((c) => ({
    id:        c.id,
    dateHeure: c.dateHeure.toISOString(),
    reduction: computeDisplayReduction(c.dateHeure, appSettings, c.reduction),
    salonId:   c.salonId,
    salonNom:  c.salon.nom,
    prestation: c.prestation
      ? {
          nom: c.prestation.nom,
          prix: c.prestation.prix,
          duree: c.prestation.duree,
        }
      : null,
  }));

  // Extraire les positions GPS des salons depuis les créneaux déjà chargés
  const seen = new Set<string>();
  const salonLocations: SalonLocation[] = [];

  for (const c of creneaux) {
    if (!seen.has(c.salonId) && c.salon.latitude != null && c.salon.longitude != null) {
      seen.add(c.salonId);
      salonLocations.push({
        id:  c.salonId,
        nom: c.salon.nom,
        lat: c.salon.latitude,
        lng: c.salon.longitude,
      });
    }
  }

  return { props: { slots, salonLocations } };
};

export default function MapPage({ slots, salonLocations }: MapPageProps) {
  return (
    <>
      <Head>
        <title>Katch — Carte des créneaux disponibles</title>
        <meta
          name="description"
          content="Visualise les créneaux de coiffure bradés disponibles près de toi sur la carte."
        />
      </Head>

      <div className="flex h-screen flex-col overflow-hidden bg-katch-bg text-katch-text">
        <AppHeader />
        <FilterBar slotCount={slots.length} />
        <div className="flex min-h-0 flex-1">
          <SlotList slots={slots} />
          <MapPanel slots={slots} salonLocations={salonLocations} />
        </div>
      </div>
    </>
  );
}
