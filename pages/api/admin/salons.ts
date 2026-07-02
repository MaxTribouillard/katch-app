import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { geocodeAddress } from "@/lib/geocode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ error: "Non autorisé" });
  }

  if (req.method === "GET") {
    const salons = await prisma.salon.findMany({
      include: { _count: { select: { creneaux: true, prestations: true } } },
      orderBy: { nom: "asc" },
    });
    return res.status(200).json(salons);
  }

  if (req.method === "POST") {
    const {
      nom, nomGerant, tel, mail, adresse, planityUrl,
      createAccount, gerantEmail, gerantPassword,
    } = req.body;

    if (!nom || !nomGerant || !tel || !mail) {
      return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    if (createAccount && (!gerantEmail || !gerantPassword)) {
      return res.status(400).json({
        error: "Email et mot de passe requis pour créer le compte gérant.",
      });
    }

    try {
      // Géocodage avant la transaction (appel réseau Nominatim)
      let latitude: number | null  = null;
      let longitude: number | null = null;

      if (adresse) {
        const coords = await geocodeAddress(adresse);
        if (coords) {
          latitude  = coords.lat;
          longitude = coords.lng;
        }
      }

      const salon = await prisma.$transaction(async (tx) => {
        // Créer le salon (avec coordonnées GPS si géocodage réussi)
        const s = await tx.salon.create({
          data: {
            nom,
            nomGerant,
            tel,
            mail,
            adresse:   adresse   || null,
            planityUrl: planityUrl || null,
            latitude,
            longitude,
          },
        });

        // Créer le compte gérant si demandé
        if (createAccount && gerantEmail && gerantPassword) {
          const hash = await bcrypt.hash(gerantPassword, 12);
          await tx.user.create({
            data: {
              email: gerantEmail,
              passwordHash: hash,
              nom: nomGerant,
              role: "SALON",
              salonId: s.id,
            },
          });
        }

        return s;
      });

      return res.status(201).json(salon);
    } catch (err: unknown) {
      if (
        typeof err === "object" && err !== null &&
        "code" in err && (err as { code: string }).code === "P2002"
      ) {
        return res.status(409).json({ error: "Cet email de connexion est déjà utilisé." });
      }
      console.error("POST /api/admin/salons", err);
      return res.status(500).json({ error: "Erreur interne." });
    }
  }

  return res.status(405).json({ error: "Méthode non supportée." });
}
