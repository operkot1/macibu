import { useEffect, useState } from "react";
import {
  filterSchools,
  isNonDefaultFilter,
  DEFAULT_CATALOG_FILTERS,
  type CatalogFilterInput,
} from "../../../lib/catalog/filterSchools";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { School, RatingEntry } from "../../../types/data";

/*
 * CatalogFilters — прогрессивное улучшение поверх статического списка школ
 * в CatalogTemplate.astro (T-053, docs/06-tools/katalog-shkol.md).
 *
 * Первый рендер (SSR + первый клиентский рендер до useEffect) не рисует
 * список вообще — статический #catalog-static-list из Astro уже виден и
 * идентичен дефолтному состоянию. Только после монтирования (useEffect)
 * остров читает реальные фильтры из location.search, скрывает статический
 * список и берёт рендер на себя — тот же hydration-safety паттерн, что
 * CookieBanner/StepListInteractive/Trainer (SSR ⇔ первый клиентский рендер
 * должны совпадать байт-в-байт).
 *
 * Карточка школы здесь обязана визуально совпадать с Astro-версией в
 * CatalogTemplate.astro — при правке одной синхронно поправить другую.
 */

export interface CatalogFiltersProps {
  schools: School[];
  ratings: RatingEntry[];
  currentLocale: "lv" | "ru";
}

const CATEGORY_OPTIONS = ["B", "A"] as const;
const LANGUAGE_OPTIONS = ["lv", "ru", "en"] as const;

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
    categoryLabel: "Kategorija",
    categoryAll: "Jebkura",
    sortLabel: "Kārtot pēc",
    sortRating: "Reitinga",
    sortPriceAsc: "Cenas (lētākais)",
    sortName: "Nosaukuma",
    resetFilters: "Notīrīt filtrus",
    zeroResults: "Nav skolu pēc šiem kritērijiem.",
    city: "Pilsēta",
    languages: "Valodas",
    gearbox: "Kārba",
    priceOnRequest: "cena pēc pieprasījuma",
    partnerBadge: "Portāla partneris",
    apply: "Pieteikties",
    detailsLink: "Skolas profils",
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
    categoryLabel: "Категория",
    categoryAll: "Любая",
    sortLabel: "Сортировать по",
    sortRating: "Рейтингу",
    sortPriceAsc: "Цене (дешевле)",
    sortName: "Названию",
    resetFilters: "Сбросить фильтры",
    zeroResults: "Нет школ по этим критериям.",
    city: "Город",
    languages: "Языки",
    gearbox: "Коробка",
    priceOnRequest: "цена по запросу",
    partnerBadge: "Партнёр портала",
    apply: "Записаться",
    detailsLink: "Профиль школы",
  },
} as const;

function parseFiltersFromSearch(search: string): CatalogFilterInput {
  const params = new URLSearchParams(search);
  const sortParam = params.get("sort");
  const sort: CatalogFilterInput["sort"] =
    sortParam === "price-asc" || sortParam === "name" ? sortParam : "rating";
  return {
    sort,
    city_id: params.get("city") ?? undefined,
    gearbox:
      params.get("gearbox") === "manual" ||
      params.get("gearbox") === "automatic"
        ? (params.get("gearbox") as "manual" | "automatic")
        : undefined,
    language:
      params.get("language") === "lv" ||
      params.get("language") === "ru" ||
      params.get("language") === "en"
        ? (params.get("language") as "lv" | "ru" | "en")
        : undefined,
    category: params.get("category") ?? undefined,
  };
}

function filtersToSearch(filters: CatalogFilterInput): string {
  const params = new URLSearchParams();
  if (filters.city_id) params.set("city", filters.city_id);
  if (filters.gearbox) params.set("gearbox", filters.gearbox);
  if (filters.language) params.set("language", filters.language);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort !== "rating") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function syncRobotsMeta(shouldNoindex: boolean): void {
  const existing = document.querySelector('meta[name="robots"]');
  if (shouldNoindex) {
    if (existing) {
      existing.setAttribute("content", "noindex");
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex");
      document.head.appendChild(meta);
    }
  } else if (existing) {
    existing.remove();
  }
}

