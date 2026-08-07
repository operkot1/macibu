import type { TheoryQuestion } from "../../types/data";

/*
 * buildDailySession — формула из docs/06-tools/trenazhyor-teorii.md.
 * Чистая функция, без UI (это T-046) и без чтения/записи
 * localStorage['portal:trainer:seen:{date}'] — вызывающий код передаёт
 * seenToday явно, эта функция не знает, откуда он взялся.
 */

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildDailySession(
  all: TheoryQuestion[],
  category: string,
  seenToday: string[],
  random: () => number = Math.random,
): TheoryQuestion[] {
  const pool = all.filter(
    (q) => q.categories.includes(category) && !seenToday.includes(q.id),
  );
  const size = Math.min(20, pool.length);
  return shuffle(pool, random).slice(0, size);
}
