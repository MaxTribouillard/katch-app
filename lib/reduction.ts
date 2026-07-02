/**
 * Calcule le pourcentage de réduction à afficher pour un créneau.
 *
 * Source de vérité : AppSettings (configuré par l'admin).
 * Le champ Creneau.reduction stocké en DB peut être obsolète si les
 * paramètres ont changé depuis le dernier scraping — on recalcule ici.
 *
 * Règles :
 *   • Créneau du jour même  → reductionSameDay
 *   • Créneau du lendemain  → reductionNextDay
 *   • Au-delà               → dbReduction (valeur stockée par le scraper)
 */

interface AppSettingsLike {
  reductionSameDay: number;
  reductionNextDay: number;
}

export function computeDisplayReduction(
  dateHeure: Date,
  settings: AppSettingsLike,
  dbReduction: number
): number {
  const now      = new Date();
  const msPerDay = 86_400_000;

  const todayStart = new Date(
    now.getFullYear(), now.getMonth(), now.getDate()
  ).getTime();

  const slotStart = new Date(
    dateHeure.getFullYear(), dateHeure.getMonth(), dateHeure.getDate()
  ).getTime();

  if (slotStart === todayStart)             return settings.reductionSameDay;
  if (slotStart === todayStart + msPerDay)  return settings.reductionNextDay;
  return dbReduction; // créneau dans 2+ jours : on garde la valeur scraper
}
