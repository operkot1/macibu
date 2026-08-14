import type { School } from "../../types/data";

export interface MatchCriteria {
  city_id: string;
  category: string;
  gearbox: "manual" | "automatic";
  language: "lv" | "ru" | "en";
}

/*
 * matchSchools — подбор для формы записи (T-077, docs/06-tools/forma-zapisi.md).
 * В отличие от filterSchools (T-053, каталог всех школ) — фильтрует
 * ИСКЛЮЧИТЕЛЬНО is_partner: true, лид не должен уйти школе без закрытых
 * юридических пунктов (docs/09-legal-gdpr.md). Сортировка — по имени: нет
 * входных данных о рейтинге в контракте этой задачи, и, в отличие от
 * каталога/рейтингов, здесь нет визуального различия между несколькими
 * подходящими партнёрами, которое сортировка могла бы исказить.
 */
export function matchSchools(
  schools: School[],
  criteria: MatchCriteria,
): School[] {
  return schools
    .filter((school) => school.is_partner)
    .filter((school) => school.city_id === criteria.city_id)
    .filter((school) => school.gearbox.includes(criteria.gearbox))
    .filter((school) => school.languages.includes(criteria.language))
    .filter((school) => school.categories.includes(criteria.category))
    .sort((a, b) => a.name.localeCompare(b.name));
}
