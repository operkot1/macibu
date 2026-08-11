import { getSchools } from "../data";
import { CITY_IDS } from "../cities";

export interface SitemapEntry {
  routeId: string;
  lv: string | null;
  ru: string | null;
}

/*
 * Временный явный список (T-023, docs/11-backlog.md: «скелет... пока с
 * 1-2 реальными URL»). Нет единого машиночитаемого источника
 * "route_id → путь" — docs/02-routes.md не парсится, Content Collection
 * entries не хранят путь, а LV/RU-слаги переводятся по смыслу
 * (about → par-mums/o-nas), формулой не выводятся. Список растёт вручную
 * по мере добавления страниц; пересмотреть на автоматический источник
 * имеет смысл, когда реальных маршрутов станет много (Ф1+), не сейчас.
 *
 * ВНИМАНИЕ (найдено в T-059): список так и не пополнялся с T-023 —
 * все маршруты Ф1/Ф2 (T-031…T-058, ~25 route_id) в нём отсутствуют.
 * Это не входит в скоуп T-059 (первый динамический маршрут школ) —
 * исправлена только своя часть (school-card, ниже, по явному правилу
 * docs/07-i18n-seo.md §5 для динамических маршрутов). Остальной пробел
 * зафиксирован как отдельный, более крупный вопрос — см. обсуждение в
 * docs/11-backlog.md при T-059.
 */
export const sitemapEntries: SitemapEntry[] = [
  { routeId: "home", lv: "/lv/", ru: "/ru/" },
  { routeId: "about", lv: "/lv/par-mums/", ru: "/ru/o-nas/" },
  { routeId: "contacts", lv: "/lv/kontakti/", ru: "/ru/kontakty/" },
  {
    routeId: "privacy",
    lv: "/lv/privatuma-politika/",
    ru: "/ru/politika-konfidencialnosti/",
  },
  // docs/07-i18n-seo.md §5: динамические маршруты (school-card) — URL по
  // данным schools.json, не один шаблонный URL.
  ...getSchools().schools.map((school) => ({
    routeId: `school-card-${school.slug}`,
    lv: `/lv/skola/${school.slug}/`,
    ru: `/ru/skola/${school.slug}/`,
  })),
  // Динамический маршрут city-хабов (T-061) — тот же принцип §5.
  ...CITY_IDS.map((cityId) => ({
    routeId: `p3-city-${cityId}`,
    lv: `/lv/autoskolas/${cityId}/`,
    ru: `/ru/avtoshkoly/${cityId}/`,
  })),
];
