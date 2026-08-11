import { describe, expect, it } from "vitest";
import { decodePrice, type DecoderInput } from "./decodePrice";
import type { CostModelCoefficients } from "../../types/data";

// Riga/manual/realist — реальная строка из fixtures/cost_model.json.
const cost: CostModelCoefficients = {
  city_id: "riga",
  gearbox: "manual",
  scenario: "realist",
  school_fee_eur: 450,
  practice_fee_eur: 720,
  csdd_fee_eur: 135,
  medical_fee_eur: 85,
  is_estimated_fallback: false,
  updated_at: "2026-07-01T00:00:00Z",
};

function baseInput(
  overrides: Partial<DecoderInput["included"]> = {},
): DecoderInput {
  return {
    advertised_price_eur: 500,
    city_id: "riga",
    gearbox: "manual",
    included: {
      theory_course: true,
      exam_fees: true,
      practice_hours_count: 20,
      first_aid_course: true,
      ...overrides,
    },
  };
}

describe("decodePrice (docs/06-tools/deshifrator-prajsa.md)", () => {
  it("всё included, 20 часов практики (не < 20) — цена уже полная, ничего не придумано", () => {
    const result = decodePrice(baseInput(), cost);
    expect(result.missing).toEqual([]);
    expect(result.likely_total_eur).toBe(500);
  });

  it("theory_course не включён — typical_eur берётся из cost.school_fee_eur, не хардкод 200", () => {
    const result = decodePrice(baseInput({ theory_course: false }), cost);
    expect(result.missing).toEqual([
      { component: "theory_course", typical_eur: 450 },
    ]);
    expect(result.likely_total_eur).toBe(950);
  });

  it("exam_fees не включён — typical_eur = cost.csdd_fee_eur", () => {
    const result = decodePrice(baseInput({ exam_fees: false }), cost);
    expect(result.missing).toEqual([
      { component: "exam_fees", typical_eur: 135 },
    ]);
    expect(result.likely_total_eur).toBe(635);
  });

  it("first_aid_course не включён — typical_eur = cost.medical_fee_eur", () => {
    const result = decodePrice(baseInput({ first_aid_course: false }), cost);
    expect(result.missing).toEqual([
      { component: "first_aid_course", typical_eur: 85 },
    ]);
    expect(result.likely_total_eur).toBe(585);
  });

  it("practice_hours_count < 20 — extra_practice_hours = practice_fee_eur * 0.3", () => {
    const result = decodePrice(baseInput({ practice_hours_count: 15 }), cost);
    expect(result.missing).toEqual([
      { component: "extra_practice_hours", typical_eur: 216 },
    ]);
    expect(result.likely_total_eur).toBe(716);
  });

  it("practice_hours_count >= 20 — не считается недостающим компонентом", () => {
    const result = decodePrice(baseInput({ practice_hours_count: 20 }), cost);
    expect(result.missing).toEqual([]);
  });

  it("practice_hours_count: null (неизвестно из рекламы) — не придумываем недостачу", () => {
    const result = decodePrice(baseInput({ practice_hours_count: null }), cost);
    expect(result.missing).toEqual([]);
  });

  it("всё не включено — все 4 компонента суммируются", () => {
    const result = decodePrice(
      baseInput({
        theory_course: false,
        exam_fees: false,
        first_aid_course: false,
        practice_hours_count: 10,
      }),
      cost,
    );
    expect(result.missing).toHaveLength(4);
    expect(result.likely_total_eur).toBe(500 + 450 + 135 + 85 + 216);
  });
});
