import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";

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

  // ── Géocodage si l'adresse a changé ──────────────────────────────────────
  // On compare avec l'adresse actuellement en base pour éviter un appel réseau
  // inutile si le gérant ne modifie pas ce champ.
  const current = await prisma.salon.findUnique({
    where:  { id: salonId },
    select: { adresse: true },
  });

  let latitude:  number | undefined = undefined;
  let longitude: number | undefined = undefined;

  const newAdresse      = adresse?.trim() || null;
  const addressChanged  = newAdresse !== (current?.adresse ?? null);

  if (addressChanged && newAdresse) {
    const coords = await geocodeAddress(newAdresse);
    if (coords) {
      latitude  = coords.lat;
      longitude = coords.lng;
    } else {
      // Adresse introuvable — on efface les anciennes coordonnées pour ne pas
      // afficher un marker à la mauvaise position sur la carte.
      latitude  = null as unknown as number;
      longitude = null as unknown as number;
    }
  }

  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: {
      nom,
      nomGerant,
      tel,
      mail,
      adresse:    newAdresse,
      planityUrl: planityUrl?.trim() || null,
      // N'injecter lat/lng que si l'adresse a effectivement changé
      ...(addressChanged && { latitude, longitude }),
    },
  });

  return res.status(200).json(salon);
}
