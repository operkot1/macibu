import type { TrafficSign } from "../../types/data";

export interface TrafficSignFilters {
  query?: string;
}

/*
 * filterSigns — поиск по номеру знака или ключевому слову в его
 * названии/значении (T-109, первый срез). Не фильтр по category — в этом
 * срезе заполнена только одна категория ("priority"), фильтр по ней был
 * бы бессмысленным UI до появления следующих срезов. Сортировка всегда по
 * номеру знака — справочник читается по порядку, не по алфавиту (в
 * отличие от filterByCity, где нет естественного порядка кроме имени).
 */
export function filterSigns(
  signs: TrafficSign[],
  filters: TrafficSignFilters,
  currentLocale: "lv" | "ru",
): TrafficSign[] {
  const query = filters.query?.trim().toLowerCase();

  const filtered = query
    ? signs.filter((sign) => {
        const haystack = [
          sign.number,
          currentLocale === "lv" ? sign.name_lv : sign.name_ru,
          currentLocale === "lv" ? sign.meaning_lv : sign.meaning_ru,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : signs;

  return [...filtered].sort((a, b) => Number(a.number) - Number(b.number));
}
