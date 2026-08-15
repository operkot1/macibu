/*
 * Порядок категорий на хабе /kategorijas/ (T-112) — не алфавитный, а
 * логическими группами (мото → B-семейство → грузовые/автобус → проф.
 * квалификация), тот же порядок, что в docs/02-routes.md, строка
 * `cat-a`…`cat-95-kods`.
 */
export const CATEGORY_ORDER = [
  "am",
  "a1",
  "a2",
  "a",
  "b1",
  "b96",
  "be",
  "c1",
  "c",
  "ce",
  "d",
  "95-kods",
] as const;

export function categoryCode(routeId: string): string {
  return routeId.replace(/^cat-/, "");
}

export function sortByCategoryOrder<T extends { route_id: string }>(
  entries: T[],
): T[] {
  return [...entries].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(
        categoryCode(a.route_id) as (typeof CATEGORY_ORDER)[number],
      ) -
      CATEGORY_ORDER.indexOf(
        categoryCode(b.route_id) as (typeof CATEGORY_ORDER)[number],
      ),
  );
}
