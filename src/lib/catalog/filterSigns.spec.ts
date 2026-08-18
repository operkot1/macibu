import { describe, expect, it } from "vitest";
import { filterSigns } from "./filterSigns";
import { getTrafficSigns } from "../data";

describe("filterSigns на реальной фикстуре fixtures/traffic_signs.json", () => {
  const signs = getTrafficSigns().signs;

  it("без запроса — все знаки, отсортированы по номеру", () => {
    const result = filterSigns(signs, {}, "lv");
    expect(result).toHaveLength(signs.length);
    const numbers = result.map((s) => Number(s.number));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("поиск по номеру знака (LV)", () => {
    const result = filterSigns(signs, { query: "207" }, "lv");
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe("207");
  });

  it("поиск по ключевому слову в названии (LV) — 'dodiet ceļu'", () => {
    const result = filterSigns(signs, { query: "dodiet" }, "lv");
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe("206");
  });

  it("поиск по ключевому слову в названии (RU) — та же запись, другой язык", () => {
    const result = filterSigns(signs, { query: "уступите" }, "ru");
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe("206");
  });

  it("LV-запрос не находит совпадение в RU-режиме, если слово другое", () => {
    const result = filterSigns(signs, { query: "dodiet" }, "ru");
    expect(result).toEqual([]);
  });

  it("запрос без совпадений — пустой список, не выдумываем", () => {
    const result = filterSigns(signs, { query: "нет такого знака xyz" }, "ru");
    expect(result).toEqual([]);
  });

  it("203 — упоминает обе стороны, отличается от 204/205", () => {
    const both = filterSigns(signs, { query: "203" }, "lv")[0];
    const right = filterSigns(signs, { query: "204" }, "lv")[0];
    const left = filterSigns(signs, { query: "205" }, "lv")[0];
    expect(both.meaning_lv).toContain("kreisās");
    expect(both.meaning_lv).toContain("labās");
    expect(right.meaning_lv).toContain("LABĀS");
    expect(right.meaning_lv).not.toContain("KREISĀS");
    expect(left.meaning_lv).toContain("KREISĀS");
    expect(left.meaning_lv).not.toContain("LABĀS");
  });
});
