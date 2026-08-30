import { z } from "zod";

export const TheoryQuestionOptionSchema = z.object({
  id: z.string(),
  text_lv: z.string(),
  text_ru: z.string(),
  is_correct: z.boolean(),
});

export const TheoryQuestionSchema = z
  .object({
    id: z.string(),
    categories: z.array(z.string()),
    text_lv: z.string(),
    text_ru: z.string(),
    options: z.array(TheoryQuestionOptionSchema),
    explanation_lv: z.string(),
    explanation_ru: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    official_reference: z.string().nullable(),
  })
  // "Валидный вопрос" (T-044, docs/11-backlog.md) означает ровно один
  // правильный вариант — 0 или 2+ делают квиз нерабочим или неоднозначным;
  // Zod проверяет форму полей, но не это бизнес-правило без явного
  // refine — найдено намеренной порчей тестовых данных при проверке.
  .refine((q) => q.options.filter((o) => o.is_correct).length === 1, {
    message: "Ровно один вариант ответа должен быть is_correct: true",
  });

export const TheoryQuestionsFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["editorial", "csdd-question-bank"]),
  questions: z.array(TheoryQuestionSchema),
});
