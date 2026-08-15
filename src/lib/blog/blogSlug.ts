/*
 * blogSlug — вспомогательные функции для блога (T-115). Тот же паттерн,
 * что categoryCode()/sortByCategoryOrder() в
 * src/lib/categories/categoryOrder.ts (T-112): route_id = `blog-{slug}`,
 * слаг URL выводится вычитанием префикса, не хранится отдельным полем.
 */
export function blogSlug(routeId: string): string {
  return routeId.replace(/^blog-/, "");
}

export function sortByPublishedAtDesc<T extends { publishedAt: string }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}
