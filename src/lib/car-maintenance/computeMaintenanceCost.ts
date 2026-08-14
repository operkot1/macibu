export interface MaintenanceCostInput {
  fuelConsumptionL100km: number;
  fuelPriceEurL: number;
  monthlyKm: number;
  monthlyMaintenanceBudgetEur: number;
  octaEurYear: number;
  inspectionFeeEurYear: number;
}

export interface MaintenanceCostResult {
  fuelEurMonth: number;
  octaEurMonth: number;
  inspectionEurMonth: number;
  maintenanceEurMonth: number;
  totalEurMonth: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/*
 * computeMaintenanceCost — чистая арифметика (T-089). Каждое входное
 * число — либо реальная процитированная константа (`inspectionFeeEurYear`,
 * из car_maintenance_cost_model.json, A-15), либо явный пользовательский
 * ввод (топливо, OCTA, обслуживание) — формула ничего не выдумывает сама,
 * только считает. Техосмотр и OCTA амортизированы на месяц (/12) —
 * реальная периодичность техосмотра зависит от возраста авто и здесь не
 * уточняется, честно предполагается «раз в год» как база для расчёта.
 */
export function computeMaintenanceCost(
  input: MaintenanceCostInput,
): MaintenanceCostResult {
  const fuelEurMonth = round2(
    (input.fuelConsumptionL100km / 100) * input.monthlyKm * input.fuelPriceEurL,
  );
  const octaEurMonth = round2(input.octaEurYear / 12);
  const inspectionEurMonth = round2(input.inspectionFeeEurYear / 12);
  const maintenanceEurMonth = round2(input.monthlyMaintenanceBudgetEur);
  const totalEurMonth = round2(
    fuelEurMonth + octaEurMonth + inspectionEurMonth + maintenanceEurMonth,
  );

  return {
    fuelEurMonth,
    octaEurMonth,
    inspectionEurMonth,
    maintenanceEurMonth,
    totalEurMonth,
  };
}
