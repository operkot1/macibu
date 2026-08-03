import { z } from "zod";

export const CostModelCoefficientsSchema = z.object({
  city_id: z.string(),
  gearbox: z.enum(["manual", "automatic"]),
  scenario: z.enum(["optimist", "realist", "pessimist"]),
  school_fee_eur: z.number(),
  practice_fee_eur: z.number(),
  csdd_fee_eur: z.number(),
  medical_fee_eur: z.number(),
  is_estimated_fallback: z.boolean(),
  updated_at: z.string(),
});

export const CostModelFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["market-research", "partner-data"]),
  coefficients: z.array(CostModelCoefficientsSchema),
});
