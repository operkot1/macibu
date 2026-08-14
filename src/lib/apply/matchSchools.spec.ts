import { describe, expect, it } from "vitest";
import { matchSchools } from "./matchSchools";
import { getSchools } from "../data";
import type { School } from "../../types/data";

const RIGA_CRITERIA = {
  city_id: "riga",
  category: "B",
  gearbox: "manual" as const,
  language: "lv" as const,
};

describe("matchSchools на реальной фикстуре fixtures/schools.json", () => {
  const schools = getSchools().schools;

  it("школа без is_partner никогда не появляется, даже если остальные критерии совпадают", () => {
    const nonPartner = schools.find((s) => !s.is_partner);
    expect(nonPartner).toBeDefined();
    const criteria = {
      city_id: nonPartner!.city_id,
      category: nonPartner!.categories[0],
      gearbox: nonPartner!.gearbox[0],
      language: nonPartner!.languages[0],
    };
    const result = matchSchools(schools, criteria);
    expect(result.every((s) => s.is_partner)).toBe(true);
    expect(result.find((s) => s.id === nonPartner!.id)).toBeUndefined();
  });

  it("реальный партнёр (FORS) подходит по своим настоящим критериям", () => {
    const result = matchSchools(schools, RIGA_CRITERIA);
    expect(result.some((s) => s.slug === "fors")).toBe(true);
  });

  it("город без подходящих партнёров — пустой список, не выдумываем", () => {
    const result = matchSchools(schools, { ...RIGA_CRITERIA, city_id: "ogre" });
    expect(result).toEqual([]);
  });

  it("несовпадающая коробка исключает партнёра", () => {
    const result = matchSchools(schools, {
      ...RIGA_CRITERIA,
      city_id: "ogre",
      gearbox: "automatic",
    });
    expect(result).toEqual([]);
  });
});

describe("matchSchools на синтетических данных — несколько подходящих партнёров", () => {
  function school(overrides: Partial<School>): School {
    return {
      id: "sch-synthetic",
      slug: "synthetic",
      name: "Synthetic",
      city_id: "riga",
      address: "Test iela 1, Rīga",
      csdd_registration_number: "CSDD-TEST-0000",
      languages: ["lv"],
      gearbox: ["manual"],
      categories: ["B"],
      is_partner: true,
      partner_price_eur: 1000,
      phone: null,
      contact_email: null,
      website: null,
      data_available_for_rating: false,
      ...overrides,
    };
  }

  it("несколько подходящих партнёров — все присутствуют, порядок по имени, без искажения", () => {
    const schools: School[] = [
      school({ id: "sch-b", slug: "b", name: "Beta Autoskola" }),
      school({ id: "sch-a", slug: "a", name: "Alfa Autoskola" }),
      school({
        id: "sch-c-not-partner",
        slug: "c",
        name: "Cita Autoskola",
        is_partner: false,
      }),
    ];
    const result = matchSchools(schools, RIGA_CRITERIA);
    expect(result.map((s) => s.id)).toEqual(["sch-a", "sch-b"]);
  });
});
