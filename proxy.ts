// Next.js 16 : proxy.ts remplace middleware.ts
// Protège /admin (ADMIN seulement) et /dashboard (SALON + ADMIN)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    if (
      pathname.startsWith("/dashboard") &&
      role !== "SALON" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Retourne false si pas de token → redirect /login automatique
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};
