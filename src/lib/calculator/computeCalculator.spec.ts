import { describe, expect, it } from "vitest";
import { computeCalculator } from "./computeCalculator";
import { getCostModel } from "../data";

const cost = getCostModel().coefficients;

function totalFor(
  totals: ReturnType<typeof computeCalculator>["totals"],
  scenario: string,
) {
  return totals.find((t) => t.scenario === scenario)?.total;
}

describe("computeCalculator", () => {
  it("Рига/механика/difficulty=50/без медсправки — 909/1390/1999 € (критерий приёмки)", () => {
    const result = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 50,
      },
      cost,
    );

    expect(totalFor(result.totals, "optimist")).toBe(909);
    expect(totalFor(result.totals, "realist")).toBe(1390);
    expect(totalFor(result.totals, "pessimist")).toBe(1999);
  });

  it("has_medical_certificate: true — медицина обнуляется, остальное не меняется", () => {
    const result = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: true,
        has_first_aid_course: false,
        difficulty: 50,
      },
      cost,
    );

    const realist = result.scenarios.find((s) => s.scenario === "realist");
    expect(realist?.medical_fee_eur).toBe(0);
    expect(realist?.school_fee_eur).toBe(450);
    expect(realist?.practice_fee_eur).toBe(720);
    expect(totalFor(result.totals, "realist")).toBe(1305);
  });

  it("difficulty=0 — практика дешевле на 15%, остальные строки не меняются", () => {
    const result = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 0,
      },
      cost,
    );

    const realist = result.scenarios.find((s) => s.scenario === "realist");
    expect(realist?.practice_fee_eur).toBe(612); // 720 * 0.85
    expect(realist?.school_fee_eur).toBe(450);
  });

  it("difficulty=100 — практика дороже на 15%", () => {
    const result = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 100,
      },
      cost,
    );

    const realist = result.scenarios.find((s) => s.scenario === "realist");
    expect(realist?.practice_fee_eur).toBe(828); // 720 * 1.15
  });

  it("has_first_aid_course не меняет ни одну цифру таблицы", () => {
    const withCourse = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: true,
        difficulty: 50,
      },
      cost,
    );
    const withoutCourse = computeCalculator(
      {
        gearbox: "manual",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 50,
      },
      cost,
    );

    expect(withCourse.totals).toEqual(withoutCourse.totals);
  });

  it("город без cost_model — fallback по Латвии, is_estimated_fallback: true", () => {
    const result = computeCalculator(
      {
        gearbox: "manual",
        city_id: "liepaja",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 50,
      },
      cost,
    );

    const realist = result.scenarios.find((s) => s.scenario === "realist");
    // (720 [riga] + 650 [daugavpils]) / 2 = 685 — те же две записи, что в
    // computeWizardPath.spec.ts (единственные manual/realist в фикстуре).
    expect(realist?.practice_fee_eur).toBe(685);
    expect(realist?.is_estimated_fallback).toBe(true);

    // optimist/pessimist есть только у Риги — усреднение по одной записи
    // не меняет числа.
    const optimist = result.scenarios.find((s) => s.scenario === "optimist");
    expect(optimist?.practice_fee_eur).toBe(440);
  });

  it("gearbox: automatic — использует отдельную ветку коэффициентов, не механику", () => {
    const result = computeCalculator(
      {
        gearbox: "automatic",
        city_id: "riga",
        has_medical_certificate: false,
        has_first_aid_course: false,
        difficulty: 50,
      },
      cost,
    );

    expect(totalFor(result.totals, "realist")).toBe(1460); // 450+790+135+85
  });
});
