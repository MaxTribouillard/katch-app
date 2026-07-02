export interface CreneauSlot {
  id: string
  dateHeure: string // ISO 8601 — sérialisé depuis Date pour Next.js props
  reduction: number  // Pourcentage de réduction fourni par le scraper (ex: 35)
  salonId: string
  salonNom: string
  prestation: {
    nom: string
    prix: number // Prix Planity d'origine
    duree: number // Minutes
  } | null
}
