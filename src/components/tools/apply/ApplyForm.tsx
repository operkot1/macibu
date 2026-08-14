import { useId, useState } from "react";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";

/*
 * ApplyForm — поля заявки (T-076): критерии подбора + контакты, с
 * клиентской валидацией. Сознательно НЕ включает: список подходящих школ
 * (нужен matchSchools.ts, T-077), чекбокс согласия (текст — юридический
 * артефакт T-074, до его появления писать плейсхолдер значило бы
 * выдумывать юридический текст) и реальную отправку лида (T-078).
 * `onValidSubmit` — единственная точка расширения: вызывается с
 * провалидированными данными, дальнейшая судьба (подбор/доставка/
 * аналитика ступени 8) — задача вызывающего кода, не этого компонента.
 */

export type Timeframe =
  "asap" | "within-month" | "within-3-months" | "flexible";
export type Schedule =
  "weekday-daytime" | "weekday-evening" | "weekend" | "flexible";

export interface ApplyFormValues {
  city_id: CityId;
  category: "B";
  gearbox: "manual" | "automatic";
  language: "lv" | "ru" | "en";
  timeframe: Timeframe;
  schedule: Schedule;
  name: string;
  phone: string;
}

export interface ApplyFormProps {
  currentLocale: "lv" | "ru";
  onValidSubmit?: (values: ApplyFormValues) => void;
}

const DEFAULT_VALUES: ApplyFormValues = {
  city_id: "riga",
  category: "B",
  gearbox: "manual",
  language: "lv",
  timeframe: "flexible",
  schedule: "flexible",
  name: "",
  phone: "",
};

const text = {
  lv: {
    cityLabel: "Pilsēta",
    categoryLabel: "Kategorija",
    categoryOnlyB: "B — pagaidām vienīgā pieejamā kategorija",
    gearboxLabel: "Kārba",
    gearboxManual: "Mehāniskā",
    gearboxAutomatic: "Automātiskā",
    languageLabel: "Valoda",
    languageLv: "Latviešu",
    languageRu: "Krievu",
    languageEn: "Angļu",
    timeframeLabel: "Vēlamais sākuma termiņš",
    timeframeAsap: "Pēc iespējas ātrāk",
    timeframeWithinMonth: "Mēneša laikā",
    timeframeWithin3Months: "3 mēnešu laikā",
    timeframeFlexible: "Nav svarīgi",
    scheduleLabel: "Vēlamais grafiks",
    scheduleWeekdayDaytime: "Darba dienās, dienā",
    scheduleWeekdayEvening: "Darba dienās, vakarā",
    scheduleWeekend: "Nedēļas nogalēs",
    scheduleFlexible: "Nav svarīgi",
    nameLabel: "Vārds, uzvārds",
    nameRequired: "Norādi vārdu un uzvārdu.",
    phoneLabel: "Tālrunis",
    phoneRequired: "Norādi tālruņa numuru.",
    phoneInvalid:
      "Tālruņa numurs izskatās nepareizs — izmanto ciparus, atstarpes un +.",
    submit: "Turpināt",
  },
  ru: {
    cityLabel: "Город",
    categoryLabel: "Категория",
    categoryOnlyB: "B — пока единственная доступная категория",
    gearboxLabel: "Коробка",
    gearboxManual: "Механика",
    gearboxAutomatic: "Автомат",
    languageLabel: "Язык",
    languageLv: "Латышский",
    languageRu: "Русский",
    languageEn: "Английский",
    timeframeLabel: "Желаемый срок начала",
    timeframeAsap: "Как можно скорее",
    timeframeWithinMonth: "В течение месяца",
    timeframeWithin3Months: "В течение 3 месяцев",
    timeframeFlexible: "Не важно",
    scheduleLabel: "Желаемый график",
    scheduleWeekdayDaytime: "Будни, днём",
    scheduleWeekdayEvening: "Будни, вечером",
    scheduleWeekend: "Выходные",
    scheduleFlexible: "Не важно",
    nameLabel: "Имя, фамилия",
    nameRequired: "Укажи имя и фамилию.",
    phoneLabel: "Телефон",
    phoneRequired: "Укажи номер телефона.",
    phoneInvalid:
      "Номер телефона выглядит некорректно — используй цифры, пробелы и +.",
    submit: "Продолжить",
  },
} as const;

const PHONE_PATTERN = /^[\d+\s-]{6,}$/;

