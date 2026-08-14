import { describe, expect, it, vi } from "vitest";
import { matchSchools } from "./matchSchools";
import { deliverLead, type Lead } from "./deliverLead";
import type { School } from "../../types/data";

/*
 * leadPipeline.spec.ts — security review T-091 (docs/11-backlog.md):
 * "лид не улетает не-партнёрам — тест на фикстуре с намеренно смешанным
 * списком школ". matchSchools (T-077) уже гарантирует это на уровне
 * подбора (см. matchSchools.spec.ts) — здесь та же гарантия проверяется
 * end-to-end через весь пайплайн подбор → доставка, на фикстуре, где
 * партнёры и не-партнёры намеренно перемешаны и совпадают по всем
 * остальным критериям (город/коробка/язык/категория), чтобы единственным
 * различающим признаком оставался is_partner.
 */

function school(overrides: Partial<School>): School {
  return {
    id: "sch-x",
    slug: "x",
    name: "X",
    city_id: "riga",
    address: "Test iela 1, Rīga",
    csdd_registration_number: "CSDD-TEST-0000",
    languages: ["lv"],
    gearbox: ["manual"],
    categories: ["B"],
    is_partner: false,
    partner_price_eur: null,
    phone: null,
    contact_email: null,
    website: null,
    data_available_for_rating: false,
    ...overrides,
  };
}

const CRITERIA = {
  city_id: "riga",
  category: "B",
  gearbox: "manual" as const,
  language: "lv" as const,
};

const MIXED_SCHOOLS: School[] = [
  school({
    id: "sch-partner-1",
    slug: "p1",
    name: "Partner One",
    is_partner: true,
  }),
  school({
    id: "sch-not-partner-1",
    slug: "np1",
    name: "Not Partner One",
    is_partner: false,
  }),
  school({
    id: "sch-partner-2",
    slug: "p2",
    name: "Partner Two",
    is_partner: true,
  }),
  school({
    id: "sch-not-partner-2",
    slug: "np2",
    name: "Not Partner Two",
    is_partner: false,
  }),
];

describe("security review: лид не улетает не-партнёрам (matchSchools -> deliverLead)", () => {
  it("на смешанной фикстуре (2 партнёра + 2 не-партнёра, идентичные по остальным критериям) deliverLead вызывается только для партнёров", async () => {
    const matched = matchSchools(MIXED_SCHOOLS, CRITERIA);

    // matchSchools сам по себе уже обязан отфильтровать не-партнёров —
    // это первая, но не единственная линия проверки в этом тесте.
    expect(matched.every((s) => s.is_partner)).toBe(true);
    expect(matched.map((s) => s.id).sort()).toEqual([
      "sch-partner-1",
      "sch-partner-2",
    ]);

    const fetchImpl = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    const delivered: string[] = [];

    for (const s of matched) {
      const lead: Lead = {
        school_id: s.id,
        city_id: s.city_id,
        category: "B",
        gearbox: "manual",
        language: "lv",
        name: "Test Testovich",
        phone: "+371 20000000",
      };
      const result = await deliverLead(lead, {
        fetchImpl,
        delayImpl: () => Promise.resolve(),
      });
      expect(result.ok).toBe(true);
      delivered.push(s.id);
    }

    // Итоговая гарантия всего пайплайна: ни один school_id, реально
    // переданный в deliverLead, не принадлежит не-партнёру из фикстуры.
    const nonPartnerIds = MIXED_SCHOOLS.filter((s) => !s.is_partner).map(
      (s) => s.id,
    );
    for (const id of delivered) {
      expect(nonPartnerIds).not.toContain(id);
    }
    expect(delivered).toEqual(["sch-partner-1", "sch-partner-2"]);
  });
});
