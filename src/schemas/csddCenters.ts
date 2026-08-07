import { z } from "zod";

export const CsddCenterSchema = z.object({
  city_id: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
});

export const CsddCentersFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["placeholder", "csdd-export-xlsx"]),
  centers: z.array(CsddCenterSchema),
});
