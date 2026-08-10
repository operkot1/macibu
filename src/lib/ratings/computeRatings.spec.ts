import { describe, expect, it } from "vitest";
import { computeRatings } from "./computeRatings";
import { getSchools, getInstructors } from "../data";

describe("computeRatings на реальных fixtures/schools.json + fixtures/instructors.json", () => {
  const schools = getSchools();
  const instructors = getInstructors();
  const entries = computeRatings(schools, instructors, "2026-08-10T00:00:00Z");

  it("порядок инструкторов: Bērziņš → Petrova → Ozols → Lapiņš", () => {
    const order = entries
      .filter((e) => e.subject_type === "instructor")
      .sort((a, b) => a.rank - b.rank)
      .map((e) => e.subject_id);
    expect(order).toEqual([
      "ins-berzins",
      "ins-petrova",
      "ins-ozols",
      "ins-lapins",
    ]);
  });

  it("порядок школ: sch-x → sch-y → sch-fors → sch-z", () => {
    const order = entries
      .filter((e) => e.subject_type === "school")
      .sort((a, b) => a.rank - b.rank)
      .map((e) => e.subject_id);
    expect(order).toEqual(["sch-x", "sch-y", "sch-fors", "sch-z"]);
  });

  it("инструктор с exam_attempts_total: 0 (ins-jauns) не участвует в рейтинге", () => {
    const ids = entries.map((e) => e.subject_id);
    expect(ids).not.toContain("ins-jauns");
  });

  it("школа с data_available_for_rating: false (sch-new) не участвует в рейтинге", () => {
    const ids = entries.map((e) => e.subject_id);
    expect(ids).not.toContain("sch-new");
  });

  it("школа-агрегат совпадает с числами её единственного инструктора (sch-z ← Lapiņš)", () => {
    const schZ = entries.find(
      (e) => e.subject_type === "school" && e.subject_id === "sch-z",
    );
    expect(schZ).toBeDefined();
    expect(schZ?.sample_size).toBe(3);
    expect(schZ?.pass_rate).toBe(1);
    expect(schZ?.confidence).toBe("insufficient");
    expect(schZ?.rank_score).toBeCloseTo(0.4385, 4);
  });
});
