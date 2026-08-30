import { useEffect, useMemo, useState } from "react";
import { computePointsStatus } from "../../../lib/points/computePointsStatus";
import type { DriverType } from "../../../lib/points/pointsThresholds";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { Violation } from "../../../schemas/violation";

/*
 * PointsCalculator — калькулятор статуса по системе учёта пунктов
 * (T-086). Переиспользует реестр violations (T-085), чтобы не
 * дублировать список нарушений (docs/06-tools/spravochnik-shtrafov.md).
 * Не отслеживает даты/срок действия конкретных баллов — см.
 * computePointsStatus.ts. Суммарные баллы честные (сумма выбранных
 * violation.points, реальная арифметика). После ревизии кода (август
 * 2026) часть категорий (speed/alcohol/phone/seatbelt/parking) получила
 * реальные данные (parkapums.lv, `source: "editorial"`) — предупреждение
 * «баллы иллюстративные» теперь условно, показывается только если среди
 * ВЫБРАННЫХ нарушений есть хотя бы одно ещё не заполненное
 * (documents/red-light, `source: "placeholder"`, A-14).
 */

export interface PointsCalculatorProps {
  violations: Violation[];
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    driverTypeLabel: "Vadītāja statuss",
    driverTypeNovice: "Jaunais vadītājs (stāžs < 2 gadi)",
    driverTypeRegular: "Pieredzējis vadītājs (stāžs ≥ 2 gadi)",
    violationsLabel: "Atzīmē pārkāpumus",
    totalLabel: "Kopā punktu",
    noneSelected: "Nav atzīmēts neviens pārkāpums — kopā 0 punktu.",
    crossedLabel: "Sasniegtie sliekšņi",
    nextLabel: "Nākamais slieksnis",
    pointsUntilNext: (n: number) => `atlikuši ${n} punkti`,
    noNextThreshold: "Nav nākamā sliekšņa šim vadītāja statusam.",
    suspendedWarning: "Sasniegts tiesību apturēšanas slieksnis.",
    illustrativeNote:
      "Konkrēto pārkāpumu punkti ir ilustratīvi (skaties sarakstu augstāk) — summa zemāk aprēķināta pareizi no izvēlētajiem, bet pašas ievades vērtības nav oficiāli apstiprinātas.",
  },
  ru: {
    driverTypeLabel: "Статус водителя",
    driverTypeNovice: "Новый водитель (стаж < 2 лет)",
    driverTypeRegular: "Опытный водитель (стаж ≥ 2 лет)",
    violationsLabel: "Отметь нарушения",
    totalLabel: "Всего баллов",
    noneSelected: "Не отмечено ни одного нарушения — всего 0 баллов.",
    crossedLabel: "Достигнутые пороги",
    nextLabel: "Следующий порог",
    pointsUntilNext: (n: number) => `осталось ${n} баллов`,
    noNextThreshold: "Нет следующего порога для этого статуса водителя.",
    suspendedWarning: "Достигнут порог приостановки прав.",
    illustrativeNote:
      "Баллы по конкретным нарушениям иллюстративные (см. список выше) — сумма ниже посчитана верно из выбранного, но сами исходные значения официально не подтверждены.",
  },
} as const;

export default function PointsCalculator({
  violations,
  currentLocale,
}: PointsCalculatorProps) {
  const t = text[currentLocale];
  const [driverType, setDriverType] = useState<DriverType>("regular");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => trackEvent("points_calculator_viewed"), []);

  const selectedViolations = useMemo(
    () => violations.filter((v) => selected.has(v.id)),
    [violations, selected],
  );

  const total = useMemo(
    () => selectedViolations.reduce((sum, v) => sum + v.points, 0),
    [selectedViolations],
  );

  const hasPlaceholderSelected = useMemo(
    () => selectedViolations.some((v) => v.source === "placeholder"),
    [selectedViolations],
  );

  const status = useMemo(
    () => computePointsStatus(total, driverType),
    [total, driverType],
  );

  function toggleViolation(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    trackEvent("points_calculator_violation_toggled", { violation_id: id });
  }

  function updateDriverType(value: DriverType) {
    setDriverType(value);
    trackEvent("points_calculator_driver_type_changed", {
      driver_type: value,
    });
  }

  return (
    <div>
      <fieldset className="mb-6">
        <legend className="text-body-sm text-neutral-600 mb-1 block">
          {t.driverTypeLabel}
        </legend>
        <div className="flex flex-col gap-2">
          <label className="text-body flex items-center gap-2">
            <input
              type="radio"
              name="driver-type"
              checked={driverType === "regular"}
              onChange={() => updateDriverType("regular")}
              className="focus-visible:ring-focus-ring focus-visible:ring-2"
            />
            {t.driverTypeRegular}
          </label>
          <label className="text-body flex items-center gap-2">
            <input
              type="radio"
              name="driver-type"
              checked={driverType === "novice"}
              onChange={() => updateDriverType("novice")}
              className="focus-visible:ring-focus-ring focus-visible:ring-2"
            />
            {t.driverTypeNovice}
          </label>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-body-sm text-neutral-600 mb-1 block">
          {t.violationsLabel}
        </legend>
        <ul className="flex flex-col gap-2">
          {violations.map((v) => {
            const inputId = `violation-${v.id}`;
            return (
              <li key={v.id}>
                <label
                  htmlFor={inputId}
                  className="border-neutral-300 flex cursor-pointer items-center justify-between gap-2 rounded-md border p-3"
                >
                  <span className="text-body text-neutral-900">
                    {currentLocale === "lv" ? v.title_lv : v.title_ru}
                  </span>
                  <span className="text-numeric text-neutral-600 tabular-nums">
                    {v.points}
                  </span>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={selected.has(v.id)}
                    onChange={() => toggleViolation(v.id)}
                    className="focus-visible:ring-focus-ring focus-visible:ring-2"
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div
        className="bg-primary-100 rounded-md p-4"
        role="status"
        aria-live="polite"
      >
        <p className="text-h3 text-neutral-900 mb-2">
          {t.totalLabel}: {total}
        </p>
        {selected.size === 0 ? (
          <p className="text-body text-neutral-600">{t.noneSelected}</p>
        ) : (
          <>
            {status.isSuspended && (
              <p className="text-danger-600 bg-danger-100 mb-2 rounded p-2 font-bold">
                {t.suspendedWarning}
              </p>
            )}
            <p className="text-body-sm text-neutral-600 mb-1">
              {t.crossedLabel}:{" "}
              {status.crossedThresholds.length === 0
                ? "—"
                : status.crossedThresholds.map((th) => th.points).join(", ")}
            </p>
            <p className="text-body-sm text-neutral-600">
              {t.nextLabel}:{" "}
              {status.nextThreshold
                ? `${status.nextThreshold.points} (${
                    status.pointsUntilNext !== null
                      ? t.pointsUntilNext(status.pointsUntilNext)
                      : ""
                  })`
                : t.noNextThreshold}
            </p>
          </>
        )}
        {hasPlaceholderSelected && (
          <p className="text-body-sm text-neutral-600 mt-3">
            {t.illustrativeNote}
          </p>
        )}
      </div>
    </div>
  );
}
