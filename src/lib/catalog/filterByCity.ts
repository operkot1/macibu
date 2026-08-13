export interface CityListing {
  city_id: string;
  name: string;
}

/*
 * filterByCity — общая формула фильтрации/сортировки для лёгких
 * каталогов "имя + город + контакты" без рейтинга (T-070
 * FirstAidProvider, T-072 MedicalCheckLocation — второй похожий
 * потребитель, поэтому вынесено сюда, а не продублировано в третий раз;
 * shared-module extraction discipline, CLAUDE.md). Только город,
 * сортировка по имени — нет rank_score, нечего кроме имени использовать
 * честно.
 */
export function filterByCity<T extends CityListing>(
  items: T[],
  cityId: string | undefined,
): T[] {
  const filtered = cityId
    ? items.filter((item) => item.city_id === cityId)
    : items;
  return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
}
