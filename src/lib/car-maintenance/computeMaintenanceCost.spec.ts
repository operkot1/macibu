import { describe, expect, it } from "vitest";
import { computeMaintenanceCost } from "./computeMaintenanceCost";

describe("computeMaintenanceCost", () => {
  it("считает топливо как л/100км × км/мес × цена/л", () => {
    const result = computeMaintenanceCost({
      fuelConsumptionL100km: 7,
      fuelPriceEurL: 1.6,
      monthlyKm: 1000,
      monthlyMaintenanceBudgetEur: 0,
      octaEurYear: 0,
      inspectionFeeEurYear: 0,
    });
    // 7/100 * 1000 * 1.6 = 112
    expect(result.fuelEurMonth).toBe(112);
  });

  it("амортизирует OCTA и техосмотр на 12 месяцев", () => {
    const result = computeMaintenanceCost({
      fuelConsumptionL100km: 0,
      fuelPriceEurL: 0,
      monthlyKm: 0,
      monthlyMaintenanceBudgetEur: 0,
      octaEurYear: 240,
      inspectionFeeEurYear: 36.95,
    });
    expect(result.octaEurMonth).toBe(20);
    expect(result.inspectionEurMonth).toBeCloseTo(3.08, 2);
  });

  it("суммирует все компоненты в totalEurMonth", () => {
    const result = computeMaintenanceCost({
      fuelConsumptionL100km: 7,
      fuelPriceEurL: 1.6,
      monthlyKm: 1000,
      monthlyMaintenanceBudgetEur: 50,
      octaEurYear: 240,
      inspectionFeeEurYear: 36.95,
    });
    const expectedTotal =
      result.fuelEurMonth +
      result.octaEurMonth +
      result.inspectionEurMonth +
      result.maintenanceEurMonth;
    expect(result.totalEurMonth).toBeCloseTo(expectedTotal, 2);
    expect(result.totalEurMonth).toBeCloseTo(185.08, 2);
  });

  it("нулевые входы дают нулевой итог, не ломается на пустых данных", () => {
    const result = computeMaintenanceCost({
      fuelConsumptionL100km: 0,
      fuelPriceEurL: 0,
      monthlyKm: 0,
      monthlyMaintenanceBudgetEur: 0,
      octaEurYear: 0,
      inspectionFeeEurYear: 0,
    });
    expect(result.totalEurMonth).toBe(0);
  });
});
