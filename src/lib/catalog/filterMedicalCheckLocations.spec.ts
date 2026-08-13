import { describe, expect, it } from "vitest";
import { filterMedicalCheckLocations } from "./filterMedicalCheckLocations";
import { getMedicalCheckLocations } from "../data";

describe("filterMedicalCheckLocations на реальной фикстуре fixtures/medical_check_locations.json", () => {
  const locations = getMedicalCheckLocations().locations;

  it("без фильтра — все места, отсортированы по имени", () => {
    const result = filterMedicalCheckLocations(locations, {});
    expect(result).toHaveLength(locations.length);
    const names = result.map((l) => l.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("фильтр по городу (riga) — только рижские места", () => {
    const result = filterMedicalCheckLocations(locations, { city_id: "riga" });
    expect(result.every((l) => l.city_id === "riga")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("город без мест — пустой список, не выдумываем", () => {
    const result = filterMedicalCheckLocations(locations, { city_id: "ogre" });
    expect(result).toEqual([]);
  });
});
