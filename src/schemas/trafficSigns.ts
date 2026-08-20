import { z } from "zod";

export const TrafficSignSchema = z.object({
  id: z.string(),
  number: z.string(),
  category: z.enum(["priority", "mandatory", "service", "prohibition"]),
  name_lv: z.string(),
  name_ru: z.string(),
  meaning_lv: z.string(),
  meaning_ru: z.string(),
  image: z.string(),
  official_reference: z.string(),
});

export const TrafficSignsFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["editorial"]),
  signs: z.array(TrafficSignSchema),
});
