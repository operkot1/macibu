import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateSimulation,
  hasSufficientQuestionBank,
  EXAM_MAX_ERRORS,
  EXAM_QUESTION_COUNT,
  type SimulationAnswer,
} from "./evaluateSimulation";
import type { TheoryQuestion } from "../../types/data";

/*
 * Банк вопросов — Astro Content Collection (src/content/theory-questions/
 * b.json, T-044), недоступна через astro:content в обычном vitest (тот
 * же выбор простоты, что в buildDailySession.spec.ts, T-045). Читаем
 * JSON напрямую — реальные 25 вопросов, не заглушку
 * fixtures/theory_questions.json (getTheoryQuestions() — неиспользуемый
 * артефакт Ф0 с 3 вопросами-затычками, не тот источник, что видит
 * реальный тренажёр).
 */
const realQuestions: TheoryQuestion[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "src/content/theory-questions/b.json"),
    "utf-8",
  ),
);

function answers(correctCount: number, wrongCount: number): SimulationAnswer[] {
  const result: SimulationAnswer[] = [];
  for (let i = 0; i < correctCount; i++) {
    result.push({ question_id: `correct-${i}`, correct: true });
  }
  for (let i = 0; i < wrongCount; i++) {
    result.push({ question_id: `wrong-${i}`, correct: false });
  }
  return result;
}

describe("evaluateSimulation (docs/06-tools/simulyator-ekzamena.md, [ДОПУЩЕНИЕ] пороги)", () => {
  it("0 ошибок — сдал", () => {
    const result = evaluateSimulation(answers(30, 0));
    expect(result).toEqual({ passed: true, errors_count: 0, total: 30 });
  });

  it(`ровно EXAM_MAX_ERRORS (${EXAM_MAX_ERRORS}) ошибок — граница, ещё сдал`, () => {
    const result = evaluateSimulation(answers(28, EXAM_MAX_ERRORS));
    expect(result.passed).toBe(true);
    expect(result.errors_count).toBe(EXAM_MAX_ERRORS);
  });

  it(`EXAM_MAX_ERRORS + 1 (${EXAM_MAX_ERRORS + 1}) ошибок — граница, уже не сдал`, () => {
    const result = evaluateSimulation(answers(27, EXAM_MAX_ERRORS + 1));
    expect(result.passed).toBe(false);
    expect(result.errors_count).toBe(EXAM_MAX_ERRORS + 1);
  });

  it("все ответы неверные — не сдал, total совпадает с количеством ответов", () => {
    const result = evaluateSimulation(answers(0, 10));
    expect(result).toEqual({ passed: false, errors_count: 10, total: 10 });
  });

  it("пустой список ответов — 0 ошибок из 0, формально «сдал» (edge case UI не должен допускать до сабмита)", () => {
    const result = evaluateSimulation([]);
    expect(result).toEqual({ passed: true, errors_count: 0, total: 0 });
  });
});

describe(`hasSufficientQuestionBank (порог EXAM_QUESTION_COUNT=${EXAM_QUESTION_COUNT})`, () => {
  it("реальный банк для категории B (25 вопросов) — банк НЕДОСТАТОЧЕН для честной симуляции", () => {
    const bCount = realQuestions.filter((q) =>
      q.categories.includes("B"),
    ).length;
    expect(bCount).toBe(25);
    expect(hasSufficientQuestionBank(realQuestions, "B")).toBe(false);
  });

  it("несуществующая категория — 0 вопросов, недостаточно", () => {
    expect(hasSufficientQuestionBank(realQuestions, "does-not-exist")).toBe(
      false,
    );
  });

  it("ровно EXAM_QUESTION_COUNT синтетических вопросов — достаточно (граница)", () => {
    const synthetic = Array.from({ length: EXAM_QUESTION_COUNT }, (_, i) => ({
      id: `q-${i}`,
      categories: ["B"],
      text_lv: "",
      text_ru: "",
      media_url: null,
      options: [],
      explanation_lv: "",
      explanation_ru: "",
      difficulty: "easy" as const,
      official_reference: null,
    }));
    expect(hasSufficientQuestionBank(synthetic, "B")).toBe(true);
  });
});
