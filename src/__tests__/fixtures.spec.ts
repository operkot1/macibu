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
  getCsddCenters,
  getFirstAidProviders,
  getMedicalCheckLocations,
  getCarMaintenanceCostModel,
  getTrafficSigns,
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

  it("csdd_centers.json", () => {
    expect(() => getCsddCenters()).not.toThrow();
  });

  it("first_aid_providers.json", () => {
    expect(() => getFirstAidProviders()).not.toThrow();
  });

  it("medical_check_locations.json", () => {
    expect(() => getMedicalCheckLocations()).not.toThrow();
  });

  it("car_maintenance_cost_model.json", () => {
    expect(() => getCarMaintenanceCostModel()).not.toThrow();
  });

  it("traffic_signs.json", () => {
    expect(() => getTrafficSigns()).not.toThrow();
  });
});
