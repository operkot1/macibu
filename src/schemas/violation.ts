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
  // Лишение прав (tiesību atņemšana) — качественно другая мера, не просто
  // штраф+баллы, поэтому отдельные поля, не текст внутри description
  // (найдено/добавлено при внутренней ревизии кода, август 2026, вместе с
  // реальным наполнением из parkapums.lv — см. A-14 и T-085 в backlog).
  // Диапазон в месяцах — источник иногда даёт диапазон («9–12 mēn.»),
  // единицы всегда нормализованы до месяцев (годы × 12).
  driving_ban_months_min: z.number().int().positive().nullable(),
  driving_ban_months_max: z.number().int().positive().nullable(),
  // "placeholder" — заведомо иллюстративные цифры (T-085, см. A-14),
  // "editorial" — реальное наполнение с указанием источника/статьи закона.
  source: z.enum(["placeholder", "editorial"]),
});

export type Violation = z.infer<typeof ViolationSchema>;
