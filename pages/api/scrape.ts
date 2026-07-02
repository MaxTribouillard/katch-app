/**
 * POST /api/scrape
 *
 * Endpoint appelé par le scraper externe pour synchroniser les créneaux d'un salon.
 * Protégé par un Bearer token (variable d'environnement SCRAPER_SECRET).
 *
 * Body :
 * {
 *   "planityUrl": "https://www.planity.com/...",
 *   "scrapedSlots": [
 *     { "time": "2026-07-02T10:30:00.000Z", "discount": 35 },
 *     ...
 *   ]
 * }
 *
 * La réduction appliquée est celle configurée par l'admin (AppSettings) :
 *   - Créneau du jour même → reductionSameDay
 *   - Créneau du lendemain → reductionNextDay
 *   - Au-delà → discount du scraper (ou 25% par défaut)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// ── Constantes métier ───────────────────────────────────────────────────────
const HORIZON_HOURS  = 36;  // Fenêtre de visibilité : 36h max
const MAX_SLOTS      = 3;   // Maximum de "bons plans" affichés par salon
const DEFAULT_REDUCTION = 25; // Fallback si AppSettings absent

// ── Utilitaires ────────────────────────────────────────────────────────────

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function resolveReduction(
  dateHeure: Date,
  sameDayRate: number,
  nextDayRate: number,
  scraperDiscount: number
): number {
  const now       = new Date();
  const todayMs   = dayStart(now);
  const slotMs    = dayStart(dateHeure);
  const msPerDay  = 86_400_000;

  if (slotMs === todayMs)              return sameDayRate; // jour même
  if (slotMs === todayMs + msPerDay)  return nextDayRate;  // lendemain
  return Math.max(10, Math.min(99, scraperDiscount || DEFAULT_REDUCTION)); // au-delà
}

// ── Types ──────────────────────────────────────────────────────────────────

interface ScrapedSlot {
  time:     string;
  discount: number;
}

interface ScrapeBody {
  planityUrl:   string;
  scrapedSlots: ScrapedSlot[];
}

interface ScrapeResponse {
  success:      boolean;
  salon?:       string;
  received?:    number;
  afterFilter?: number;
  upserted?:    number;
  deletedPast?: number;
  error?:       string;
}

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScrapeResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  // ── Authentification Bearer ─────────────────────────────────────────
  const secret = process.env.SCRAPER_SECRET;
  if (secret) {
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ success: false, error: "Invalid or missing Authorization header." });
    }
  }

  // ── Validation body ─────────────────────────────────────────────────
  const { planityUrl, scrapedSlots } = req.body as Partial<ScrapeBody>;

  if (!planityUrl || typeof planityUrl !== "string") {
    return res.status(400).json({ success: false, error: "planityUrl (string) requis." });
  }
  if (!Array.isArray(scrapedSlots)) {
    return res.status(400).json({ success: false, error: "scrapedSlots (array) requis." });
  }

  // ── 1. Trouver le salon ─────────────────────────────────────────────
  const salon = await prisma.salon.findUnique({
    where:  { planityUrl },
    select: { id: true, nom: true },
  });

  if (!salon) {
    return res.status(404).json({
      success: false,
      error: `Aucun salon trouvé pour planityUrl: "${planityUrl}". Configurez l'URL dans le dashboard salon.`,
    });
  }

  // ── 2. Lire les paramètres de réduction (admin) ─────────────────────
  const appSettings = await prisma.appSettings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: { id: "singleton", reductionSameDay: 50, reductionNextDay: 35 },
  });

  const now = new Date();

  // ── 3. Supprimer les créneaux passés ────────────────────────────────
  const { count: deletedPast } = await prisma.creneau.deleteMany({
    where: { salonId: salon.id, dateHeure: { lt: now } },
  });

  // ── 4. Filtrer les slots (logique métier Katch) ──────────────────────
  //   • Uniquement les 36 prochaines heures
  //   • Triés chronologiquement
  //   • Maximum 3 créneaux (les plus urgents)
  const horizon = new Date(now.getTime() + HORIZON_HOURS * 3_600_000);

  const filteredSlots = scrapedSlots
    .filter((slot) => {
      if (!slot?.time || typeof slot.time !== "string") return false;
      const d = new Date(slot.time);
      return !isNaN(d.getTime()) && d > now && d <= horizon;
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, MAX_SLOTS);

  // ── 5. Upsert avec réduction calculée selon la tranche ──────────────
  //   Clé unique : (salonId, dateHeure) — définie par @@unique dans le schéma
  let upserted = 0;

  for (const slot of filteredSlots) {
    const dateHeure = new Date(slot.time);
    const reduction = resolveReduction(
      dateHeure,
      appSettings.reductionSameDay,
      appSettings.reductionNextDay,
      slot.discount
    );

    await prisma.creneau.upsert({
      where:  { salonId_dateHeure: { salonId: salon.id, dateHeure } },
      update: { reduction, disponible: true },
      create: { salonId: salon.id, dateHeure, reduction, disponible: true },
    });

    upserted++;
  }

  return res.status(200).json({
    success:     true,
    salon:       salon.nom,
    received:    scrapedSlots.length,
    afterFilter: filteredSlots.length,
    upserted,
    deletedPast,
  });
}
