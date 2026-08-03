import { z } from "zod";

export const ExamZoneSchema = z.object({
  id: z.string(),
  city_id: z.string(),
  csdd_center_id: z.string(),
  title_lv: z.string(),
  title_ru: z.string(),
  description_lv: z.string(),
  description_ru: z.string(),
  geo: z.object({ lat: z.number(), lng: z.number() }),
  route_type: z.enum(["city", "highway", "maneuvers"]),
  submitted_by: z.enum(["editorial", "ugc"]),
  submitted_at: z.string(),
  moderation_status: z.enum(["pending", "approved", "rejected"]),
  upvotes: z.number(),
});

export const ExamZonesFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["user-generated", "editorial-seed"]),
  zones: z.array(ExamZoneSchema),
});
