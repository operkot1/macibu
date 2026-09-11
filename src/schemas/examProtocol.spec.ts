import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ExamProtocolCriterionSchema } from "./examProtocol";

describe("examProtocolCriteria — реальный контент src/content/exam-protocol/criteria.json (T-102)", () => {
  const raw = readFileSync(
    new URL("../content/exam-protocol/criteria.json", import.meta.url),
    "utf-8",
  );
  const parsed: unknown = JSON.parse(raw);
  const criteria = (parsed as unknown[]).map((c) =>
    ExamProtocolCriterionSchema.parse(c),
  );

  it("ровно 14 критериев — точная структура официального протокола (не 16, как предполагало более раннее, менее надёжное WebSearch-исследование)", () => {
    expect(criteria).toHaveLength(14);
  });

  it("номера 1–14 присутствуют ровно по одному разу, без пропусков и дублей", () => {
    const numbers = criteria.map((c) => c.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  });

  it("4 категории распределены как в официальной таблице «Protokols»: 4/4/3/3", () => {
    const byCategory = criteria.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(byCategory).toEqual({
      "vehicle-control": 4,
      "traffic-rules": 4,
      safety: 3,
      "social-skills": 3,
    });
  });

  it("честность: все записи — source editorial (реальный официальный источник, не placeholder)", () => {
    expect(criteria.every((c) => c.source === "editorial")).toBe(true);
  });

  it("честность: каждая запись явно ссылается на официальный источник, не выдаёт факт без основания", () => {
    for (const c of criteria) {
      expect(c.official_reference).toContain("Vadīšanas eksāmena vērtēšana");
      expect(c.official_reference.length).toBeGreaterThan(10);
    }
  });

  it("«Videi draudzīga pārvietošanās» (экологичное вождение) — один пункт внутри категории social-skills, не отдельная 4-я категория целиком (расхождение с прежним WebSearch-выводом)", () => {
    const eco = criteria.find((c) => c.number === 14);
    expect(eco?.category).toBe("social-skills");
    expect(eco?.title_lv).toBe("Videi draudzīga pārvietošanās");
  });
});
