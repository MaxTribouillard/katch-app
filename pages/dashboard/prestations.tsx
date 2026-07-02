import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, PlusSignIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";

interface PrestationItem {
  id: string;
  nom: string;
  prix: number;
  duree: number;
}

interface PrestationsPageProps {
  salonId: string;
  salonNom: string;
  prestations: PrestationItem[];
}

export const getServerSideProps: GetServerSideProps<PrestationsPageProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session || (session.user.role !== "SALON" && session.user.role !== "ADMIN")) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const salonId = session.user.salonId;
  if (!salonId) return { redirect: { destination: "/dashboard", permanent: false } };

  const [salon, prestations] = await Promise.all([
    prisma.salon.findUnique({ where: { id: salonId }, select: { nom: true } }),
    prisma.prestation.findMany({
      where: { salonId },
      orderBy: { nom: "asc" },
    }),
  ]);

  return {
    props: {
      salonId,
      salonNom: salon?.nom ?? "",
      prestations: prestations.map((p) => ({
        id: p.id,
        nom: p.nom,
        prix: p.prix,
        duree: p.duree,
      })),
    },
  };
};

export default function PrestationsPage({
  salonId,
  prestations: initialPrestations,
}: PrestationsPageProps) {
  const [prestations, setPrestations] = useState<PrestationItem[]>(initialPrestations);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [duree, setDuree] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nom || !prix || !duree) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/dashboard/prestations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salonId, nom, prix: parseFloat(prix), duree: parseInt(duree) }),
    });

    setAdding(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Erreur lors de l'ajout.");
      return;
    }

    const created = await res.json();
    setPrestations((p) => [...p, created].sort((a, b) => a.nom.localeCompare(b.nom)));
    setNom("");
    setPrix("");
    setDuree("");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch("/api/dashboard/prestations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPrestations((p) => p.filter((x) => x.id !== id));
    setDeletingId(null);
  }

  return (
    <>
      <Head>
        <title>Prestations — Dashboard Katch</title>
      </Head>

      <DashboardLayout title="Prestations Planity">
        {/* Note explicative */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-katch-lime/20 bg-katch-lime/8 px-4 py-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={16}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0 text-katch-lime"
          />
          <p className="font-mono text-xs leading-relaxed text-katch-lime/80">
            Renseignez ici les noms <strong>exacts</strong> de vos prestations tels qu&apos;ils
            apparaissent sur Planity. Le scraper utilise ces noms pour associer correctement les
            créneaux bradés.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Formulaire ajout ──────────────────────────── */}
          <section className="rounded-2xl border border-white/6 bg-katch-surface p-6">
            <h2 className="mb-4 font-display text-sm uppercase tracking-wider text-katch-text">
              Ajouter une prestation
            </h2>

            {error && (
              <div className="mb-4 rounded-xl border border-katch-red/20 bg-katch-red/10 px-3 py-2.5 font-mono text-xs text-katch-red">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-katch-muted">
                  Nom exact (tel que sur Planity) *
                </label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Coupe Homme"
                  required
                  className="rounded-xl border border-white/8 bg-katch-bg px-3 py-2.5 font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:border-katch-purple/50 focus:outline-none focus:ring-1 focus:ring-katch-purple/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-katch-muted">
                    Prix Planity (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    placeholder="25"
                    required
                    className="rounded-xl border border-white/8 bg-katch-bg px-3 py-2.5 font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:border-katch-purple/50 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-katch-muted">
                    Durée (min) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    placeholder="30"
                    required
                    className="rounded-xl border border-white/8 bg-katch-bg px-3 py-2.5 font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:border-katch-purple/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="flex items-center justify-center gap-2 rounded-xl bg-katch-purple py-2.5 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {adding ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2} />
                )}
                Ajouter
              </button>
            </form>
          </section>

          {/* ── Liste prestations ────────────────────────── */}
          <section className="rounded-2xl border border-white/6 bg-katch-surface">
            <div className="border-b border-white/6 px-6 py-4">
              <h2 className="font-display text-sm uppercase tracking-wider text-katch-text">
                Prestations référencées
                <span className="ml-2 rounded-lg bg-katch-purple/15 px-2 py-0.5 font-mono text-xs text-katch-purple">
                  {prestations.length}
                </span>
              </h2>
            </div>

            {prestations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-mono text-sm text-katch-muted">
                  Aucune prestation encore.
                </p>
                <p className="mt-1 font-mono text-xs text-katch-muted/60">
                  Ajoutez-en une depuis le formulaire.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/4">
                {prestations.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-6 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm text-katch-text">{p.nom}</p>
                      <p className="font-mono text-xs text-katch-muted">
                        {p.prix} € · {p.duree} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="shrink-0 rounded-lg p-1.5 text-katch-muted transition-colors hover:bg-katch-red/10 hover:text-katch-red disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === p.id ? (
                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-katch-muted border-t-transparent" />
                      ) : (
                        <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={1.75} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
