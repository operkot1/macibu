import type { CostModelCoefficients } from "../../types/data";

export interface DecoderInput {
  advertised_price_eur: number;
  included: {
    theory_course: boolean;
    exam_fees: boolean;
    practice_hours_count: number | null;
    first_aid_course: boolean;
  };
  city_id: string;
  gearbox: "manual" | "automatic";
}

export type DecoderComponent =
  "theory_course" | "exam_fees" | "first_aid_course" | "extra_practice_hours";

export interface DecoderMissingComponent {
  component: DecoderComponent;
  typical_eur: number;
}

export interface DecoderResult {
  missing: DecoderMissingComponent[];
  likely_total_eur: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/*
 * decodePrice — docs/06-tools/deshifrator-prajsa.md. `cost` — уже
 * разрешённая строка cost_model (сценарий "realist" для city_id/gearbox
 * пользователя, резолвится вызывающим кодом через fallbackLatviaAverage
 * при отсутствии города, тот же паттерн, что computeCalculator).
 *
 * Контрактное псевдо-код в доке хардкодил typical_eur: 200 для
 * theory_course — magic number, не связанный с реальным cost_model,
 * при этом school_fee_eur (та же строка "Skola"/"Школа", что в
 * Calculator.tsx) уже несёт ровно этот компонент по городу/коробке.
 * Исправлено здесь на cost.school_fee_eur — не мимо реальных данных.
 */
export function decodePrice(
  input: DecoderInput,
  cost: CostModelCoefficients,
): DecoderResult {
  const missing: DecoderMissingComponent[] = [];

  if (!input.included.theory_course) {
    missing.push({
      component: "theory_course",
      typical_eur: cost.school_fee_eur,
    });
  }
  if (!input.included.exam_fees) {
    missing.push({ component: "exam_fees", typical_eur: cost.csdd_fee_eur });
  }
  if (!input.included.first_aid_course) {
    missing.push({
      component: "first_aid_course",
      typical_eur: cost.medical_fee_eur,
    });
  }
  if (
    input.included.practice_hours_count !== null &&
    input.included.practice_hours_count < 20
  ) {
    missing.push({
      component: "extra_practice_hours",
      typical_eur: round2(cost.practice_fee_eur * 0.3),
    });
  }

  const likely_total_eur = round2(
    input.advertised_price_eur +
      missing.reduce((sum, m) => sum + m.typical_eur, 0),
  );

  return { missing, likely_total_eur };
}
