import type {
  RatingEntry,
  SchoolsFile,
  InstructorsFile,
} from "../../types/data";
import { wilsonLowerBound } from "./wilsonLowerBound";

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function confidenceFor(sampleSize: number): RatingEntry["confidence"] {
  if (sampleSize >= 30) return "sufficient";
  if (sampleSize >= 10) return "limited";
  return "insufficient";
}

function rankEntries(entries: Array<Omit<RatingEntry, "rank">>): RatingEntry[] {
  return [...entries]
    .sort((a, b) => b.rank_score - a.rank_score)
    .map((entry, index) => {
      const { calculated_at, ...rest } = entry;
      return { ...rest, rank: index + 1, calculated_at };
    });
}

/*
 * Чистая функция агрегации рейтинга (docs/03-data-model.md §4,
 * docs/06-tools/rejting-shkol.md). Инструктор с exam_attempts_total: 0
 * не участвует в рейтинге вообще (не 0%). Школа участвует, только если
 * data_available_for_rating === true; агрегат школы — сумма попыток/
 * успехов всех её инструкторов (даже с нулевой выборкой у части из них).
 * Школа с итоговым total === 0 (при выставленном флаге) тоже не
 * получает запись — не показываем 0% как честное число.
 */
export function computeRatings(
  schools: SchoolsFile,
  instructors: InstructorsFile,
  calculatedAt: string,
): RatingEntry[] {
  const instructorEntries: Array<Omit<RatingEntry, "rank">> =
    instructors.instructors
      .filter((instructor) => instructor.exam_attempts_total > 0)
      .map((instructor) => {
        const sampleSize = instructor.exam_attempts_total;
        const rankScore = wilsonLowerBound(
          instructor.exam_passes_total,
          sampleSize,
        );
        return {
          subject_type: "instructor",
          subject_id: instructor.id,
          pass_rate: round4(instructor.exam_passes_total / sampleSize),
          sample_size: sampleSize,
          confidence: confidenceFor(sampleSize),
          rank_score: round4(rankScore),
          calculated_at: calculatedAt,
        };
      });

  const schoolEntries: Array<Omit<RatingEntry, "rank">> = schools.schools
    .filter((school) => school.data_available_for_rating)
    .map((school) => {
      const schoolInstructors = instructors.instructors.filter(
        (instructor) => instructor.school_id === school.id,
      );
      const totalAttempts = schoolInstructors.reduce(
        (sum, instructor) => sum + instructor.exam_attempts_total,
        0,
      );
      const totalPasses = schoolInstructors.reduce(
        (sum, instructor) => sum + instructor.exam_passes_total,
        0,
      );
      if (totalAttempts === 0) return null;
      const rankScore = wilsonLowerBound(totalPasses, totalAttempts);
      return {
        subject_type: "school" as const,
        subject_id: school.id,
        pass_rate: round4(totalPasses / totalAttempts),
        sample_size: totalAttempts,
        confidence: confidenceFor(totalAttempts),
        rank_score: round4(rankScore),
        calculated_at: calculatedAt,
      };
    })
    .filter((entry): entry is Exclude<typeof entry, null> => entry !== null);

  return [...rankEntries(instructorEntries), ...rankEntries(schoolEntries)];
}
