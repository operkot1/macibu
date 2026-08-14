import type { Violation } from "../../schemas/violation";

export interface ViolationFilters {
  category?: Violation["category"];
  points?: number;
  sort: "points-desc" | "fine-asc" | "fine-desc";
}

export const DEFAULT_VIOLATION_FILTERS: ViolationFilters = {
  sort: "points-desc",
};

function matches(violation: Violation, filters: ViolationFilters): boolean {
  if (filters.category && violation.category !== filters.category) return false;
  if (filters.points !== undefined && violation.points !== filters.points)
    return false;
  return true;
}

/*
 * filterViolations — тот же стиль предиката, что filterSchools.ts (T-053,
 * явный прецедент задачи T-085). "fine-asc"/"fine-desc" сортируют по
 * fine_min_eur — записи без нижней границы (null) уходят в конец
 * сортировки по цене, не приравниваются к 0.
 */
export function filterViolations(
  violations: Violation[],
  filters: ViolationFilters,
): Violation[] {
  const filtered = violations.filter((v) => matches(v, filters));

  if (filters.sort === "fine-asc") {
    return [...filtered].sort((a, b) => {
      if (a.fine_min_eur === null && b.fine_min_eur === null)
        return a.title_lv.localeCompare(b.title_lv);
      if (a.fine_min_eur === null) return 1;
      if (b.fine_min_eur === null) return -1;
      return a.fine_min_eur - b.fine_min_eur;
    });
  }

  if (filters.sort === "fine-desc") {
    return [...filtered].sort((a, b) => {
      if (a.fine_min_eur === null && b.fine_min_eur === null)
        return a.title_lv.localeCompare(b.title_lv);
      if (a.fine_min_eur === null) return 1;
      if (b.fine_min_eur === null) return -1;
      return b.fine_min_eur - a.fine_min_eur;
    });
  }

  return [...filtered].sort((a, b) => b.points - a.points);
}
