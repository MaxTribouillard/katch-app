import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface SettingsProps {
  salonId: string;
  initialData: {
    nom: string;
    nomGerant: string;
    tel: string;
    mail: string;
    adresse: string;
    planityUrl: string;
  };
}

export const getServerSideProps: GetServerSideProps<SettingsProps> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session || (session.user.role !== "SALON" && session.user.role !== "ADMIN")) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const salonId = session.user.salonId;
  if (!salonId) return { redirect: { destination: "/dashboard", permanent: false } };

  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) return { redirect: { destination: "/dashboard", permanent: false } };

  return {
    props: {
      salonId,
      initialData: {
        nom: salon.nom,
        nomGerant: salon.nomGerant,
        tel: salon.tel,
        mail: salon.mail,
        adresse: salon.adresse ?? "",
        planityUrl: salon.planityUrl ?? "",
      },
    },
  };
};

export default function SettingsPage({ salonId, initialData }: SettingsProps) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/dashboard/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salonId, ...form }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Erreur lors de la sauvegarde.");
    } else {
      setSaved(true);
    }
  }

  return (
    <>
      <Head>
        <title>Paramètres — Dashboard Katch</title>
      </Head>

      <DashboardLayout title="Paramètres du salon">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-4 rounded-xl border border-katch-red/20 bg-katch-red/10 px-4 py-3 font-mono text-xs text-katch-red">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-katch-lime/20 bg-katch-lime/10 px-4 py-3 font-mono text-xs text-katch-lime">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={1.75} />
              Modifications sauvegardées.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ── Infos salon ─────────────────────────────── */}
            <section className="rounded-2xl border border-white/6 bg-katch-surface p-6">
              <h2 className="mb-4 font-display text-sm uppercase tracking-wider text-katch-text">
                Informations salon
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du salon" value={form.nom} onChange={(v) => update("nom", v)} />
                <Field label="Nom du gérant" value={form.nomGerant} onChange={(v) => update("nomGerant", v)} />
                <Field label="Téléphone" value={form.tel} onChange={(v) => update("tel", v)} />
                <Field label="Email" type="email" value={form.mail} onChange={(v) => update("mail", v)} />
                <div className="sm:col-span-2">
                  <Field label="Adresse" value={form.adresse} onChange={(v) => update("adresse", v)} />
                </div>
              </div>
            </section>

            {/* ── Lien Planity ────────────────────────────── */}
            <section className="rounded-2xl border border-white/6 bg-katch-surface p-6">
              <h2 className="mb-1 font-display text-sm uppercase tracking-wider text-katch-text">
                URL Planity
              </h2>
              <p className="mb-4 font-mono text-xs text-katch-muted">
                L&apos;URL de votre page salon sur Planity. Indispensable pour le scraper de créneaux.
              </p>
              <Field
                label="Lien Planity"
                type="url"
                value={form.planityUrl}
                onChange={(v) => update("planityUrl", v)}
                placeholder="https://www.planity.com/votre-salon"
              />
            </section>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-katch-purple py-3 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sauvegarder"
              )}
            </button>
          </form>
        </div>
      </DashboardLayout>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs text-katch-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-white/8 bg-katch-bg px-3 py-2.5 font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:border-katch-purple/50 focus:outline-none focus:ring-1 focus:ring-katch-purple/20"
      />
    </div>
  );
}
