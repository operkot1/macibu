import { shuffle } from "../trainer/buildDailySession";
import type { TheoryQuestion } from "../../types/data";

/*
 * Пороги подтверждены официальным источником (T-066, снят блокер
 * T-065): csdd.lv, «Vieglā automobiļa vadītāja apliecība (B)» →
 * «Teorētiskais eksāmens un pieteikšanās eksāmenam», со ссылкой на MK
 * noteikumi Nr. 103 (02.02.2010) «Transportlīdzekļu vadītāju tiesību
 * iegūšanas un atjaunošanas kārtība...». Дословно: «Eksāmenā jāatbild uz
 * 30 jautājumiem... Atbilžu sniegšanai atvēlētais laiks ir 30 minūtes...
 * Eksāmens ir nokārtots, ja nepareizi atbildēto jautājumu skaits
 * nepārsniedz 3 jautājumus» — EXAM_MAX_ERRORS был занижен (2 вместо 3)
 * до этой сверки, см. docs/06-tools/simulyator-ekzamena.md.
 */
export const EXAM_QUESTION_COUNT = 30;
export const EXAM_MAX_ERRORS = 3;
export const EXAM_TIME_LIMIT_MIN = 30;

export interface SimulationAnswer {
  question_id: string;
  correct: boolean;
}

export interface SimulationResult {
  passed: boolean;
  errors_count: number;
  total: number;
}

/*
 * evaluateSimulation — формула из docs/06-tools/simulyator-ekzamena.md.
 * "Выход" в контракте также требует разбивку ошибок по темам — в
 * TheoryQuestion (src/types/data.ts) и в реальной фикстуре
 * (src/content/theory-questions/b.json) нет поля темы/раздела вопроса
 * (только categories — категория прав "B", не тематика), сама формула
 * в контракте тоже её не считает. Разбивка по темам не реализована
 * здесь — придумывать таксономию тем самостоятельно означало бы
 * выдумывать классификацию контента, не основанную на реальных данных;
 * нужна отдельная задача, добавляющая поле темы в модель данных.
 */
export function evaluateSimulation(
  answers: SimulationAnswer[],
): SimulationResult {
  const errors_count = answers.filter((a) => !a.correct).length;
  return {
    passed: errors_count <= EXAM_MAX_ERRORS,
    errors_count,
    total: answers.length,
  };
}

/*
 * hasSufficientQuestionBank — edge case "insufficient-question-bank"
 * (docs/06-tools/simulyator-ekzamena.md, §"Edge cases"): банк вопросов
 * для категории с < EXAM_QUESTION_COUNT уникальных вопросов не может
 * честно эмулировать экзамен без повторов. На реальной фикстуре
 * (25 вопросов для "B") это условие сейчас всегда истинно — см. spec.
 */
export function hasSufficientQuestionBank(
  questions: TheoryQuestion[],
  category: string,
): boolean {
  const count = questions.filter((q) => q.categories.includes(category)).length;
  return count >= EXAM_QUESTION_COUNT;
}

/*
 * getRemainingSeconds — чистая формула обратного отсчёта (T-066), без
 * React и без реального `setInterval`, чтобы «таймер точен» проверялось
 * unit-тестом на фиксированных временных метках (docs/06-tools/
 * simulyator-ekzamena.md, критерии приёмки), а не «на глаз» в браузере.
 * UI дергает её раз в секунду с `Date.now()` и своим `startedAt`.
 */
export function getRemainingSeconds(
  startedAt: number,
  now: number,
  limitMinutes: number,
): number {
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  return Math.max(0, limitMinutes * 60 - elapsedSec);
}

/*
 * buildExamSession — набор вопросов для одного прохождения симуляции,
 * тот же `shuffle` (Fisher-Yates, инъекция `random` для тестируемости),
 * что уже обкатан в `buildDailySession` (T-045) — не дублирую
 * `Array.sort(() => Math.random() - 0.5)` (известно смещённый способ).
 * Вызывающий код обязан сам проверить `hasSufficientQuestionBank` —
 * здесь честно возвращается меньше `EXAM_QUESTION_COUNT`, если банк мал,
 * без повторов вопросов.
 */
export function buildExamSession(
  all: TheoryQuestion[],
  category: string,
  random: () => number = Math.random,
): TheoryQuestion[] {
  const pool = all.filter((q) => q.categories.includes(category));
  return shuffle(pool, random).slice(0, EXAM_QUESTION_COUNT);
}
