import { describe, expect, it } from "vitest";
import {
  categoryCode,
  CATEGORY_ORDER,
  sortByCategoryOrder,
} from "./categoryOrder";

describe("categoryCode", () => {
  it("strips the cat- prefix", () => {
    expect(categoryCode("cat-am")).toBe("am");
    expect(categoryCode("cat-95-kods")).toBe("95-kods");
  });
});

describe("sortByCategoryOrder", () => {
  it("orders entries by the canonical category grouping, not alphabetically", () => {
    const entries = [
      { route_id: "cat-d", label: "D" },
      { route_id: "cat-am", label: "AM" },
      { route_id: "cat-c", label: "C" },
      { route_id: "cat-a1", label: "A1" },
    ];
    const sorted = sortByCategoryOrder(entries).map((e) => e.label);
    expect(sorted).toEqual(["AM", "A1", "C", "D"]);
  });

  it("covers all 12 real category codes with no duplicates", () => {
    expect(CATEGORY_ORDER.length).toBe(12);
    expect(new Set(CATEGORY_ORDER).size).toBe(12);
  });

  it("does not mutate the input array", () => {
    const entries = [{ route_id: "cat-d" }, { route_id: "cat-am" }];
    const copy = [...entries];
    sortByCategoryOrder(entries);
    expect(entries).toEqual(copy);
  });
});
