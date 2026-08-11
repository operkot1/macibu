import { useEffect, useMemo, useState } from "react";
import {
  decodePrice,
  type DecoderComponent,
} from "../../../lib/decoder/decodePrice";
import { fallbackLatviaAverage } from "../../../lib/costModel";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { CostModelCoefficients, School } from "../../../types/data";

/*
 * Decoder — Дешифратор прайса (docs/06-tools/deshifrator-prajsa.md, T-064).
 * Образовательный инструмент прозрачности: раскладывает ЛЮБУЮ введённую
 * пользователем цену на вероятные компоненты — не публикует "настоящую"
 * цену конкретной не-партнёрской школы (правило контракта, §"Назначение
 * и границы"). Выбор школы работает только для партнёров с полными
 * данными (partner_price_eur !== null) — их цена по определению полная,
 * поэтому при выборе результат всегда "уже полная цена", без missing.
 */

export interface DecoderProps {
  coeffs: CostModelCoefficients[];
  schools: School[];
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    cityLabel: "Pilsēta",
    gearboxLabel: "Kārba",
    gearboxManual: "Mehāniskā",
    gearboxAutomatic: "Automātiskā",
    priceLabel: "Reklamētā cena (€)",
    theoryLabel: "Reklamētajā cenā iekļauts teorijas kurss",
    examLabel: "Reklamētajā cenā iekļautas CSDD eksāmenu maksas",
    firstAidLabel: "Reklamētajā cenā iekļauts pirmās palīdzības kurss",
    practiceKnownLabel: "Zinu, cik braukšanas stundu iekļauts",
    practiceHoursLabel: "Braukšanas stundu skaits",
    schoolSelectLabel: "Vai šī cena ir konkrētas partnerskolas cena?",
    schoolSelectNone: "Manuāla ievade (nezināma skola)",
    schoolSelectLockedNote:
      "Cena ņemta no partnerskolas profila — pēc definīcijas jau ietver visu.",
    resultHeading: "Rezultāts",
    alreadyComplete:
      "Šī cena, šķiet, jau ir pilna — trūkstošu daļu nav atrasts.",
    missingHeading: "Iespējams, trūkst:",
    notMentioned: "nav minēts reklamētajā cenā",
    likelyTotalLabel: "Iespējamā pilnā cena",
    emptyDataWarning: "Dati par izmaksām īslaicīgi nav pieejami.",
    emptyDataLink: "CSDD oficiālie tarifi",
    componentLabels: {
      theory_course: "Teorijas kurss",
      exam_fees: "CSDD eksāmenu maksas",
      first_aid_course: "Pirmās palīdzības kurss",
      extra_practice_hours: "Papildu braukšanas stundas",
    } as Record<DecoderComponent, string>,
  },
  ru: {
    cityLabel: "Город",
    gearboxLabel: "Коробка",
    gearboxManual: "Механика",
    gearboxAutomatic: "Автомат",
    priceLabel: "Рекламируемая цена (€)",
    theoryLabel: "В рекламируемую цену включён теоретический курс",
    examLabel: "В рекламируемую цену включены экзаменационные сборы CSDD",
    firstAidLabel: "В рекламируемую цену включён курс первой помощи",
    practiceKnownLabel: "Знаю, сколько часов вождения включено",
    practiceHoursLabel: "Количество часов вождения",
    schoolSelectLabel: "Это цена конкретной школы-партнёра?",
    schoolSelectNone: "Ручной ввод (школа неизвестна)",
    schoolSelectLockedNote:
      "Цена взята из профиля школы-партнёра — по определению уже включает всё.",
    resultHeading: "Результат",
    alreadyComplete:
      "Похоже, эта цена уже полная — недостающих частей не найдено.",
    missingHeading: "Возможно, не хватает:",
    notMentioned: "не упомянуто в рекламируемой цене",
    likelyTotalLabel: "Вероятная полная цена",
    emptyDataWarning: "Данные о стоимости временно недоступны.",
    emptyDataLink: "Официальные тарифы CSDD",
    componentLabels: {
      theory_course: "Теоретический курс",
      exam_fees: "Экзаменационные сборы CSDD",
      first_aid_course: "Курс первой помощи",
      extra_practice_hours: "Дополнительные часы вождения",
    } as Record<DecoderComponent, string>,
  },
} as const;

