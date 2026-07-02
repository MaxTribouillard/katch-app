/**
 * Géocodage d'adresse via l'API Adresse officielle du gouvernement français.
 * Gratuit, sans clé API, optimisé pour les adresses françaises.
 * https://adresse.data.gouv.fr/api-doc/adresse
 *
 * ⚠️  L'API renvoie les coordonnées dans l'ordre GeoJSON standard :
 *     geometry.coordinates = [longitude, latitude]  ← ordre inversé !
 */

interface GouvFeature {
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    label:       string;
    score:       number;
    city?:       string;
    postcode?:   string;
  };
}

interface GouvApiResponse {
  features: GouvFeature[];
}

/**
 * Convertit une adresse textuelle en coordonnées GPS.
 * Retourne null si l'adresse est introuvable ou si la requête échoue.
 *
 * @param adresse - Adresse complète (ex: "10 rue de la Paix, 75001 Paris")
 */
export async function geocodeAddress(
  adresse: string
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = adresse.trim();
  if (!trimmed) return null;

  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmed)}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as GouvApiResponse;

    if (!data.features?.length) return null;

    const [longitude, latitude] = data.features[0].geometry.coordinates;

    if (isNaN(latitude) || isNaN(longitude)) return null;

    return { lat: latitude, lng: longitude };
  } catch {
    return null;
  }
}
