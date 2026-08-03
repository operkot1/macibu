import { z } from "zod";

export const CsddTariffSchema = z.object({
  id: z.string(),
  category: z.string(),
  name_lv: z.string(),
  name_ru: z.string(),
  price_eur: z.number(),
  unit: z.enum(["per-attempt", "one-time", "per-year"]),
  effective_from: z.string(),
  source_document: z.string(),
});

export const CsddTariffsFileSchema = z.object({
  updated_at: z.string(),
  source: z.literal("csdd-export-xlsx"),
  source_file_ref: z.string(),
  tariffs: z.array(CsddTariffSchema),
});
