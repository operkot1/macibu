import type { TheoryQuestion } from "../../types/data";

/*
 * [ДОПУЩЕНИЕ] — числа не подтверждены официальным регламентом CSDD (в
 * материалах Модуля 7 их нет), docs/06-tools/simulyator-ekzamena.md.
 * Блокер: T-066 (UI + релиз) не выходит в прод, пока эти пороги не
 * сверены с официальным источником — задача T-065 (эта) реализует
 * формулу с явной пометкой, не разблокирует релиз сама по себе.
 */
export const EXAM_QUESTION_COUNT = 30;
export const EXAM_MAX_ERRORS = 2;
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
