import { useEffect, useState } from "react";
import {
  joinRatingSubjects,
  type RatingSubjectFilters,
} from "../../../lib/ratings/joinRatingSubjects";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { School, Instructor, RatingEntry } from "../../../types/data";

/*
 * RatingList — общий остров для рейтинга школ (p3-reitings, T-056) и
 * инструкторов (p3-instruktori, T-057), докс rejting-shkol.md /
 * rejting-instruktorov.md. Строится на ToolPageTemplate (T-032) —
 * отдельный RatingTemplate не нужен, у экранов нет отличий в разметке
 * страницы от любого другого инструмента (в отличие от каталога, T-053,
 * где было реальное требование "работает без JS"), тот же вывод, что
 * T-039 сделал для PillarIndexTemplate/SubsectionIndexTemplate.
 *
 * Сортировка НЕ настраивается пользователем — только фильтры (город,
 * коробка, язык), порядок всегда из ratings.json (T-052), не
 * пересчитывается на клиенте.
 *
 * Данные полностью проп-driven (фикстуры), SSR/первый клиентский рендер
 * не расходятся — в отличие от CatalogFilters (T-053), здесь не нужен
 * null-до-гидратации паттерн.
 */

interface RatingListPropsBase {
  ratingEntries: RatingEntry[];
  currentLocale: "lv" | "ru";
}

export type RatingListProps =
  | (RatingListPropsBase & { subjectType: "school"; subjects: School[] })
  | (RatingListPropsBase & {
      subjectType: "instructor";
      subjects: Instructor[];
      schools: School[];
    });

const text = {
  lv: {
    cityLabel: "Pilsēta",
    cityAll: "Visas pilsētas",
    gearboxLabel: "Kārba",
    gearboxAll: "Jebkura",
    gearboxManual: "Mehāniskā",
    gearboxAutomatic: "Automātiskā",
    languageLabel: "Valoda",
    languageAll: "Jebkura",
    confidenceSufficient: "ⓘ Izlase pietiekama",
    confidenceLimited: "Izlase ierobežota — ņem vērā piesardzīgi",
    confidenceInsufficient: "⚠ Izlase maza — reitings nav uzticams",
    partnerBadge: "Portāla partneris",
    unrankedHeading: "Vēl nav CSDD statistikas",
    methodologyLink: "Kā mēs to aprēķinām?",
    notCalculated: "Reitings vēl nav aprēķināts.",
    students: "skolēni",
  },
  ru: {
    cityLabel: "Город",
    cityAll: "Все города",
    gearboxLabel: "Коробка",
    gearboxAll: "Любая",
    gearboxManual: "Механика",
    gearboxAutomatic: "Автомат",
    languageLabel: "Язык",
    languageAll: "Любой",
    confidenceSufficient: "ⓘ Выборка достаточная",
    confidenceLimited: "Выборка ограничена — учитывайте с осторожностью",
    confidenceInsufficient: "⚠ Выборка мала — рейтинг недостоверен",
    partnerBadge: "Партнёр портала",
    unrankedHeading: "Пока нет статистики CSDD",
    methodologyLink: "Как мы это считаем?",
    notCalculated: "Рейтинг пока не рассчитан.",
    students: "учеников",
  },
} as const;

const LANGUAGE_OPTIONS = ["lv", "ru", "en"] as const;

function confidenceText(
  confidence: RatingEntry["confidence"],
  t: (typeof text)[keyof typeof text],
): string {
  if (confidence === "sufficient") return t.confidenceSufficient;
  if (confidence === "limited") return t.confidenceLimited;
  return t.confidenceInsufficient;
}

function progressBar(passRate: number): string {
  const filled = Math.round(passRate * 10);
  return "▓".repeat(filled) + "░".repeat(10 - filled);
}

