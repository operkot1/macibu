import type { WizardResult as WizardResultData } from "../../../types/data";

/*
 * WizardResult — Экран 2, нижняя часть (Модуль 7 §7.5). Только карточки
 * шагов + итог + дедлайн. "Сохранить путь"/"Что дальше?" — отдельный
 * компонент SavePathButton.tsx (T-031), собирается рядом на реальном
 * route (T-032), не внутри этого компонента.
 *
 * Заголовок "~N месяцев" в прототипе не соответствует ни одному полю
 * WizardResult (только duration_label по шагам) — честно парсится и
 * суммируется здесь, не хардкодится: середина диапазона каждого шага,
 * конвертация дни/недели/месяцы → дни, сумма → месяцы, округление.
 * Цены по шагам — точные из тарифа, не диапазоны, как в мокапе (у нас
 * есть точные данные, показывать вымышленный диапазон было бы нечестно).
 */

export interface WizardResultProps {
  result: WizardResultData;
  currentLocale: "lv" | "ru";
}

type StepId = WizardResultData["computed_steps"][number]["step_id"];

const stepLabels: Record<string, { lv: string; ru: string }> = {
  "medical-certificate": { lv: "Veselības apliecība", ru: "Медсправка" },
  "white-license": { lv: "Baltā apliecība", ru: "Белые права" },
  "choose-school": { lv: "Skolas izvēle", ru: "Выбор школы" },
  "theory-course": {
    lv: "Teorijas kurss (11 moduļi)",
    ru: "Теория (11 модулей)",
  },
  "first-aid-course": { lv: "Pirmā palīdzība", ru: "Первая помощь" },
  "theory-exam": { lv: "Teorijas eksāmens", ru: "Экзамен теории" },
  practice: { lv: "Prakse", ru: "Практика" },
  "driving-exam": { lv: "Braukšanas eksāmens", ru: "Экзамен вождения" },
  "plastic-card": { lv: "Plastikāta karte", ru: "Пластик" },
};

const text = {
  lv: {
    title: (steps: number, months: number) =>
      `Tavs ceļš: ${steps} soļi, ~${months} mēn.`,
    approxTotal: "Aptuveni",
    deadlineLabel: "Tavs termiņš",
    deadlineRule: "braukšanas eksāmens — līdz 3 gadiem no reģistrācijas",
    deadlineDate: "Datums",
  },
  ru: {
    title: (steps: number, months: number) =>
      `Твой путь: ${steps} шагов, ~${months} мес.`,
    approxTotal: "Ориентировочно",
    deadlineLabel: "Твой дедлайн",
    deadlineRule: "экзамен вождения — до 3 лет с регистрации",
    deadlineDate: "Дата",
  },
} as const;

function formatEur(value: number): string {
  return `${value.toLocaleString("lv-LV", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

function parseDurationToDays(label: string): number {
  const match = /^(\d+)(?:-(\d+))?(д|н|м)$/.exec(label);
  if (!match) return 0;
  const from = Number(match[1]);
  const to = match[2] ? Number(match[2]) : from;
  const mid = (from + to) / 2;
  const daysPerUnit = match[3] === "д" ? 1 : match[3] === "н" ? 7 : 30;
  return mid * daysPerUnit;
}

function estimateDurationMonths(
  steps: WizardResultData["computed_steps"],
): number {
  const totalDays = steps.reduce(
    (sum, s) => sum + parseDurationToDays(s.duration_label),
    0,
  );
  return Math.max(1, Math.round(totalDays / 30));
}

function formatDate(iso: string, locale: "lv" | "ru"): string {
  return new Date(iso).toLocaleDateString(locale === "lv" ? "lv-LV" : "ru-LV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function WizardResult({
  result,
  currentLocale,
}: WizardResultProps) {
  const t = text[currentLocale];
  const months = estimateDurationMonths(result.computed_steps);

  return (
    <div>
      <h2 className="text-h2 text-neutral-900 mb-1">
        {t.title(result.computed_steps.length, months)}
      </h2>
      <p className="text-numeric text-neutral-900 mb-4 tabular-nums">
        {t.approxTotal} {formatEur(result.computed_total_eur)}
      </p>

      <ol className="mb-6 flex flex-col gap-2">
        {result.computed_steps.map((step, index) => {
          const label =
            stepLabels[step.step_id as StepId]?.[currentLocale] ?? step.step_id;
          return (
            <li
              key={step.step_id}
              className="border-neutral-300 flex items-center gap-3 rounded-md border p-3"
            >
              <span
                className="bg-neutral-100 text-neutral-900 text-body-sm flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-body text-neutral-900 flex-1">{label}</span>
              {step.duration_label && (
                <span className="text-body-sm text-neutral-600">
                  {step.duration_label}
                </span>
              )}
              <span className="text-numeric text-neutral-900 tabular-nums">
                {formatEur(step.price_eur)}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="bg-warning-100 text-warning-600 rounded-md p-4">
        <p className="text-body-sm font-bold">{t.deadlineLabel}</p>
        <p className="text-body-sm">{t.deadlineRule}</p>
        <p className="text-body-sm">
          {t.deadlineDate}:{" "}
          {formatDate(result.computed_deadline, currentLocale)}
        </p>
      </div>
    </div>
  );
}
