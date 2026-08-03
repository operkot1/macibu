import { z } from "zod";

export const RatingEntrySchema = z.object({
  subject_type: z.enum(["school", "instructor"]),
  subject_id: z.string(),
  pass_rate: z.number(),
  sample_size: z.number(),
  confidence: z.enum(["sufficient", "limited", "insufficient"]),
  rank_score: z.number(),
  rank: z.number(),
  calculated_at: z.string(),
});

export const RatingsFileSchema = z.object({
  updated_at: z.string(),
  methodology_version: z.string(),
  entries: z.array(RatingEntrySchema),
});
