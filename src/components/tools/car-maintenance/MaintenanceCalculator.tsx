import { useEffect, useMemo, useState } from "react";
import { computeMaintenanceCost } from "../../../lib/car-maintenance/computeMaintenanceCost";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { CarMaintenanceCostModel } from "../../../types/data";

/*
 * MaintenanceCalculator — калькулятор содержания pirmās mašīnas (T-089).
 * Единственные "факты", которые компонент утверждает сам — techniskā
 * apskate (реальная цена CSDD из costModel) и подсказанный диапазон OCTA
 * (тоже из costModel, A-15) в качестве стартового значения поля, которое
 * пользователь может изменить. Топливо/пробег/обслуживание — целиком
 * пользовательский ввод без предзаполненного "типичного" числа, которое
 * portāls не мог бы обосновать.
 */

export interface MaintenanceCalculatorProps {
  costModel: CarMaintenanceCostModel;
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    fuelConsumptionLabel: "Patēriņš (l/100km)",
    fuelPriceLabel: "Degvielas cena (EUR/l)",
    monthlyKmLabel: "Nobrauktie km mēnesī",
    maintenanceLabel: "Apkope/remonts mēnesī (EUR, tava aplēse)",
    octaLabel: "OCTA (EUR/gadā)",
    octaHint: (min: number, max: number) =>
      `Tipisks diapazons jaunam vadītājam: ${min}–${max} EUR/gadā — cena ir ļoti individuāla, precizē pie sava apdrošinātāja.`,
    inspectionLabel: "Tehniskā apskate",
    inspectionValue: (fee: number) =>
      `${fee} EUR/reizi (pieņemts — reizi gadā)`,
    resultHeading: "Aptuvenās izmaksas mēnesī",
    fuel: "Degviela",
    octa: "OCTA",
    inspection: "Tehniskā apskate",
    maintenance: "Apkope/remonts",
    total: "Kopā",
    source: "Avots: CSDD (tehniskā apskate), tirgus izpēte (OCTA diapazons).",
  },
  ru: {
    fuelConsumptionLabel: "Расход (л/100км)",
    fuelPriceLabel: "Цена топлива (EUR/л)",
    monthlyKmLabel: "Пробег в месяц (км)",
    maintenanceLabel: "Обслуживание/ремонт в месяц (EUR, твоя оценка)",
    octaLabel: "ОСАГО (EUR/год)",
    octaHint: (min: number, max: number) =>
      `Типичный диапазон для нового водителя: ${min}–${max} EUR/год — цена очень индивидуальна, уточни у своего страховщика.`,
    inspectionLabel: "Техосмотр",
    inspectionValue: (fee: number) => `${fee} EUR/раз (принято — раз в год)`,
    resultHeading: "Примерные расходы в месяц",
    fuel: "Топливо",
    octa: "ОСАГО",
    inspection: "Техосмотр",
    maintenance: "Обслуживание/ремонт",
    total: "Итого",
    source:
      "Источник: CSDD (техосмотр), рыночное исследование (диапазон ОСАГО).",
  },
} as const;

function formatEur(value: number): string {
  return `${value.toLocaleString("lv-LV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export default function MaintenanceCalculator({
  costModel,
  currentLocale,
}: MaintenanceCalculatorProps) {
  const t = text[currentLocale];
  const octaDefault = Math.round(
    (costModel.octa.typical_min_eur_year +
      costModel.octa.typical_max_eur_year) /
      2,
  );

  const [fuelConsumptionL100km, setFuelConsumptionL100km] = useState(7);
  const [fuelPriceEurL, setFuelPriceEurL] = useState(1.6);
  const [monthlyKm, setMonthlyKm] = useState(1000);
  const [monthlyMaintenanceBudgetEur, setMonthlyMaintenanceBudgetEur] =
    useState(50);
  const [octaEurYear, setOctaEurYear] = useState(octaDefault);

  useEffect(() => trackEvent("maintenance_calculator_viewed"), []);

  const result = useMemo(
    () =>
      computeMaintenanceCost({
        fuelConsumptionL100km,
        fuelPriceEurL,
        monthlyKm,
        monthlyMaintenanceBudgetEur,
        octaEurYear,
        inspectionFeeEurYear: costModel.inspection.fee_eur,
      }),
    [
      fuelConsumptionL100km,
      fuelPriceEurL,
      monthlyKm,
      monthlyMaintenanceBudgetEur,
      octaEurYear,
      costModel.inspection.fee_eur,
    ],
  );

  function numberField(
    label: string,
    value: number,
    onChange: (v: number) => void,
    step = 1,
  ) {
    return (
      <div>
        <label className="text-body-sm text-neutral-600 mb-1 block">
          {label}
        </label>
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Number.isFinite(v) && v >= 0 ? v : 0);
            trackEvent("maintenance_calculator_input_changed", {
              field: label,
            });
          }}
          className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {numberField(
          t.fuelConsumptionLabel,
          fuelConsumptionL100km,
          setFuelConsumptionL100km,
          0.1,
        )}
        {numberField(t.fuelPriceLabel, fuelPriceEurL, setFuelPriceEurL, 0.01)}
        {numberField(t.monthlyKmLabel, monthlyKm, setMonthlyKm, 50)}
        {numberField(
          t.maintenanceLabel,
          monthlyMaintenanceBudgetEur,
          setMonthlyMaintenanceBudgetEur,
          5,
        )}
        <div>
          {numberField(t.octaLabel, octaEurYear, setOctaEurYear, 5)}
          <p className="text-body-sm text-neutral-600 mt-1">
            {t.octaHint(
              costModel.octa.typical_min_eur_year,
              costModel.octa.typical_max_eur_year,
            )}
          </p>
        </div>
        <div>
          <p className="text-body-sm text-neutral-600 mb-1">
            {t.inspectionLabel}
          </p>
          <p className="text-body text-neutral-900">
            {t.inspectionValue(costModel.inspection.fee_eur)}
          </p>
        </div>
      </div>

      <div
        className="bg-primary-100 rounded-md p-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-h3 text-neutral-900 mb-2">{t.resultHeading}</p>
        <ul className="text-body-sm text-neutral-900 flex flex-col gap-1">
          <li>
            {t.fuel}: {formatEur(result.fuelEurMonth)}
          </li>
          <li>
            {t.octa}: {formatEur(result.octaEurMonth)}
          </li>
          <li>
            {t.inspection}: {formatEur(result.inspectionEurMonth)}
          </li>
          <li>
            {t.maintenance}: {formatEur(result.maintenanceEurMonth)}
          </li>
        </ul>
        <p className="text-h3 text-neutral-900 mt-2">
          {t.total}: {formatEur(result.totalEurMonth)}
        </p>
      </div>

      <p className="text-body-sm text-neutral-600 mt-4">{t.source}</p>
    </div>
  );
}
