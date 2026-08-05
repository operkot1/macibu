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
];
