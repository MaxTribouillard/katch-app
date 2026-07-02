import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  SaleTag02Icon,
  Settings01Icon,
  Logout01Icon,
  Scissor01Icon,
} from "@hugeicons/core-free-icons";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: DashboardSquare01Icon },
  { href: "/dashboard/prestations", label: "Prestations", icon: SaleTag02Icon },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings01Icon },
];

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-[#0E0E0E] text-katch-text">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/6 bg-katch-surface">
        {/* Logo + nom salon */}
        <div className="flex items-center gap-2.5 border-b border-white/6 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-katch-lime/15">
            <HugeiconsIcon
              icon={Scissor01Icon}
              size={16}
              strokeWidth={1.75}
              className="text-katch-lime"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm uppercase tracking-widest text-katch-text">
              Katch
            </p>
            <p className="font-mono text-[10px] text-katch-muted">Salon</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon }) => {
              const isActive =
                href === "/dashboard"
                  ? router.pathname === "/dashboard"
                  : router.pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-mono text-xs transition-colors ${
                      isActive
                        ? "bg-katch-lime/15 text-katch-lime"
                        : "text-katch-muted hover:bg-white/5 hover:text-katch-text"
                    }`}
                  >
                    <HugeiconsIcon icon={icon} size={15} strokeWidth={1.75} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profil */}
        <div className="border-t border-white/6 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-katch-lime/20 font-display text-xs font-bold text-katch-lime">
              {session?.user.name?.[0]?.toUpperCase() ?? "S"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-xs font-bold text-katch-text">
                {session?.user.name ?? "Gérant"}
              </p>
              <p className="truncate font-mono text-[10px] text-katch-muted">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-katch-muted transition-colors hover:bg-white/5 hover:text-katch-text"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ─────────────────────────────────────────── */}
      <main className="flex min-h-screen flex-1 flex-col overflow-auto">
        {title && (
          <header className="border-b border-white/6 px-8 py-5">
            <h1 className="font-display text-xl uppercase tracking-tight text-katch-text">
              {title}
            </h1>
          </header>
        )}
        <div className="flex-1 px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
