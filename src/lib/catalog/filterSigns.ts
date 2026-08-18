import type { TrafficSign } from "../../types/data";

export interface TrafficSignFilters {
  query?: string;
  category?: TrafficSign["category"];
}

/*
 * filterSigns — поиск по номеру знака/ключевому слову + фильтр по
 * категории (T-109). Фильтр по category добавлен во втором срезе
 * (mandatory, T-109) — в первом срезе (только priority) он был бы
 * бессмысленным UI при единственной категории, теперь при двух и более
 * категориях помогает сузить список. Сортировка всегда по номеру знака —
 * справочник читается по порядку, не по алфавиту (в отличие от
 * filterByCity, где нет естественного порядка кроме имени).
 */
export function filterSigns(
  signs: TrafficSign[],
  filters: TrafficSignFilters,
  currentLocale: "lv" | "ru",
): TrafficSign[] {
  const query = filters.query?.trim().toLowerCase();

  const byCategory = filters.category
    ? signs.filter((sign) => sign.category === filters.category)
    : signs;

  const filtered = query
    ? byCategory.filter((sign) => {
        const haystack = [
          sign.number,
          currentLocale === "lv" ? sign.name_lv : sign.name_ru,
          currentLocale === "lv" ? sign.meaning_lv : sign.meaning_ru,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : byCategory;

  return [...filtered].sort((a, b) => Number(a.number) - Number(b.number));
}