function formatEur(value: number): string {
  return `${value.toLocaleString("lv-LV", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

export default function Decoder({
  coeffs,
  schools,
  currentLocale,
}: DecoderProps) {
  const t = text[currentLocale];
  const partnerSchools = schools.filter(
    (s) => s.is_partner && s.partner_price_eur !== null,
  );

  const [cityId, setCityId] = useState<CityId>("riga");
  const [gearbox, setGearbox] = useState<"manual" | "automatic">("manual");
  const [advertisedPrice, setAdvertisedPrice] = useState(500);
  const [includedTheory, setIncludedTheory] = useState(false);
  const [includedExam, setIncludedExam] = useState(false);
  const [includedFirstAid, setIncludedFirstAid] = useState(false);
  const [practiceKnown, setPracticeKnown] = useState(false);
  const [practiceHours, setPracticeHours] = useState(20);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  useEffect(() => trackEvent("decoder_started"), []);

  const selectedSchool = selectedSchoolId
    ? (partnerSchools.find((s) => s.id === selectedSchoolId) ?? null)
    : null;

  const effectivePrice = selectedSchool
    ? selectedSchool.partner_price_eur!
    : advertisedPrice;
  const effectiveIncluded = selectedSchool
    ? {
        theory_course: true,
        exam_fees: true,
        first_aid_course: true,
        practice_hours_count: 20,
      }
    : {
        theory_course: includedTheory,
        exam_fees: includedExam,
        first_aid_course: includedFirstAid,
        practice_hours_count: practiceKnown ? practiceHours : null,
      };

  const result = useMemo(() => {
    if (coeffs.length === 0) return null;
    const cost =
      coeffs.find(
        (c) =>
          c.city_id === cityId &&
          c.gearbox === gearbox &&
          c.scenario === "realist",
      ) ?? fallbackLatviaAverage(coeffs, gearbox, "realist");
    return decodePrice(
      {
        advertised_price_eur: effectivePrice,
        included: effectiveIncluded,
        city_id: cityId,
        gearbox,
      },
      cost,
    );
  }, [coeffs, cityId, gearbox, effectivePrice, effectiveIncluded]);

  useEffect(() => {
    if (!result) return;
    trackEvent("decoder_result_viewed", {
      missing_count: result.missing.length,
      likely_total_eur: result.likely_total_eur,
    });
  }, [result]);

  function handleSchoolChange(value: string) {
    if (value === "") {
      setSelectedSchoolId(null);
      return;
    }
    setSelectedSchoolId(value);
    trackEvent("decoder_school_selected", { school_id: value });
  }

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

  return (
    <div>
      <fieldset className="mb-6 flex flex-col gap-4">
        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.schoolSelectLabel}
          </label>
          <select
            value={selectedSchoolId ?? ""}
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.schoolSelectNone}</option>
            {partnerSchools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.cityLabel}
          </label>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value as CityId)}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            {CITY_IDS.map((id) => (
              <option key={id} value={id}>
                {cityLabels[currentLocale][id]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.gearboxLabel}
          </label>
          <select
            value={gearbox}
            onChange={(e) =>
              setGearbox(e.target.value as "manual" | "automatic")
            }
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="manual">{t.gearboxManual}</option>
            <option value="automatic">{t.gearboxAutomatic}</option>
          </select>
        </div>

        {selectedSchool ? (
          <p className="text-body-sm text-neutral-600">
            {t.schoolSelectLockedNote}
          </p>
        ) : (
          <>
            <div>
              <label className="text-body-sm text-neutral-600 mb-1 block">
                {t.priceLabel}
              </label>
              <input
                type="number"
                min={0}
                value={advertisedPrice}
                onChange={(e) => setAdvertisedPrice(Number(e.target.value))}
                onBlur={() =>
                  trackEvent("decoder_manual_price_entered", {
                    advertised_price_eur: advertisedPrice,
                  })
                }
                className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
              />
            </div>

            <label className="text-body flex items-center gap-2">
              <input
                type="checkbox"
                checked={includedTheory}
                onChange={(e) => setIncludedTheory(e.target.checked)}
              />
              {t.theoryLabel}
            </label>
            <label className="text-body flex items-center gap-2">
              <input
                type="checkbox"
                checked={includedExam}
                onChange={(e) => setIncludedExam(e.target.checked)}
              />
              {t.examLabel}
            </label>
            <label className="text-body flex items-center gap-2">
              <input
                type="checkbox"
                checked={includedFirstAid}
                onChange={(e) => setIncludedFirstAid(e.target.checked)}
              />
              {t.firstAidLabel}
            </label>

            <label className="text-body flex items-center gap-2">
              <input
                type="checkbox"
                checked={practiceKnown}
                onChange={(e) => setPracticeKnown(e.target.checked)}
              />
              {t.practiceKnownLabel}
            </label>
            {practiceKnown && (
              <div>
                <label className="text-body-sm text-neutral-600 mb-1 block">
                  {t.practiceHoursLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  value={practiceHours}
                  onChange={(e) => setPracticeHours(Number(e.target.value))}
                  className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
                />
              </div>
            )}
          </>
        )}
      </fieldset>

      {result && (
        <div className="border-neutral-300 rounded-md border p-4">
          <p className="text-h3 text-neutral-900 mb-2">{t.resultHeading}</p>
          {result.missing.length === 0 ? (
            <p className="text-body text-neutral-900">{t.alreadyComplete}</p>
          ) : (
            <>
              <p className="text-body-sm text-neutral-600 mb-2">
                {t.missingHeading}
              </p>
              <ul className="mb-3 flex flex-col gap-1">
                {result.missing.map((m) => (
                  <li
                    key={m.component}
                    className="text-body-sm text-neutral-900 flex justify-between"
                  >
                    <span>
                      {t.componentLabels[m.component]}{" "}
                      <span className="text-neutral-600">
                        ({t.notMentioned})
                      </span>
                    </span>
                    <span className="text-numeric tabular-nums">
                      {formatEur(m.typical_eur)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="border-neutral-300 mt-2 flex justify-between border-t pt-2">
            <span className="text-body font-bold">{t.likelyTotalLabel}</span>
            <span className="text-numeric font-bold tabular-nums">
              {formatEur(result.likely_total_eur)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
