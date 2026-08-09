import { useState } from "react";
import { computeTheoryValidityDeadline } from "../../../lib/deadlines/computeTheoryValidityDeadline";
import { trackEvent } from "../../../lib/analytics/trackEvent";

/*
 * DeadlineCalc — мини-инструмент «Посчитать мой дедлайн»
 * (docs/06-tools/ekran-ne-sdal.md, T-048). Только сам калькулятор —
 * не весь экран «Не сдал» (это T-049b). Состояния: default →
 * deadline-input-open → deadline-computed (→ deadline-warning, если
 * осталось <30 дней — факт, не паника, тот же тон, что требует контракт).
 *
 * Дата сдачи теории — не PII, единственное поле ввода на всём экране
 * «Не сдал» (докс, «Критерии приёмки»).
 */

export interface DeadlineCalcProps {
  currentLocale: "lv" | "ru";
}

const WARNING_THRESHOLD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const text = {
  lv: {
    cta: "Aprēķināt manu termiņu",
    label: "Kad kārtoji teorijas eksāmenu?",
    submit: "Aprēķināt",
    deadlineLabel: "Teorija derīga līdz",
    daysRemaining: (n: number) => `Atlikušas ${n} dienas`,
    warningNote:
      "Mazāk par 30 dienām — varētu būt vērts ieplānot braukšanas eksāmenu jau tagad.",
  },
  ru: {
    cta: "Посчитать мой дедлайн",
    label: "Когда ты сдал(а) теоретический экзамен?",
    submit: "Рассчитать",
    deadlineLabel: "Теория действует до",
    daysRemaining: (n: number) => `Осталось ${n} дней`,
    warningNote:
      "Меньше 30 дней — возможно, стоит запланировать экзамен вождения уже сейчас.",
  },
} as const;

export default function DeadlineCalc({ currentLocale }: DeadlineCalcProps) {
  const t = text[currentLocale];
  const [open, setOpen] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  function handleCompute() {
    if (!examDate) return;
    const parsed = new Date(`${examDate}T00:00:00Z`);
    const computedDeadline = computeTheoryValidityDeadline(parsed);
    const days = Math.round(
      (computedDeadline.getTime() - Date.now()) / MS_PER_DAY,
    );
    setDeadline(computedDeadline);
    setDaysRemaining(days);
    trackEvent("deadline_calculated", { days_remaining: days });
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString(currentLocale === "lv" ? "lv-LV" : "ru-LV", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body border-neutral-300 focus-visible:ring-focus-ring rounded-md border p-3 hover:bg-neutral-100 focus-visible:ring-2"
      >
        {t.cta}
      </button>
    );
  }

  return (
    <div className="border-neutral-300 rounded-md border p-4">
      {!deadline && (
        <>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.label}
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={examDate}
              max={todayIsoDate()}
              onChange={(e) => setExamDate(e.target.value)}
              className="text-body focus-visible:ring-focus-ring flex-1 rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
            />
            <button
              type="button"
              onClick={handleCompute}
              className="text-body bg-neutral-900 rounded-md p-2 px-4 text-white"
            >
              {t.submit}
            </button>
          </div>
        </>
      )}
      {deadline && daysRemaining !== null && (
        <div
          className={
            daysRemaining < WARNING_THRESHOLD_DAYS
              ? "bg-danger-100 text-danger-600 rounded-md p-3"
              : ""
          }
        >
          <p className="text-body-sm font-bold">
            {t.deadlineLabel}: {formatDate(deadline)}
          </p>
          <p className="text-body-sm">{t.daysRemaining(daysRemaining)}</p>
          {daysRemaining < WARNING_THRESHOLD_DAYS && (
            <p className="text-body-sm mt-1">{t.warningNote}</p>
          )}
        </div>
      )}
    </div>
  );
}
