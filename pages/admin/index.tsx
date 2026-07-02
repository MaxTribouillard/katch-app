import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon, UserMultiple02Icon, SaleTag02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"];

interface SalonStat {
  id: string;
  nom: string;
  creneauxCount: number;
  prestationsCount: number;
  mail: string;
  planityUrl: string | null;
}

interface AdminHomeProps {
  totalSalons: number;
  totalCreneaux: number;
  totalUsers: number;
  totalPrestations: number;
  salonStats: SalonStat[];
}

export const getServerSideProps: GetServerSideProps<AdminHomeProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const [totalSalons, totalCreneaux, totalUsers, totalPrestations, salons] =
    await Promise.all([
      prisma.salon.count(),
      prisma.creneau.count({ where: { disponible: true } }),
      prisma.user.count(),
      prisma.prestation.count(),
      prisma.salon.findMany({
        include: {
          _count: { select: { creneaux: true, prestations: true } },
        },
        orderBy: { nom: "asc" },
      }),
    ]);

  const salonStats: SalonStat[] = salons.map((s) => ({
    id: s.id,
    nom: s.nom,
    mail: s.mail,
    planityUrl: s.planityUrl,
    creneauxCount: s._count.creneaux,
    prestationsCount: s._count.prestations,
  }));

  return {
    props: { totalSalons, totalCreneaux, totalUsers, totalPrestations, salonStats },
  };
};

// ── Composants internes ─────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: HugeIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-5 ${
        accent
          ? "border-katch-purple/20 bg-katch-purple/8"
          : "border-white/6 bg-katch-surface-2"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-katch-purple/20" : "bg-white/6"
        }`}
      >
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.75}
          className={accent ? "text-katch-purple" : "text-katch-muted"}
        />
      </div>
      <div>
        <p className="font-display text-3xl text-katch-text">{value}</p>
        <p className="font-mono text-xs text-katch-muted">{label}</p>
      </div>
    </div>
  );
}

const CHART_COLORS = ["#EF4444", "#F59E0B", "#EF4444", "#F59E0B", "#EF4444"];

export default function AdminHome({
  totalSalons,
  totalCreneaux,
  totalUsers,
  totalPrestations,
  salonStats,
}: AdminHomeProps) {
  const chartData = salonStats.map((s) => ({
    name: s.nom.length > 14 ? s.nom.slice(0, 13) + "…" : s.nom,
    créneaux: s.creneauxCount,
    prestations: s.prestationsCount,
  }));

  return (
    <>
      <Head>
        <title>Dashboard Admin — Katch</title>
      </Head>

      <AdminLayout title="Vue d'ensemble">
        {/* ── Stats globales ─────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Salons partenaires" value={totalSalons} icon={Store01Icon} />
          <StatCard label="Créneaux disponibles" value={totalCreneaux} icon={SaleTag02Icon} accent />
          <StatCard label="Utilisateurs" value={totalUsers} icon={UserMultiple02Icon} />
          <StatCard label="Prestations référencées" value={totalPrestations} icon={SaleTag02Icon} />
        </div>

        {/* ── Graphique créneaux par salon ───────────────── */}
        <section className="mt-8 rounded-2xl border border-white/6 bg-katch-surface p-6">
          <h2 className="mb-5 font-display text-sm uppercase tracking-wider text-katch-text">
            Créneaux &amp; prestations par salon
          </h2>
          {salonStats.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-katch-muted">
              Aucun salon pour l&apos;instant
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#737373", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#737373", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#F5F5F4",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="créneaux" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#EF4444" fillOpacity={0.85} />
                  ))}
                </Bar>
                <Bar dataKey="prestations" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#F59E0B" fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* ── Table salons ───────────────────────────────── */}
        <section className="mt-8 rounded-2xl border border-white/6 bg-katch-surface">
          <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
            <h2 className="font-display text-sm uppercase tracking-wider text-katch-text">
              Salons partenaires
            </h2>
            <Link
              href="/admin/salons/new"
              className="flex items-center gap-1.5 rounded-xl bg-katch-purple px-4 py-2 font-mono text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2} />
              Nouveau salon
            </Link>
          </div>

          {salonStats.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-mono text-sm text-katch-muted">
                Aucun salon encore — commence par en créer un.
              </p>
              <Link
                href="/admin/salons/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-katch-purple px-5 py-2.5 font-mono text-sm font-bold text-white"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={13} strokeWidth={2} />
                Créer un salon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/4">
                    {["Nom", "Email", "Créneaux", "Prestations", "Planity"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-katch-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salonStats.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-white/4 transition-colors hover:bg-white/3 ${
                        i === salonStats.length - 1 ? "border-none" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-display text-sm uppercase tracking-tight text-katch-text">
                        {s.nom}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-katch-muted">
                        {s.mail}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-katch-purple/10 px-2 py-0.5 font-mono text-xs text-katch-purple">
                          {s.creneauxCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-katch-lime/10 px-2 py-0.5 font-mono text-xs text-katch-lime">
                          {s.prestationsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.planityUrl ? (
                          <a
                            href={s.planityUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-katch-lime underline underline-offset-2 hover:no-underline"
                          >
                            Voir →
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-katch-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AdminLayout>
    </>
  );
}
