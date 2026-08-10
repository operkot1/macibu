/*
 * Нижняя граница доверительного интервала Уилсона (95%, z = 1.96).
 * Формула зафиксирована в docs/03-data-model.md, раздел «Правило честности
 * рейтинга» — менять только через ту же правку в документе и code review.
 */
export function wilsonLowerBound(
  passes: number,
  total: number,
  z = 1.96,
): number {
  if (total === 0) return 0;
  const phat = passes / total;
  const denominator = 1 + (z * z) / total;
  const centre = phat + (z * z) / (2 * total);
  const margin =
    z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);
  return (centre - margin) / denominator;
}
