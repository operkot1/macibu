import { describe, expect, it } from "vitest";
import { computePointsStatus } from "./computePointsStatus";

describe("computePointsStatus", () => {
  it("0 баллов — ничего не пройдено, следующий порог 4", () => {
    const s = computePointsStatus(0, "novice");
    expect(s.crossedThresholds).toEqual([]);
    expect(s.nextThreshold?.points).toBe(4);
    expect(s.pointsUntilNext).toBe(4);
    expect(s.isSuspended).toBe(false);
  });

  it("новичок, 9 баллов — пройдены 4 и 8, до приостановки (10) остаётся 1", () => {
    const s = computePointsStatus(9, "novice");
    expect(s.crossedThresholds.map((t) => t.points)).toEqual([4, 8]);
    expect(s.nextThreshold?.points).toBe(10);
    expect(s.pointsUntilNext).toBe(1);
    expect(s.isSuspended).toBe(false);
  });

  it("новичок, ровно 10 баллов — приостановка, порог 12/16 не применим к новичку", () => {
    const s = computePointsStatus(10, "novice");
    expect(s.crossedThresholds.map((t) => t.points)).toEqual([4, 8, 10]);
    expect(s.nextThreshold).toBeNull();
    expect(s.pointsUntilNext).toBeNull();
    expect(s.isSuspended).toBe(true);
  });

  it("новичок, 15 баллов — всё ещё приостановлен, 12/16 никогда не считаются для новичка", () => {
    const s = computePointsStatus(15, "novice");
    expect(s.crossedThresholds.map((t) => t.points)).toEqual([4, 8, 10]);
    expect(s.isSuspended).toBe(true);
  });

  it("опытный водитель, 10 баллов — порог 10 не применим, следующий порог 12", () => {
    const s = computePointsStatus(10, "regular");
    expect(s.crossedThresholds.map((t) => t.points)).toEqual([4, 8]);
    expect(s.nextThreshold?.points).toBe(12);
    expect(s.pointsUntilNext).toBe(2);
    expect(s.isSuspended).toBe(false);
  });

  it("опытный водитель, 16 баллов — приостановка", () => {
    const s = computePointsStatus(16, "regular");
    expect(s.crossedThresholds.map((t) => t.points)).toEqual([4, 8, 12, 16]);
    expect(s.nextThreshold).toBeNull();
    expect(s.isSuspended).toBe(true);
  });

  it("баллов больше максимального порога — статус не ломается, остаётся suspended", () => {
    const s = computePointsStatus(30, "regular");
    expect(s.isSuspended).toBe(true);
    expect(s.nextThreshold).toBeNull();
  });
});
