import { z } from "zod";

export const FirstAidProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  city_id: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
});

export const FirstAidProvidersFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["placeholder", "editorial"]),
  providers: z.array(FirstAidProviderSchema),
});
