import type { FirstAidProvider } from "../../types/data";

export interface FirstAidProviderFilters {
  city_id?: string;
}

/*
 * filterFirstAidProviders — упрощённая версия filterSchools (T-053) для
 * T-070: без рейтинга (нет данных для этого), без gearbox/language (не
 * применимо к курсам первой помощи) — только город, сортировка по имени
 * (нет rank_score, нечего кроме имени использовать честно).
 */
export function filterFirstAidProviders(
  providers: FirstAidProvider[],
  filters: FirstAidProviderFilters,
): FirstAidProvider[] {
  const filtered = filters.city_id
    ? providers.filter((p) => p.city_id === filters.city_id)
    : providers;
  return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
}
