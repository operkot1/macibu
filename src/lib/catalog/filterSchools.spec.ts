import { describe, expect, it } from "vitest";
import { filterSchools, isNonDefaultFilter } from "./filterSchools";
import { getSchools, getRatings } from "../data";

describe("filterSchools на реальных fixtures/schools.json + fixtures/ratings.json", () => {
  const schools = getSchools().schools;
  const ratings = getRatings().entries;

  it("sort: rating — школы без записи в ratings уходят в конец", () => {
    const result = filterSchools(schools, ratings, { sort: "rating" });
    const ids = result.map((s) => s.id);
    // sch-new не имеет записи в ratings (data_available_for_rating: false)
    expect(ids.indexOf("sch-new")).toBe(ids.length - 1);
    // остальные — по убыванию rank_score: sch-x → sch-y → sch-fors → sch-z
    expect(ids).toEqual(["sch-x", "sch-y", "sch-fors", "sch-z", "sch-new"]);
  });

  it("sort: price-asc — partner_price_eur: null уходит в конец, не считается 0", () => {
    const result = filterSchools(schools, ratings, { sort: "price-asc" });
    // единственная школа с ценой — sch-fors (партнёр); остальные null → в
    // конец, упорядочены по имени: X → Y → Z → Jaunā Autoskola
    expect(result.map((s) => s.id)).toEqual([
      "sch-fors",
      "sch-x",
      "sch-y",
      "sch-z",
      "sch-new",
    ]);
    expect(result.slice(1).every((s) => s.partner_price_eur === null)).toBe(
      true,
    );
  });

  it("sort: name — алфавитный порядок по названию", () => {
    const result = filterSchools(schools, ratings, { sort: "name" });
    const names = result.map((s) => s.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("фильтр по городу", () => {
    const result = filterSchools(schools, ratings, {
      sort: "name",
      city_id: "daugavpils",
    });
    expect(result.map((s) => s.id)).toEqual(["sch-z"]);
  });

  it("фильтр по коробке (automatic)", () => {
    const result = filterSchools(schools, ratings, {
      sort: "name",
      gearbox: "automatic",
    });
    expect(result.map((s) => s.id).sort()).toEqual(["sch-fors", "sch-y"]);
  });

  it("фильтр по языку (en) — только школы, где явно указан en", () => {
    const result = filterSchools(schools, ratings, {
      sort: "name",
      language: "en",
    });
    expect(result.map((s) => s.id)).toEqual(["sch-fors"]);
  });

  it("комбинация фильтров без совпадений → пустой список (zero-results)", () => {
    const result = filterSchools(schools, ratings, {
      sort: "name",
      city_id: "riga",
      language: "en",
      gearbox: "manual",
    });
    // sch-fors — единственная riga+en, но её gearbox включает "manual" тоже
    expect(result.map((s) => s.id)).toEqual(["sch-fors"]);

    const zero = filterSchools(schools, ratings, {
      sort: "name",
      city_id: "liepaja",
      language: "ru",
    });
    expect(zero).toEqual([]);
  });
});

describe("isNonDefaultFilter", () => {
  it("пустое состояние (только sort) — не triggers noindex", () => {
    expect(isNonDefaultFilter({ sort: "rating" })).toBe(false);
    expect(isNonDefaultFilter({ sort: "name" })).toBe(false);
  });

  it("любой реальный фильтр — triggers noindex", () => {
    expect(isNonDefaultFilter({ sort: "rating", city_id: "riga" })).toBe(true);
    expect(isNonDefaultFilter({ sort: "rating", gearbox: "manual" })).toBe(
      true,
    );
    expect(isNonDefaultFilter({ sort: "rating", language: "lv" })).toBe(true);
    expect(isNonDefaultFilter({ sort: "rating", category: "B" })).toBe(true);
  });
});
