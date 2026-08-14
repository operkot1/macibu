import { z } from "zod";

export const ViolationSchema = z.object({
  id: z.string(),
  category: z.enum([
    "speed",
    "alcohol",
    "phone",
    "seatbelt",
    "parking",
    "documents",
    "red-light",
  ]),
  title_lv: z.string(),
  title_ru: z.string(),
  description_lv: z.string(),
  description_ru: z.string(),
  fine_min_eur: z.number().nullable(),
  fine_max_eur: z.number().nullable(),
  points: z.number().int().min(0).max(8),
  // "placeholder" — заведомо иллюстративные цифры (T-085, см. A-14),
  // "editorial" зарезервирован для будущего реального наполнения.
  source: z.enum(["placeholder", "editorial"]),
});

export type Violation = z.infer<typeof ViolationSchema>;