export default function RatingList(props: RatingListProps) {
  const { ratingEntries, currentLocale, subjectType } = props;
  const t = text[currentLocale];
  const [filters, setFilters] = useState<RatingSubjectFilters>({});

  useEffect(() => {
    trackEvent("rating_viewed", { subject_type: subjectType });
  }, [subjectType]);

  const relevantEntries = ratingEntries.filter(
    (e) => e.subject_type === subjectType,
  );

  const { ranked, unranked } =
    props.subjectType === "school"
      ? joinRatingSubjects(props.subjects, ratingEntries, "school", filters)
      : joinRatingSubjects(
          props.subjects,
          ratingEntries,
          "instructor",
          filters,
        );

  useEffect(() => {
    for (const entry of ranked) {
      if (entry.confidence === "insufficient") {
        trackEvent("rating_low_confidence_badge_viewed", {
          [subjectType === "school" ? "school_id" : "instructor_id"]:
            entry.subject.id,
        });
      }
    }
  }, [ranked, subjectType]);

  if (relevantEntries.length === 0) {
    return <p className="text-body text-neutral-600">{t.notCalculated}</p>;
  }

  const schoolsById =
    props.subjectType === "instructor"
      ? new Map(props.schools.map((school) => [school.id, school]))
      : null;

  function updateFilter<K extends keyof RatingSubjectFilters>(
    key: K,
    value: RatingSubjectFilters[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    trackEvent("rating_filter_applied", { filter: key, value });
  }

  const methodologyHref =
    currentLocale === "lv"
      ? "/lv/autoskolas/metodologija/"
      : "/ru/avtoshkoly/metodologiya/";

  return (
    <div>
      <fieldset className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.cityLabel}
          </label>
          <select
            value={filters.city_id ?? ""}
            onChange={(e) =>
              updateFilter(
                "city_id",
                e.target.value === "" ? undefined : e.target.value,
              )
            }
            className="text-body focus-visible:ring-focus-ring rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.cityAll}</option>
            {CITY_IDS.map((id: CityId) => (
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
            value={filters.gearbox ?? ""}
            onChange={(e) =>
              updateFilter(
                "gearbox",
                e.target.value === ""
                  ? undefined
                  : (e.target.value as "manual" | "automatic"),
              )
            }
            className="text-body focus-visible:ring-focus-ring rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.gearboxAll}</option>
            <option value="manual">{t.gearboxManual}</option>
            <option value="automatic">{t.gearboxAutomatic}</option>
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.languageLabel}
          </label>
          <select
            value={filters.language ?? ""}
            onChange={(e) =>
              updateFilter(
                "language",
                e.target.value === ""
                  ? undefined
                  : (e.target.value as "lv" | "ru" | "en"),
              )
            }
            className="text-body focus-visible:ring-focus-ring rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.languageAll}</option>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <ol className="flex flex-col gap-3">
        {ranked.map((entry) => {
          const isSchool = subjectType === "school";
          const name = isSchool
            ? (entry.subject as School).name
            : (entry.subject as Instructor).full_name;
          const schoolName =
            !isSchool && schoolsById
              ? (schoolsById.get((entry.subject as Instructor).school_id)
                  ?.name ?? null)
              : null;

          return (
            <li
              key={entry.subject.id}
              className="border-neutral-300 rounded-md border p-4"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-h3 text-neutral-900">
                  {entry.rank}. {name}
                </p>
                {isSchool && (entry.subject as School).is_partner && (
                  <span className="bg-primary-100 text-primary-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {t.partnerBadge}
                  </span>
                )}
              </div>
              {schoolName && (
                <p className="text-body-sm text-neutral-600">{schoolName}</p>
              )}
              {!isSchool && (
                <p
                  className="text-numeric text-neutral-900 tabular-nums"
                  aria-hidden="true"
                >
                  {progressBar(entry.pass_rate)}
                </p>
              )}
              <p className="text-body-sm text-neutral-600">
                {Math.round(entry.pass_rate * 100)}% · {entry.sample_size}{" "}
                {t.students}
              </p>
              <p className="text-body-sm text-neutral-600">
                {confidenceText(entry.confidence, t)}
              </p>
            </li>
          );
        })}
      </ol>

      {unranked.length > 0 && (
        <div className="mt-6">
          <p className="text-h3 text-neutral-900 mb-2">{t.unrankedHeading}</p>
          <ul className="flex flex-col gap-2">
            {unranked.map((subject) => (
              <li key={subject.id} className="text-body-sm text-neutral-600">
                {subjectType === "school"
                  ? (subject as School).name
                  : (subject as Instructor).full_name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={methodologyHref}
        onClick={() => trackEvent("rating_methodology_link_clicked")}
        className="text-primary-600 text-body-sm mt-4 inline-block underline"
      >
        {t.methodologyLink}
      </a>
    </div>
  );
}
