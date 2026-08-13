import { useEffect, useState } from "react";
import {
  filterMedicalCheckLocations,
  type MedicalCheckLocationFilters,
} from "../../../lib/catalog/filterMedicalCheckLocations";
import { CITY_IDS, cityLabels, type CityId } from "../../../lib/cities";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { MedicalCheckLocation } from "../../../types/data";

/*
 * MedicalCheckLocationList — каталог мест сдачи медсправки (T-072),
 * тот же паттерн, что FirstAidCourseList (T-070): ToolPageTemplate,
 * единственный client:visible остров, фильтр только по городу.
 */

export interface MedicalCheckLocationListProps {
  locations: MedicalCheckLocation[];
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    cityLabel: "Pilsēta",
    cityAll: "Visas pilsētas",
    phone: "Tālrunis",
    website: "Mājaslapa",
    noPhone: "Tālrunis nav norādīts",
    zeroResults: "Nav vietu šajā pilsētā.",
  },
  ru: {
    cityLabel: "Город",
    cityAll: "Все города",
    phone: "Телефон",
    website: "Сайт",
    noPhone: "Телефон не указан",
    zeroResults: "В этом городе мест нет.",
  },
} as const;

export default function MedicalCheckLocationList({
  locations,
  currentLocale,
}: MedicalCheckLocationListProps) {
  const t = text[currentLocale];
  const [filters, setFilters] = useState<MedicalCheckLocationFilters>({});

  useEffect(() => trackEvent("medical_check_locations_viewed"), []);

  const results = filterMedicalCheckLocations(locations, filters);

  function updateCity(cityId: string) {
    const next = cityId === "" ? {} : { city_id: cityId };
    setFilters(next);
    trackEvent("medical_check_locations_filter_applied", {
      city_id: cityId || null,
    });
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
          {results.map((location) => (
            <li
              key={location.id}
              className="border-neutral-300 rounded-md border p-4"
            >
              <p className="text-h3 text-neutral-900">{location.name}</p>
              <p className="text-body-sm text-neutral-600">
                {location.address}
              </p>
              <p className="text-body-sm text-neutral-600">
                {t.phone}: {location.phone ?? t.noPhone}
              </p>
              {location.website && (
                <p className="text-body-sm">
                  <a
                    href={location.website}
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
