import type { School, RatingEntry } from "../../types/data";

export interface CatalogFilterInput {
  city_id?: string;
  gearbox?: "manual" | "automatic";
  language?: "lv" | "ru" | "en";
  category?: string;
  sort: "rating" | "price-asc" | "name";
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilterInput = {
  sort: "rating",
};

function matches(school: School, filters: CatalogFilterInput): boolean {
  if (filters.city_id && school.city_id !== filters.city_id) return false;
  if (filters.gearbox && !school.gearbox.includes(filters.gearbox))
    return false;
  if (filters.language && !school.languages.includes(filters.language))
    return false;
  if (filters.category && !school.categories.includes(filters.category))
    return false;
  return true;
}

function rankScoreFor(school: School, ratings: RatingEntry[]): number | null {
  const entry = ratings.find(
    (r) => r.subject_type === "school" && r.subject_id === school.id,
  );
  return entry ? entry.rank_score : null;
}

/*
 * Чистая фильтрация + сортировка (docs/06-tools/katalog-shkol.md, §«Формула»).
 * "rating" — school без записи в ratings уходит в конец, не наверх и не
 * наравне с топ-позициями; "price-asc" — partner_price_eur: null тоже в
 * конец, не приравнивается к 0. Оба случая используют имя как стабильный
 * тай-брейк — в контракте порядок внутри «нет данных» не оговорён явно.
 */
export function filterSchools(
  schools: School[],
  ratings: RatingEntry[],
  filters: CatalogFilterInput,
): School[] {
  const filtered = schools.filter((school) => matches(school, filters));

  if (filters.sort === "name") {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (filters.sort === "price-asc") {
    return [...filtered].sort((a, b) => {
      const priceA = a.partner_price_eur;
      const priceB = b.partner_price_eur;
      if (priceA === null && priceB === null)
        return a.name.localeCompare(b.name);
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceA - priceB;
    });
  }

  return [...filtered].sort((a, b) => {
    const scoreA = rankScoreFor(a, ratings);
    const scoreB = rankScoreFor(b, ratings);
    if (scoreA === null && scoreB === null) return a.name.localeCompare(b.name);
    if (scoreA === null) return 1;
    if (scoreB === null) return -1;
    return scoreB - scoreA;
  });
}

/*
 * Только реальные фильтры (city/gearbox/language/category) меняют состав
 * выдачи и попадают под правило noindex докса — sort лишь переупорядочивает
 * тот же набор школ, это не «другой» контент.
 */
export function isNonDefaultFilter(filters: CatalogFilterInput): boolean {
  return (
    filters.city_id !== undefined ||
    filters.gearbox !== undefined ||
    filters.language !== undefined ||
    filters.category !== undefined
  );
}
