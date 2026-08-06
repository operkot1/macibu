import { useEffect, useMemo, useState } from "react";
import {
  computeCalculator,
  type CalculatorInput,
  type CalculatorScenario,
} from "../../../lib/calculator/computeCalculator";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { CostModelCoefficients, School } from "../../../types/data";

/*
 * Calculator — Экран 3 (docs/06-tools/kalkulyator-stoimosti.md, T-034).
 * Реалист-сценарий с настройками по умолчанию виден сразу (не по клику
 * "Рассчитать"), пересчёт мгновенный при смене формы, слайдер сложности
 * дебаунсится на 150мс (докс "Состояния").
 *
 * Строка FORS не подсвечивается визуально — верстается теми же классами,
 * что строка "Средняя цена по городу" (docs/06-tools, проверяемый
 * критерий приёмки), единственное отличие — текст/данные.
 */

export interface CalculatorProps {
  coeffs: CostModelCoefficients[];
  schools: School[];
  currentLocale: "lv" | "ru";
}

const DEBOUNCE_MS = 150;

const SCENARIO_ORDER: CalculatorScenario[] = [
  "optimist",
  "realist",
  "pessimist",
];

const text = {
  lv: {
    gearboxLabel: "Kārba",
    gearboxManual: "Mehāniskā",
    gearboxAutomatic: "Automātiskā",
    cityLabel: "Pilsēta",
    medicalLabel: "Man jau ir veselības apliecība",
    firstAidLabel: "Man jau ir pirmās palīdzības kursa apliecība",
    difficultyLabel: "Cik grūti tev būs mācīties braukt?",
    difficultyEasy: "Viegli",
    difficultyHard: "Grūti",
    scenarioLabels: {
      optimist: "Optimists",
      realist: "Reālists",
      pessimist: "Pesimists",
    } as Record<CalculatorScenario, string>,
    rowSchool: "Skola",
    rowPractice: "Prakse",
    rowCsdd: "CSDD",
    rowMedical: "Medicīna",
    rowTotal: "KOPĀ",
    fallbackBadge:
      "Precīzu datu par šo pilsētu vēl nav — parādīta Latvijas vidējā aplēse.",
    notIncludedHeading: "Šeit NAV iekļauts",
    notIncludedItems: [
      "CSDD teorijas vai braukšanas eksāmena atkārtota kārtošana (maksa par katru mēģinājumu atsevišķi)",
      "Papildu braukšanas nodarbības virs skolas standarta paketes",
      "Degviela un stāvvieta papildu nodarbībām",
      "Apliecības dublikāts nozaudēšanas vai bojājuma gadījumā",
      "Auto apdrošināšana, ja eksāmenu kārto ar savu automašīnu (ne visas skolas to atļauj)",
    ],
    comparisonHeading: "Salīdzinājums",
    averagePriceLabel: "Vidējā cena pilsētā",
    applyToPartner: "Pieteikties",
    emptyDataWarning: "Dati par izmaksām īslaicīgi nav pieejami.",
    emptyDataLink: "CSDD oficiālie tarifi",
  },
  ru: {
    gearboxLabel: "Коробка",
    gearboxManual: "Механика",
    gearboxAutomatic: "Автомат",
    cityLabel: "Город",
    medicalLabel: "У меня уже есть медсправка",
    firstAidLabel: "У меня уже есть курс первой помощи",
    difficultyLabel: "Насколько тяжело тебе будет учиться водить?",
    difficultyEasy: "Легко",
    difficultyHard: "Тяжело",
    scenarioLabels: {
      optimist: "Оптимист",
      realist: "Реалист",
      pessimist: "Пессимист",
    } as Record<CalculatorScenario, string>,
    rowSchool: "Школа",
    rowPractice: "Практика",
    rowCsdd: "CSDD",
    rowMedical: "Медицина",
    rowTotal: "ИТОГО",
    fallbackBadge:
      "Точных данных по этому городу пока нет — показана оценка по Латвии в среднем.",
    notIncludedHeading: "Сюда НЕ входит",
    notIncludedItems: [
      "Пересдача теоретического или практического экзамена CSDD (отдельная плата за каждую попытку)",
      "Дополнительные уроки вождения сверх стандартного пакета школы",
      "Топливо и парковка на дополнительных уроках",
      "Дубликат прав при утере или повреждении",
      "Страховка автомобиля, если сдаёшь экзамен на личном авто (разрешено не во всех школах)",
    ],
    comparisonHeading: "Сравнение",
    averagePriceLabel: "Средняя цена по городу",
    applyToPartner: "Записаться",
    emptyDataWarning: "Данные о стоимости временно недоступны.",
    emptyDataLink: "Официальные тарифы CSDD",
  },
} as const;

