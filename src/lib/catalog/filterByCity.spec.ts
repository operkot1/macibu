import { describe, expect, it } from "vitest";
import { filterByCity } from "./filterByCity";

interface FakeListing {
  city_id: string;
  name: string;
}

const items: FakeListing[] = [
  { city_id: "riga", name: "Zebra" },
  { city_id: "riga", name: "Alfa" },
  { city_id: "daugavpils", name: "Beta" },
];

describe("filterByCity", () => {
  it("без города — все, отсортированы по имени", () => {
    const result = filterByCity(items, undefined);
    expect(result.map((i) => i.name)).toEqual(["Alfa", "Beta", "Zebra"]);
  });

  it("с городом — только совпадающие, отсортированы по имени", () => {
    const result = filterByCity(items, "riga");
    expect(result.map((i) => i.name)).toEqual(["Alfa", "Zebra"]);
  });

  it("город без совпадений — пустой список", () => {
    const result = filterByCity(items, "ogre");
    expect(result).toEqual([]);
  });
});
