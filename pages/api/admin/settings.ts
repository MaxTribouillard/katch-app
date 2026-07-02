import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── Initialise les paramètres si la ligne singleton n'existe pas encore ──────
async function getOrInitSettings() {
  return prisma.appSettings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: { id: "singleton", reductionSameDay: 50, reductionNextDay: 35 },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ error: "Non autorisé" });
  }

  // ── GET — lire les paramètres ─────────────────────────────────────────
  if (req.method === "GET") {
    const settings = await getOrInitSettings();
    return res.status(200).json(settings);
  }

  // ── PUT — mettre à jour les paramètres ────────────────────────────────
  if (req.method === "PUT") {
    const { reductionSameDay, reductionNextDay } = req.body;

    if (
      typeof reductionSameDay !== "number" ||
      typeof reductionNextDay !== "number" ||
      reductionSameDay < 0 || reductionSameDay > 99 ||
      reductionNextDay < 0 || reductionNextDay > 99
    ) {
      return res.status(400).json({
        error: "reductionSameDay et reductionNextDay doivent être des entiers entre 0 et 99.",
      });
    }

    const settings = await prisma.appSettings.upsert({
      where:  { id: "singleton" },
      update: { reductionSameDay, reductionNextDay },
      create: { id: "singleton", reductionSameDay, reductionNextDay },
    });

    return res.status(200).json(settings);
  }

  return res.status(405).json({ error: "Méthode non supportée." });
}
