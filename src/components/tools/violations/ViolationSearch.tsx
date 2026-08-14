import { useEffect, useState } from "react";
import {
  filterViolations,
  DEFAULT_VIOLATION_FILTERS,
  type ViolationFilters,
} from "../../../lib/violations/filterViolations";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { Violation } from "../../../schemas/violation";

/*
 * ViolationSearch — поиск/фильтр по реестру нарушений (T-085,
 * docs/06-tools/spravochnik-shtrafov.md). Все записи сейчас
 * `source: "placeholder"` (A-14, docs/00-assumptions.md) — конкретные
 * суммы штрафов не подтверждены достаточно надёжно в рамках исследования
 * задачи. Бейдж "ilustratīvi dati"/"иллюстративные данные" на каждой
 * строке — намеренно на уровне каждой записи, не только в шапке
 * страницы: числа сами по себе не выглядят фиктивно (в отличие от
 * "Piemēra iela" для адресов), поэтому раскрытие должно быть явным на
 * каждой карточке, а не подразумеваемым.
 */

export interface ViolationSearchProps {
  violations: Violation[];
  currentLocale: "lv" | "ru";
}

const CATEGORIES: Violation["category"][] = [
  "speed",
  "alcohol",
  "phone",
  "seatbelt",
  "parking",
  "documents",
  "red-light",
];

const text = {
  lv: {
    categoryLabel: "Kategorija",
    categoryAll: "Visas kategorijas",
    categories: {
      speed: "Ātrums",
      alcohol: "Alkohols",
      phone: "Tālrunis",
      seatbelt: "Drošības josta",
      parking: "Apstāšanās/stāvēšana",
      documents: "Dokumenti",
      "red-light": "Sarkanais signāls",
    } as Record<Violation["category"], string>,
    pointsLabel: "Punkti",
    pointsAll: "Visi",
    sortLabel: "Kārtot",
    sortPointsDesc: "Vairāk punktu vispirms",
    sortFineAsc: "Lētākais vispirms",
    sortFineDesc: "Dārgākais vispirms",
    fine: "Sods",
    points: "Punkti",
    fineOnRequest: "Summa nav norādīta",
    placeholderBadge: "Ilustratīvi dati",
    zeroResults: "Nav pārkāpumu ar šādiem filtriem.",
  },
  ru: {
    categoryLabel: "Категория",
    categoryAll: "Все категории",
    categories: {
      speed: "Скорость",
      alcohol: "Алкоголь",
      phone: "Телефон",
      seatbelt: "Ремень безопасности",
      parking: "Остановка/стоянка",
      documents: "Документы",
      "red-light": "Красный сигнал",
    } as Record<Violation["category"], string>,
    pointsLabel: "Баллы",
    pointsAll: "Все",
    sortLabel: "Сортировка",
    sortPointsDesc: "Сначала больше баллов",
    sortFineAsc: "Сначала дешевле",
    sortFineDesc: "Сначала дороже",
    fine: "Штраф",
    points: "Баллы",
    fineOnRequest: "Сумма не указана",
    placeholderBadge: "Иллюстративные данные",
    zeroResults: "Нет нарушений с такими фильтрами.",
  },
} as const;

function formatFine(
  min: number | null,
  max: number | null,
  fineOnRequest: string,
): string {
  if (min === null && max === null) return fineOnRequest;
  if (min === max) return `${min} €`;
  return `${min}–${max} €`;
}

export default function ViolationSearch({
  violations,
  currentLocale,
}: ViolationSearchProps) {
  const t = text[currentLocale];
  const [filters, setFilters] = useState<ViolationFilters>(
    DEFAULT_VIOLATION_FILTERS,
  );

  useEffect(() => trackEvent("violation_search_viewed"), []);

  const results = filterViolations(violations, filters);

  function updateCategory(value: string) {
    const next: ViolationFilters = {
      ...filters,
      category: value === "" ? undefined : (value as Violation["category"]),
    };
    setFilters(next);
    trackEvent("violation_search_filter_applied", { category: value || null });
  }

  function updatePoints(value: string) {
    const next: ViolationFilters = {
      ...filters,
      points: value === "" ? undefined : Number(value),
    };
    setFilters(next);
    trackEvent("violation_search_filter_applied", {
      points: value === "" ? null : Number(value),
    });
  }

  function updateSort(value: ViolationFilters["sort"]) {
    setFilters({ ...filters, sort: value });
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.categoryLabel}
          </label>
          <select
            value={filters.category ?? ""}
            onChange={(e) => updateCategory(e.target.value)}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.categoryAll}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.categories[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.pointsLabel}
          </label>
          <select
            value={filters.points ?? ""}
            onChange={(e) => updatePoints(e.target.value)}
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="">{t.pointsAll}</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <option key={p} value={p}>
                {p}
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
              updateSort(e.target.value as ViolationFilters["sort"])
            }
            className="text-body focus-visible:ring-focus-ring w-full rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
          >
            <option value="points-desc">{t.sortPointsDesc}</option>
            <option value="fine-asc">{t.sortFineAsc}</option>
            <option value="fine-desc">{t.sortFineDesc}</option>
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-body text-neutral-600">{t.zeroResults}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((v) => (
            <li key={v.id} className="border-neutral-300 rounded-md border p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-h3 text-neutral-900">
                  {currentLocale === "lv" ? v.title_lv : v.title_ru}
                </p>
                <span className="bg-warning-100 text-warning-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {t.placeholderBadge}
                </span>
              </div>
              <p className="text-body-sm text-neutral-600">
                {currentLocale === "lv" ? v.description_lv : v.description_ru}
              </p>
              <p className="text-body-sm text-neutral-900 mt-1">
                {t.fine}:{" "}
                {formatFine(v.fine_min_eur, v.fine_max_eur, t.fineOnRequest)} ·{" "}
                {t.points}: {v.points}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
