import { useEffect, useState } from "react";
import { filterSigns } from "../../../lib/catalog/filterSigns";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { TrafficSign } from "../../../types/data";

/*
 * TrafficSignSearch — справочник дорожных знаков (T-109, срезы: priority
 * 201–209, mandatory 401–427, service 601–634, prohibition 301–334,
 * warning 101–143, direction — частично, 16 из 53 virzienu rādītāji,
 * information 501–556, additional 801–860 — все 8 официальных категорий
 * заполнены). Реестр (docs/02-routes.md) называет ToolPageTemplate, не
 * CatalogTemplate — тот же паттерн, что
 * FirstAidCourseList (T-070)/MedicalCheckLocation (T-072): единственный
 * client:visible остров, без zero-JS SSR-архитектуры каталога школ
 * (T-053) — та сложность оправдана SEO-важностью каталога школ, не
 * применима к лёгкому ★-инструменту-справочнику. Фильтр по категории
 * добавлен во втором срезе — при единственной категории (первый срез) он
 * был бы бессмысленным UI.
 */

export interface TrafficSignSearchProps {
  signs: TrafficSign[];
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    searchLabel: "Meklēt pēc numura vai nosaukuma",
    searchPlaceholder: 'Piemēram, 206 vai "dodiet ceļu"',
    categoryLabel: "Kategorija",
    categoryAll: "Visas kategorijas",
    zeroResults: "Nav atrasta neviena zīme pēc šī meklējuma.",
    referencePrefix: "Avots:",
  },
  ru: {
    searchLabel: "Поиск по номеру или названию",
    searchPlaceholder: "Например, 206 или «уступите дорогу»",
    categoryLabel: "Категория",
    categoryAll: "Все категории",
    zeroResults: "По этому запросу знаков не найдено.",
    referencePrefix: "Источник:",
  },
} as const;

const categoryLabels = {
  lv: {
    priority: "Priekšrocības zīmes",
    mandatory: "Rīkojuma zīmes",
    service: "Servisa zīmes",
    prohibition: "Aizlieguma zīmes",
    warning: "Brīdinājuma zīmes",
    direction: "Virzienu rādītāji",
    information: "Norādījuma zīmes",
    additional: "Papildzīmes",
  },
  ru: {
    priority: "Знаки приоритета",
    mandatory: "Знаки предписания",
    service: "Знаки сервиса",
    prohibition: "Знаки запрета",
    warning: "Предупреждающие знаки",
    direction: "Указатели направлений",
    information: "Информационные знаки",
    additional: "Таблички",
  },
} as const;

export default function TrafficSignSearch({
  signs,
  currentLocale,
}: TrafficSignSearchProps) {
  const t = text[currentLocale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TrafficSign["category"] | "">("");

  useEffect(() => trackEvent("traffic_signs_viewed"), []);

  const availableCategories = [
    ...new Set(signs.map((sign) => sign.category)),
  ] as TrafficSign["category"][];

  const results = filterSigns(
    signs,
    { query, category: category || undefined },
    currentLocale,
  );

  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length > 0) {
      trackEvent("traffic_signs_search_used", { query_length: value.length });
    }
  }

  function updateCategory(value: string) {
    const next = value as TrafficSign["category"] | "";
    setCategory(next);
    trackEvent("traffic_signs_category_filter_applied", {
      category: next || null,
    });
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label
            htmlFor="traffic-sign-search"
            className="text-body-sm mb-1 block text-neutral-600"
          >
            {t.searchLabel}
          </label>
          <input
            id="traffic-sign-search"
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          />
        </div>
        {availableCategories.length > 1 && (
          <div>
            <label
              htmlFor="traffic-sign-category"
              className="text-body-sm mb-1 block text-neutral-600"
            >
              {t.categoryLabel}
            </label>
            <select
              id="traffic-sign-category"
              value={category}
              onChange={(e) => updateCategory(e.target.value)}
              className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
            >
              <option value="">{t.categoryAll}</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[currentLocale][cat]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-body text-neutral-600">{t.zeroResults}</p>
      ) : (
        <ul
          id="traffic-sign-results"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map((sign) => (
            <li
              key={sign.id}
              className="border-neutral-300 flex flex-col gap-2 rounded-md border p-4"
            >
              <img
                src={sign.image}
                alt={currentLocale === "lv" ? sign.name_lv : sign.name_ru}
                width={96}
                height={96}
                loading="lazy"
                className="h-24 w-24 self-center"
              />
              <p className="text-h3 text-neutral-900">
                {sign.number} —{" "}
                {currentLocale === "lv" ? sign.name_lv : sign.name_ru}
              </p>
              <p className="text-body-sm text-neutral-600">
                {currentLocale === "lv" ? sign.meaning_lv : sign.meaning_ru}
              </p>
              <p className="text-body-sm text-neutral-500">
                {t.referencePrefix} {sign.official_reference}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
