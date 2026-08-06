import type { CostModelCoefficients } from "../../types/data";
import { fallbackLatviaAverage } from "../costModel";

/*
 * computeCalculator — формула из
 * docs/06-tools/kalkulyator-stoimosti.md. Чистая функция, без UI (это
 * T-034).
 */

export interface CalculatorInput {
  gearbox: "manual" | "automatic";
  city_id: string;
  has_medical_certificate: boolean;
  has_first_aid_course: boolean;
  difficulty: number; // 0..100, по умолчанию 50
}

export type CalculatorScenario = "optimist" | "realist" | "pessimist";

export interface CalculatorScenarioResult {
  scenario: CalculatorScenario;
  school_fee_eur: number;
  practice_fee_eur: number;
  csdd_fee_eur: number;
  medical_fee_eur: number;
  is_estimated_fallback: boolean;
}

export interface CalculatorResult {
  scenarios: CalculatorScenarioResult[];
  totals: Array<{ scenario: CalculatorScenario; total: number }>;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeCalculator(
  input: CalculatorInput,
  coeffs: CostModelCoefficients[],
): CalculatorResult {
  const scenarios: CalculatorScenarioResult[] = (
    ["optimist", "realist", "pessimist"] as const
  ).map((scenario) => {
    const base =
      coeffs.find(
        (c) =>
          c.city_id === input.city_id &&
          c.gearbox === input.gearbox &&
          c.scenario === scenario,
      ) ?? fallbackLatviaAverage(coeffs, input.gearbox, scenario);

    // Слайдер "легко-тяжело" двигает только практику: 0 => -15%, 50 =>
    // 0%, 100 => +15%.
    const difficultyMultiplier = 1 + ((input.difficulty - 50) / 50) * 0.15;

    return {
      scenario,
      school_fee_eur: base.school_fee_eur,
      practice_fee_eur: round2(base.practice_fee_eur * difficultyMultiplier),
      csdd_fee_eur: base.csdd_fee_eur,
      medical_fee_eur: input.has_medical_certificate ? 0 : base.medical_fee_eur,
      is_estimated_fallback: base.is_estimated_fallback,
    };
  });

  const totals = scenarios.map((s) => ({
    scenario: s.scenario,
    total: round2(
      s.school_fee_eur +
        s.practice_fee_eur +
        s.csdd_fee_eur +
        s.medical_fee_eur,
    ),
  }));

  return { scenarios, totals };
}
