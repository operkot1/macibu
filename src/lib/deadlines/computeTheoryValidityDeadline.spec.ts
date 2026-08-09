import { describe, expect, it } from "vitest";
import { computeTheoryValidityDeadline } from "./computeTheoryValidityDeadline";

describe("computeTheoryValidityDeadline", () => {
  it("добавляет ровно 1 год к дате сдачи теории", () => {
    const examDate = new Date("2026-08-01T00:00:00Z");
    const deadline = computeTheoryValidityDeadline(examDate);
    expect(deadline.getUTCFullYear()).toBe(2027);
    expect(deadline.getUTCMonth()).toBe(examDate.getUTCMonth());
    expect(deadline.getUTCDate()).toBe(examDate.getUTCDate());
  });

  it("29 февраля високосного года — переносится на 1 марта следующего (невисокосного) года", () => {
    const examDate = new Date("2028-02-29T00:00:00Z");
    const deadline = computeTheoryValidityDeadline(examDate);
    // 2029 — не високосный, у JS Date нативное поведение при setFullYear
    // на несуществующую дату — перенос на следующий день (1 марта), не
    // округление вниз до 28 февраля.
    expect(deadline.getUTCFullYear()).toBe(2029);
    expect(deadline.getUTCMonth()).toBe(2); // март (0-indexed)
    expect(deadline.getUTCDate()).toBe(1);
  });

  it("не мутирует переданную дату", () => {
    const examDate = new Date("2026-08-01T00:00:00Z");
    const original = examDate.getTime();
    computeTheoryValidityDeadline(examDate);
    expect(examDate.getTime()).toBe(original);
  });
});
