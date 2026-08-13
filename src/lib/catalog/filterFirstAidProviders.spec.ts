import { describe, expect, it } from "vitest";
import { filterFirstAidProviders } from "./filterFirstAidProviders";
import { getFirstAidProviders } from "../data";

describe("filterFirstAidProviders на реальной фикстуре fixtures/first_aid_providers.json", () => {
  const providers = getFirstAidProviders().providers;

  it("без фильтра — все провайдеры, отсортированы по имени", () => {
    const result = filterFirstAidProviders(providers, {});
    expect(result).toHaveLength(providers.length);
    const names = result.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("фильтр по городу (riga) — только рижские провайдеры", () => {
    const result = filterFirstAidProviders(providers, { city_id: "riga" });
    expect(result.every((p) => p.city_id === "riga")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("город без провайдеров — пустой список, не выдумываем", () => {
    const result = filterFirstAidProviders(providers, { city_id: "ogre" });
    expect(result).toEqual([]);
  });
});
