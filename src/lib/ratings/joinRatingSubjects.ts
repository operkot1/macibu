import type { RatingEntry } from "../../types/data";

export interface RatableSubject {
  id: string;
  city_id: string;
  languages: Array<"lv" | "ru" | "en">;
  gearbox: Array<"manual" | "automatic">;
}

export interface RatingSubjectFilters {
  city_id?: string;
  gearbox?: "manual" | "automatic";
  language?: "lv" | "ru" | "en";
}

export interface RankedSubject<T> {
  subject: T;
  rank: number;
  pass_rate: number;
  sample_size: number;
  confidence: RatingEntry["confidence"];
}

export interface JoinedRatingSubjects<T> {
  ranked: RankedSubject<T>[];
  unranked: T[];
}

function matches(
  subject: RatableSubject,
  filters: RatingSubjectFilters,
): boolean {
  if (filters.city_id && subject.city_id !== filters.city_id) return false;
  if (filters.gearbox && !subject.gearbox.includes(filters.gearbox))
    return false;
  if (filters.language && !subject.languages.includes(filters.language))
    return false;
  return true;
}

/*
 * Джойн School[]/Instructor[] с уже посчитанным и отсортированным
 * ratings.json (T-052) — общая логика для school- и instructor-рейтинга
 * (docs/06-tools/rejting-shkol.md, rejting-instruktorov.md). rank НЕ
 * пересчитывается здесь — порядок из ETL используется как есть, сортировка
 * не настраивается пользователем (критерий T-055). Субъект без записи в
 * ratings (data_available_for_rating: false у школы или
 * exam_attempts_total: 0 у инструктора) уходит в unranked — вне
 * ранжированного списка, не наверх/вниз с 0%.
 */
export function joinRatingSubjects<T extends RatableSubject>(
  subjects: T[],
  ratingEntries: RatingEntry[],
  subjectType: "school" | "instructor",
  filters: RatingSubjectFilters,
): JoinedRatingSubjects<T> {
  const filtered = subjects.filter((subject) => matches(subject, filters));

  const ranked: RankedSubject<T>[] = [];
  const unranked: T[] = [];

  for (const subject of filtered) {
    const entry = ratingEntries.find(
      (e) => e.subject_type === subjectType && e.subject_id === subject.id,
    );
    if (entry) {
      ranked.push({
        subject,
        rank: entry.rank,
        pass_rate: entry.pass_rate,
        sample_size: entry.sample_size,
        confidence: entry.confidence,
      });
    } else {
      unranked.push(subject);
    }
  }

  ranked.sort((a, b) => a.rank - b.rank);

  return { ranked, unranked };
}
