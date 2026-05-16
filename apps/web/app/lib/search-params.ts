export type SearchFormState = {
  keyword: string;
  cuisine: string;
  area: string;
  budgetMin: string;
  budgetMax: string;
  language: string;
  cleanlinessLevel: string;
  hasAirConditioner: boolean;
  isJapaneseFriendly: boolean;
};

export const INITIAL_SEARCH_FORM: SearchFormState = {
  keyword: "",
  cuisine: "",
  area: "",
  budgetMin: "",
  budgetMax: "",
  language: "",
  cleanlinessLevel: "",
  hasAirConditioner: false,
  isJapaneseFriendly: false,
};

export type GeoSearchParams = {
  lat?: string;
  long?: string;
  radiusKm?: string;
  ratingMin?: string;
};

function appendQuery(query: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) {
    query.set(key, trimmed);
  }
}

export function buildRestaurantSearchParams(
  form: SearchFormState,
  geo?: GeoSearchParams,
): URLSearchParams {
  const query = new URLSearchParams();
  appendQuery(query, "keyword", form.keyword);
  appendQuery(query, "cuisine", form.cuisine);
  appendQuery(query, "area", form.area);
  appendQuery(query, "budgetMin", form.budgetMin);
  appendQuery(query, "budgetMax", form.budgetMax);
  appendQuery(query, "language", form.language);
  appendQuery(query, "cleanlinessLevel", form.cleanlinessLevel);
  if (form.hasAirConditioner) {
    query.set("hasAirConditioner", "true");
  }
  if (form.isJapaneseFriendly) {
    query.set("isJapaneseFriendly", "true");
  }
  if (geo?.lat) {
    query.set("lat", geo.lat);
  }
  if (geo?.long) {
    query.set("long", geo.long);
  }
  if (geo?.radiusKm) {
    query.set("radiusKm", geo.radiusKm);
  }
  if (geo?.ratingMin) {
    query.set("ratingMin", geo.ratingMin);
  }
  return query;
}

export function searchFormFromQuery(
  searchParams: URLSearchParams,
): SearchFormState {
  return {
    keyword: searchParams.get("keyword") ?? "",
    cuisine: searchParams.get("cuisine") ?? "",
    area: searchParams.get("area") ?? "",
    budgetMin: searchParams.get("budgetMin") ?? "",
    budgetMax: searchParams.get("budgetMax") ?? "",
    language: searchParams.get("language") ?? "",
    cleanlinessLevel: searchParams.get("cleanlinessLevel") ?? "",
    hasAirConditioner: searchParams.get("hasAirConditioner") === "true",
    isJapaneseFriendly: searchParams.get("isJapaneseFriendly") === "true",
  };
}
