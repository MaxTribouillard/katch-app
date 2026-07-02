import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "../generated/prisma/client";

// ── Options NextAuth partagées (API route + proxy) ─────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            nom: true,
            role: true,
            passwordHash: true,
            salonId: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          role: user.role,
          salonId: user.salonId,
        };
      },
    }),
  ],

  callbacks: {
    // Persistance role + salonId dans le JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: Role }).role;
        token.salonId =
          (user as unknown as { salonId: string | null }).salonId ?? null;
        token.id = user.id;
      }
      return token;
    },
    // Exposition role + salonId dans la session côté client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.salonId = token.salonId as string | null;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
