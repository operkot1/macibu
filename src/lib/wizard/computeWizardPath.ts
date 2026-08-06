import type {
  CsddTariff,
  CostModelCoefficients,
  WizardResult,
} from "../../types/data";

/*
 * computeWizardPath — формула из docs/06-tools/vizard-tvoj-put.md.
 * Чистая функция, без UI (это T-029/T-030) и без обработки возрастного
 * Callout (T-030, экран результата) — здесь только расчёт.
 */

export type WizardInput = Pick<
  WizardResult,
  "age_bracket" | "has_medical_certificate" | "gearbox_preference" | "city_id"
>;

type StepId =
  | "medical-certificate"
  | "white-license"
  | "choose-school"
  | "theory-course"
  | "first-aid-course"
  | "theory-exam"
  | "practice"
  | "driving-exam"
  | "plastic-card";

type WizardStep = WizardResult["computed_steps"][number];

function priced(
  stepId: StepId,
  tariffs: CsddTariff[],
  durationLabel: string,
): WizardStep | null {
  const tariff = tariffs.find((t) => t.id === stepId);
  if (!tariff) return null;
  return {
    step_id: stepId,
    price_eur: tariff.price_eur,
    duration_label: durationLabel,
  };
}

/*
 * Усреднение cost_model по всем городам для данных gearbox/scenario —
 * используется, когда для input.city_id нет собственной записи
 * (docs/03-data-model.md, правило пустых данных для cost_model).
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

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function computeWizardPath(
  input: WizardInput,
  tariffs: CsddTariff[],
  cost: CostModelCoefficients[],
): WizardResult {
  const steps: WizardStep[] = [];

  if (input.has_medical_certificate !== "yes") {
    const step = priced("medical-certificate", tariffs, "1-7д");
    if (step) steps.push(step);
  }

  const whiteLicense = priced("white-license", tariffs, "1д");
  if (whiteLicense) steps.push(whiteLicense);

  steps.push({
    step_id: "choose-school",
    price_eur: 0,
    duration_label: "1-2н",
  });

  const theoryCourse = priced("theory-course", tariffs, "4-8н");
  if (theoryCourse) steps.push(theoryCourse);

  const firstAid = priced("first-aid-course", tariffs, "1д");
  if (firstAid) steps.push(firstAid);

  const theoryExam = priced("theory-exam", tariffs, "");
  if (theoryExam) steps.push(theoryExam);

  const gearbox =
    input.gearbox_preference === "undecided"
      ? "manual"
      : input.gearbox_preference;

  const realist =
    cost.find(
      (c) =>
        c.city_id === input.city_id &&
        c.gearbox === gearbox &&
        c.scenario === "realist",
    ) ?? fallbackLatviaAverage(cost, gearbox, "realist");

  steps.push({
    step_id: "practice",
    price_eur: realist.practice_fee_eur,
    duration_label: "2-4м",
  });

  const drivingExam = priced("driving-exam", tariffs, "");
  if (drivingExam) steps.push(drivingExam);

  const plasticCard = priced("plastic-card", tariffs, "");
  if (plasticCard) steps.push(plasticCard);

  const stepsTotal = steps.reduce((sum, s) => sum + s.price_eur, 0);
  const computed_total_eur =
    Math.round((stepsTotal + realist.school_fee_eur) * 100) / 100;

  const computed_deadline = addYears(new Date(), 3).toISOString();

  return {
    ...input,
    computed_steps: steps,
    computed_total_eur,
    computed_deadline,
    is_estimated_fallback: realist.is_estimated_fallback,
  };
}
