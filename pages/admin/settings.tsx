import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { SaleTag02Icon, CheckmarkCircle02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";

interface SettingsPageProps {
  initialSameDay: number;
  initialNextDay: number;
}

export const getServerSideProps: GetServerSideProps<SettingsPageProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const settings = await prisma.appSettings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: { id: "singleton", reductionSameDay: 50, reductionNextDay: 35 },
  });

  return {
    props: {
      initialSameDay: settings.reductionSameDay,
      initialNextDay: settings.reductionNextDay,
    },
  };
};

export default function AdminSettingsPage({ initialSameDay, initialNextDay }: SettingsPageProps) {
  const [sameDay, setSameDay] = useState(initialSameDay);
  const [nextDay, setNextDay] = useState(initialNextDay);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/admin/settings", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ reductionSameDay: sameDay, reductionNextDay: nextDay }),
    });

    setSaving(false);
    if (res.ok) setSaved(true);
    else setError("Erreur lors de la sauvegarde.");
  }

  // Prix exemple pour la prévisualisation
  const EXAMPLE_PRICE = 30;
  const previewSameDay = Math.round(EXAMPLE_PRICE * (1 - sameDay / 100));
  const previewNextDay = Math.round(EXAMPLE_PRICE * (1 - nextDay / 100));

  return (
    <>
      <Head>
        <title>Réductions automatiques — Admin Katch</title>
      </Head>

      <AdminLayout title="Réductions automatiques">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Info */}
          <div className="flex items-start gap-3 rounded-xl border border-katch-lime/20 bg-katch-lime/8 px-4 py-3">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-katch-lime"
            />
            <p className="font-mono text-xs leading-relaxed text-katch-lime/80">
              Ces réductions sont appliquées <strong>automatiquement</strong> par le scraper lors
              de l&apos;upsert. Les créneaux du <strong>jour même</strong> bénéficient d&apos;une
              remise plus forte pour créer l&apos;urgence.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-katch-lime/20 bg-katch-lime/10 px-4 py-3 font-mono text-xs text-katch-lime">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={1.75} />
              Paramètres sauvegardés avec succès.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-katch-red/20 bg-katch-red/10 px-4 py-3 font-mono text-xs text-katch-red">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* ── Créneau du jour même ─────────────────────── */}
            <ReductionSlider
              label="Créneaux du jour même"
              sublabel="Urgence maximale — ex: une place libre dans 2h"
              value={sameDay}
              onChange={setSameDay}
              color="katch-purple"
              examplePrice={EXAMPLE_PRICE}
              katchPrice={previewSameDay}
            />

            {/* ── Créneau du lendemain ─────────────────────── */}
            <ReductionSlider
              label="Créneaux du lendemain"
              sublabel="Promotion standard — ex: une place libre demain matin"
              value={nextDay}
              onChange={setNextDay}
              color="katch-lime"
              examplePrice={EXAMPLE_PRICE}
              katchPrice={previewNextDay}
            />

            {/* ── Bouton save ──────────────────────────────── */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-katch-purple py-3 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <HugeiconsIcon icon={SaleTag02Icon} size={14} strokeWidth={2} />
                  Sauvegarder les réductions
                </>
              )}
            </button>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}

// ── Composant slider réutilisable ───────────────────────────────────────────
function ReductionSlider({
  label,
  sublabel,
  value,
  onChange,
  color,
  examplePrice,
  katchPrice,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
  color: "katch-purple" | "katch-lime";
  examplePrice: number;
  katchPrice: number;
}) {
  const accent = color === "katch-purple" ? "text-katch-purple" : "text-katch-lime";
  const border = color === "katch-purple" ? "border-katch-purple/20" : "border-katch-lime/20";
  const bg     = color === "katch-purple" ? "bg-katch-purple/8"    : "bg-katch-lime/8";

  return (
    <section className={`rounded-2xl border ${border} ${bg} p-6`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-katch-text">
            {label}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-katch-muted">{sublabel}</p>
        </div>

        {/* Valeur en grand */}
        <div className={`shrink-0 text-right ${accent}`}>
          <p className="font-display text-4xl leading-none">-{value}%</p>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={10}
        max={70}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-current"
        style={{ accentColor: color === "katch-purple" ? "#EF4444" : "#F59E0B" }}
      />

      <div className="mt-1 flex justify-between font-mono text-[10px] text-katch-muted">
        <span>10%</span>
        <span>70%</span>
      </div>

      {/* Prévisualisation prix */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/6 bg-katch-surface/60 px-4 py-3">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-katch-muted">
            Prévisualisation
          </p>
          <p className="mt-0.5 font-mono text-xs text-katch-muted">
            Prestation à {examplePrice} € sur Planity
          </p>
        </div>
        <div className="text-right">
          <p className={`font-display text-2xl ${accent}`}>{katchPrice} €</p>
          <p className="font-mono text-xs text-katch-muted line-through">{examplePrice} €</p>
        </div>
      </div>

      {/* Input numérique direct */}
      <div className="mt-3 flex items-center gap-2">
        <label className="font-mono text-xs text-katch-muted">Valeur exacte (%)</label>
        <input
          type="number"
          min={10}
          max={70}
          step={5}
          value={value}
          onChange={(e) => {
            const v = Math.max(10, Math.min(70, Number(e.target.value)));
            onChange(v);
          }}
          className="w-20 rounded-lg border border-white/8 bg-katch-bg px-2 py-1 text-right font-mono text-sm text-katch-text focus:outline-none focus:ring-1 focus:ring-katch-purple/30"
        />
      </div>
    </section>
  );
}
