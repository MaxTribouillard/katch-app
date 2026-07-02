import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, LockPasswordIcon, Scissor01Icon } from "@hugeicons/core-free-icons";

// Redirige les utilisateurs déjà connectés
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) return { props: {} };

  const role = session.user.role;
  if (role === "ADMIN") return { redirect: { destination: "/admin", permanent: false } };
  if (role === "SALON") return { redirect: { destination: "/dashboard", permanent: false } };
  return { redirect: { destination: "/", permanent: false } };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    router.query.error === "unauthorized" ? "Accès non autorisé." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res?.ok || res.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Récupère la session pour rediriger selon le rôle
    const session = await getSession();
    if (session?.user.role === "ADMIN") router.replace("/admin");
    else if (session?.user.role === "SALON") router.replace("/dashboard");
    else router.replace("/");
  }

  return (
    <>
      <Head>
        <title>Connexion — Katch</title>
      </Head>

      <div className="flex min-h-screen flex-col items-center justify-center bg-katch-bg px-4">
        {/* Halo rouge */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(239,68,68,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-katch-purple/10 ring-1 ring-katch-purple/20">
              <HugeiconsIcon icon={Scissor01Icon} size={22} strokeWidth={1.75} className="text-katch-purple" />
            </div>
            <div className="text-center">
              <p className="font-display text-2xl uppercase tracking-widest text-katch-text">
                Katch
              </p>
              <p className="mt-0.5 font-mono text-xs text-katch-muted">
                Accès espace professionnel
              </p>
            </div>
          </div>

          {/* Carte de connexion */}
          <div className="rounded-2xl border border-white/8 bg-katch-surface p-8 shadow-2xl">
            <h1 className="mb-6 font-display text-lg uppercase tracking-tight text-katch-text">
              Connexion
            </h1>

            {error && (
              <div className="mb-4 rounded-xl border border-katch-red/20 bg-katch-red/10 px-4 py-3 font-mono text-xs text-katch-red">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-katch-muted">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-katch-bg px-3 py-3 focus-within:border-katch-purple/50 focus-within:ring-1 focus-within:ring-katch-purple/20">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={14}
                    strokeWidth={1.75}
                    className="shrink-0 text-katch-muted"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@katch.fr"
                    required
                    autoComplete="email"
                    className="flex-1 bg-transparent font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-katch-muted">
                  Mot de passe
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-katch-bg px-3 py-3 focus-within:border-katch-purple/50 focus-within:ring-1 focus-within:ring-katch-purple/20">
                  <HugeiconsIcon
                    icon={LockPasswordIcon}
                    size={14}
                    strokeWidth={1.75}
                    className="shrink-0 text-katch-muted"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="flex-1 bg-transparent font-mono text-sm text-katch-text placeholder:text-katch-muted/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-katch-purple py-3 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center font-mono text-xs text-katch-muted">
            Accès réservé aux administrateurs et partenaires salons.
          </p>
        </div>
      </div>
    </>
  );
}
