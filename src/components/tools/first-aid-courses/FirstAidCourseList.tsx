import { useEffect, useState } from "react";
import {
  filterFirstAidProviders,
  type FirstAidProviderFilters,
} from "../../../lib/catalog/filterFirstAidProviders";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { FirstAidProvider } from "../../../types/data";

/*
 * FirstAidCourseList — упрощённый каталог курсов первой palīdzības
 * (T-070). В отличие от CatalogFilters (T-053) — не нужен zero-JS SSR-
 * список: реестр (docs/02-routes.md) называет для этого маршрута
 * ToolPageTemplate, не CatalogTemplate — тот же паттерн, что
 * Calculator/Decoder (единственный client:visible остров, без
 * прогрессивного улучшения). Нет рейтинга/gearbox/языка — только город.
 */

export interface FirstAidCourseListProps {
  providers: FirstAidProvider[];
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    cityLabel: "Pilsēta",
    cityAll: "Visas pilsētas",
    phone: "Tālrunis",
    website: "Mājaslapa",
    noPhone: "Tālrunis nav norādīts",
    zeroResults: "Nav kursu šajā pilsētā.",
  },
  ru: {
    cityLabel: "Город",
    cityAll: "Все города",
    phone: "Телефон",
    website: "Сайт",
    noPhone: "Телефон не указан",
    zeroResults: "В этом городе курсов нет.",
  },
} as const;

export default function FirstAidCourseList({
  providers,
  currentLocale,
}: FirstAidCourseListProps) {
  const t = text[currentLocale];
  const [filters, setFilters] = useState<FirstAidProviderFilters>({});

  useEffect(() => trackEvent("first_aid_courses_viewed"), []);

  const results = filterFirstAidProviders(providers, filters);

  function updateCity(cityId: string) {
    const next = cityId === "" ? {} : { city_id: cityId };
    setFilters(next);
    trackEvent("first_aid_courses_filter_applied", { city_id: cityId || null });
  }

  return (
    <div>
      <div className="mb-6">
        <label className="text-body-sm text-neutral-600 mb-1 block">
          {t.cityLabel}
        </label>
        <select
          value={filters.city_id ?? ""}
          onChange={(e) => updateCity(e.target.value)}
          className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
        >
          <option value="">{t.cityAll}</option>
          {CITY_IDS.map((id: CityId) => (
            <option key={id} value={id}>
              {cityLabels[currentLocale][id]}
            </option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <p className="text-body text-neutral-600">{t.zeroResults}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((provider) => (
            <li
              key={provider.id}
              className="border-neutral-300 rounded-md border p-4"
            >
              <p className="text-h3 text-neutral-900">{provider.name}</p>
              <p className="text-body-sm text-neutral-600">
                {provider.address}
              </p>
              <p className="text-body-sm text-neutral-600">
                {t.phone}: {provider.phone ?? t.noPhone}
              </p>
              {provider.website && (
                <p className="text-body-sm">
                  <a
                    href={provider.website}
                    className="text-primary-600 underline"
                  >
                    {t.website}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
