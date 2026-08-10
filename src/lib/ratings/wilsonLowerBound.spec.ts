import { describe, expect, it } from "vitest";
import { wilsonLowerBound } from "./wilsonLowerBound";

describe("wilsonLowerBound (docs/03-data-model.md)", () => {
  it("total = 0 → 0, без деления на ноль", () => {
    expect(wilsonLowerBound(0, 0)).toBe(0);
  });

  it("48 попыток / 34 успеха (71%) ≈ 0.5682 — А. Bērziņš", () => {
    expect(wilsonLowerBound(34, 48)).toBeCloseTo(0.5682, 4);
  });

  it("3 попытки / 3 успеха (100%) ≈ 0.4385 — K. Lapiņš", () => {
    expect(wilsonLowerBound(3, 3)).toBeCloseTo(0.4385, 4);
  });

  it("31 попытка / 20 успехов ≈ 0.4695 — I. Petrova", () => {
    expect(wilsonLowerBound(20, 31)).toBeCloseTo(0.4695, 4);
  });

  it("27 попыток / 17 успехов ≈ 0.4423 — M. Ozols", () => {
    expect(wilsonLowerBound(17, 27)).toBeCloseTo(0.4423, 4);
  });

  it("большая выборка со 100% > маленькая выборка со 100% (защита от манипуляции)", () => {
    const big = wilsonLowerBound(48, 48);
    const small = wilsonLowerBound(3, 3);
    expect(big).toBeGreaterThan(small);
  });

  it("71% на 48 учениках ранжируется выше 100% на 3 учениках (правило честности рейтинга)", () => {
    const highSampleModerate = wilsonLowerBound(34, 48);
    const lowSamplePerfect = wilsonLowerBound(3, 3);
    expect(highSampleModerate).toBeGreaterThan(lowSamplePerfect);
  });
});
