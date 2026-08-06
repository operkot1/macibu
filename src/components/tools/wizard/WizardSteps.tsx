import { useEffect, useState } from "react";
import type { WizardInput } from "../../../lib/wizard/computeWizardPath";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import { CITY_IDS, cityLabels } from "../../../lib/cities";

/*
 * WizardSteps — Экран 2 (Модуль 7 §7.5), только форма из 4 шагов. Экран
 * результата — отдельный компонент, T-030. Автопереход на следующий шаг
 * по клику (без отдельной кнопки "Далее") — пропустить шаг физически
 * нельзя, до шага N нет иного пути, кроме ответа на шаги 1..N-1. Кнопки
 * "Назад" нет — в прототипе её нет, задача явно про непропускаемость
 * вперёд.
 */

export interface WizardStepsProps {
  currentLocale: "lv" | "ru";
  onComplete: (input: WizardInput) => void;
}

type AgeBracket = WizardInput["age_bracket"];
type MedicalCertificate = WizardInput["has_medical_certificate"];
type GearboxPreference = WizardInput["gearbox_preference"];

const AGE_BRACKETS: AgeBracket[] = ["16-17", "18-24", "25-35", "36+"];
const MEDICAL_VALUES: MedicalCertificate[] = ["yes", "no", "unknown"];
const GEARBOX_VALUES: GearboxPreference[] = [
  "manual",
  "automatic",
  "undecided",
];

const text = {
  lv: {
    stepLabel: (n: number) => `Solis ${n}/4`,
    q1: "Cik tev gadu?",
    ageOptions: {
      "16-17": "16–17",
      "18-24": "18–24",
      "25-35": "25–35",
      "36+": "36+",
    } as Record<AgeBracket, string>,
    q2: "Vai tev ir veselības apliecība?",
    medOptions: {
      yes: "Ir",
      no: "Nav",
      unknown: "Nezinu",
    } as Record<MedicalCertificate, string>,
    q3: "Kāda kārba?",
    gearboxOptions: {
      manual: "Mehāniskā",
      automatic: "Automātiskā",
      undecided: "Vēl nezinu",
    } as Record<GearboxPreference, string>,
    q4: "Kura pilsēta?",
    cityPlaceholder: "Izvēlies pilsētu",
  },
  ru: {
    stepLabel: (n: number) => `Шаг ${n}/4`,
    q1: "Сколько тебе лет?",
    ageOptions: {
      "16-17": "16–17",
      "18-24": "18–24",
      "25-35": "25–35",
      "36+": "36+",
    } as Record<AgeBracket, string>,
    q2: "Есть ли у тебя медсправка?",
    medOptions: {
      yes: "Есть",
      no: "Нет",
      unknown: "Не знаю",
    } as Record<MedicalCertificate, string>,
    q3: "Какая коробка?",
    gearboxOptions: {
      manual: "Механика",
      automatic: "Автомат",
      undecided: "Не решил",
    } as Record<GearboxPreference, string>,
    q4: "Какой город?",
    cityPlaceholder: "Выберите город",
  },
} as const;

const optionButtonClass =
  "text-body rounded-md border border-neutral-300 p-3 focus-visible:ring-2 focus-visible:ring-focus-ring hover:bg-neutral-100";

export default function WizardSteps({
  currentLocale,
  onComplete,
}: WizardStepsProps) {
  const t = text[currentLocale];
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ageBracket, setAgeBracket] = useState<AgeBracket | null>(null);
  const [medicalCertificate, setMedicalCertificate] =
    useState<MedicalCertificate | null>(null);
  const [gearboxPreference, setGearboxPreference] =
    useState<GearboxPreference | null>(null);

  useEffect(() => trackEvent("wizard_started"), []);

  function selectAge(value: AgeBracket) {
    setAgeBracket(value);
    trackEvent("wizard_step_completed", { step: 1, value });
    setStep(2);
  }

  function selectMedical(value: MedicalCertificate) {
    setMedicalCertificate(value);
    trackEvent("wizard_step_completed", { step: 2, value });
    setStep(3);
  }

  function selectGearbox(value: GearboxPreference) {
    setGearboxPreference(value);
    trackEvent("wizard_step_completed", { step: 3, value });
    setStep(4);
  }

  function selectCity(cityId: string) {
    if (
      ageBracket === null ||
      medicalCertificate === null ||
      gearboxPreference === null
    ) {
      return;
    }
    trackEvent("wizard_step_completed", { step: 4, value: cityId });
    onComplete({
      age_bracket: ageBracket,
      has_medical_certificate: medicalCertificate,
      gearbox_preference: gearboxPreference,
      city_id: cityId,
    });
  }

  return (
    <div aria-live="polite">
      <p className="text-body-sm text-neutral-600 mb-4">
        {t.stepLabel(step)}{" "}
        <span aria-hidden="true">
          {([1, 2, 3, 4] as const).map((n) => (n === step ? "●" : "○"))}
        </span>
      </p>

      {step === 1 && (
        <fieldset>
          <legend className="text-h3 text-neutral-900 mb-3">{t.q1}</legend>
          <div className="grid grid-cols-2 gap-2">
            {AGE_BRACKETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectAge(value)}
                className={optionButtonClass}
              >
                {t.ageOptions[value]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend className="text-h3 text-neutral-900 mb-3">{t.q2}</legend>
          <div className="flex flex-col gap-2">
            {MEDICAL_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectMedical(value)}
                className={optionButtonClass}
              >
                {t.medOptions[value]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset>
          <legend className="text-h3 text-neutral-900 mb-3">{t.q3}</legend>
          <div className="flex flex-col gap-2">
            {GEARBOX_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectGearbox(value)}
                className={optionButtonClass}
              >
                {t.gearboxOptions[value]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 4 && (
        <fieldset>
          <legend className="text-h3 text-neutral-900 mb-3">{t.q4}</legend>
          <select
            defaultValue=""
            onChange={(e) => selectCity(e.target.value)}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-3 focus-visible:ring-2"
          >
            <option value="" disabled>
              {t.cityPlaceholder}
            </option>
            {CITY_IDS.map((id) => (
              <option key={id} value={id}>
                {cityLabels[currentLocale][id]}
              </option>
            ))}
          </select>
        </fieldset>
      )}
    </div>
  );
}
