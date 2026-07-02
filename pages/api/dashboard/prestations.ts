import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user.role !== "SALON" && session.user.role !== "ADMIN")) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  const salonId = session.user.salonId;
  if (!salonId) {
    return res.status(403).json({ error: "Aucun salon associé à ce compte." });
  }

  // ── POST — Créer une prestation ─────────────────────────────────────────
  if (req.method === "POST") {
    const { nom, prix, duree } = req.body;

    if (!nom || prix == null || duree == null) {
      return res.status(400).json({ error: "Champs manquants (nom, prix, duree)." });
    }

    if (typeof prix !== "number" || typeof duree !== "number") {
      return res.status(400).json({ error: "prix et duree doivent être des nombres." });
    }

    const prestation = await prisma.prestation.create({
      data: { salonId, nom, prix, duree },
    });

    return res.status(201).json(prestation);
  }

  // ── DELETE — Supprimer une prestation ──────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id manquant." });

    // Vérifier que la prestation appartient bien au salon du gérant
    const prestation = await prisma.prestation.findUnique({ where: { id } });
    if (!prestation || prestation.salonId !== salonId) {
      return res.status(403).json({ error: "Prestation introuvable ou non autorisée." });
    }

    await prisma.prestation.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Méthode non supportée." });
}
