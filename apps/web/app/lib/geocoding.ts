export type PlaceResult = {
  label: string;
  lat: number;
  lng: number;
};

/** Vietnam bounding box: minLon,minLat,maxLon,maxLat */
const VN_BBOX = "102.14,8.18,109.46,23.39";

const DEFAULT_PHOTON_URL = "https://photon.komoot.io/api";

function photonBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PHOTON_API_URL?.replace(/\/$/, "") ??
    DEFAULT_PHOTON_URL
  );
}

type PhotonFeature = {
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

function formatPhotonLabel(props: PhotonFeature["properties"]): string {
  if (!props) {
    return "";
  }
  const parts = [
    props.name,
    props.housenumber && props.street
      ? `${props.housenumber} ${props.street}`
      : props.street,
    props.city,
    props.state,
    props.country,
  ].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export async function searchPlaces(
  query: string,
  options?: { limit?: number },
): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const limit = options?.limit ?? 6;
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    bbox: VN_BBOX,
    lang: "vi",
  });

  const res = await fetch(`${photonBaseUrl()}/?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status})`);
  }

  const data = (await res.json()) as { features?: PhotonFeature[] };
  const results: PlaceResult[] = [];

  for (const feature of data.features ?? []) {
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) {
      continue;
    }
    const [lng, lat] = coords;
    const label = formatPhotonLabel(feature.properties);
    if (!label) {
      continue;
    }
    results.push({ label, lat, lng });
  }

  return results;
}
