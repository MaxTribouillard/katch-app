import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

interface FormState {
  nom: string;
  nomGerant: string;
  tel: string;
  mail: string;
  adresse: string;
  planityUrl: string;
  // Compte gérant
  gerantEmail: string;
  gerantPassword: string;
  createAccount: boolean;
}

export default function NewSalonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nom: "",
    nomGerant: "",
    tel: "",
    mail: "",
    adresse: "",
    planityUrl: "",
    gerantEmail: "",
    gerantPassword: "",
    createAccount: true,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/salons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin");
  }

  return (
    <>
      <Head>
        <title>Nouveau salon — Admin Katch</title>
      </Head>

      <AdminLayout title="Nouveau salon">
        <div className="mx-auto max-w-2xl">
          {/* Retour */}
          <Link
            href="/admin"
            className="mb-6 flex items-center gap-1.5 font-mono text-xs text-katch-muted transition-colors hover:text-katch-text"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={1.75} />
            Retour au dashboard
          </Link>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-xl border border-katch-red/20 bg-katch-red/10 px-4 py-3 font-mono text-xs text-katch-red">
                {error}
              </div>
            )}

            {/* ── Infos salon ─────────────────────────── */}
            <section className="rounded-2xl border border-white/6 bg-katch-surface p-6">
              <h2 className="mb-4 font-display text-sm uppercase tracking-wider text-katch-text">
                Informations salon
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nom du salon *"
                  value={form.nom}
                  onChange={(v) => update("nom", v)}
                  placeholder="Tim Barber"
                  required
                />
                <Field
                  label="Nom du gérant *"
                  value={form.nomGerant}
                  onChange={(v) => update("nomGerant", v)}
                  placeholder="Shpetim Osmani"
                  required
                />
                <Field
                  label="Téléphone *"
                  value={form.tel}
                  onChange={(v) => update("tel", v)}
                  placeholder="06 11 22 33 44"
                  required
                />
                <Field
                  label="Email *"
                  value={form.mail}
                  onChange={(v) => update("mail", v)}
                  placeholder="contact@salon.fr"
                  type="email"
                  required
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Adresse"
                    value={form.adresse}
                    onChange={(v) => update("adresse", v)}
                    placeholder="12 rue de la Paix, Paris 2e"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="URL Planity"
                    value={form.planityUrl}
                    onChange={(v) => update("planityUrl", v)}
                    placeholder="https://www.planity.com/salon/tim-barber-paris"
                    type="url"
                  />
                </div>
              </div>
            </section>

            {/* ── Compte gérant ───────────────────────── */}
            <section className="rounded-2xl border border-white/6 bg-katch-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-sm uppercase tracking-wider text-katch-text">
                  Compte gérant (dashboard salon)
                </h2>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-katch-muted">
                  <input
                    type="checkbox"
                    checked={form.createAccount}
                    onChange={(e) => update("createAccount", e.target.checked)}
                    className="accent-katch-purple"
                  />
                  Créer le compte
                </label>
              </div>

              {form.createAccount && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email de connexion *"
                    value={form.gerantEmail}
                    onChange={(v) => update("gerantEmail", v)}
                    placeholder="gerant@salon.fr"
                    type="email"
                  />
                  <Field
                    label="Mot de passe *"
                    value={form.gerantPassword}
                    onChange={(v) => update("gerantPassword", v)}
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-katch-purple py-3 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création…
                </>
              ) : (
                "Créer le salon"
              )}
            </button>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}

// ── Composant champ réutilisable ────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs text-katch-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-white/8 bg-katch-bg px-3 py-2.5 font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:border-katch-purple/50 focus:outline-none focus:ring-1 focus:ring-katch-purple/20"
      />
    </div>
  );
}
