import { z } from "zod";

export const MedicalCheckLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  city_id: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
});

export const MedicalCheckLocationsFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["placeholder", "editorial"]),
  locations: z.array(MedicalCheckLocationSchema),
});
