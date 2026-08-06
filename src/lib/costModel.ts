import type { CostModelCoefficients } from "../types/data";

/*
 * fallbackLatviaAverage — усреднение cost_model по всем городам для
 * данных gearbox/scenario, когда для нужного city_id нет собственной
 * записи (docs/03-data-model.md, правило пустых данных). Общая для всех
 * инструментов, читающих cost_model (визард, калькулятор), не
 * wizard-специфична — вынесена сюда, чтобы calculator не тянул её из
 * lib/wizard/ (нарушение границы "один модуль на инструмент",
 * CLAUDE.md).
 */
export function fallbackLatviaAverage(
  cost: CostModelCoefficients[],
  gearbox: "manual" | "automatic",
  scenario: "optimist" | "realist" | "pessimist",
): CostModelCoefficients {
  const matches = cost.filter(
    (c) => c.gearbox === gearbox && c.scenario === scenario,
  );
  if (matches.length === 0) {
    throw new Error(
      `Нет ни одной записи cost_model для gearbox=${gearbox}, scenario=${scenario} — усреднить нечего`,
    );
  }

  const average = (key: keyof CostModelCoefficients): number =>
    matches.reduce((sum, c) => sum + (c[key] as number), 0) / matches.length;

  return {
    city_id: "latvia-average",
    gearbox,
    scenario,
    school_fee_eur: average("school_fee_eur"),
    practice_fee_eur: average("practice_fee_eur"),
    csdd_fee_eur: average("csdd_fee_eur"),
    medical_fee_eur: average("medical_fee_eur"),
    is_estimated_fallback: true,
    updated_at: new Date().toISOString(),
  };
}
