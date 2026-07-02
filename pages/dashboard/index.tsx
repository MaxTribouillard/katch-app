import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SaleTag02Icon,
  LinkSquare01Icon,
  PlusSignIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"];

interface UpcomingSlot {
  id: string;
  dateHeure: string;
  prestation: { nom: string; prix: number } | null;
}

interface SalonDashboardProps {
  salonNom: string;
  salonId: string;
  planityUrl: string | null;
  totalPrestations: number;
  totalCreneaux: number;
  upcomingSlots: UpcomingSlot[];
}

export const getServerSideProps: GetServerSideProps<SalonDashboardProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session || (session.user.role !== "SALON" && session.user.role !== "ADMIN")) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const salonId = session.user.salonId;
  if (!salonId) {
    return { redirect: { destination: "/login?error=no-salon", permanent: false } };
  }

  const now = new Date();

  const [salon, totalCreneaux, upcoming] = await Promise.all([
    prisma.salon.findUnique({
      where: { id: salonId },
      include: { _count: { select: { prestations: true } } },
    }),
    prisma.creneau.count({ where: { salonId, disponible: true, dateHeure: { gte: now } } }),
    prisma.creneau.findMany({
      where: { salonId, disponible: true, dateHeure: { gte: now } },
      include: { prestation: { select: { nom: true, prix: true } } },
      orderBy: { dateHeure: "asc" },
      take: 5,
    }),
  ]);

  if (!salon) return { redirect: { destination: "/login", permanent: false } };

  return {
    props: {
      salonNom: salon.nom,
      salonId: salon.id,
      planityUrl: salon.planityUrl,
      totalPrestations: salon._count.prestations,
      totalCreneaux,
      upcomingSlots: upcoming.map((c) => ({
        id: c.id,
        dateHeure: c.dateHeure.toISOString(),
        prestation: c.prestation
          ? { nom: c.prestation.nom, prix: c.prestation.prix }
          : null,
      })),
    },
  };
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((d.getTime() - Date.now()) / 60_000);
  if (mins < 60) return `Dans ${mins} min`;
  if (mins < 1440) return `Aujourd'hui ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SalonDashboard({
  salonNom,
  planityUrl,
  totalPrestations,
  totalCreneaux,
  upcomingSlots,
}: SalonDashboardProps) {
  return (
    <>
      <Head>
        <title>{salonNom} — Dashboard Katch</title>
      </Head>

      <DashboardLayout title={salonNom}>
        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Créneaux disponibles"
            value={totalCreneaux}
            accent
            icon={Clock01Icon}
          />
          <StatCard
            label="Prestations référencées"
            value={totalPrestations}
            icon={SaleTag02Icon}
          />
          <div className="flex flex-col justify-between rounded-2xl border border-white/6 bg-katch-surface-2 p-5">
            <p className="font-mono text-xs text-katch-muted">Profil Planity</p>
            {planityUrl ? (
              <a
                href={planityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 font-mono text-sm text-katch-lime underline underline-offset-2 hover:no-underline"
              >
                <HugeiconsIcon icon={LinkSquare01Icon} size={14} strokeWidth={1.75} />
                Voir sur Planity
              </a>
            ) : (
              <Link
                href="/dashboard/settings"
                className="mt-2 font-mono text-sm text-katch-muted underline hover:text-katch-text"
              >
                Ajouter l&apos;URL →
              </Link>
            )}
          </div>
        </div>

        {/* ── Créneaux à venir ────────────────────────────────── */}
        <section className="mt-8 rounded-2xl border border-white/6 bg-katch-surface">
          <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
            <h2 className="font-display text-sm uppercase tracking-wider text-katch-text">
              Prochains créneaux
            </h2>
            <Link
              href="/dashboard/prestations"
              className="flex items-center gap-1.5 font-mono text-xs text-katch-muted transition-colors hover:text-katch-text"
            >
              Gérer les prestations →
            </Link>
          </div>

          {upcomingSlots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-mono text-sm text-katch-muted">
                Aucun créneau disponible pour l&apos;instant.
              </p>
              <p className="mt-1 font-mono text-xs text-katch-muted/60">
                Le scraper ajoutera les créneaux dès qu&apos;ils apparaissent sur Planity.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/4">
              {upcomingSlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-mono text-sm text-katch-text">
                      {slot.prestation?.nom ?? "Créneau libre"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-katch-muted">
                      {formatDate(slot.dateHeure)}
                    </p>
                  </div>
                  {slot.prestation && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-katch-lime/10 px-2.5 py-1 font-mono text-xs text-katch-lime">
                        {slot.prestation.prix} €
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Raccourcis ──────────────────────────────────────── */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/prestations"
            className="flex items-center gap-3 rounded-2xl border border-katch-lime/20 bg-katch-lime/8 p-5 transition-colors hover:bg-katch-lime/12"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-katch-lime/20">
              <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} className="text-katch-lime" />
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-tight text-katch-text">
                Ajouter une prestation
              </p>
              <p className="font-mono text-xs text-katch-muted">
                Noms exacts depuis Planity
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-2xl border border-white/6 bg-katch-surface-2 p-5 transition-colors hover:bg-white/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8">
              <HugeiconsIcon icon={LinkSquare01Icon} size={18} strokeWidth={1.75} className="text-katch-muted" />
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-tight text-katch-text">
                Lien Planity
              </p>
              <p className="font-mono text-xs text-katch-muted">
                Requis pour le scraper
              </p>
            </div>
          </Link>
        </div>
      </DashboardLayout>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent?: boolean;
  icon: HugeIcon;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-5 ${
        accent
          ? "border-katch-lime/20 bg-katch-lime/8"
          : "border-white/6 bg-katch-surface-2"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-katch-lime/20" : "bg-white/6"
        }`}
      >
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.75}
          className={accent ? "text-katch-lime" : "text-katch-muted"}
        />
      </div>
      <div>
        <p className="font-display text-3xl text-katch-text">{value}</p>
        <p className="font-mono text-xs text-katch-muted">{label}</p>
      </div>
    </div>
  );
}