function formatEur(value: number): string {
  return `${value.toLocaleString("lv-LV", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

const comparisonRowClass =
  "flex items-center justify-between border-neutral-300 border-b p-3 last:border-b-0";

export default function Calculator({
  coeffs,
  schools,
  currentLocale,
}: CalculatorProps) {
  const t = text[currentLocale];
  const [gearbox, setGearbox] = useState<CalculatorInput["gearbox"]>("manual");
  const [cityId, setCityId] = useState<CityId>("riga");
  const [hasMedicalCertificate, setHasMedicalCertificate] = useState(false);
  const [hasFirstAidCourse, setHasFirstAidCourse] = useState(false);
  const [difficultyDisplay, setDifficultyDisplay] = useState(50);
  const [difficultyCommitted, setDifficultyCommitted] = useState(50);

  useEffect(() => trackEvent("calculator_viewed"), []);

  useEffect(() => {
    const timer = setTimeout(
      () => setDifficultyCommitted(difficultyDisplay),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [difficultyDisplay]);

  const result = useMemo(() => {
    if (coeffs.length === 0) return null;
    return computeCalculator(
      {
        gearbox,
        city_id: cityId,
        has_medical_certificate: hasMedicalCertificate,
        has_first_aid_course: hasFirstAidCourse,
        difficulty: difficultyCommitted,
      },
      coeffs,
    );
  }, [
    gearbox,
    cityId,
    hasMedicalCertificate,
    hasFirstAidCourse,
    difficultyCommitted,
    coeffs,
  ]);

  useEffect(() => {
    if (!result) return;
    const realistTotal = result.totals.find(
      (r) => r.scenario === "realist",
    )?.total;
    if (realistTotal === undefined) return;
    trackEvent("calculator_result_computed", {
      realist_total_eur: realistTotal,
      city_id: cityId,
      gearbox,
    });
  }, [result, cityId, gearbox]);

  if (coeffs.length === 0) {
    return (
      <div className="bg-warning-100 text-warning-600 rounded-md p-4">
        <p className="text-body-sm font-bold">{t.emptyDataWarning}</p>
        <a
          href={
            currentLocale === "lv"
              ? "/lv/csdd-eksameni/cenas/"
              : "/ru/ekzameny-csdd/ceny/"
          }
          className="text-body-sm underline"
        >
          {t.emptyDataLink}
        </a>
      </div>
    );
  }

  const isEstimatedFallback = result!.scenarios.some(
    (s) => s.is_estimated_fallback,
  );
  const partnerSchool = schools.find(
    (s) => s.city_id === cityId && s.is_partner && s.partner_price_eur !== null,
  );
  const realistTotal = result!.totals.find(
    (r) => r.scenario === "realist",
  )!.total;

  function handleFieldChange(field: string, value: unknown) {
    trackEvent("calculator_input_changed", { field, value });
  }

  return (
    <div>
      <fieldset className="mb-6 flex flex-col gap-4">
        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.gearboxLabel}
          </label>
          <select
            value={gearbox}
            onChange={(e) => {
              const value = e.target.value as CalculatorInput["gearbox"];
              setGearbox(value);
              handleFieldChange("gearbox", value);
            }}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="manual">{t.gearboxManual}</option>
            <option value="automatic">{t.gearboxAutomatic}</option>
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.cityLabel}
          </label>
          <select
            value={cityId}
            onChange={(e) => {
              const value = e.target.value as CityId;
              setCityId(value);
              handleFieldChange("city_id", value);
            }}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            {CITY_IDS.map((id) => (
              <option key={id} value={id}>
                {cityLabels[currentLocale][id]}
              </option>
            ))}
          </select>
        </div>

        <label className="text-body flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasMedicalCertificate}
            onChange={(e) => {
              setHasMedicalCertificate(e.target.checked);
              handleFieldChange("has_medical_certificate", e.target.checked);
            }}
          />
          {t.medicalLabel}
        </label>

        <label className="text-body flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasFirstAidCourse}
            onChange={(e) => {
              setHasFirstAidCourse(e.target.checked);
              handleFieldChange("has_first_aid_course", e.target.checked);
            }}
          />
          {t.firstAidLabel}
        </label>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.difficultyLabel}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={difficultyDisplay}
            onChange={(e) => {
              const value = Number(e.target.value);
              setDifficultyDisplay(value);
              handleFieldChange("difficulty", value);
            }}
            aria-valuetext={
              difficultyDisplay === 0
                ? `0 — ${t.difficultyEasy}`
                : difficultyDisplay === 100
                  ? `100 — ${t.difficultyHard}`
                  : String(difficultyDisplay)
            }
            className="w-full"
          />
          <div className="text-body-sm text-neutral-600 flex justify-between">
            <span>{t.difficultyEasy}</span>
            <span>{t.difficultyHard}</span>
          </div>
        </div>
      </fieldset>

      {isEstimatedFallback && (
        <p className="text-body-sm text-neutral-600 mb-4">{t.fallbackBadge}</p>
      )}

      <table className="text-body-sm mb-6 w-full border-collapse">
        <thead>
          <tr>
            <th className="border-neutral-300 border-b p-2 text-left"></th>
            {SCENARIO_ORDER.map((scenario) => (
              <th
                key={scenario}
                className="border-neutral-300 border-b p-2 text-right"
              >
                {t.scenarioLabels[scenario]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["rowSchool", "school_fee_eur"],
              ["rowPractice", "practice_fee_eur"],
              ["rowCsdd", "csdd_fee_eur"],
              ["rowMedical", "medical_fee_eur"],
            ] as const
          ).map(([labelKey, field]) => (
            <tr key={field}>
              <td className="border-neutral-300 text-neutral-600 border-b p-2">
                {t[labelKey]}
              </td>
              {SCENARIO_ORDER.map((scenario) => {
                const row = result!.scenarios.find(
                  (s) => s.scenario === scenario,
                )!;
                return (
                  <td
                    key={scenario}
                    className="text-numeric border-neutral-300 border-b p-2 text-right tabular-nums"
                  >
                    {formatEur(row[field])}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="text-neutral-900 p-2 font-bold">{t.rowTotal}</td>
            {SCENARIO_ORDER.map((scenario) => (
              <td
                key={scenario}
                className="text-numeric text-neutral-900 p-2 text-right font-bold tabular-nums"
              >
                {formatEur(
                  result!.totals.find((r) => r.scenario === scenario)!.total,
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="border-neutral-300 mb-6 rounded-md border p-4">
        <p className="text-h3 text-neutral-900 mb-2">{t.notIncludedHeading}</p>
        <ul className="text-body-sm text-neutral-600 list-disc pl-5">
          {t.notIncludedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {partnerSchool && (
        <div className="border-neutral-300 rounded-md border">
          <p className="text-h3 text-neutral-900 p-3 pb-0">
            {t.comparisonHeading}
          </p>
          <div className={comparisonRowClass}>
            <span className="text-body text-neutral-900">
              {t.averagePriceLabel}
            </span>
            <span className="text-numeric text-neutral-900 tabular-nums">
              {formatEur(realistTotal)}
            </span>
          </div>
          <div className={comparisonRowClass}>
            <span className="text-body text-neutral-900">
              {partnerSchool.name}
            </span>
            <span className="text-numeric text-neutral-900 tabular-nums">
              {formatEur(partnerSchool.partner_price_eur!)}
            </span>
          </div>
          <div className="p-3 pt-0">
            <a
              href={
                currentLocale === "lv" ? "/lv/pieteikties/" : "/ru/zapisatsya/"
              }
              onClick={() =>
                trackEvent("calculator_partner_cta_clicked", {
                  school_id: partnerSchool.id,
                })
              }
              className="text-primary-600 underline"
            >
              {t.applyToPartner}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
