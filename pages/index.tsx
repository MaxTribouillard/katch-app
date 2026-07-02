import { useState, useRef, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  MapPinIcon,
  Notification03Icon,
  SaleTag02Icon,
  Scissor01Icon,
} from "@hugeicons/core-free-icons";
import { prisma } from "@/lib/prisma";
import HomeHeader from "@/components/app/HomeHeader";
import DealCard from "@/components/app/DealCard";
import type { CreneauSlot } from "@/types/slot";

interface HomeProps {
  deals: CreneauSlot[];
  totalCount: number;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const now = new Date();

  const creneaux = await prisma.creneau.findMany({
    where: { disponible: true, dateHeure: { gte: now } },
    include: { salon: true, prestation: true },
    orderBy: { dateHeure: "asc" },
    take: 9,
  });

  const deals: CreneauSlot[] = creneaux.map((c) => ({
    id: c.id,
    dateHeure: c.dateHeure.toISOString(),
    reduction: c.reduction,
    salonId: c.salonId,
    salonNom: c.salon.nom,
    prestation: c.prestation
      ? { nom: c.prestation.nom, prix: c.prestation.prix, duree: c.prestation.duree }
      : null,
  }));

  const totalCount = await prisma.creneau.count({
    where: { disponible: true, dateHeure: { gte: now } },
  });

  return { props: { deals, totalCount } };
};

export default function Home({ deals, totalCount }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const dealsRef = useRef<HTMLElement>(null);

  const filteredDeals = searchQuery.trim()
    ? deals.filter(
        (d) =>
          d.salonNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.prestation?.nom.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deals;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dealsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  return (
    <>
      <Head>
        <title>Katch — Créneaux coiffure bradés, maintenant près de toi</title>
        <meta
          name="description"
          content="Trouve un créneau coiffure de dernière minute à prix réduit. Mis à jour toutes les 5 minutes."
        />
      </Head>

      {/* ═══════════════════════════════════════════════════════════
          HERO UNIFIÉ — Les deux messages au même niveau
      ═════════════════════════════════════════════════════════════*/}
      <section className="relative overflow-hidden bg-katch-bg">
        {/* Gradient rouge en halo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(239,68,68,0.18) 0%, transparent 60%)",
          }}
        />
        {/* Grille fine */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <HomeHeader />

        {/* Grille deux colonnes — même niveau */}
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-28 lg:px-10 lg:pt-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ── Colonne gauche : H1 ─────────────────────── */}
            <div className="flex flex-col justify-center gap-5">
              {/* Badge live */}
              <span className="flex w-fit items-center gap-2 rounded-full border border-katch-lime/30 bg-katch-lime/10 px-3 py-1.5 font-mono text-xs text-katch-lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-katch-lime" />
                {totalCount} créneau{totalCount !== 1 ? "x" : ""} en ce moment
              </span>

              <h1 className="font-display text-5xl uppercase leading-[1.02] tracking-tight text-katch-text sm:text-6xl">
                Le bon coiffeur.{" "}
                <br className="hidden sm:block" />
                <span className="text-katch-lime">Au bon prix.</span>
              </h1>

              <p className="max-w-sm font-mono text-sm leading-relaxed text-katch-muted">
                Katch surveille les annulations de dernière minute dans les
                salons partenaires et te les propose à tarif étudiant.
              </p>
            </div>

            {/* ── Colonne droite : H2 + image téléphone ───── */}
            <div className="flex flex-col gap-5">
              <span className="flex w-fit items-center gap-2 rounded-full border border-katch-purple/30 bg-katch-purple/10 px-3 py-1.5 font-mono text-xs text-katch-purple">
                <HugeiconsIcon icon={Notification03Icon} size={12} strokeWidth={1.75} />
                Alertes en temps réel
              </span>

              <h2 className="font-display text-4xl uppercase leading-[1.02] tracking-tight text-katch-text sm:text-5xl">
                Ton barber a un créneau.{" "}
                <span className="text-katch-purple">Tu le sais en premier.</span>
              </h2>

              <p className="max-w-sm font-mono text-sm leading-relaxed text-katch-muted">
                Active les alertes pour ton salon favori. Dès qu&apos;une place
                se libère à prix bradé, tu es notifié avant tout le monde.
              </p>

              {/* Image téléphone */}
              <div className="relative mt-2 h-[260px] overflow-hidden rounded-2xl lg:h-[280px]">
                <Image
                  src="/marketing1.jpg"
                  alt="Notification Katch sur smartphone"
                  fill
                  priority
                  className="object-cover object-top"
                  style={{
                    boxShadow: "0 0 40px rgba(239,68,68,0.12)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Barre de recherche unifiée ──────────────────── */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-12 flex max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all focus-within:border-katch-purple/50 focus-within:ring-1 focus-within:ring-katch-purple/20"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={1.75}
              className="ml-4 shrink-0 self-center text-katch-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ville, quartier ou nom de salon…"
              className="flex-1 bg-transparent px-3 py-4 font-mono text-sm text-katch-text placeholder:text-katch-muted focus:outline-none"
            />
            <button
              type="submit"
              className="m-1.5 flex items-center gap-2 rounded-xl bg-katch-purple px-5 py-2.5 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Chercher
            </button>
          </form>

          {/* Lien carte */}
          <div className="mt-4 flex justify-center">
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs text-katch-muted transition-colors hover:text-katch-text"
            >
              <HugeiconsIcon icon={MapPinIcon} size={12} strokeWidth={1.75} />
              Voir sur la carte →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DEALS — Directement en dessous, sans section intermédiaire
      ═════════════════════════════════════════════════════════════*/}
      <section
        ref={dealsRef}
        className="bg-[#F7F3EC] px-6 py-16 lg:px-10 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          {/* En-tête section */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={SaleTag02Icon}
                  size={16}
                  strokeWidth={1.75}
                  className="text-katch-purple"
                />
                <span className="font-mono text-xs uppercase tracking-widest text-katch-purple">
                  Bons plans du moment
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-tight text-[#1A1A1A] sm:text-3xl">
                {searchQuery.trim()
                  ? `Résultats pour « ${searchQuery} »`
                  : "Les meilleures affaires près de toi"}
              </h2>
            </div>

            <Link
              href="/map"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#DDD8D0] bg-white px-4 py-2 font-mono text-xs text-[#737373] shadow-sm transition-colors hover:border-katch-purple/30 hover:text-katch-purple"
            >
              <HugeiconsIcon icon={MapPinIcon} size={12} strokeWidth={1.75} />
              Voir sur la carte
            </Link>
          </div>

          {/* Grille / Empty state */}
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#C4BAB0] shadow-sm">
                <HugeiconsIcon icon={Scissor01Icon} size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-sm uppercase tracking-wide text-[#1A1A1A]">
                  {searchQuery
                    ? `Aucun résultat pour « ${searchQuery} »`
                    : "Pas de créneaux disponibles"}
                </p>
                <p className="mt-1 font-mono text-xs text-[#737373]">
                  {searchQuery
                    ? "Essaie un autre nom ou une autre ville"
                    : "Reviens dans quelques minutes — mis à jour toutes les 5 min."}
                </p>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg border border-[#DDD8D0] bg-white px-4 py-2 font-mono text-xs text-[#737373] shadow-sm transition-colors hover:text-katch-purple"
                >
                  Voir tous les créneaux
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.id} slot={deal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E2D8] bg-[#F7F3EC] px-6 py-8 text-center">
        <p className="font-mono text-xs text-[#737373]">
          © 2026 Katch — Données Planity mises à jour toutes les 5 minutes
        </p>
      </footer>
    </>
  );
}
