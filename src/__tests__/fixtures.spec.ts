import { describe, expect, it } from "vitest";
import {
  getCsddTariffs,
  getSchools,
  getInstructors,
  getRatings,
  getExamZones,
  getTheoryQuestions,
  getUserStateFixture,
  getCostModel,
} from "../lib/data";

describe("fixtures проходят свою Zod-схему (docs/03-data-model.md)", () => {
  it("csdd_tariffs.json", () => {
    expect(() => getCsddTariffs()).not.toThrow();
  });

  it("schools.json", () => {
    expect(() => getSchools()).not.toThrow();
  });

  it("instructors.json", () => {
    expect(() => getInstructors()).not.toThrow();
  });

  it("ratings.json", () => {
    expect(() => getRatings()).not.toThrow();
  });

  it("exam_zones.json", () => {
    expect(() => getExamZones()).not.toThrow();
  });

  it("theory_questions.json", () => {
    expect(() => getTheoryQuestions()).not.toThrow();
  });

  it("user_state.json", () => {
    expect(() => getUserStateFixture()).not.toThrow();
  });

  it("cost_model.json", () => {
    expect(() => getCostModel()).not.toThrow();
  });
});
