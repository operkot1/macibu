import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildDailySession } from "./buildDailySession";
import type { TheoryQuestion } from "../../types/data";

/*
 * Банк вопросов — Astro Content Collection (src/content/theory-questions/
 * b.json, T-044), недоступна через `astro:content` в обычном vitest без
 * getViteConfig-интеграции (которой в vitest.config.ts нет — намеренно,
 * тот же выбор простоты, что у остальных .spec.ts в проекте). Читаем JSON
 * напрямую — тот же файл, что видит Content Layer, реальные данные, не
 * синтетика.
 */
const allQuestions: TheoryQuestion[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "src/content/theory-questions/b.json"),
    "utf-8",
  ),
);

function fixedRandom(sequence: number[]): () => number {
  let i = 0;
  return () => sequence[i++ % sequence.length];
}

describe("buildDailySession", () => {
  it("реальный банк, категория B, без seenToday — 20 вопросов (min(20, 25))", () => {
    const session = buildDailySession(allQuestions, "B", []);
    expect(session).toHaveLength(20);
  });

  it("нет повторов id в сессии", () => {
    const session = buildDailySession(allQuestions, "B", []);
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("размер сессии не превышает доступный пул", () => {
    const seenToday = allQuestions.slice(0, 20).map((q) => q.id);
    const session = buildDailySession(allQuestions, "B", seenToday);
    // Осталось 5 непросмотренных — сессия короче 20, не дополняется откуда-то ещё
    expect(session).toHaveLength(5);
  });

  it("seenToday реально исключены из сессии", () => {
    const seenToday = allQuestions.slice(0, 3).map((q) => q.id);
    const session = buildDailySession(allQuestions, "B", seenToday);
    const sessionIds = session.map((q) => q.id);
    for (const seenId of seenToday) {
      expect(sessionIds).not.toContain(seenId);
    }
  });

  it("категория без вопросов — пустой массив, не падает", () => {
    const session = buildDailySession(allQuestions, "C", []);
    expect(session).toEqual([]);
  });

  it("фильтрует по категории — все вопросы сессии реально содержат её", () => {
    const session = buildDailySession(allQuestions, "B", []);
    expect(session.every((q) => q.categories.includes("B"))).toBe(true);
  });

  it("shuffle реально переставляет порядок (детерминированный random)", () => {
    const small = allQuestions.slice(0, 4);
    // Fisher-Yates с фиксированной последовательностью — не тот же порядок,
    // что во входном массиве.
    const shuffled = buildDailySession(small, "B", [], fixedRandom([0, 0, 0]));
    const originalOrder = small.map((q) => q.id);
    const shuffledOrder = shuffled.map((q) => q.id);
    expect(shuffledOrder).not.toEqual(originalOrder);
    expect(shuffledOrder.sort()).toEqual(originalOrder.sort());
  });

  it("пустой общий банк — пустая сессия, не бросает исключение", () => {
    expect(() => buildDailySession([], "B", [])).not.toThrow();
    expect(buildDailySession([], "B", [])).toEqual([]);
  });
});
