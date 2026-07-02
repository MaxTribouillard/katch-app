import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Méthode non supportée." });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user.role !== "SALON" && session.user.role !== "ADMIN")) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  const salonId = session.user.salonId;
  if (!salonId) {
    return res.status(403).json({ error: "Aucun salon associé." });
  }

  const { nom, nomGerant, tel, mail, adresse, planityUrl } = req.body;

  if (!nom || !nomGerant || !tel || !mail) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: {
      nom,
      nomGerant,
      tel,
      mail,
      adresse: adresse || null,
      planityUrl: planityUrl || null,
    },
  });

  return res.status(200).json(salon);
}
