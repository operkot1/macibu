import { describe, expect, it } from "vitest";
import { computeWizardPath, fallbackLatviaAverage } from "./computeWizardPath";
import { getCsddTariffs, getCostModel } from "../data";

const tariffs = getCsddTariffs().tariffs;
const cost = getCostModel().coefficients;

describe("computeWizardPath", () => {
  it("стандартный сценарий: 9 шагов в правильном порядке, верная сумма", () => {
    const result = computeWizardPath(
      {
        age_bracket: "18-24",
        has_medical_certificate: "no",
        gearbox_preference: "manual",
        city_id: "riga",
      },
      tariffs,
      cost,
    );

    expect(result.computed_steps.map((s) => s.step_id)).toEqual([
      "medical-certificate",
      "white-license",
      "choose-school",
      "theory-course",
      "first-aid-course",
      "theory-exam",
      "practice",
      "driving-exam",
      "plastic-card",
    ]);
    expect(result.computed_total_eur).toBe(1549.88);
    expect(result.is_estimated_fallback).toBe(false);
  });

  it("дедлайн — примерно +3 года от текущей даты", () => {
    const result = computeWizardPath(
      {
        age_bracket: "18-24",
        has_medical_certificate: "no",
        gearbox_preference: "manual",
        city_id: "riga",
      },
      tariffs,
      cost,
    );

    const deadline = new Date(result.computed_deadline).getTime();
    const expected = new Date();
    expected.setFullYear(expected.getFullYear() + 3);
    // Допуск в минуту — на случай пересечения границы секунды между
    // вызовом функции и вычислением expected здесь же, в тесте.
    expect(Math.abs(deadline - expected.getTime())).toBeLessThan(60_000);
  });

  it("has_medical_certificate: 'yes' — шаг медсправки отсутствует", () => {
    const result = computeWizardPath(
      {
        age_bracket: "25-35",
        has_medical_certificate: "yes",
        gearbox_preference: "automatic",
        city_id: "riga",
      },
      tariffs,
      cost,
    );

    expect(
      result.computed_steps.some((s) => s.step_id === "medical-certificate"),
    ).toBe(false);
    expect(result.computed_steps).toHaveLength(8);
  });

  it("gearbox_preference: 'undecided' — считает как механику", () => {
    const undecided = computeWizardPath(
      {
        age_bracket: "18-24",
        has_medical_certificate: "no",
        gearbox_preference: "undecided",
        city_id: "riga",
      },
      tariffs,
      cost,
    );
    const manual = computeWizardPath(
      {
        age_bracket: "18-24",
        has_medical_certificate: "no",
        gearbox_preference: "manual",
        city_id: "riga",
      },
      tariffs,
      cost,
    );

    expect(undecided.computed_total_eur).toBe(manual.computed_total_eur);
  });

  it("город без cost_model — использует усреднённый fallback, не падает", () => {
    const result = computeWizardPath(
      {
        age_bracket: "36+",
        has_medical_certificate: "unknown",
        gearbox_preference: "manual",
        city_id: "liepaja",
      },
      tariffs,
      cost,
    );

    const practiceStep = result.computed_steps.find(
      (s) => s.step_id === "practice",
    );
    // (720 [riga] + 650 [daugavpils]) / 2 = 685 — единственные две
    // manual/realist записи в фикстуре на момент теста.
    expect(practiceStep?.price_eur).toBe(685);
    expect(result.is_estimated_fallback).toBe(true);
  });

  it("отсутствующий тариф пропускает шаг, не подставляет 0", () => {
    const tariffsWithoutPlastic = tariffs.filter(
      (t) => t.id !== "plastic-card",
    );
    const result = computeWizardPath(
      {
        age_bracket: "18-24",
        has_medical_certificate: "no",
        gearbox_preference: "manual",
        city_id: "riga",
      },
      tariffsWithoutPlastic,
      cost,
    );

    expect(
      result.computed_steps.some((s) => s.step_id === "plastic-card"),
    ).toBe(false);
  });
});

describe("fallbackLatviaAverage", () => {
  it("усредняет по всем городам для данной коробки/сценария", () => {
    const avg = fallbackLatviaAverage(cost, "manual", "realist");
    expect(avg.practice_fee_eur).toBe(685);
    expect(avg.is_estimated_fallback).toBe(true);
    expect(avg.city_id).toBe("latvia-average");
  });

  it("бросает ошибку, если для комбинации нет вообще ни одной записи", () => {
    const emptyCost: typeof cost = [];
    expect(() =>
      fallbackLatviaAverage(emptyCost, "manual", "realist"),
    ).toThrow();
  });
});