interface FormErrors {
  name?: string;
  phone?: string;
}

function validate(
  values: ApplyFormValues,
  t: (typeof text)[keyof typeof text],
): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length === 0) {
    errors.name = t.nameRequired;
  }
  if (values.phone.trim().length === 0) {
    errors.phone = t.phoneRequired;
  } else if (!PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = t.phoneInvalid;
  }
  return errors;
}

const selectClass =
  "text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2";
const inputClass = selectClass;
const labelClass = "text-body-sm text-neutral-600 mb-1 block";

export default function ApplyForm({
  currentLocale,
  onValidSubmit,
}: ApplyFormProps) {
  const t = text[currentLocale];
  const [values, setValues] = useState<ApplyFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const nameErrorId = useId();
  const phoneErrorId = useId();

  function update<K extends keyof ApplyFormValues>(
    key: K,
    value: ApplyFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(values, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onValidSubmit?.(values);
    }
  }

  const nameError = submitted ? errors.name : undefined;
  const phoneError = submitted ? errors.phone : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset className="mb-6 flex flex-col gap-4">
        <legend className="sr-only">{t.cityLabel}</legend>

        <div>
          <label className={labelClass} htmlFor="apply-city">
            {t.cityLabel}
          </label>
          <select
            id="apply-city"
            value={values.city_id}
            onChange={(e) => update("city_id", e.target.value as CityId)}
            className={selectClass}
          >
            {CITY_IDS.map((id: CityId) => (
              <option key={id} value={id}>
                {cityLabels[currentLocale][id]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-category">
            {t.categoryLabel}
          </label>
          <select
            id="apply-category"
            value={values.category}
            disabled
            className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="B">{t.categoryOnlyB}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-gearbox">
            {t.gearboxLabel}
          </label>
          <select
            id="apply-gearbox"
            value={values.gearbox}
            onChange={(e) =>
              update("gearbox", e.target.value as ApplyFormValues["gearbox"])
            }
            className={selectClass}
          >
            <option value="manual">{t.gearboxManual}</option>
            <option value="automatic">{t.gearboxAutomatic}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-language">
            {t.languageLabel}
          </label>
          <select
            id="apply-language"
            value={values.language}
            onChange={(e) =>
              update("language", e.target.value as ApplyFormValues["language"])
            }
            className={selectClass}
          >
            <option value="lv">{t.languageLv}</option>
            <option value="ru">{t.languageRu}</option>
            <option value="en">{t.languageEn}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-timeframe">
            {t.timeframeLabel}
          </label>
          <select
            id="apply-timeframe"
            value={values.timeframe}
            onChange={(e) => update("timeframe", e.target.value as Timeframe)}
            className={selectClass}
          >
            <option value="asap">{t.timeframeAsap}</option>
            <option value="within-month">{t.timeframeWithinMonth}</option>
            <option value="within-3-months">{t.timeframeWithin3Months}</option>
            <option value="flexible">{t.timeframeFlexible}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-schedule">
            {t.scheduleLabel}
          </label>
          <select
            id="apply-schedule"
            value={values.schedule}
            onChange={(e) => update("schedule", e.target.value as Schedule)}
            className={selectClass}
          >
            <option value="weekday-daytime">{t.scheduleWeekdayDaytime}</option>
            <option value="weekday-evening">{t.scheduleWeekdayEvening}</option>
            <option value="weekend">{t.scheduleWeekend}</option>
            <option value="flexible">{t.scheduleFlexible}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-name">
            {t.nameLabel}
          </label>
          <input
            id="apply-name"
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={nameError ? "true" : undefined}
            aria-describedby={nameError ? nameErrorId : undefined}
            className={inputClass}
          />
          {nameError && (
            <p
              id={nameErrorId}
              className="text-danger-600 bg-danger-100 text-body-sm mt-1 rounded p-2"
            >
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="apply-phone">
            {t.phoneLabel}
          </label>
          <input
            id="apply-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={phoneError ? "true" : undefined}
            aria-describedby={phoneError ? phoneErrorId : undefined}
            className={inputClass}
          />
          {phoneError && (
            <p
              id={phoneErrorId}
              className="text-danger-600 bg-danger-100 text-body-sm mt-1 rounded p-2"
            >
              {phoneError}
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 active:bg-primary-700 focus-visible:ring-focus-ring rounded-md px-4 py-2 font-bold text-white focus-visible:ring-2"
      >
        {t.submit}
      </button>
    </form>
  );
}
