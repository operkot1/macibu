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

  it("фильтр category=priority — только 9 знаков приоритета", () => {
    const result = filterSigns(signs, { category: "priority" }, "lv");
    expect(result).toHaveLength(9);
    expect(result.every((s) => s.category === "priority")).toBe(true);
  });

  it("фильтр category=mandatory — только 27 знаков предписания", () => {
    const result = filterSigns(signs, { category: "mandatory" }, "lv");
    expect(result).toHaveLength(27);
    expect(result.every((s) => s.category === "mandatory")).toBe(true);
  });

  it("category + query вместе сужают до пересечения", () => {
    const result = filterSigns(
      signs,
      { category: "mandatory", query: "labi" },
      "lv",
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.category === "mandatory")).toBe(true);
    // "priority" content also uses "labās" (204) but must not leak in when category is mandatory
    expect(result.some((s) => s.number === "204")).toBe(false);
  });

  it("402/403 — геометрически подтверждённая пара право/лево, отличается по тексту", () => {
    const right = filterSigns(signs, { query: "402" }, "lv")[0];
    const left = filterSigns(signs, { query: "403" }, "lv")[0];
    expect(right.name_lv).toContain("labi");
    expect(left.name_lv).toContain("kreisi");
  });

  it("419/421 — зеркальная пара (велосипедисты/пешеходы слева-справа), различаются по названию", () => {
    const bikeLeft = filterSigns(signs, { query: "419" }, "lv")[0];
    const pedLeft = filterSigns(signs, { query: "421" }, "lv")[0];
    expect(bikeLeft.name_lv).toContain("velosipēdisti pa kreisi");
    expect(pedLeft.name_lv).toContain("gājēji pa kreisi");
  });

  it("фильтр category=service — только 34 знака сервиса", () => {
    const result = filterSigns(signs, { category: "service" }, "lv");
    expect(result).toHaveLength(34);
    expect(result.every((s) => s.category === "service")).toBe(true);
  });

  it("607/633 — оба телефон, но текст явно разграничивает обычный и аварийный", () => {
    const plain = filterSigns(signs, {}, "lv").find((s) => s.number === "607");
    const emergency = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "633",
    );
    expect(plain?.name_lv).toBe("Telefons");
    expect(emergency?.name_lv).toContain("Avārijas");
    expect(emergency?.meaning_lv).toContain("607");
  });

  it("фильтр category=prohibition — только 34 знака запрета", () => {
    const result = filterSigns(signs, { category: "prohibition" }, "lv");
    expect(result).toHaveLength(34);
    expect(result.every((s) => s.category === "prohibition")).toBe(true);
  });

  it("без фильтра — все четыре категории представлены (9+27+34+34=104)", () => {
    const result = filterSigns(signs, {}, "lv");
    expect(result).toHaveLength(104);
  });

  it("315/316 — геометрически подтверждённая пара право/лево запрета поворота", () => {
    const right = filterSigns(signs, {}, "lv").find((s) => s.number === "315");
    const left = filterSigns(signs, {}, "lv").find((s) => s.number === "316");
    expect(right?.name_lv).toContain("pa labi");
    expect(left?.name_lv).toContain("pa kreisi");
  });

  it("326/327 — остановка vs стоянка, явно разграничены по строгости", () => {
    const noStopping = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "326",
    );
    const noParking = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "327",
    );
    expect(noStopping?.name_lv).toBe("Apstāties aizliegts");
    expect(noParking?.name_lv).toBe("Stāvēt aizliegts");
    expect(noStopping?.meaning_lv).toContain("327");
  });

  it("332 (обязательная остановка у поста) явно отличается от сервисного 620", () => {
    const mustStop = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "332" && s.category === "prohibition",
    );
    expect(mustStop?.meaning_lv).toContain("620");
  });
});
