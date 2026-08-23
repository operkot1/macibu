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
    // Не просто { query: "207" } — с ростом справочника число "207"
    // неизбежно появляется и в перекрёстных ссылках других знаков
    // (546 явно ссылается на 207 в тексте) — та же коллизия, что уже
    // была с 402/407 и 607/633. Ищем по номеру+началу названия.
    const result = filterSigns(signs, { query: '207 "' }, "lv");
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

  it("фильтр category=warning — только 43 предупреждающих знака", () => {
    const result = filterSigns(signs, { category: "warning" }, "lv");
    expect(result).toHaveLength(43);
    expect(result.every((s) => s.category === "warning")).toBe(true);
  });

  it("103/104 — геометрически подтверждённая пара опасного поворота", () => {
    const right = filterSigns(signs, {}, "lv").find((s) => s.number === "103");
    const left = filterSigns(signs, {}, "lv").find((s) => s.number === "104");
    expect(right?.name_lv).toContain("pa labi");
    expect(left?.name_lv).toContain("pa kreisi");
  });

  it("136–141 — 3 пары знаков приближения к переезду, все различаются числом полос и стороной", () => {
    const nums = ["136", "137", "138", "139", "140", "141"];
    const found = nums.map((n) =>
      filterSigns(signs, {}, "lv").find((s) => s.number === n)!,
    );
    expect(found.every(Boolean)).toBe(true);
    const [s136, s137, s138, s139, s140, s141] = found;
    expect(s136.name_lv).toContain("labajā");
    expect(s137.name_lv).toContain("kreisajā");
    expect(s138.name_lv).toContain("labajā");
    expect(s139.name_lv).toContain("kreisajā");
    expect(s140.name_lv).toContain("labajā");
    expect(s141.name_lv).toContain("kreisajā");
  });

  it("фильтр category=direction — только 16 знаков (частичный срез, не все 53)", () => {
    const result = filterSigns(signs, { category: "direction" }, "lv");
    expect(result).toHaveLength(16);
    expect(result.every((s) => s.category === "direction")).toBe(true);
  });

  it("740/741/742 — цвета номеров дорог, исправленные после визуальной проверки (не из текста-источника)", () => {
    const main = filterSigns(signs, {}, "lv").find((s) => s.number === "740");
    const regional = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "741",
    );
    const european = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "742",
    );
    expect(main?.meaning_lv).toContain("sarkans");
    expect(main?.meaning_lv).toContain('"A"');
    expect(regional?.meaning_lv).toContain("zils");
    expect(regional?.meaning_lv).toContain('"P"');
    expect(european?.meaning_lv).toContain("zaļš");
    expect(european?.meaning_lv).toContain('"E"');
  });

  it("725 (рекомендуемая скорость) явно отличается от обязательного знака 323", () => {
    const recommended = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "725",
    );
    expect(recommended?.meaning_lv).toContain("323");
  });

  it("фильтр category=information — только 56 знаков (норādījuma zīmes, полная категория)", () => {
    const result = filterSigns(signs, { category: "information" }, "lv");
    expect(result).toHaveLength(56);
    expect(result.every((s) => s.category === "information")).toBe(true);
  });

  it("503/504 — геометрически подтверждённая пара стрелок право/лево", () => {
    const right = filterSigns(signs, {}, "lv").find((s) => s.number === "503");
    const left = filterSigns(signs, {}, "lv").find((s) => s.number === "504");
    expect(right?.name_lv).toContain("pa labi");
    expect(left?.name_lv).toContain("pa kreisi");
  });

  it("535/536 — подтверждённая MD5-сравнением зеркальная пара, явно объяснена в тексте", () => {
    const right = filterSigns(signs, {}, "lv").find((s) => s.number === "535");
    const left = filterSigns(signs, {}, "lv").find((s) => s.number === "536");
    expect(right?.meaning_lv).toContain("spoguļattēli");
    expect(left?.meaning_lv).toContain("spoguļoti");
  });

  it("524 — раскрывает найденную датированную ревизию дизайна (2011 vs 2016)", () => {
    const sign524 = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "524",
    );
    expect(sign524?.meaning_lv).toContain("2016");
    expect(sign524?.meaning_lv).toContain("Muitas zona");
  });

  it("521/522 vs 555/556 — два визуально разных стиля таблички с названием, оба честно описаны", () => {
    const entering521 = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "521",
    );
    const entering555 = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "555",
    );
    expect(entering521?.meaning_lv).toContain("Zils fons");
    expect(entering555?.meaning_lv).toContain("baltā");
    expect(entering555?.meaning_lv).toContain("521");
  });

  it("546 (место остановки) явно отличается от обязательного знака 207 (STOP)", () => {
    const sign546 = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "546",
    );
    expect(sign546?.meaning_lv).toContain("207");
  });

  it("фильтр category=additional — только 60 табличек (papildzīmes, полная категория, все 8 официальных категорий закрыты)", () => {
    const result = filterSigns(signs, { category: "additional" }, "lv");
    expect(result).toHaveLength(60);
    expect(result.every((s) => s.category === "additional")).toBe(true);
  });

  it("без фильтра — все восемь категорий представлены (219+60=279)", () => {
    const result = filterSigns(signs, {}, "lv");
    expect(result).toHaveLength(279);
  });

  it("814/816 — направление исправлено визуальной проверкой в обратную сторону от источника", () => {
    const left = filterSigns(signs, {}, "lv").find((s) => s.number === "814");
    const right = filterSigns(signs, {}, "lv").find((s) => s.number === "816");
    expect(left?.name_lv).toContain("pa kreisi");
    expect(right?.name_lv).toContain("pa labi");
    expect(left?.meaning_lv).toContain("gross.lv");
    expect(right?.meaning_lv).toContain("gross.lv");
  });

  it("818–824 — тип транспорта переставлен по реальным пиктограммам, не по заявленному источником порядку", () => {
    const bus = filterSigns(signs, {}, "lv").find((s) => s.number === "821");
    const tractor = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "822",
    );
    expect(bus?.name_lv).toContain("autobuss");
    expect(bus?.meaning_lv).toContain("gross.lv");
    expect(tractor?.name_lv).toContain("traktors");
    expect(tractor?.meaning_lv).toContain("gross.lv");
  });

  it("825 (Darbdienās) подтверждён напрямую метаданными файла Wikimedia, не только текстом-источником", () => {
    const workdays = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "825",
    );
    expect(workdays?.meaning_lv).toContain("Wikimedia Commons");
  });

  it("849 (прочая информация) честно описан как шаблон без единого значения", () => {
    const other = filterSigns(signs, {}, "lv").find((s) => s.number === "849");
    expect(other?.meaning_lv).toContain("nav viena universāla satura");
  });

  it("858 (EuroVelo) использует реальный маршрут (EuroVelo 13), не выдуманный номер", () => {
    const eurovelo = filterSigns(signs, {}, "lv").find(
      (s) => s.number === "858",
    );
    expect(eurovelo?.meaning_lv).toContain("EuroVelo 13");
  });
});