export default function CatalogFilters({
  schools,
  ratings,
  currentLocale,
}: CatalogFiltersProps) {
  const t = text[currentLocale];
  const [hydrated, setHydrated] = useState(false);
  const [filters, setFilters] = useState<CatalogFilterInput>(
    DEFAULT_CATALOG_FILTERS,
  );

  useEffect(() => {
    const realFilters = parseFiltersFromSearch(window.location.search);
    setFilters(realFilters);
    setHydrated(true);
    trackEvent("catalog_viewed");

    const staticList = document.getElementById("catalog-static-list");
    if (staticList) staticList.style.display = "none";
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    syncRobotsMeta(isNonDefaultFilter(filters));
    const search = filtersToSearch(filters);
    const url = `${window.location.pathname}${search}`;
    window.history.replaceState(null, "", url);
  }, [filters, hydrated]);

  const results = filterSchools(schools, ratings, filters);

  useEffect(() => {
    if (hydrated && results.length === 0) {
      trackEvent("catalog_zero_results", { filters });
    }
  }, [results.length, hydrated, filters]);

  function updateFilter<K extends keyof CatalogFilterInput>(
    key: K,
    value: CatalogFilterInput[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "sort") {
      trackEvent("catalog_sort_changed", { sort: value });
    } else {
      trackEvent("catalog_filter_applied", { filter: key, value });
    }
  }

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

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.categoryLabel}
          </label>
          <select
            value={filters.category ?? ""}
            onChange={(e) =>
              updateFilter(
                "category",
                e.target.value === "" ? undefined : e.target.value,
              )
            }
            className="text-body focus-visible:ring-focus-ring rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.categoryAll}</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.sortLabel}
          </label>
          <select
            value={filters.sort}
            onChange={(e) =>
              updateFilter("sort", e.target.value as CatalogFilterInput["sort"])
            }
            className="text-body focus-visible:ring-focus-ring rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="rating">{t.sortRating}</option>
            <option value="price-asc">{t.sortPriceAsc}</option>
            <option value="name">{t.sortName}</option>
          </select>
        </div>

        {isNonDefaultFilter(filters) && results.length > 0 && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_CATALOG_FILTERS)}
              className="text-primary-600 text-body-sm underline"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </fieldset>

      {hydrated && results.length === 0 && (
        <div className="border-neutral-300 rounded-md border p-4">
          <p className="text-body text-neutral-600 mb-2">{t.zeroResults}</p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_CATALOG_FILTERS)}
            className="text-primary-600 text-body-sm underline"
          >
            {t.resetFilters}
          </button>
        </div>
      )}
      {hydrated && results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {results.map((school) => (
            <li
              key={school.id}
              className="border-neutral-300 rounded-md border p-4"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-h3 text-neutral-900">{school.name}</p>
                {school.is_partner && (
                  <span className="bg-primary-100 text-primary-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {t.partnerBadge}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-neutral-600">
                {t.city}: {school.city_id} · {t.languages}:{" "}
                {school.languages.join(", ")} · {t.gearbox}:{" "}
                {school.gearbox.join(", ")}
              </p>
              <p className="text-body-sm text-neutral-900 mt-1">
                {school.partner_price_eur !== null
                  ? `${school.partner_price_eur} €`
                  : t.priceOnRequest}
              </p>
              <div className="mt-2 flex items-center gap-4">
                <a
                  href={`/${currentLocale}/skola/${school.slug}/`}
                  onClick={() =>
                    trackEvent("catalog_school_card_clicked", {
                      school_id: school.id,
                      is_partner: school.is_partner,
                    })
                  }
                  className="text-primary-600 text-body-sm underline"
                >
                  {t.detailsLink}
                </a>
                {school.is_partner && (
                  <a
                    href={
                      currentLocale === "lv"
                        ? "/lv/pieteikties/"
                        : "/ru/zapisatsya/"
                    }
                    className="text-primary-600 text-body-sm underline"
                  >
                    {t.apply}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
