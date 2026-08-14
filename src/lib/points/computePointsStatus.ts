import {
  thresholdsFor,
  type DriverType,
  type PointsThreshold,
} from "./pointsThresholds";

export interface PointsStatus {
  total: number;
  driverType: DriverType;
  crossedThresholds: PointsThreshold[];
  nextThreshold: PointsThreshold | null;
  pointsUntilNext: number | null;
  isSuspended: boolean;
}

/*
 * computePointsStatus — чистая функция подсчёта статуса (T-086). Не
 * отслеживает даты/срок действия конкретных баллов (2/5 лет,
 * pointsThresholds.ts) — это потребовало бы реальных дат каждого
 * нарушения и персистентного состояния, которых нет в контракте задачи;
 * результат считает так, как если бы все выбранные баллы сейчас активны
 * — честно, не выдумывая механизм отслеживания сроков, которого нет.
 */
export function computePointsStatus(
  total: number,
  driverType: DriverType,
): PointsStatus {
  const applicable = thresholdsFor(driverType);
  const crossed = applicable.filter((t) => total >= t.points);
  const next = applicable.find((t) => total < t.points) ?? null;

  return {
    total,
    driverType,
    crossedThresholds: crossed,
    nextThreshold: next,
    pointsUntilNext: next ? next.points - total : null,
    isSuspended: crossed.some((t) => t.isSuspension),
  };
}
