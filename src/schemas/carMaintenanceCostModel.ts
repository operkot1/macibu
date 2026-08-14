import { z } from "zod";

export const CarMaintenanceCostModelSchema = z.object({
  updated_at: z.string(),
  source: z.literal("csdd-published-fee-and-market-research"),
  inspection: z.object({
    fee_eur: z.number(),
    source_document: z.string(),
  }),
  octa: z.object({
    typical_min_eur_year: z.number(),
    typical_max_eur_year: z.number(),
    note_lv: z.string(),
    note_ru: z.string(),
  }),
});
