import { z } from "zod";

export const TheoryQuestionOptionSchema = z.object({
  id: z.string(),
  text_lv: z.string(),
  text_ru: z.string(),
  is_correct: z.boolean(),
});

export const TheoryQuestionSchema = z.object({
  id: z.string(),
  categories: z.array(z.string()),
  text_lv: z.string(),
  text_ru: z.string(),
  media_url: z.string().nullable(),
  options: z.array(TheoryQuestionOptionSchema),
  explanation_lv: z.string(),
  explanation_ru: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  official_reference: z.string().nullable(),
});

export const TheoryQuestionsFileSchema = z.object({
  updated_at: z.string(),
  source: z.enum(["editorial", "csdd-question-bank"]),
  questions: z.array(TheoryQuestionSchema),
});
