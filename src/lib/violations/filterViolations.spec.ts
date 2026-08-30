import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  filterViolations,
  DEFAULT_VIOLATION_FILTERS,
} from "./filterViolations";
import { ViolationSchema, type Violation } from "../../schemas/violation";

function violation(overrides: Partial<Violation>): Violation {
  return {
    id: "v-synthetic",
    category: "speed",
    title_lv: "Synthetic",
    title_ru: "Synthetic",
    description_lv: "Synthetic",
    description_ru: "Synthetic",
    fine_min_eur: 50,
    fine_max_eur: 100,
    points: 1,
    driving_ban_months_min: null,
    driving_ban_months_max: null,
    source: "placeholder",
    ...overrides,
  };
}

const SAMPLE: Violation[] = [
  violation({ id: "v-a", category: "speed", points: 1, fine_min_eur: 30 }),
  violation({ id: "v-b", category: "alcohol", points: 8, fine_min_eur: 340 }),
  violation({ id: "v-c", category: "parking", points: 0, fine_min_eur: 15 }),
  violation({ id: "v-d", category: "speed", points: 4, fine_min_eur: 160 }),
  violation({
    id: "v-e",
    category: "documents",
    points: 0,
    fine_min_eur: null,
  }),
];

describe("filterViolations на синтетических данных", () => {
  it("без фильтра — все записи, сортировка по умолчанию (points-desc)", () => {
    const result = filterViolations(SAMPLE, DEFAULT_VIOLATION_FILTERS);
    expect(result.map((v) => v.id)).toEqual([
      "v-b",
      "v-d",
      "v-a",
      "v-c",
      "v-e",
    ]);
  });

  it("фильтр по категории", () => {
    const result = filterViolations(SAMPLE, {
      ...DEFAULT_VIOLATION_FILTERS,
      category: "speed",
    });
    expect(result.map((v) => v.id).sort()).toEqual(["v-a", "v-d"]);
  });

  it("фильтр по количеству баллов", () => {
    const result = filterViolations(SAMPLE, {
      ...DEFAULT_VIOLATION_FILTERS,
      points: 0,
    });
    expect(result.map((v) => v.id).sort()).toEqual(["v-c", "v-e"]);
  });

  it("категория без совпадений — пустой список, не выдумываем", () => {
    const result = filterViolations(SAMPLE, {
      ...DEFAULT_VIOLATION_FILTERS,
      category: "phone",
    });
    expect(result).toEqual([]);
  });

  it("sort: fine-asc — записи без fine_min_eur уходят в конец, не приравниваются к 0", () => {
    const result = filterViolations(SAMPLE, { sort: "fine-asc" });
    expect(result.map((v) => v.id)).toEqual([
      "v-c",
      "v-a",
      "v-d",
      "v-b",
      "v-e",
    ]);
  });

  it("sort: fine-desc — записи без fine_min_eur всё равно в конце", () => {
    const result = filterViolations(SAMPLE, { sort: "fine-desc" });
    expect(result.map((v) => v.id)).toEqual([
      "v-b",
      "v-d",
      "v-a",
      "v-c",
      "v-e",
    ]);
  });
});

describe("реальная фикстура src/content/violations/violations.json", () => {
  const raw = readFileSync(
    new URL("../../content/violations/violations.json", import.meta.url),
    "utf-8",
  );
  const parsed: unknown = JSON.parse(raw);
  const violations = (parsed as unknown[]).map((v) => ViolationSchema.parse(v));

  it("проходит схему и содержит записи", () => {
    expect(violations.length).toBeGreaterThan(0);
  });

  it("filterViolations работает на реальных данных без ошибок", () => {
    const result = filterViolations(violations, DEFAULT_VIOLATION_FILTERS);
    expect(result.length).toBe(violations.length);
  });

  it("честность (найдено при ревизии кода, август 2026): 5 категорий получили реальные данные (parkapums.lv), documents/red-light остаются placeholder до будущего среза — 88 всего, 86 editorial + 2 placeholder", () => {
    expect(violations).toHaveLength(88);
    expect(violations.filter((v) => v.source === "editorial")).toHaveLength(86);
    const placeholders = violations.filter((v) => v.source === "placeholder");
    expect(placeholders).toHaveLength(2);
    expect(placeholders.map((v) => v.category).sort()).toEqual([
      "documents",
      "red-light",
    ]);
  });

  it("честность: каждая editorial-запись явно ссылается на источник (статью Ceļu satiksmes likums), не выдаёт себя за проверенную без основания", () => {
    const editorial = violations.filter((v) => v.source === "editorial");
    for (const v of editorial) {
      expect(v.description_lv).toContain("Ceļu satiksmes likums");
      expect(v.description_ru).toContain("Ceļu satiksmes likums");
    }
  });

  it("честность: лишение прав указано только там, где значение реально известно (не выдуманный 0)", () => {
    for (const v of violations) {
      const hasMin = v.driving_ban_months_min !== null;
      const hasMax = v.driving_ban_months_max !== null;
      expect(hasMin).toBe(hasMax);
      if (hasMin) {
        expect(v.driving_ban_months_min).toBeGreaterThan(0);
      }
    }
  });

  it("810/811-стиль честности: расхождение с источником про «(mopēds)»-ярлык раскрыто в тексте, не скрыто", () => {
    const v = violations.find((x) => x.id === "v-alcohol-over-15");
    expect(v?.description_lv).toContain("A-14");
  });
});
