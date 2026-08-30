import { describe, expect, it } from "vitest";
import { toSafeJsonLdString } from "./safeJsonLd";

describe("toSafeJsonLdString", () => {
  it("экранирует </script>, чтобы нельзя было разорвать тег", () => {
    const out = toSafeJsonLdString({ name: "Школа</script><script>alert(1)" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>\\u003cscript>");
  });

  it("после JSON.parse даёт исходную строку без искажений", () => {
    const original = { name: "Школа</script>с <b>тегом</b>" };
    const roundTrip: typeof original = JSON.parse(toSafeJsonLdString(original));
    expect(roundTrip).toEqual(original);
  });

  it("обычные данные без < остаются как обычный JSON.stringify", () => {
    const data = { a: 1, b: "простой текст" };
    expect(toSafeJsonLdString(data)).toBe(JSON.stringify(data));
  });

  it("экранирует все вхождения <, не только первое", () => {
    const out = toSafeJsonLdString({ a: "<x><y><z>" });
    expect(out).not.toContain("<");
    expect((out.match(/\\u003c/g) ?? []).length).toBe(3);
  });
});
