import { describe, expect, it } from "vitest";
import { joinRatingSubjects } from "./joinRatingSubjects";
import { getSchools, getInstructors, getRatings } from "../data";

describe("joinRatingSubjects на реальных fixtures", () => {
  const schools = getSchools().schools;
  const instructors = getInstructors().instructors;
  const ratings = getRatings().entries;

  it("школы: порядок sch-x → sch-y → sch-fors → sch-z, sch-new — unranked", () => {
    const { ranked, unranked } = joinRatingSubjects(
      schools,
      ratings,
      "school",
      {},
    );
    expect(ranked.map((r) => r.subject.id)).toEqual([
      "sch-x",
      "sch-y",
      "sch-fors",
      "sch-z",
    ]);
    expect(unranked.map((s) => s.id)).toEqual(["sch-new"]);
  });

  it("школы: pass_rate/sample_size/confidence сохранены из ratings.json", () => {
    const { ranked } = joinRatingSubjects(schools, ratings, "school", {});
    expect(ranked[0]).toMatchObject({
      rank: 1,
      pass_rate: 0.7083,
      sample_size: 48,
      confidence: "sufficient",
    });
  });

  it("инструкторы: порядок Bērziņš → Petrova → Ozols → Lapiņš (Экран 5), ins-jauns — unranked", () => {
    const { ranked, unranked } = joinRatingSubjects(
      instructors,
      ratings,
      "instructor",
      {},
    );
    expect(ranked.map((r) => r.subject.id)).toEqual([
      "ins-berzins",
      "ins-petrova",
      "ins-ozols",
      "ins-lapins",
    ]);
    expect(unranked.map((i) => i.id)).toEqual(["ins-jauns"]);
  });

  it("инструкторы: Lapiņš — 100%/3, confidence insufficient (с предупреждением, не скрыт)", () => {
    const { ranked } = joinRatingSubjects(
      instructors,
      ratings,
      "instructor",
      {},
    );
    const lapins = ranked.find((r) => r.subject.id === "ins-lapins");
    expect(lapins).toMatchObject({
      pass_rate: 1,
      sample_size: 3,
      confidence: "insufficient",
    });
  });

  it("фильтр по городу (riga) — исключает Daugavpils/Liepāja субъектов", () => {
    const { ranked, unranked } = joinRatingSubjects(
      schools,
      ratings,
      "school",
      {
        city_id: "riga",
      },
    );
    expect(ranked.map((r) => r.subject.id)).toEqual([
      "sch-x",
      "sch-y",
      "sch-fors",
    ]);
    expect(unranked).toEqual([]);
  });

  it("фильтр без совпадений → пустые ranked и unranked", () => {
    const { ranked, unranked } = joinRatingSubjects(
      instructors,
      ratings,
      "instructor",
      {
        city_id: "ventspils",
      },
    );
    expect(ranked).toEqual([]);
    expect(unranked).toEqual([]);
  });
});
