import { z } from "zod";

/*
 * examProtocol — структура протокола оценки практического экзамена
 * вождения CSDD (T-102). Источник: официальная презентация CSDD
 * «Vadīšanas eksāmena vērtēšana» (Alberts Krūmiņš, 2018,
 * kval.csdd.lv/ausk/www/Vertesana_2018.pdf), слайд «Protokols» —
 * таблица с явной нумерацией 1–14 и 4 категориями, оценка по шкале
 * nepietiekami/pietiekami/labi. Ссылается на MK noteikumi Nr. 103,
 * Nr. 358, Direktīva 2006/126/EK, 1968. gada Vīnes konvencija.
 *
 * "number" — официальный номер пункта протокола (1–14), это и есть
 * "код" в смысле контракта docs/06-tools/razbor-protokola.md (реального
 * отдельного числового "кода нарушения" в источнике нет — только
 * пронумерованный список критериев оценки).
 */
export const ExamProtocolCriterionSchema = z.object({
  id: z.string(),
  number: z.number().int().min(1).max(14),
  category: z.enum([
    "vehicle-control",
    "traffic-rules",
    "safety",
    "social-skills",
  ]),
  title_lv: z.string(),
  title_ru: z.string(),
  description_lv: z.string(),
  description_ru: z.string(),
  official_reference: z.string(),
  source: z.literal("editorial"),
});

export type ExamProtocolCriterion = z.infer<typeof ExamProtocolCriterionSchema>;
