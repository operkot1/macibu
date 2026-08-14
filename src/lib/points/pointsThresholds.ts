/*
 * pointsThresholds — единый источник данных о порогах системы учёта
 * пунктов (T-085/T-086). Раньше жил как статический текст только на
 * p5-sodi (T-085); T-086 добавил второго реального потребителя
 * (калькулятор p5-punkti) — вынесено сюда, чтобы цифры не могли
 * разойтись между двумя страницами. Факты подтверждены несколькими
 * независимыми источниками (см. A-14, docs/00-assumptions.md) — это
 * не плейсхолдер, в отличие от сумм штрафов в violations.json.
 */

export type DriverType = "novice" | "regular";

export interface PointsThreshold {
  points: number;
  appliesTo: "all" | DriverType;
  isSuspension: boolean;
  description_lv: string;
  description_ru: string;
}

export const POINTS_THRESHOLDS: PointsThreshold[] = [
  {
    points: 4,
    appliesTo: "all",
    isSuspension: false,
    description_lv: "Rakstisks brīdinājums.",
    description_ru: "Письменное предупреждение.",
  },
  {
    points: 8,
    appliesTo: "all",
    isSuspension: false,
    description_lv:
      "Obligāts satiksmes drošības kurss vai uzvedības korekcijas grupa.",
    description_ru:
      "Обязательный курс безопасности движения или группа коррекции поведения.",
  },
  {
    points: 10,
    appliesTo: "novice",
    isSuspension: true,
    description_lv:
      'Vadītājiem ar stāžu mazāku par 2 gadiem ("jaunais vadītājs") tiesības aptur uz 1 gadu.',
    description_ru:
      'У водителей со стажем менее 2 лет ("новый водитель") права приостанавливают на 1 год.',
  },
  {
    points: 12,
    appliesTo: "regular",
    isSuspension: false,
    description_lv: "Obligāts teorijas un braukšanas eksāmens atkārtoti.",
    description_ru: "Обязательная повторная сдача теории и вождения.",
  },
  {
    points: 16,
    appliesTo: "regular",
    isSuspension: true,
    description_lv: "Pieredzējušiem vadītājiem tiesības aptur uz 1 gadu.",
    description_ru: "У опытных водителей права приостанавливают на 1 год.",
  },
];

export const POINTS_SOURCE_CITATION = {
  lv: 'Avots: Ministru kabineta noteikumi Nr. 551 "Pārkāpumu uzskaites punktu sistēmas piemērošanas noteikumi"; Ceļu satiksmes likuma 55. pants.',
  ru: 'Источник: Правила Кабинета министров № 551 "Правила применения системы учётных баллов нарушений"; статья 55 Закона о дорожном движении.',
} as const;

export const POINTS_VALIDITY_TEXT = {
  lv: "Par pārkāpumiem, kas apdraud satiksmes drošību, papildus naudas sodam piešķir uzskaites punktus (0–8 par pārkāpumu). Punkti ir spēkā 2 gadus, izņemot 8 punktu pārkāpumus — tiem 5 gadus.",
  ru: "За нарушения, угрожающие безопасности движения, помимо денежного штрафа начисляются баллы (0–8 за нарушение). Баллы действуют 2 года, кроме нарушений на 8 баллов — для них 5 лет.",
} as const;

/*
 * thresholdsFor — пороги, применимые к конкретному типу водителя,
 * отсортированные по возрастанию баллов. Новичок никогда не доходит до
 * 12/16 на практике — тиесибас уже приостановлены на 10, но это не
 * повод исключать 12/16 из общего образовательного списка на p5-sodi
 * (там рендерится весь POINTS_THRESHOLDS без фильтра).
 */
export function thresholdsFor(driverType: DriverType): PointsThreshold[] {
  return POINTS_THRESHOLDS.filter(
    (t) => t.appliesTo === "all" || t.appliesTo === driverType,
  ).sort((a, b) => a.points - b.points);
}
