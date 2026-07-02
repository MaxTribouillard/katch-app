/**
 * Géocodage d'adresse via Nominatim (OpenStreetMap) — gratuit, sans API key.
 * Respecte les conditions d'usage Nominatim : 1 requête/seconde max, User-Agent requis.
 * https://nominatim.org/release-docs/develop/api/Search/
 */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Convertit une adresse textuelle en coordonnées GPS.
 * Retourne null si l'adresse est introuvable ou si la requête échoue.
 */
export async function geocodeAddress(
  adresse: string
): Promise<{ lat: number; lng: number } | null> {
  if (!adresse.trim()) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q",      adresse);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit",  "1");
  url.searchParams.set("countrycodes", "fr"); // Restreindre à la France

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim exige un User-Agent identifiable (politique d'usage)
        "User-Agent": "Katch-SaaS/1.0 (contact@katch.fr)",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as NominatimResult[];
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    // Silently fail — les coordonnées resteront null
    return null;
  }
}
