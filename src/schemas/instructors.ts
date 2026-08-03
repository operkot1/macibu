import { z } from "zod";

export const InstructorSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  school_id: z.string(),
  city_id: z.string(),
  languages: z.array(z.enum(["lv", "ru", "en"])),
  gearbox: z.array(z.enum(["manual", "automatic"])),
  exam_attempts_total: z.number(),
  exam_passes_total: z.number(),
  sample_period_from: z.string(),
  sample_period_to: z.string(),
});

export const InstructorsFileSchema = z.object({
  updated_at: z.string(),
  source: z.literal("csdd-export-xlsx"),
  instructors: z.array(InstructorSchema),
});
